import datetime as dt

from django.contrib import admin
from django.utils import timezone

from . import approvals
from .models import Expense, ExpenseRequest, RecurringExpense, generate_due_expenses


class SuperuserOnlyAdmin(admin.ModelAdmin):
    """Hidden from every non-superuser, whatever permissions they hold."""

    def has_module_permission(self, request):
        return request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.register(Expense)
class ExpenseAdmin(SuperuserOnlyAdmin):
    list_display = ['date', 'title', 'category', 'amount', 'paid_to', 'payment_method', 'receipt', 'recurring', 'source', 'project']
    list_filter = ['source', 'project', 'category', 'payment_method', 'date']
    search_fields = ['title', 'paid_to', 'reference', 'notes']
    date_hierarchy = 'date'
    list_per_page = 50
    fieldsets = (
        (None, {'fields': (('date', 'amount'), 'title', ('category', 'payment_method'), 'paid_to', 'reference', 'project')}),
        ('Receipt & notes', {'fields': ('receipt', 'notes')}),
        ('Record', {'fields': ('source', 'recurring', 'recorded_by', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['source', 'recurring', 'recorded_by', 'created_at', 'updated_at']

    def get_queryset(self, request):
        # Fixed costs that fell due since the last visit are booked before the list is shown
        generate_due_expenses()
        return super().get_queryset(request).select_related('recurring', 'project')

    def save_model(self, request, obj, form, change):
        if obj.recorded_by_id is None:
            obj.recorded_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(RecurringExpense)
class RecurringExpenseAdmin(SuperuserOnlyAdmin):
    list_display = ['title', 'amount', 'schedule', 'category', 'paid_to', 'next_booking', 'is_active']
    list_filter = ['is_active', 'frequency', 'category']
    search_fields = ['title', 'paid_to', 'notes']
    list_editable = ['is_active']
    fieldsets = (
        (None, {'fields': (('title', 'amount'), ('category', 'payment_method'), 'paid_to', 'project')}),
        ('Schedule', {
            'fields': (('frequency', 'day_of_month'), 'month_of_year', ('start_date', 'end_date'), 'is_active'),
            'description': 'The expense is booked automatically on this day. Booked entries can still be edited or deleted one by one.',
        }),
        ('Notes', {'fields': ('notes',)}),
        ('Record', {'fields': ('generated_until', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['generated_until', 'created_at', 'updated_at']

    @admin.display(description='next booking')
    def next_booking(self, obj):
        day = obj.next_date() if obj.is_active else None
        return day.strftime('%d %b %Y') if day else '-'

    def save_model(self, request, obj, form, change):
        if change and 'is_active' in form.changed_data and obj.is_active:
            # Resuming: months while paused are skipped; bookings due from today on still happen
            yesterday = timezone.localdate() - dt.timedelta(days=1)
            obj.generated_until = max(obj.generated_until or yesterday, yesterday)
        super().save_model(request, obj, form, change)
        generate_due_expenses()


@admin.register(ExpenseRequest)
class ExpenseRequestAdmin(admin.ModelAdmin):
    """Everyone with a panel login can ask; approvers (the CEO) decide. Decisions go through the panel's Approve/Reject buttons."""

    list_display = ['title', 'amount', 'category', 'project', 'requested_by', 'needed_by', 'status', 'created_at']
    list_filter = ['status', 'category', 'project']
    search_fields = ['title', 'reason', 'paid_to']
    fieldsets = (
        (None, {'fields': (('title', 'amount'), ('category', 'project'), ('paid_to', 'needed_by'), 'reason', 'attachment')}),
        ('Decision', {'fields': ('status', 'decided_by', 'decided_at', 'decision_note', 'expense')}),
        ('Record', {'fields': ('requested_by', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
    readonly_fields = ['status', 'decided_by', 'decided_at', 'decision_note', 'expense', 'requested_by', 'created_at', 'updated_at']

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related('project', 'requested_by', 'decided_by', 'expense')
        return qs if approvals.sees_all_requests(request.user) else qs.filter(requested_by=request.user)

    def _own_pending(self, request, obj):
        return obj is None or (obj.status == 'pending' and (obj.requested_by_id == request.user.pk or request.user.is_superuser))

    # Any panel user may raise a request — no model permission needed
    def has_module_permission(self, request):
        return request.user.is_active and request.user.is_staff

    def has_view_permission(self, request, obj=None):
        return self.has_module_permission(request)

    def has_add_permission(self, request):
        return self.has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        return self.has_module_permission(request) and self._own_pending(request, obj)

    def has_delete_permission(self, request, obj=None):
        return self.has_module_permission(request) and self._own_pending(request, obj)

    def get_readonly_fields(self, request, obj=None):
        if obj is not None and obj.status != 'pending':
            return [f.name for f in self.model._meta.fields if f.name != 'id']
        return self.readonly_fields

    def save_model(self, request, obj, form, change):
        if not change:
            obj.requested_by = request.user
        super().save_model(request, obj, form, change)
        if not change:
            approvals.request_created(obj, request.user)
