"""Translate Django admin configuration, forms and values to/from JSON.

Everything here is driven by the ModelAdmin classes registered with
``django.contrib.admin`` so the Next.js panel mirrors the Django admin:
same fields, fieldsets, inlines, filters, actions and validation.
"""
import datetime
import json
from decimal import Decimal

from django import forms
from django.contrib import admin
from django.contrib.admin.utils import display_for_field, display_for_value, flatten_fieldsets, label_for_field, lookup_field
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.db.models.fields.files import FieldFile
from django.utils import timezone
from django.utils.datastructures import MultiValueDict
from django.utils.html import strip_tags
from django.utils.safestring import SafeData

EMPTY = '-'


# --------------------------------------------------------------------------- models

def model_key(model):
    return f'{model._meta.app_label}.{model._meta.model_name}'


def resolve_model(key):
    """Return (model, model_admin) for a registered 'app_label.model_name' key, else (None, None)."""
    for model, model_admin in admin.site._registry.items():
        if model_key(model) == key.lower():
            return model, model_admin
    return None, None


def related_models_of_registered():
    """Models that registered admin forms point at (FK / M2M targets), e.g. auth.permission."""
    targets = set()
    for model in admin.site._registry:
        for field in model._meta.get_fields():
            if (field.many_to_one or field.many_to_many or field.one_to_one) and field.related_model and not field.auto_created:
                targets.add(field.related_model)
    return targets


# --------------------------------------------------------------------------- media

def absolute_url(request, url):
    return request.build_absolute_uri(url) if request is not None else url


def file_value(request, value):
    if not value:
        return None
    try:
        url = absolute_url(request, value.url)
    except ValueError:
        url = None
    return {'name': value.name.rsplit('/', 1)[-1], 'url': url}


# --------------------------------------------------------------------------- form fields

def describe_form_field(name, ff):
    """JSON description of a Django form field, used by the panel to render an input."""
    desc = {
        'name': name,
        'label': str(ff.label) if ff.label else name.replace('_', ' ').capitalize(),
        'required': bool(ff.required),
        'help_text': strip_tags(str(ff.help_text or '')),
        'disabled': bool(ff.disabled),
    }
    widget = ff.widget

    if isinstance(ff, ReadOnlyPasswordHashField):
        desc['type'] = 'password_hash'
    elif isinstance(ff, forms.ModelMultipleChoiceField):
        desc.update(type='m2m', target=model_key(ff.queryset.model))
    elif isinstance(ff, forms.ModelChoiceField):
        desc.update(type='fk', target=model_key(ff.queryset.model))
    elif isinstance(ff, forms.NullBooleanField):
        desc.update(type='select', choices=[['', 'Unknown'], ['true', 'Yes'], ['false', 'No']])
    elif isinstance(ff, forms.BooleanField):
        desc['type'] = 'boolean'
    elif isinstance(ff, (forms.SplitDateTimeField, forms.DateTimeField)):
        desc['type'] = 'datetime'
    elif isinstance(ff, forms.DateField):
        desc['type'] = 'date'
    elif isinstance(ff, forms.TimeField):
        desc['type'] = 'time'
    elif isinstance(ff, forms.FileField):
        desc.update(type='file', image=isinstance(ff, forms.ImageField))
    elif isinstance(ff, forms.ChoiceField):
        choices = []
        for value, label in ff.choices:
            if isinstance(label, (list, tuple)):  # optgroup
                choices.extend([str(v), f'{value}: {lbl}'] for v, lbl in label)
            else:
                choices.append([str(value), str(label)])
        desc.update(type='select', choices=choices)
    elif isinstance(ff, forms.IntegerField):
        desc['type'] = 'integer'
    elif isinstance(ff, (forms.DecimalField, forms.FloatField)):
        desc['type'] = 'decimal'
    elif isinstance(ff, forms.EmailField):
        desc['type'] = 'email'
    elif isinstance(ff, forms.URLField):
        desc['type'] = 'url'
    elif isinstance(ff, forms.SlugField):
        desc['type'] = 'slug'
    elif isinstance(ff, forms.JSONField):
        desc['type'] = 'json'
    elif isinstance(widget, forms.PasswordInput):
        desc['type'] = 'password'
    elif isinstance(widget, forms.Textarea):
        desc['type'] = 'textarea'
    else:
        desc['type'] = 'text'

    max_length = getattr(ff, 'max_length', None)
    if max_length:
        desc['max_length'] = max_length
    return desc


