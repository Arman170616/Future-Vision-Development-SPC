"""REST endpoints behind the Next.js admin panel (futureinnvo.com/admin).

All model access goes through the ModelAdmin registered with Django admin —
the same permissions, querysets, forms, validation, save hooks, actions and
LogEntry history — so both panels always behave identically.
"""
import json

from django.apps import apps
from django.contrib import admin, messages
from django.contrib.admin.models import ADDITION, CHANGE, DELETION, LogEntry
from django.contrib.admin.utils import model_format_dict, unquote
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.forms import AdminPasswordChangeForm, PasswordChangeForm
from django.contrib.auth.models import update_last_login
from django.contrib.contenttypes.models import ContentType
from django.core.paginator import Paginator
from django.db import models, transaction
from django.db.models import Q
from django.forms.formsets import all_valid
from django.utils.html import strip_tags
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth import IsActiveStaff, LoginRateThrottle, SignedTokenAuthentication, make_token
from .introspect import (
    EMPTY, add_form_data, column_label, describe_form_field, display_cell, fieldset_lines, filter_spec,
    flatten_fieldsets, form_errors, model_key, new_form_data, related_models_of_registered, relation_labels,
    resolve_model, serialize_form_value, sort_field_for,
)

ACTION_NAMES = {ADDITION: 'add', CHANGE: 'change', DELETION: 'delete'}


def user_payload(user):
    member = getattr(user, 'team_member', None)
    return {
        'id': user.pk,
        'username': user.get_username(),
        'name': (member.name if member else None) or user.get_full_name() or user.get_username(),
        'is_superuser': user.is_superuser,
        # Team-member logins see a reduced panel ("My tasks")
        'team_member': {'id': member.pk, 'name': member.name, 'position': member.position} if member else None,
    }


def parse_payload(request):
    data = request.data
    raw = data.get('payload') if hasattr(data, 'get') else None
    if raw is None:
        return data if isinstance(data, dict) else {}
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            raise ValidationError({'detail': 'Invalid payload.'})
    return raw


def model_info(model, ma, hr):
    opts = model._meta
    return {
        'key': model_key(model),
        'app_label': opts.app_label,
        'app_name': str(apps.get_app_config(opts.app_label).verbose_name),
        'verbose_name': str(opts.verbose_name),
        'verbose_name_plural': str(opts.verbose_name_plural),
        'perms': {
            'add': ma.has_add_permission(hr),
            'change': ma.has_change_permission(hr),
            'delete': ma.has_delete_permission(hr),
            'view': ma.has_view_or_change_permission(hr),
        },
    }


class AdminAPIView(APIView):
    authentication_classes = [SignedTokenAuthentication]
    permission_classes = [IsActiveStaff]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @property
    def hr(self):
        # The underlying HttpRequest; DRF has already set .user on it during authentication.
        return self.request._request

    def get_model(self, key):
        model, ma = resolve_model(key)
        if model is None:
            raise NotFound('Unknown model.')
        return model, ma

    def get_object(self, ma, pk):
        obj = ma.get_object(self.hr, unquote(str(pk)))
        if obj is None:
            raise NotFound('This object does not exist. Perhaps it was deleted?')
        return obj


# --------------------------------------------------------------------------- auth

class LoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        username = str(request.data.get('username', '')).strip()
        password = str(request.data.get('password', ''))
        user = authenticate(request._request, username=username, password=password)
        if user is None or not user.is_active or not user.is_staff:
            return Response(
                {'detail': 'Please enter the correct username and password for a staff account. Note that both fields may be case-sensitive.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        update_last_login(None, user)
        return Response({'token': make_token(user), 'user': user_payload(user)})


class MeView(AdminAPIView):
    def get(self, request):
        return Response({'user': user_payload(request.user)})


class MePasswordView(AdminAPIView):
    def post(self, request):
        form = PasswordChangeForm(request.user, {
            'old_password': request.data.get('old_password', ''),
            'new_password1': request.data.get('new_password1', ''),
            'new_password2': request.data.get('new_password2', ''),
        })
        if not form.is_valid():
            return Response({'errors': form_errors(form)}, status=status.HTTP_400_BAD_REQUEST)
        user = form.save()
        # The old token is tied to the old password hash; hand out a fresh one.
        return Response({'detail': 'Your password was changed.', 'token': make_token(user)})


# --------------------------------------------------------------------------- index

class IndexView(AdminAPIView):
    def get(self, request):
        hr = self.hr
        # Built from the registry directly: admin.site.get_app_list() reverses the Django admin URLs,
        # which are intentionally not routed (this panel replaces them).
        apps_by_label = {}
        for model, model_admin in admin.site._registry.items():
            if not model_admin.has_module_permission(hr):
                continue
            perms = model_admin.get_model_perms(hr)
            if not any(perms.values()):
                continue
            label = model._meta.app_label
            app = apps_by_label.setdefault(label, {
                'app_label': label,
                'name': str(apps.get_app_config(label).verbose_name),
                'models': [],
            })
            app['models'].append({
                'key': model_key(model),
                'name': str(model._meta.verbose_name_plural),
                'perms': perms,
                'view_only': not perms.get('change') and not perms.get('add'),
            })
        app_list = sorted(apps_by_label.values(), key=lambda a: a['name'].lower())
        for app in app_list:
            app['models'].sort(key=lambda m: m['name'].lower())
            for m in app['models']:
                m['name'] = m['name'][:1].upper() + m['name'][1:]
        recent = LogEntry.objects.filter(user=request.user).select_related('content_type')[:10]
        return Response({
            'site_title': 'FutureInnvo Administration',
            'apps': app_list,
            'recent_actions': [{
                'action': ACTION_NAMES.get(entry.action_flag, 'change'),
                'object_repr': entry.object_repr,
                'object_id': entry.object_id,
                'model_key': f'{entry.content_type.app_label}.{entry.content_type.model}' if entry.content_type else None,
                'model_name': str(entry.content_type.name).capitalize() if entry.content_type else '',
                'time': entry.action_time.isoformat(),
            } for entry in recent],
        })


# --------------------------------------------------------------------------- changelist

class ModelListView(AdminAPIView):
    def get(self, request, key):
        model, ma = self.get_model(key)
        hr = self.hr
        if not ma.has_view_or_change_permission(hr):
            raise PermissionDenied()
        params = request.query_params
        qs = ma.get_queryset(hr)

        filters = []
        for spec in ma.get_list_filter(hr):
            fs = filter_spec(model, spec)
            if fs is None:
                continue
            current = params.get(f'f_{fs["name"]}', '')
            if current:
                qs = fs['apply'](qs, current)
            filters.append({
                'name': fs['name'],
                'label': fs['label'],
                'value': current,
                'options': [{'value': v, 'label': lbl} for v, lbl in fs['options']],
            })

        search_fields = ma.get_search_fields(hr)
        term = params.get('q', '').strip()
        if term and search_fields:
            qs, may_have_duplicates = ma.get_search_results(hr, qs, term)
            if may_have_duplicates:
                qs = qs.distinct()

        date_hierarchy = None
        if ma.date_hierarchy:
            field = ma.date_hierarchy
            year, month = params.get('dh_y', ''), params.get('dh_m', '')
            if year.isdigit():
                qs = qs.filter(**{f'{field}__year': int(year)})
            if year.isdigit() and month.isdigit():
                qs = qs.filter(**{f'{field}__month': int(month)})
            day = params.get('dh_d', '')
            if year.isdigit() and month.isdigit() and day.isdigit():
                qs = qs.filter(**{f'{field}__day': int(day)})
            if not year.isdigit():
                level, options = 'year', [{'value': str(d.year), 'label': str(d.year)} for d in qs.dates(field, 'year')]
            elif not month.isdigit():
                level, options = 'month', [{'value': str(d.month), 'label': d.strftime('%B %Y')} for d in qs.dates(field, 'month')]
            else:
                level, options = 'day', []
            date_hierarchy = {
                'field': field,
                'label': column_label(field, model, ma),
                'level': level,
                'year': year,
                'month': month,
                'day': params.get('dh_d', ''),
                'options': options,
            }

        list_display = list(ma.get_list_display(hr))
        order = params.get('o', '')
        sort_name = order.lstrip('-')
        sort_field = sort_field_for(sort_name, model, ma) if sort_name in list_display else None
        if sort_field:
            qs = qs.order_by(('-' if order.startswith('-') else '') + sort_field, '-pk')
        elif not qs.ordered:
            qs = qs.order_by(*(ma.get_ordering(hr) or model._meta.ordering or ['-pk']))

        paginator = Paginator(qs, ma.list_per_page)
        page = paginator.get_page(params.get('p'))

        can_change = ma.has_change_permission(hr)
        editable = [n for n in ma.list_editable if n in list_display] if can_change else []
        changelist_form = ma.get_changelist_form(hr, fields=editable) if editable else None

        rows = []
        for obj in page.object_list:
            row = {
                'id': obj.pk,
                'str': str(obj),
                'cells': {name: display_cell(obj, name, ma, hr) for name in list_display},
            }
            if changelist_form:
                form = changelist_form(instance=obj)
                row['editable'] = {n: serialize_form_value(form.fields[n], form[n].value(), hr) for n in editable}
            rows.append(row)

        actions = []
        for name, (func, _, description) in ma.get_actions(hr).items():
            try:
                label = str(description) % model_format_dict(ma.opts)
            except (TypeError, ValueError, KeyError):
                label = str(description)
            actions.append({'name': name, 'description': label})

        links = ma.get_list_display_links(hr, list_display) or []
        return Response({
            'model': model_info(model, ma, hr),
            'columns': [{
                'name': name,
                'label': column_label(name, model, ma),
                'sortable': bool(sort_field_for(name, model, ma)),
                'editable': name in editable,
                'link': name in links,
            } for name in list_display],
            'editable_fields': {n: describe_form_field(n, changelist_form.base_fields[n]) for n in editable} if changelist_form else {},
            'rows': rows,
            'filters': filters,
            'search_enabled': bool(search_fields),
            'search': term,
            'date_hierarchy': date_hierarchy,
            'ordering': order if sort_field else '',
            'actions': actions,
            'count': paginator.count,
            'total_count': ma.get_queryset(hr).count(),
            'page': page.number,
            'num_pages': paginator.num_pages,
            'per_page': ma.list_per_page,
        })

    def post(self, request, key):
        model, ma = self.get_model(key)
        return save_object(self, model, ma, None)


# --------------------------------------------------------------------------- change form

def build_inlines(view, ma, obj):
    hr = view.hr
    parent = obj if obj is not None else ma.model()
    result, prefixes = [], {}
    for FormSet, inline in ma.get_formsets_with_inlines(hr, obj):
        prefix = FormSet.get_default_prefix()
        prefixes[prefix] = prefixes.get(prefix, 0) + 1
        if prefixes[prefix] != 1:
            prefix = f'{prefix}-{prefixes[prefix]}'
        formset = FormSet(instance=parent, prefix=prefix, queryset=inline.get_queryset(hr))
        fk_name = formset.fk.name
        readonly = set(inline.get_readonly_fields(hr, obj))
        base = FormSet.form.base_fields

        columns = []
        for name in flatten_fieldsets(inline.get_fieldsets(hr, obj)):
            if name == fk_name:
                continue
            if name in base and name not in readonly:
                columns.append(describe_form_field(name, base[name]))
            else:
                columns.append({'name': name, 'label': column_label(name, FormSet.model, inline), 'type': 'readonly'})
        editable_names = [c['name'] for c in columns if c['type'] != 'readonly']

        rows = []
        for form in formset.initial_forms:
            instance = form.instance
            rows.append({
                'id': instance.pk,
                'str': str(instance),
                'values': {n: serialize_form_value(form.fields[n], form[n].value(), hr) for n in editable_names},
                'readonly': {c['name']: display_cell(instance, c['name'], inline, hr) for c in columns if c['type'] == 'readonly'},
                'labels': relation_labels(form, hr),
            })
        empty = formset.empty_form
        result.append({
            'prefix': prefix,
            'model': model_key(FormSet.model),
            'verbose_name': str(inline.verbose_name or FormSet.model._meta.verbose_name),
            'verbose_name_plural': str(inline.verbose_name_plural or FormSet.model._meta.verbose_name_plural),
            'style': 'tabular' if 'tabular' in (inline.template or '') else 'stacked',
            'columns': columns,
            'rows': rows,
            'empty': {n: serialize_form_value(empty.fields[n], empty[n].value(), hr) for n in editable_names},
            'extra': inline.get_extra(hr, obj),
            'max_num': formset.max_num,
            'min_num': formset.min_num,
            'can_add': inline.has_add_permission(hr, obj),
            'can_change': inline.has_change_permission(hr, obj),
            'can_delete': bool(inline.can_delete and inline.has_delete_permission(hr, obj)),
        })
    return result


def model_field_help(model, name):
    try:
        return strip_tags(str(model._meta.get_field(name).help_text or ''))
    except Exception:
        return ''


class ModelFormView(AdminAPIView):
    """Schema + current values for the add (no id) or change (?id=) form."""

    def get(self, request, key):
        model, ma = self.get_model(key)
        hr = self.hr
        pk = request.query_params.get('id')
        obj = self.get_object(ma, pk) if pk else None
        if obj is None and not ma.has_add_permission(hr):
            raise PermissionDenied()
        if obj is not None and not ma.has_view_or_change_permission(hr, obj):
            raise PermissionDenied()

        fieldsets = ma.get_fieldsets(hr, obj)
        readonly = set(ma.get_readonly_fields(hr, obj))
        FormClass = ma.get_form(hr, obj, change=obj is not None)
        form = FormClass(instance=obj) if obj is not None else FormClass(initial=ma.get_changeform_initial_data(hr))

        fields, values, readonly_values = {}, {}, {}
        for name in flatten_fieldsets(fieldsets):
            if name in form.fields and name not in readonly:
                ff = form.fields[name]
                desc = describe_form_field(name, ff)
                fields[name] = desc
                values[name] = None if desc['type'] == 'password_hash' else serialize_form_value(ff, form[name].value(), hr)
            else:
                fields[name] = {
                    'name': name,
                    'label': column_label(name, model, ma),
                    'type': 'readonly',
                    'help_text': model_field_help(model, name),
                }
                readonly_values[name] = display_cell(obj, name, ma, hr) if obj is not None else {'text': EMPTY}

        can_save = ma.has_change_permission(hr, obj) if obj is not None else ma.has_add_permission(hr)
        return Response({
            'model': model_info(model, ma, hr),
            'object': {'id': obj.pk, 'str': str(obj)} if obj is not None else None,
            'fieldsets': fieldset_lines(fieldsets),
            'fields': fields,
            'values': values,
            'labels': relation_labels(form, hr),
            'readonly_values': readonly_values,
            'prepopulated': {k: list(v) for k, v in ma.get_prepopulated_fields(hr, obj).items()} if obj is None else {},
            'inlines': build_inlines(self, ma, obj),
            'permissions': {
                'save': can_save,
                'delete': bool(obj is not None and ma.has_delete_permission(hr, obj)),
                'add': ma.has_add_permission(hr),
            },
            'is_user_model': model is get_user_model(),
        })


def build_formset_data(FormSet, rows, parent, prefix, files_in):
    data, files = new_form_data()
    rows = sorted(rows, key=lambda r: 0 if r.get('id') else 1)
    existing = [r for r in rows if r.get('id')]
    data[f'{prefix}-TOTAL_FORMS'] = str(len(rows))
    data[f'{prefix}-INITIAL_FORMS'] = str(len(existing))
    data[f'{prefix}-MIN_NUM_FORMS'] = '0'
    data[f'{prefix}-MAX_NUM_FORMS'] = '1000'
    fk_name = FormSet.fk.name
    pk_name = FormSet.model._meta.pk.name
    for index, row in enumerate(rows):
        fp = f'{prefix}-{index}-'
        if row.get('id'):
            data[f'{fp}{pk_name}'] = str(row['id'])
        data[f'{fp}{fk_name}'] = str(parent.pk) if parent.pk is not None else ''
        add_form_data(data, files, FormSet.form.base_fields, row.get('values', {}), files_in, prefix=fp)
        if row.get('delete'):
            data[f'{fp}DELETE'] = 'on'
    return data, files


def save_object(view, model, ma, obj):
    """Create/update through the ModelAdmin form + inline formsets, exactly like Django admin."""
    hr = view.hr
    add = obj is None
    if add and not ma.has_add_permission(hr):
        raise PermissionDenied()
    if not add and not ma.has_change_permission(hr, obj):
        raise PermissionDenied()

    payload = parse_payload(view.request)
    files_in = view.request.FILES

    FormClass = ma.get_form(hr, obj, change=not add)
    data, files = new_form_data()
    add_form_data(data, files, FormClass.base_fields, payload.get('values', {}), files_in)
    form = FormClass(data, files, instance=obj)
    form_valid = form.is_valid()
    new_object = form.save(commit=False) if form_valid else form.instance

    formsets, prefixes = [], {}
    inline_payload = payload.get('inlines', {}) or {}
    for FormSet, inline in ma.get_formsets_with_inlines(hr, None if add else new_object):
        prefix = FormSet.get_default_prefix()
        prefixes[prefix] = prefixes.get(prefix, 0) + 1
        if prefixes[prefix] != 1:
            prefix = f'{prefix}-{prefixes[prefix]}'
        rows = inline_payload.get(prefix)
        if rows is None:
            continue  # inline not sent: leave its rows untouched
        fs_data, fs_files = build_formset_data(FormSet, rows, new_object, prefix, files_in)
        formsets.append(FormSet(data=fs_data, files=fs_files, instance=new_object, prefix=prefix, queryset=inline.get_queryset(hr)))

    if all_valid(formsets) and form_valid:
        with transaction.atomic():
            ma.save_model(hr, new_object, form, not add)
            ma.save_related(hr, form, formsets, not add)
            change_message = ma.construct_change_message(hr, form, formsets, add)
            if add:
                ma.log_addition(hr, new_object, change_message)
            else:
                ma.log_change(hr, new_object, change_message)
        verb = 'added' if add else 'changed'
        return Response(
            {'id': new_object.pk, 'str': str(new_object), 'detail': f'The {model._meta.verbose_name} “{new_object}” was {verb} successfully.'},
            status=status.HTTP_201_CREATED if add else status.HTTP_200_OK,
        )

    inline_errors = {}
    for fs in formsets:
        if not fs.is_valid():
            inline_errors[fs.prefix] = {
                'non_form': [str(e) for e in fs.non_form_errors()],
                'rows': [{field: [str(m) for m in msgs] for field, msgs in f.errors.items()} for f in fs.forms],
            }
    return Response(
        {'detail': 'Please correct the errors below.', 'errors': form_errors(form), 'inline_errors': inline_errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


class ModelDetailView(AdminAPIView):
    def post(self, request, key, pk):
        model, ma = self.get_model(key)
        return save_object(self, model, ma, self.get_object(ma, pk))

    patch = post

    def delete(self, request, key, pk):
        model, ma = self.get_model(key)
        hr = self.hr
        obj = self.get_object(ma, pk)
        if not ma.has_delete_permission(hr, obj):
            raise PermissionDenied()
        _, model_count, perms_needed, protected = ma.get_deleted_objects([obj], hr)
        if perms_needed or protected:
            return Response({
                'detail': 'This object cannot be deleted.',
                'perms_needed': sorted(str(p) for p in perms_needed),
                'protected': [strip_tags(str(p)) for p in protected],
            }, status=status.HTTP_400_BAD_REQUEST)
        obj_display = str(obj)
        ma.log_deletion(hr, obj, obj_display)
        ma.delete_model(hr, obj)
        return Response({'detail': f'The {model._meta.verbose_name} “{obj_display}” was deleted successfully.'})


class DeletePreviewView(AdminAPIView):
    def get(self, request, key, pk):
        model, ma = self.get_model(key)
        hr = self.hr
        obj = self.get_object(ma, pk)
        _, model_count, perms_needed, protected = ma.get_deleted_objects([obj], hr)
        return Response({
            'object': str(obj),
            'model_count': {str(k): v for k, v in model_count.items()},
            'perms_needed': sorted(str(p) for p in perms_needed),
            'protected': [strip_tags(str(p)) for p in protected],
        })


class HistoryView(AdminAPIView):
    def get(self, request, key, pk):
        model, ma = self.get_model(key)
        hr = self.hr
        obj = self.get_object(ma, pk)
        if not ma.has_view_or_change_permission(hr, obj):
            raise PermissionDenied()
        entries = LogEntry.objects.filter(
            object_id=str(obj.pk), content_type=ContentType.objects.get_for_model(model, for_concrete_model=False),
        ).select_related('user').order_by('action_time')
        return Response({
            'object': str(obj),
            'entries': [{
                'time': entry.action_time.isoformat(),
                'user': entry.user.get_full_name() or entry.user.get_username(),
                'action': ACTION_NAMES.get(entry.action_flag, 'change'),
                'message': entry.get_change_message(),
            } for entry in entries],
        })


# --------------------------------------------------------------------------- actions & list editing

class ActionView(AdminAPIView):
    def post(self, request, key):
        model, ma = self.get_model(key)
        hr = self.hr
        name = request.data.get('action')
        ids = request.data.get('ids') or []
        available = ma.get_actions(hr)
        if name not in available:
            raise ValidationError({'detail': 'Unknown action.'})
        if not ids:
            raise ValidationError({'detail': 'Items must be selected in order to perform actions on them. No items have been changed.'})
        queryset = ma.get_queryset(hr).filter(pk__in=ids)

        if name == 'delete_selected':
            if not ma.has_delete_permission(hr):
                raise PermissionDenied()
            _, model_count, perms_needed, protected = ma.get_deleted_objects(queryset, hr)
            if perms_needed or protected:
                return Response({
                    'detail': 'The selected objects cannot be deleted.',
                    'perms_needed': sorted(str(p) for p in perms_needed),
                    'protected': [strip_tags(str(p)) for p in protected],
                }, status=status.HTTP_400_BAD_REQUEST)
            count = queryset.count()
            with transaction.atomic():
                for obj in queryset:
                    ma.log_deletion(hr, obj, str(obj))
                ma.delete_queryset(hr, queryset)
            noun = model._meta.verbose_name if count == 1 else model._meta.verbose_name_plural
            return Response({'messages': [f'Successfully deleted {count} {noun}.']})

        func = available[name][0]
        func(ma, hr, queryset)
        return Response({'messages': [str(m) for m in messages.get_messages(hr)] or ['Action completed.']})


class BulkEditView(AdminAPIView):
    """Save list_editable columns from the changelist."""

    def post(self, request, key):
        model, ma = self.get_model(key)
        hr = self.hr
        if not ma.has_change_permission(hr):
            raise PermissionDenied()
        editable = list(ma.list_editable)
        if not editable:
            raise ValidationError({'detail': 'This list has no editable columns.'})
        FormClass = ma.get_changelist_form(hr, fields=editable)
        rows = request.data.get('rows') or {}

        forms_to_save, errors = [], {}
        for pk, values in rows.items():
            obj = self.get_object(ma, pk)
            data, files = new_form_data()
            add_form_data(data, files, FormClass.base_fields, values, {})
            form = FormClass(data, files, instance=obj)
            if form.is_valid():
                forms_to_save.append(form)
            else:
                errors[str(pk)] = form_errors(form)
        if errors:
            return Response({'detail': 'Please correct the errors below.', 'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for form in forms_to_save:
                obj = form.save(commit=False)
                ma.save_model(hr, obj, form, change=True)
                ma.save_related(hr, form, formsets=[], change=True)
                ma.log_change(hr, obj, ma.construct_change_message(hr, form, None))
        count = len(forms_to_save)
        noun = model._meta.verbose_name if count == 1 else model._meta.verbose_name_plural
        return Response({'messages': [f'{count} {noun} {"was" if count == 1 else "were"} changed successfully.']})


# --------------------------------------------------------------------------- relation options & passwords

class OptionsView(AdminAPIView):
    """Choices for FK / M2M inputs (searchable)."""

    def get(self, request, key):
        try:
            app_label, model_name = key.split('.', 1)
            model = apps.get_model(app_label, model_name)
        except (ValueError, LookupError):
            raise NotFound('Unknown model.')

        model_admin = admin.site._registry.get(model)
        if model_admin is not None:
            if not model_admin.has_view_or_change_permission(self.hr):
                raise PermissionDenied()
        elif model not in related_models_of_registered():
            raise PermissionDenied()

        qs = model._default_manager.all()
        ids = [i for i in request.query_params.get('ids', '').split(',') if i]
        term = request.query_params.get('q', '').strip()
        if ids:
            qs = qs.filter(pk__in=ids)
        elif term:
            if model_admin is not None and model_admin.get_search_fields(self.hr):
                qs, dup = model_admin.get_search_results(self.hr, qs, term)
                if dup:
                    qs = qs.distinct()
            else:
                text_fields = [f.name for f in model._meta.fields if isinstance(f, (models.CharField, models.TextField))][:4]
                query = Q()
                for name in text_fields:
                    query |= Q(**{f'{name}__icontains': term})
                qs = qs.filter(query) if text_fields else qs.none()
        limit = 500 if not term and not ids else 100
        return Response({'results': [{'id': obj.pk, 'label': str(obj)} for obj in qs[:limit]]})


class UserPasswordView(AdminAPIView):
    def post(self, request, key, pk):
        model, ma = self.get_model(key)
        if model is not get_user_model():
            raise NotFound()
        hr = self.hr
        user = self.get_object(ma, pk)
        if not ma.has_change_permission(hr, user):
            raise PermissionDenied()
        form = AdminPasswordChangeForm(user, {
            'password1': request.data.get('password1', ''),
            'password2': request.data.get('password2', ''),
        })
        if not form.is_valid():
            return Response({'errors': form_errors(form)}, status=status.HTTP_400_BAD_REQUEST)
        form.save()
        ma.log_change(hr, user, ma.construct_change_message(hr, form, None))
        response = {'detail': 'Password changed successfully.'}
        if user.pk == request.user.pk:
            response['token'] = make_token(user)
        return Response(response)
