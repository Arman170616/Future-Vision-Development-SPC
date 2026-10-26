from django.conf import settings
from django.db import models
from django.utils import timezone


class Task(models.Model):
    """Internal work item — managed only in the admin panel, never exposed on the public site."""

    FREQUENCY_CHOICES = [
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('yearly', 'Yearly'),
        ('once', 'One-time'),
    ]
    STATUS_CHOICES = [
        ('not_started', 'Not started'),
        ('in_progress', 'In progress'),
        ('on_hold', 'On hold'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    APPROVAL_CHOICES = [
        ('pending', 'Pending approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField('task name', max_length=200)
    client = models.CharField(max_length=150, blank=True)
    frequency = models.CharField(max_length=10, choices=FREQUENCY_CHOICES, default='once')
    start_date = models.DateField(default=timezone.localdate)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    # Assigned to a person on the team (Team members), not a login account
    assigned_to = models.ForeignKey(
        'teams.TeamMember', null=True, blank=True, on_delete=models.SET_NULL, related_name='tasks',
        help_text='Team member responsible for this task. Add people under Teams → Team members.',
    )
    description = models.TextField('notes', blank=True)
    completed_at = models.DateTimeField(null=True, blank=True, editable=False)

    # Approval — only superusers may change these (enforced in TaskAdmin)
    approval_status = models.CharField('approval', max_length=10, choices=APPROVAL_CHOICES, default='pending')
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='approved_tasks', editable=False,
    )
    approved_at = models.DateTimeField(null=True, blank=True, editable=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_tasks', editable=False,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['end_date', '-created_at']

    def __str__(self):
        return self.title

    @property
    def is_overdue(self):
        return bool(self.end_date and self.end_date < timezone.localdate() and self.status not in ('completed', 'cancelled'))

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.end_date and self.start_date and self.end_date < self.start_date:
            raise ValidationError({'end_date': 'End date cannot be before the start date.'})


class TaskNote(models.Model):
    """Timeline of a task: notes written by admins / the assigned member, plus automatic events."""

    KIND_CHOICES = [('note', 'Note'), ('event', 'Event')]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='task_notes')
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default='note')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at', 'id']

    def __str__(self):
        return f'{self.task} — {self.body[:40]}'


class Notification(models.Model):
    """In-panel notification (the bell): new assignments, notes, status and approval changes."""

    KIND_CHOICES = [
        ('assigned', 'Assigned'),
        ('created', 'New task'),
        ('note', 'Note'),
        ('status', 'Status'),
        ('approval', 'Approval'),
        ('expense', 'Expense request'),
    ]

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_notifications')
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='+')
    task = models.ForeignKey(Task, null=True, blank=True, on_delete=models.CASCADE, related_name='notifications')
    kind = models.CharField(max_length=10, choices=KIND_CHOICES)
    message = models.CharField(max_length=255)
    # Panel page to open (used by notifications that are not about a task)
    url = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at', '-id']
        indexes = [models.Index(fields=['recipient', 'read_at'])]

    def __str__(self):
        return self.message
