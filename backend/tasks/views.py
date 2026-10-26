from django.contrib import admin
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.response import Response

from adminapi.views import AdminAPIView

from . import activity
from .models import Notification, Task


class TaskSummaryView(AdminAPIView):
    """Counts for the admin panel's task bar (staff only; there is no public task API)."""

    def get(self, request):
        today = timezone.localdate()
        open_q = ~Q(status__in=['completed', 'cancelled'])
        # Same scoping as the task list: team members only count their own tasks
        tasks = admin.site._registry[Task].get_queryset(self.hr)
        by_frequency = dict(tasks.order_by().values_list('frequency').annotate(n=Count('id')))
        return Response({
            'total': tasks.count(),
            'by_frequency': {key: by_frequency.get(key, 0) for key, _ in Task.FREQUENCY_CHOICES},
            'pending_approval': tasks.filter(approval_status='pending').count(),
            'in_progress': tasks.filter(status='in_progress').count(),
            'completed': tasks.filter(status='completed').count(),
            'overdue': tasks.filter(open_q, end_date__lt=today).count(),
            'due_this_week': tasks.filter(open_q, end_date__gte=today, end_date__lte=today + timezone.timedelta(days=7)).count(),
            'can_approve': request.user.is_superuser,
        })


def note_payload(note, me):
    author = note.author
    return {
        'id': note.pk,
        'kind': note.kind,
        'body': note.body,
        'created_at': note.created_at.isoformat(),
        'author': None if author is None else {
            'id': author.pk,
            'name': activity.display_name(author),
            'role': 'admin' if author.is_superuser else 'team' if getattr(author, 'team_member', None) else 'staff',
        },
        'mine': author is not None and author.pk == me.pk,
    }


class TaskNotesView(AdminAPIView):
    """Notes thread + history of one task. Same visibility as the task itself."""

    def get_task(self, pk):
        ma = admin.site._registry[Task]
        if not ma.has_view_or_change_permission(self.hr):
            raise PermissionDenied()
        task = ma.get_queryset(self.hr).filter(pk=pk).first()
        if task is None:
            raise NotFound('Task not found.')
        return ma, task

    def payload(self, ma, task):
        notes = task.notes.select_related('author', 'author__team_member')
        return {
            'notes': [note_payload(n, self.request.user) for n in notes],
            'can_post': ma.has_change_permission(self.hr, task),
        }

    def get(self, request, pk):
        # Reading the thread does not clear the bell: notifications are marked read from the bell itself
        ma, task = self.get_task(pk)
        return Response(self.payload(ma, task))

    def post(self, request, pk):
        ma, task = self.get_task(pk)
        if not ma.has_change_permission(self.hr, task):
            raise PermissionDenied('You cannot add notes to this task.')
        body = str(request.data.get('body', '')).strip()
        if not body:
            raise ValidationError({'errors': {'body': ['Write a note first.']}})
        if len(body) > 5000:
            raise ValidationError({'errors': {'body': ['Keep notes under 5000 characters.']}})
        activity.add_note(task, request.user, body)
        return Response(self.payload(ma, task), status=status.HTTP_201_CREATED)


class NotificationsView(AdminAPIView):
    """The header bell: latest notifications for the signed-in user."""

    def get(self, request):
        mine = Notification.objects.filter(recipient=request.user)
        items = mine.select_related('actor', 'actor__team_member')[:30]
        return Response({
            'unread': mine.filter(read_at__isnull=True).count(),
            'items': [{
                'id': n.pk,
                'kind': n.kind,
                'message': n.message,
                'task_id': n.task_id,
                'url': n.url,
                'actor': activity.display_name(n.actor) if n.actor else None,
                'created_at': n.created_at.isoformat(),
                'read': n.read_at is not None,
            } for n in items],
        })

    def post(self, request):
        """Mark as read: {"ids": [...]} or {"all": true}."""
        unread = Notification.objects.filter(recipient=request.user, read_at__isnull=True)
        if not request.data.get('all'):
            ids = [i for i in request.data.get('ids', []) if str(i).isdigit()]
            unread = unread.filter(pk__in=ids)
        unread.update(read_at=timezone.now())
        return self.get(request)
