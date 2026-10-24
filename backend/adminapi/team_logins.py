"""Create / update / remove the admin-panel login of a team member (superusers only)."""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group, Permission
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.response import Response

from teams.models import TeamMember

from .views import AdminAPIView

GROUP_NAME = 'Team Members'
# Team members can see and update the tasks assigned to them — nothing else.
GROUP_PERMS = ['tasks.view_task', 'tasks.change_task']


def team_group():
    group, _ = Group.objects.get_or_create(name=GROUP_NAME)
    perms = []
    for code in GROUP_PERMS:
        app_label, codename = code.split('.')
        perms.extend(Permission.objects.filter(content_type__app_label=app_label, codename=codename))
    group.permissions.set(perms)
    return group


def login_info(member):
    user = member.user
    if user is None:
        return {'has_login': False, 'member': member.name}
    return {
        'has_login': True,
        'member': member.name,
        'username': user.get_username(),
        'email': user.email,
        'is_active': user.is_active,
        'last_login': user.last_login.isoformat() if user.last_login else None,
    }


class TeamMemberLoginView(AdminAPIView):
    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if not request.user.is_superuser:
            raise PermissionDenied('Only administrators can manage team member logins.')

    def get_member(self, pk):
        member = TeamMember.objects.select_related('user').filter(pk=pk).first()
        if member is None:
            raise NotFound('Team member not found.')
        return member

    def get(self, request, pk):
        return Response(login_info(self.get_member(pk)))

    def post(self, request, pk):
        """Create the login, or update username / password / active state of an existing one."""
        member = self.get_member(pk)
        User = get_user_model()
        username = str(request.data.get('username') or '').strip()
        password = str(request.data.get('password') or '')
        is_active = request.data.get('is_active')
        user = member.user
        errors = {}

        if user is None and not username:
            errors['username'] = ['Choose a username.']
        if username:
            clash = User.objects.filter(username__iexact=username)
            if user is not None:
                clash = clash.exclude(pk=user.pk)
            if clash.exists():
                errors['username'] = ['That username is already taken.']
            else:
                try:
                    User.username_validator(username)
                except DjangoValidationError as exc:
                    errors['username'] = list(exc.messages)
        if user is None and not password:
            errors['password'] = ['Choose a password.']
        if password:
            candidate = user or User(username=username, first_name=member.name, email=member.email)
            try:
                validate_password(password, candidate)
            except DjangoValidationError as exc:
                errors['password'] = list(exc.messages)
        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            created = user is None
            if created:
                first, _, last = member.name.partition(' ')
                user = User(username=username, email=member.email, first_name=first[:150], last_name=last[:150])
            elif username:
                user.username = username
            user.is_staff = True          # may sign in to the admin panel …
            user.is_superuser = False     # … with team-member rights only
            if is_active is not None:
                user.is_active = bool(is_active)
            elif created:
                user.is_active = True
            if password:
                user.set_password(password)  # also signs the person out everywhere
            user.save()
            user.groups.add(team_group())
            if created:
                member.user = user
                member.save(update_fields=['user'])

        verb = 'created' if created else 'updated'
        return Response({**login_info(member), 'detail': f'Login for {member.name} {verb}.'},
                        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, pk):
        """Remove access: the login account is deleted, the team member stays."""
        member = self.get_member(pk)
        if member.user is None:
            return Response({'detail': 'This team member has no login.'}, status=status.HTTP_400_BAD_REQUEST)
        member.user.delete()
        member.refresh_from_db()
        return Response({**login_info(member), 'detail': f'Login for {member.name} removed.'})
