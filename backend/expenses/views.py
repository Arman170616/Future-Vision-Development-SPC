import calendar
import datetime as dt
from decimal import Decimal

from django.db.models import Count, Q, Sum
from django.db.models.functions import ExtractYear, TruncDay, TruncMonth
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from adminapi.views import AdminAPIView

from adminapi.introspect import file_value

from . import approvals
from .models import Expense, ExpenseRequest, RecurringExpense, generate_due_expenses
from tasks.activity import display_name

ZERO = Decimal('0')


def total(qs):
    return qs.aggregate(s=Sum('amount'))['s'] or ZERO


def money(value):
    return f'{(value or ZERO):.3f}'


def days_in_month(year, month):
    return calendar.monthrange(year, month)[1]


def days_in_year(year):
    return 366 if calendar.isleap(year) else 365


def per_day(value, days):
    return money((value or ZERO) / days) if days else money(ZERO)


class ExpenseStatsView(AdminAPIView):
    """Totals, a time series and a category breakdown for the Expenses page (superusers only).

    ?period=daily   → each day of ?year/?month (default: this month)
    ?period=monthly → each month of ?year (default: this year)
    ?period=yearly  → each year on record
    """

    def get(self, request):
        if not request.user.is_superuser:
            raise PermissionDenied('Only administrators can view expenses.')
        today = timezone.localdate()
        params = request.query_params
        period = params.get('period', 'monthly')
        year = int(params['year']) if params.get('year', '').isdigit() else today.year
        month = int(params['month']) if params.get('month', '').isdigit() and 1 <= int(params['month']) <= 12 else today.month

        generate_due_expenses(today)
        all_expenses = Expense.objects.all()
        everything = all_expenses
        # Type tabs on the Expenses page: normal / fixed / request entries, or project costs
        source = params.get('source', '')
        if source in dict(Expense.SOURCE_CHOICES):
            everything = everything.filter(source=source)
        project = params.get('project', '')
        if project == 'any':
            everything = everything.filter(project__isnull=False)
        elif project.isdigit():
            everything = everything.filter(project_id=int(project))
        week_start = today - dt.timedelta(days=today.weekday())
        month_total = total(everything.filter(date__year=today.year, date__month=today.month))
        tiles = {
            'today': money(total(everything.filter(date=today))),
            'week': money(total(everything.filter(date__gte=week_start, date__lte=today))),
            'month': money(month_total),
            # The month's spending spread evenly over its days (e.g. 300 OMR in a 30-day month = 10 OMR/day)
            'month_per_day': per_day(month_total, days_in_month(today.year, today.month)),
            'month_days': days_in_month(today.year, today.month),
            'year': money(total(everything.filter(date__year=today.year))),
            'all_time': money(total(everything)),
            'count': everything.count(),
        }

        if period == 'daily':
            scope = everything.filter(date__year=year, date__month=month)
            first = dt.date(year, month, 1)
            last = (first.replace(day=28) + dt.timedelta(days=4)).replace(day=1) - dt.timedelta(days=1)
            sums = {row['d'].date() if hasattr(row['d'], 'date') else row['d']: row['s']
                    for row in scope.annotate(d=TruncDay('date')).values('d').annotate(s=Sum('amount'))}
            series = [{
                'key': day.isoformat(),
                'label': str(day.day),
                'title': day.strftime('%a %d %b %Y'),
                'value': money(sums.get(day)),
                'params': {'dh_y': str(year), 'dh_m': str(month), 'dh_d': str(day.day)},
            } for day in (first + dt.timedelta(days=i) for i in range((last - first).days + 1))]
            scope_label = first.strftime('%B %Y')
            scope_days = last.day
        elif period == 'yearly':
            scope = everything
            sums = {row['y']: row['s'] for row in everything.annotate(y=ExtractYear('date')).values('y').annotate(s=Sum('amount'))}
            years = sorted(sums) or [today.year]
            series = [{
                'key': str(y), 'label': str(y), 'title': str(y), 'value': money(sums.get(y)),
                'per_day': per_day(sums.get(y), days_in_year(y)), 'days': days_in_year(y),
                'params': {'dh_y': str(y)},
            } for y in range(years[0], max(years[-1], today.year) + 1)]
            scope_label = 'All years'
            scope_days = 0
        else:
            period = 'monthly'
            scope = everything.filter(date__year=year)
            sums = {row['m'].month: row['s'] for row in scope.annotate(m=TruncMonth('date')).values('m').annotate(s=Sum('amount'))}
            series = [{
                'key': f'{year}-{m:02d}',
                'label': dt.date(year, m, 1).strftime('%b'),
                'title': dt.date(year, m, 1).strftime('%B %Y'),
                'value': money(sums.get(m)),
                'per_day': per_day(sums.get(m), days_in_month(year, m)), 'days': days_in_month(year, m),
                'params': {'dh_y': str(year), 'dh_m': str(m)},
            } for m in range(1, 13)]
            scope_label = str(year)
            scope_days = days_in_year(year)

        labels = dict(Expense.CATEGORY_CHOICES)
        categories = [{
            'key': row['category'],
            'label': labels.get(row['category'], row['category']),
            'value': money(row['s']),
            'count': row['n'],
        } for row in scope.values('category').annotate(s=Sum('amount'), n=Count('id')).order_by('-s')]

        # Fixed costs: monthly equivalent and what they cost per day this month
        fixed = []
        fixed_monthly = ZERO
        this_month_days = days_in_month(today.year, today.month)
        for rec in RecurringExpense.objects.all():
            monthly = rec.monthly_amount
            if rec.is_active and (not rec.end_date or rec.end_date >= today):
                fixed_monthly += monthly
            next_day = rec.next_date() if rec.is_active else None
            fixed.append({
                'id': rec.pk,
                'title': rec.title,
                'category': labels.get(rec.category, rec.category),
                'amount': money(rec.amount),
                'frequency': rec.frequency,
                'schedule': rec.schedule,
                'monthly': money(monthly),
                'per_day': per_day(monthly, this_month_days),
                'next_date': next_day.isoformat() if next_day else None,
                'is_active': rec.is_active,
                'booked': rec.entries.count(),
            })

        # Cost per project (all time), for the Projects tab
        projects = []
        rows = all_expenses.filter(project__isnull=False).values('project_id', 'project__title', 'category').annotate(s=Sum('amount'), n=Count('id'))
        by_project = {}
        for row in rows:
            entry = by_project.setdefault(row['project_id'], {'id': row['project_id'], 'title': row['project__title'], 'total': ZERO, 'count': 0, 'categories': []})
            entry['total'] += row['s']
            entry['count'] += row['n']
            entry['categories'].append({'label': labels.get(row['category'], row['category']), 'value': row['s']})
        for entry in sorted(by_project.values(), key=lambda e: -e['total']):
            entry['categories'].sort(key=lambda c: -c['value'])
            projects.append({**entry, 'total': money(entry['total']), 'categories': [{**c, 'value': money(c['value'])} for c in entry['categories']]})

        type_counts = dict(all_expenses.order_by().values_list('source').annotate(n=Count('id')))
        type_counts['all'] = all_expenses.count()
        type_counts['project'] = all_expenses.filter(project__isnull=False).count()
        type_counts['pending_requests'] = ExpenseRequest.objects.filter(status='pending').count()

        years_on_record = sorted({d.year for d in all_expenses.dates('date', 'year')} | {today.year}, reverse=True)
        return Response({
            'currency': 'OMR',
            'period': period,
            'year': year,
            'month': month,
            'scope_label': scope_label,
            'scope_total': money(total(scope)),
            'scope_count': scope.count(),
            'scope_per_day': per_day(total(scope), scope_days) if scope_days else None,
            'scope_days': scope_days,
            'fixed': fixed,
            'projects': projects,
            'type_counts': type_counts,
            'source': source,
            'project': project,
            'fixed_totals': {
                'monthly': money(fixed_monthly),
                'per_day': per_day(fixed_monthly, this_month_days),
                'days': this_month_days,
            },
            'tiles': tiles,
            'series': series,
            'categories': categories,
            'years': years_on_record,
        })


