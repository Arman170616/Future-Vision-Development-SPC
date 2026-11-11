from django.contrib.auth import get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from tasks.models import Notification

from .models import ContactMessage
from .serializers import ContactMessageSerializer


class ContactRateThrottle(AnonRateThrottle):
    scope = 'contact'
    rate = '5/min'


class ContactMessageCreateView(generics.CreateAPIView):
    """Public, create only: messages are read in the admin panel."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        website = serializer.validated_data.pop('website', '')
        if not website:  # a filled honeypot looks like success to the bot, but nothing is saved
            message = serializer.save()
            Notification.objects.bulk_create(
                Notification(
                    recipient=user, kind='contact', url=f'/edit/?model=contact.contactmessage&id={message.pk}',
                    message=f'New website message from {message.name}: {message.get_subject_display()}'[:255],
                )
                for user in get_user_model().objects.filter(is_superuser=True, is_active=True)
            )
        return Response({'detail': 'Message received.'}, status=status.HTTP_201_CREATED)
