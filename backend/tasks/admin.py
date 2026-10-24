from django.contrib import admin, messages
from django.utils import timezone

from . import activity
from .models import Task

# Members change the status; everything else they write goes in the task's notes thread
MEMBER_EDITABLE = ('status',)


def is_team_member(user):
    """A team-member login: linked to a TeamMember and without full task rights."""
    return (
        not user.is_superuser
        and getattr(user, 'team_member', None) is not None
        and not user.has_perm('tasks.add_task')
    )


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'client', 'frequency', 'start_date', 'end_date', 'status', 'priority', 'approval_status', 'overdue', 'assigned_to']
    list_filter = ['frequency', 'status', 'approval_status', 'priority', 'start_date', 'end_date']
    search_fields = ['title', 'client', 'description']
    list_editable = ['status']
    date_hierarchy = 'start_date'
    list_per_page = 50
    actions = ['approve_tasks', 'reject_tasks', 'mark_completed']
    fieldsets = (
        (None, {'fields': ('title', 'client', 'frequency', 'priority', 'assigned_to')}),
        ('Schedule & progress', {'fields': (('start_date', 'end_date'), ('status', 'completed_at'))}),
        ('Notes', {'fields': ('description',)}),
        ('Approval', {
            'fields': ('approval_status', 'approved_by', 'approved_at'),
            'description': 'Only superusers can approve or reject tasks.',
        }),
        ('Record', {'fields': ('created_by', 'created_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    @admin.display(boolean=True, description='Overdue')
    def overdue(self, obj):
        return obj.is_overdue

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related('assigned_to', 'approved_by', 'created_by')
        if is_team_member(request.user):
            # Team members only ever see the tasks assigned to them
            return qs.filter(assigned_to=request.user.team_member)
        return qs

    def get_readonly_fields(self, request, obj=None):
        readonly = ['approved_by', 'approved_at', 'created_by', 'created_at', 'updated_at', 'completed_at']
        if is_team_member(request.user):
            names = [f.name for f in self.model._meta.fields if f.name not in MEMBER_EDITABLE and f.name != 'id']
            return list(dict.fromkeys(readonly + names))
        if not request.user.is_superuser:
            readonly.append('approval_status')
        return readonly

    def has_add_permission(self, request):
        return not is_team_member(request.user) and super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        return not is_team_member(request.user) and super().has_delete_permission(request, obj)

    def save_model(self, request, obj, form, change):
        if not change and obj.created_by_id is None:
            obj.created_by = request.user
        if obj.status == 'completed' and obj.completed_at is None:
            obj.completed_at = timezone.now()
        elif obj.status != 'completed':
            obj.completed_at = None
        if 'approval_status' in form.changed_data:
            # Recorded only when a superuser changes the approval on the form
            obj.approved_by = request.user if obj.approval_status != 'pending' else None
            obj.approved_at = timezone.now() if obj.approval_status != 'pending' else None
        old = Task.objects.filter(pk=obj.pk).first() if change else None
        super().save_model(request, obj, form, change)
        activity.record_task_saved(obj, request.user, old)

    # ---- approval actions: superusers only ----
    def has_approve_permission(self, request):
        return request.user.is_superuser

    def _set_approval(self, request, queryset, value, verb):
        changed = list(queryset.exclude(approval_status=value))
        updated = queryset.update(approval_status=value, approved_by=request.user, approved_at=timezone.now())
        for task in changed:
            task.approval_status = value
            activity.record_approval(task, request.user)
        for task in queryset:
            self.log_change(request, task, f'{verb.capitalize()} task.')
        self.message_user(request, f'{updated} task{"s" if updated != 1 else ""} {verb}.', messages.SUCCESS)

    @admin.action(description='Approve selected tasks', permissions=['approve'])
    def approve_tasks(self, request, queryset):
        self._set_approval(request, queryset, 'approved', 'approved')

    @admin.action(description='Reject selected tasks', permissions=['approve'])
    def reject_tasks(self, request, queryset):
        self._set_approval(request, queryset, 'rejected', 'rejected')

    @admin.action(description='Mark selected tasks as completed', permissions=['change'])
    def mark_completed(self, request, queryset):
        changed = list(queryset.exclude(status='completed'))
        updated = queryset.update(status='completed', completed_at=timezone.now())
        for task in changed:
            old_status, task.status = task.status, 'completed'
            activity.record_task_saved(task, request.user, old=Task(pk=task.pk, status=old_status, assigned_to_id=task.assigned_to_id, approval_status=task.approval_status))
        self.message_user(request, f'{updated} task{"s" if updated != 1 else ""} marked as completed.', messages.SUCCESS)