def serialize_form_value(ff, value, request):
    """Bound/initial form value -> JSON."""
    if callable(value):
        value = value()
    if value is None or value == '':
        return [] if isinstance(ff, forms.ModelMultipleChoiceField) else None
    if isinstance(ff, forms.ModelMultipleChoiceField):
        return [v.pk if isinstance(v, models.Model) else v for v in value]
    if isinstance(value, models.Model):
        return value.pk
    if isinstance(value, FieldFile):
        return file_value(request, value)
    if isinstance(value, datetime.datetime):
        if timezone.is_aware(value):
            value = timezone.localtime(value)
        return value.strftime('%Y-%m-%dT%H:%M')
    if isinstance(value, datetime.date):
        return value.isoformat()
    if isinstance(value, datetime.time):
        return value.strftime('%H:%M')
    if isinstance(value, Decimal):
        return str(value)
    if isinstance(value, (list, tuple)) and isinstance(ff, forms.SplitDateTimeField):
        return None
    if isinstance(value, (str, int, float, bool, list, dict)):
        return value
    return str(value)


def relation_labels(form, request):
    """{field: [{id, label}]} for the current FK/M2M values so selects can show names."""
    labels = {}
    for name, ff in form.fields.items():
        if not isinstance(ff, forms.ModelChoiceField):
            continue
        value = serialize_form_value(ff, form[name].value(), request)
        ids = value if isinstance(value, list) else ([value] if value not in (None, '') else [])
        if ids:
            objects = ff.queryset.model._default_manager.filter(pk__in=ids)
            labels[name] = [{'id': obj.pk, 'label': str(obj)} for obj in objects]
    return labels


def add_form_data(data, files_out, fields, values, files_in, prefix=''):
    """Convert JSON values into the POST-style data Django admin forms expect."""
    for name, ff in fields.items():
        key = f'{prefix}{name}'
        if isinstance(ff, forms.FileField):
            upload = files_in.get(key)
            if upload is not None:
                files_out[key] = upload
            if values.get(f'{name}__clear'):
                data[f'{key}-clear'] = 'on'
            continue
        if name not in values:
            continue
        value = values[name]
        if isinstance(ff, forms.SplitDateTimeField):
            if value:
                date_part, _, time_part = str(value).partition('T')
                data[f'{key}_0'], data[f'{key}_1'] = date_part, time_part[:5]
            else:
                data[f'{key}_0'] = data[f'{key}_1'] = ''
        elif isinstance(ff, forms.ModelMultipleChoiceField):
            data.setlist(key, [str(v) for v in (value or [])])
        elif isinstance(ff, forms.NullBooleanField):
            data[key] = '' if value in (None, '') else ('true' if value in (True, 'true') else 'false')
        elif isinstance(ff, forms.BooleanField):
            if value in (True, 'true', 'on', 1):
                data[key] = 'on'
        elif isinstance(ff, forms.JSONField) and not isinstance(value, str):
            data[key] = json.dumps(value)
        elif value is None:
            data[key] = ''
        else:
            data[key] = str(value)


def new_form_data():
    return MultiValueDict(), MultiValueDict()


def form_errors(form):
    return {field: [str(e['message']) for e in errs] for field, errs in form.errors.get_json_data().items()}


# --------------------------------------------------------------------------- display values

def display_cell(obj, name, model_admin, request):
    """A list_display / readonly value as {'text'} | {'html'} | {'bool'} | {'file'}."""
    try:
        field, attr, value = lookup_field(name, obj, model_admin)
    except (AttributeError, ObjectDoesNotExist):
        return {'text': EMPTY}

    if field is None:
        if getattr(attr, 'boolean', False):
            return {'bool': None if value is None else bool(value)}
        result = display_for_value(value, EMPTY)
    else:
        if isinstance(field, models.BooleanField):
            return {'bool': value}
        if isinstance(field, models.FileField):
            fv = file_value(request, value)
            return {'file': fv} if fv else {'text': EMPTY}
        if isinstance(field, models.ForeignKey) or isinstance(field, models.OneToOneField):
            return {'text': str(value) if value is not None else EMPTY}
        if field.many_to_many:
            return {'text': ', '.join(str(v) for v in value.all()) or EMPTY}
        result = display_for_field(value, field, EMPTY)

    if isinstance(result, SafeData):
        return {'html': str(result)}
    return {'text': str(result)}


