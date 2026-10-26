"""Who approves expense requests, and what approving / rejecting does.

Approvers, in order of preference:
1. the active members of the "Expense approvers" group (ticked on a team member's login);
2. otherwise the CEO — the team member whose position is Chief Executive Officer — once she has a login;
3. otherwise administrators (superusers) approve on her behalf, so requests are never stuck.
"""
import re

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.db import transaction
from django.utils import timezone

from tasks.activity import display_name
from tasks.models import Notification

from .models import Expense, ExpenseRequest

APPROVER_GROUP = 'Expense approvers'
REQUESTS_URL = '/requests/'


def approver_group():
    return Group.objects.get_or_create(name=APPROVER_GROUP)[0]


CEO_POSITION = re.compile(r'\bchief executive\b|\bceo\b', re.IGNORECASE)


def ceo_member():
    from teams.models import TeamMember
    return next((m for m in TeamMember.objects.select_related('user').order_by('id') if CEO_POSITION.search(m.position or '')), None)


def approvers():
    users = list(get_user_model().objects.filter(groups__name=APPROVER_GROUP, is_active=True))
    if users:
        return users
    ceo = ceo_member()
    if ceo is not None and ceo.user is not None and ceo.user.is_active:
        return [ceo.user]
    return list(get_user_model().objects.filter(is_superuser=True, is_active=True))


def approver_summary():
    """Names shown on the Requests page, and a hint when administrators stand in for the CEO."""
    users = list(get_user_model().objects.filter(groups__name=APPROVER_GROUP, is_active=True))
    if users:
        return [display_name(u) for u in users], ''
    ceo = ceo_member()
    if ceo is None:
        return [display_name(u) for u in approvers()], ''
    if ceo.user is not None and ceo.user.is_active:
        return [ceo.name], ''
    return [ceo.name], f'{ceo.name} has no admin-panel login yet — administrators approve on her behalf until one is created.'


def can_approve(user):
    return any(u.pk == user.pk for u in approvers())


def is_approver_member(user):
    return user.groups.filter(name=APPROVER_GROUP).exists()


def sees_all_requests(user):
    return user.is_superuser or can_approve(user)


def notify(users, actor, message, url=REQUESTS_URL):
    Notification.objects.bulk_create(
        Notification(recipient=u, actor=actor, kind='expense', message=message[:255], url=url)
        for u in {u.pk: u for u in users if u is not None and u.is_active and (actor is None or u.pk != actor.pk)}.values()
    )


def request_created(req, actor):
    notify(approvers(), actor, f'{display_name(actor)} requests {req.amount:.3f} OMR: {req.title} — needs your approval')


def decide(req, actor, approve, note=''):
    """Approve (books the expense) or reject a pending request."""
    with transaction.atomic():
        # Lock-free guard: only the first decision on a pending request wins
        updated = ExpenseRequest.objects.filter(pk=req.pk, status='pending').update(
            status='approved' if approve else 'rejected', decided_by=actor, decided_at=timezone.now(), decision_note=note,
        )
        if not updated:
            return False
        req.refresh_from_db()
        if approve:
            req.expense = Expense.objects.create(
                date=timezone.localdate(), title=req.title, category=req.category, amount=req.amount,
                paid_to=req.paid_to, project=req.project, source='request', recorded_by=actor,
                notes=f'Approved request by {display_name(req.requested_by)}: {req.reason}' + (f'\nApprover note: {note}' if note else ''),
            )
            req.save(update_fields=['expense'])

    verb = 'approved' if approve else 'rejected'
    others = list(get_user_model().objects.filter(is_superuser=True, is_active=True))
    notify([req.requested_by], actor, f'{display_name(actor)} {verb} your request: {req.title}' + (f' — “{note}”' if note else ''))
    notify([u for u in others if req.requested_by is None or u.pk != req.requested_by.pk], actor,
           f'{display_name(actor)} {verb} {req.amount:.3f} OMR for {req.title}')
    return True
