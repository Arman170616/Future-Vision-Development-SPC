import calendar
import datetime as dt
import os
import uuid

from django.conf import settings
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.db import models, transaction
from django.utils import timezone


def receipt_path(instance, filename):
    # Unguessable names: receipts are served from /media/ like other uploads
    ext = os.path.splitext(filename)[1].lower()[:8]
    return f'expenses/receipts/{timezone.now():%Y/%m}/{uuid.uuid4().hex}{ext}'


class Expense(models.Model):
    """Company spending — administrators only (admin panel), never exposed on the public site."""

    CATEGORY_CHOICES = [
        ('salaries', 'Salaries & wages'),
        ('rent', 'Rent & office'),
        ('utilities', 'Utilities & internet'),
        ('software', 'Software & subscriptions'),
        ('hardware', 'Equipment & hardware'),
        ('marketing', 'Marketing & advertising'),
        ('training', 'Training & events'),
        ('travel', 'Travel & transport'),
        ('professional', 'Professional services'),
        ('government', 'Government fees & licences'),
        ('other', 'Other'),
    ]
    PAYMENT_CHOICES = [
        ('bank', 'Bank transfer'),
        ('card', 'Card'),
        ('cash', 'Cash'),
        ('cheque', 'Cheque'),
        ('online', 'Online payment'),
    ]

    date = models.DateField(default=timezone.localdate)
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    amount = models.DecimalField('amount (OMR)', max_digits=12, decimal_places=3, validators=[MinValueValidator(0)])
    paid_to = models.CharField(max_length=150, blank=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='bank')
    reference = models.CharField(max_length=100, blank=True, help_text='Invoice or transaction number')
    notes = models.TextField(blank=True)
    receipt = models.FileField(
        upload_to=receipt_path, blank=True,
        validators=[FileExtensionValidator(['pdf', 'jpg', 'jpeg', 'png', 'webp'])],
        help_text='Optional: PDF or image of the receipt / invoice',
    )
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, editable=False)
    # Set on entries booked automatically from a fixed cost
    recurring = models.ForeignKey(
        'RecurringExpense', null=True, blank=True, on_delete=models.SET_NULL, related_name='entries', editable=False,
        verbose_name='fixed cost',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f'{self.title} — {self.amount} OMR'


def first_of_this_month():
    return timezone.localdate().replace(day=1)


class RecurringExpense(models.Model):
    """A fixed cost (rent, salary, subscription) that books an Expense automatically when it falls due."""

    FREQUENCY_CHOICES = [('monthly', 'Every month'), ('yearly', 'Every year')]

    title = models.CharField(max_length=200, help_text='e.g. Office rent, Salary — Arman, AI Agent subscription')
    category = models.CharField(max_length=20, choices=Expense.CATEGORY_CHOICES, default='other')
    amount = models.DecimalField('amount (OMR)', max_digits=12, decimal_places=3, validators=[MinValueValidator(0)])
    paid_to = models.CharField(max_length=150, blank=True)
    payment_method = models.CharField(max_length=10, choices=Expense.PAYMENT_CHOICES, default='bank')
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='monthly')
    day_of_month = models.PositiveSmallIntegerField(
        default=1, validators=[MinValueValidator(1), MaxValueValidator(31)],
        help_text='Day the cost is booked. 29–31 fall on the last day in shorter months.',
    )
    month_of_year = models.PositiveSmallIntegerField(
        null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(12)],
        help_text='Yearly costs only: month it is booked (1 = January). Defaults to the start month.',
    )
    start_date = models.DateField(
        default=first_of_this_month,
        help_text='First booking on or after this date. A past date books the missed months once.',
    )
    end_date = models.DateField(null=True, blank=True, help_text='Optional: stop booking after this date.')
    is_active = models.BooleanField('active', default=True, help_text='Untick to pause. Paused months are not booked later.')
    notes = models.TextField(blank=True)
    # Bookings up to and including this date are done (entries deleted afterwards are not re-created)
    generated_until = models.DateField(null=True, blank=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['day_of_month', 'title']
        verbose_name = 'fixed cost'
        verbose_name_plural = 'fixed costs'

    def __str__(self):
        return f'{self.title} — {self.amount} OMR / {"month" if self.frequency == "monthly" else "year"}'

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({'end_date': 'End date cannot be before the start date.'})

    @property
    def monthly_amount(self):
        return self.amount if self.frequency == 'monthly' else self.amount / 12

    @property
    def schedule(self):
        day = self.day_of_month
        suffix = 'th' if 11 <= day <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(day % 10, 'th')
        if self.frequency == 'monthly':
            return f'Monthly · {day}{suffix}'
        return f'Yearly · {day}{suffix} {calendar.month_abbr[self.month_of_year or self.start_date.month]}'

    def occurrences(self, start, end):
        """Booking dates between start and end (inclusive)."""
        year, month = start.year, start.month
        booking_month = self.month_of_year or self.start_date.month
        while dt.date(year, month, 1) <= end:
            if self.frequency == 'monthly' or month == booking_month:
                day = dt.date(year, month, min(self.day_of_month, calendar.monthrange(year, month)[1]))
                if start <= day <= end:
                    yield day
            month += 1
            if month > 12:
                year, month = year + 1, 1

    def next_date(self):
        start = self.start_date
        if self.generated_until and self.generated_until >= start:
            start = self.generated_until + dt.timedelta(days=1)
        end = start + dt.timedelta(days=800)
        if self.end_date:
            end = min(end, self.end_date)
        return next(self.occurrences(start, end), None) if start <= end else None


def generate_due_expenses(today=None):
    """Book every fixed cost that has fallen due. Safe to call often (page loads, cron)."""
    today = today or timezone.localdate()
    created = 0
    for rec in RecurringExpense.objects.filter(models.Q(generated_until__isnull=True) | models.Q(generated_until__lt=today)):
        previous = rec.generated_until
        start = rec.start_date if previous is None or previous < rec.start_date else previous + dt.timedelta(days=1)
        end = min(today, rec.end_date) if rec.end_date else today
        with transaction.atomic():
            # Claim the period first so two simultaneous requests cannot book it twice
            claimed = RecurringExpense.objects.filter(pk=rec.pk, generated_until=previous) if previous else \
                RecurringExpense.objects.filter(pk=rec.pk, generated_until__isnull=True)
            if not claimed.update(generated_until=today):
                continue
            if not rec.is_active or start > end:
                continue  # paused: the period is skipped, not booked later
            for day in rec.occurrences(start, end):
                Expense.objects.create(
                    date=day, title=rec.title, category=rec.category, amount=rec.amount, paid_to=rec.paid_to,
                    payment_method=rec.payment_method, notes=rec.notes, recurring=rec,
                )
                created += 1
    return created
