"""Task timeline events and bell notifications.

Who hears about a task: every active superuser, the person who created it and the assigned
team member (when they have a login) — never the person who made the change.
"""
from django.contrib.auth import get_user_model

from .models import Notification, Task, TaskNote


def display_name(user):
    if user is None:
        return 'Someone'
    member = getattr(user, 'team_member', None)
    return (member.name if member else None) or user.get_full_name() or user.get_username()


def assignee_user(task):
    member = task.assigned_to
    user = getattr(member, 'user', None) if member else None
    return user if user is not None and user.is_active else None


def watchers(task, exclude=None):
    users = {u.pk: u for u in get_user_model().objects.filter(is_superuser=True, is_active=True)}
    for user in (task.created_by, assignee_user(task)):
        if user is not None and user.is_active:
            users[user.pk] = user
    if exclude is not None:
        users.pop(exclude.pk, None)
    return list(users.values())


def notify(recipients, actor, task, kind, message):
    Notification.objects.bulk_create(
        Notification(recipient=user, actor=actor, task=task, kind=kind, message=message[:255]) for user in recipients
    )


def event(task, actor, body):
    TaskNote.objects.create(task=task, author=actor, kind='event', body=body)


def status_label(value):
    return dict(Task.STATUS_CHOICES).get(value, value)


def record_task_saved(task, actor, old=None):
    """Called after a task is saved in the panel; `old` is the previous copy (None on create)."""
    who = display_name(actor)
    assignee = assignee_user(task)

    if old is None:
        event(task, actor, 'created this task' + (f' and assigned it to {task.assigned_to.name}' if task.assigned_to_id else ''))
        if assignee is not None and assignee != actor:
            notify([assignee], actor, task, 'assigned', f'{who} assigned you a new task: {task.title}')
        others = [u for u in watchers(task, exclude=actor) if u != assignee]
        notify(others, actor, task, 'created', f'{who} created a new task: {task.title}')
        return

    if old.assigned_to_id != task.assigned_to_id:
        event(task, actor, f'assigned this task to {task.assigned_to.name}' if task.assigned_to_id else 'removed the assignee')
        if assignee is not None and assignee != actor:
            notify([assignee], actor, task, 'assigned', f'{who} assigned you a task: {task.title}')

    if old.status != task.status:
        event(task, actor, f'changed the status from {status_label(old.status)} to {status_label(task.status)}')
        notify(watchers(task, exclude=actor), actor, task, 'status', f'{who} marked “{task.title}” as {status_label(task.status)}')

    if old.approval_status != task.approval_status:
        record_approval(task, actor)


def record_approval(task, actor):
    label = dict(Task.APPROVAL_CHOICES).get(task.approval_status, task.approval_status).lower()
    event(task, actor, f'set the approval to {label}')
    assignee = assignee_user(task)
    if assignee is not None and assignee != actor and task.approval_status != 'pending':
        notify([assignee], actor, task, 'approval', f'{display_name(actor)} {label} your task: {task.title}')


def add_note(task, actor, body):
    note = TaskNote.objects.create(task=task, author=actor, kind='note', body=body)
    preview = ' '.join(body.split())
    preview = preview if len(preview) <= 80 else preview[:79] + '…'
    notify(watchers(task, exclude=actor), actor, task, 'note', f'{display_name(actor)} on “{task.title}”: {preview}')
    return note
