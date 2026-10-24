"""Signed, stateless bearer tokens for the Next.js admin panel.

A token embeds the user id and the user's session auth hash, so changing the
password (or deactivating the user / removing staff status) invalidates it.
"""
from django.contrib.auth import get_user_model
from django.core import signing
from django.utils.crypto import constant_time_compare
from rest_framework import exceptions
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.permissions import BasePermission
from rest_framework.throttling import AnonRateThrottle

TOKEN_SALT = 'adminapi.token'
TOKEN_MAX_AGE = 60 * 60 * 12  # 12 hours


def make_token(user):
    return signing.dumps({'u': user.pk, 'h': user.get_session_auth_hash()}, salt=TOKEN_SALT, compress=True)


class SignedTokenAuthentication(BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        header = get_authorization_header(request).split()
        if not header or header[0].lower() != self.keyword.lower().encode():
            return None
        if len(header) != 2:
            raise exceptions.AuthenticationFailed('Invalid authorization header.')
        token = header[1].decode()
        try:
            data = signing.loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE)
        except signing.SignatureExpired:
            raise exceptions.AuthenticationFailed('Your session has expired. Please log in again.')
        except signing.BadSignature:
            raise exceptions.AuthenticationFailed('Invalid session. Please log in again.')

        user = get_user_model().objects.filter(pk=data.get('u')).first()
        if (
            user is None
            or not user.is_active
            or not user.is_staff
            or not constant_time_compare(user.get_session_auth_hash(), data.get('h', ''))
        ):
            raise exceptions.AuthenticationFailed('Invalid session. Please log in again.')
        return user, token

    def authenticate_header(self, request):
        return self.keyword


class IsActiveStaff(BasePermission):
    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_active and user.is_staff)


class LoginRateThrottle(AnonRateThrottle):
    rate = '10/min'
