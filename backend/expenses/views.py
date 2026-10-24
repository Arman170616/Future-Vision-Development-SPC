import calendar
import datetime as dt
from decimal import Decimal

from django.db.models import Count, Sum
from django.db.models.functions import ExtractYear, TruncDay, TruncMonth
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from adminapi.views import AdminAPIView

from .models import Expense, RecurringExpense, generate_due_expenses

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
        everything = Expense.objects.all()
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

        years_on_record = sorted({d.year for d in everything.dates('date', 'year')} | {today.year}, reverse=True)
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