def request_payload(req, hr):
    user = hr.user
    return {
        'id': req.pk,
        'title': req.title,
        'amount': money(req.amount),
        'category': dict(Expense.CATEGORY_CHOICES).get(req.category, req.category),
        'project': {'id': req.project_id, 'title': req.project.title} if req.project_id else None,
        'paid_to': req.paid_to,
        'needed_by': req.needed_by.isoformat() if req.needed_by else None,
        'reason': req.reason,
        'attachment': file_value(hr, req.attachment),
        'status': req.status,
        'requested_by': display_name(req.requested_by) if req.requested_by else 'Unknown',
        'mine': req.requested_by_id == user.pk,
        'decided_by': display_name(req.decided_by) if req.decided_by else None,
        'decided_at': req.decided_at.isoformat() if req.decided_at else None,
        'decision_note': req.decision_note,
        'expense_id': req.expense_id,
        'created_at': req.created_at.isoformat(),
    }


class ExpenseRequestsView(AdminAPIView):
    """Requests the user may see (approvers and admins: all; others: their own), with counts."""

    def get(self, request):
        user = request.user
        qs = ExpenseRequest.objects.select_related('project', 'requested_by', 'decided_by', 'requested_by__team_member', 'decided_by__team_member')
        if not approvals.sees_all_requests(user):
            qs = qs.filter(requested_by=user)
        counts = qs.aggregate(
            pending=Count('id', filter=Q(status='pending')),
            approved=Count('id', filter=Q(status='approved')),
            rejected=Count('id', filter=Q(status='rejected')),
        )
        status_ = request.query_params.get('status', 'pending')
        if status_ in dict(ExpenseRequest.STATUS_CHOICES):
            qs = qs.filter(status=status_)
        approver_names, approver_note = approvals.approver_summary()
        pending_total = ExpenseRequest.objects.filter(pk__in=qs.filter(status='pending').values('pk')).aggregate(s=Sum('amount'))['s']
        return Response({
            'items': [request_payload(r, self.hr) for r in qs[:200]],
            'counts': counts,
            'pending_total': money(pending_total),
            'status': status_,
            'can_approve': approvals.can_approve(user),
            'approvers': approver_names,
            'approver_note': approver_note,
        })


class ExpenseRequestDecideView(AdminAPIView):
    def post(self, request, pk):
        if not approvals.can_approve(request.user):
            raise PermissionDenied('Only the expense approver can approve or reject requests.')
        req = ExpenseRequest.objects.filter(pk=pk).first()
        if req is None:
            raise NotFound('Request not found.')
        decision = request.data.get('decision')
        if decision not in ('approve', 'reject'):
            raise ValidationError({'detail': 'Choose approve or reject.'})
        note = str(request.data.get('note', '')).strip()[:1000]
        if not approvals.decide(req, request.user, decision == 'approve', note):
            raise ValidationError({'detail': 'This request has already been decided.'})
        req.refresh_from_db()
        verb = 'approved and added to expenses' if decision == 'approve' else 'rejected'
        return Response({'detail': f'“{req.title}” was {verb}.', 'item': request_payload(req, self.hr)})
