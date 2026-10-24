from rest_framework import serializers
from .models import Activity, ActivityHighlight, UpcomingEvent, Gallery


class ActivityHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityHighlight
        fields = ['highlight']


class GallerySerializer(serializers.ModelSerializer):
    """Serializer for Gallery items"""
    activity_title = serializers.CharField(source='activity.title', read_only=True)
    event_title = serializers.CharField(source='upcoming_event.title', read_only=True)
    display_url = serializers.ReadOnlyField()
    is_youtube_video = serializers.ReadOnlyField()
    is_vimeo_video = serializers.ReadOnlyField()
    
    class Meta:
        model = Gallery
        fields = [
            'id', 'title', 'description', 'media_type', 'category',
            'image_url', 'video_url', 'thumbnail_url',
            'activity', 'activity_title', 'upcoming_event', 'event_title',
            'taken_date', 'photographer', 'location',
            'is_featured', 'is_public', 'display_order',
            'display_url', 'is_youtube_video', 'is_vimeo_video',
            'uploaded_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_at', 'updated_at', 'display_url', 'is_youtube_video', 'is_vimeo_video']


class GalleryListSerializer(serializers.ModelSerializer):
    """Simplified serializer for gallery listings"""
    activity_title = serializers.CharField(source='activity.title', read_only=True)
    event_title = serializers.CharField(source='upcoming_event.title', read_only=True)
    display_url = serializers.ReadOnlyField()
    
    class Meta:
        model = Gallery
        fields = [
            'id', 'title', 'media_type', 'category',
            'display_url', 'taken_date', 'photographer',
            'activity_title', 'event_title', 'is_featured'
        ]


class ActivitySerializer(serializers.ModelSerializer):
    highlights = ActivityHighlightSerializer(many=True, read_only=True)
    gallery_items = GalleryListSerializer(many=True, read_only=True)
    
    class Meta:
        model = Activity
        fields = [
            'id', 'title', 'date', 'type', 'image', 'description', 
            'participants', 'highlights', 'gallery_items', 'created_at', 'updated_at'
        ]


class UpcomingEventSerializer(serializers.ModelSerializer):
    gallery_items = GalleryListSerializer(many=True, read_only=True)
    
    class Meta:
        model = UpcomingEvent
        fields = [
            'id', 'title', 'date', 'type', 'description', 
            'gallery_items', 'created_at', 'updated_at'
        ]