def column_label(name, model, model_admin):
    try:
        return str(label_for_field(name, model, model_admin))
    except AttributeError:
        return name


def sort_field_for(name, model, model_admin):
    """Database ordering field for a list_display entry, or None if not sortable."""
    if name == '__str__':
        return None
    try:
        field = model._meta.get_field(name)
        return None if field.many_to_many else name
    except Exception:
        attr = getattr(model_admin, name, None) or getattr(model, name, None)
        order = getattr(attr, 'admin_order_field', None)
        return order if isinstance(order, str) else None


# --------------------------------------------------------------------------- list filters

DATE_FILTERS = [('today', 'Today'), ('7d', 'Past 7 days'), ('month', 'This month'), ('year', 'This year')]


def filter_spec(model, spec):
    """Options and a queryset filter for a simple list_filter entry (field names only)."""
    name = spec if isinstance(spec, str) else (spec[0] if isinstance(spec, (list, tuple)) and isinstance(spec[0], str) else None)
    if not name:
        return None
    try:
        field = model._meta.get_field(name)
    except Exception:
        return None

    label = str(field.verbose_name).capitalize() if hasattr(field, 'verbose_name') else name

    if isinstance(field, models.BooleanField):
        options = [('1', 'Yes'), ('0', 'No')]
        apply = lambda qs, v: qs.filter(**{name: v == '1'})
    elif getattr(field, 'choices', None):
        options = [(str(k), str(v)) for k, v in field.flatchoices]
        apply = lambda qs, v: qs.filter(**{name: v})
    elif field.many_to_one or field.one_to_one or field.many_to_many:
        related = field.related_model._default_manager.all()[:200]
        options = [(str(obj.pk), str(obj)) for obj in related]
        apply = lambda qs, v: qs.filter(**{f'{name}__pk': v})
    elif isinstance(field, (models.DateField, models.DateTimeField)):
        options = DATE_FILTERS
        is_datetime = isinstance(field, models.DateTimeField)

        def apply(qs, v):
            today = timezone.localdate()
            start = {
                'today': today,
                '7d': today - datetime.timedelta(days=7),
                'month': today.replace(day=1),
                'year': today.replace(month=1, day=1),
            }.get(v)
            if start is None:
                return qs
            end = today + datetime.timedelta(days=1)
            if is_datetime:
                start = timezone.make_aware(datetime.datetime.combine(start, datetime.time.min))
                end = timezone.make_aware(datetime.datetime.combine(end, datetime.time.min))
            return qs.filter(**{f'{name}__gte': start, f'{name}__lt': end})
    else:
        values = model._default_manager.order_by(name).values_list(name, flat=True).distinct()[:200]
        options = [(str(v), str(v)) for v in values if v not in (None, '')]
        apply = lambda qs, v: qs.filter(**{name: v})

    return {'name': name, 'label': label, 'options': options, 'apply': apply}


def fieldset_lines(fieldsets):
    """[{name, description, classes, lines:[[field,...], ...]}] from ModelAdmin fieldsets."""
    result = []
    for title, opts in fieldsets:
        lines = []
        for entry in opts.get('fields', ()):
            lines.append(list(entry) if isinstance(entry, (list, tuple)) else [entry])
        result.append({
            'name': str(title) if title else None,
            'description': strip_tags(str(opts.get('description') or '')),
            'classes': list(opts.get('classes', ())),
            'lines': lines,
        })
    return result


__all__ = [
    'EMPTY', 'model_key', 'resolve_model', 'related_models_of_registered', 'absolute_url', 'file_value',
    'describe_form_field', 'serialize_form_value', 'relation_labels', 'add_form_data', 'new_form_data',
    'form_errors', 'display_cell', 'column_label', 'sort_field_for', 'filter_spec', 'fieldset_lines',
    'flatten_fieldsets',
]
