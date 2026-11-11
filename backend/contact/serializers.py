from rest_framework import serializers

from .models import ContactMessage


class ContactMessageSerializer(serializers.ModelSerializer):
    # Hidden on the page: only bots fill it in
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'company', 'subject', 'message', 'website']

    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Please enter a message with at least 10 characters.')
        return value
