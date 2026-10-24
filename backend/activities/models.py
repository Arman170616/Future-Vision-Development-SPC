from django.db import models
from django.utils import timezone
from django.core.validators import FileExtensionValidator


class Activity(models.Model):
    ACTIVITY_TYPES = [
        ('conference', 'Conference'),
        ('education', 'Education'),
        ('sustainability', 'Sustainability'),
        ('community_outreach', 'Community Outreach'),
        ('facility', 'Facility'),
        ('competition', 'Competition'),
        ('workshop', 'Workshop'),
        ('networking', 'Networking'),
    ]

    title = models.CharField(max_length=200)
    date = models.DateField()
    type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    image = models.URLField()
    description = models.TextField()
    participants = models.CharField(max_length=50)  # e.g., "500+", "150+"

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Activities"
        ordering = ['-date']

    def __str__(self):
        return self.title


class ActivityHighlight(models.Model):
    activity = models.ForeignKey(Activity, related_name='highlights', on_delete=models.CASCADE)
    highlight = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.activity.title} - {self.highlight[:50]}"


class UpcomingEvent(models.Model):
    EVENT_TYPES = [
        ('workshop', 'Workshop'),
        ('education', 'Education'),
        ('networking', 'Networking'),
        ('conference', 'Conference'),
        ('competition', 'Competition'),
    ]

    title = models.CharField(max_length=200)
    date = models.DateField()
    type = models.CharField(max_length=50, choices=EVENT_TYPES)
    description = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date']

    def __str__(self):
        return self.title


class Gallery(models.Model):
    """Model for storing photos and videos from company activities and events"""
    
    MEDIA_TYPES = [
        ('photo', 'Photo'),
        ('video', 'Video'),
    ]
    
    GALLERY_CATEGORIES = [
        ('activity', 'Activity'),
        ('event', 'Upcoming Event'),
        ('conference', 'Conference'),
        ('workshop', 'Workshop'),
        ('facility', 'Facility Tour'),
        ('team', 'Team Building'),
        ('achievement', 'Achievement'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200, help_text="Title for the photo/video")
    description = models.TextField(blank=True, help_text="Optional description")
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPES)
    category = models.CharField(max_length=20, choices=GALLERY_CATEGORIES, default='other')
    
    # Media files
    image_url = models.URLField(blank=True, help_text="URL for photos (e.g., from cloud storage)")
    video_url = models.URLField(blank=True, help_text="URL for videos (e.g., YouTube, Vimeo)")
    thumbnail_url = models.URLField(blank=True, help_text="Thumbnail image URL for videos")
    
    # Relationships
    activity = models.ForeignKey(
        Activity, 
        related_name='gallery_items', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Link to specific activity (optional)"
    )
    upcoming_event = models.ForeignKey(
        UpcomingEvent, 
        related_name='gallery_items', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        help_text="Link to specific upcoming event (optional)"
    )
    
    # Metadata
    taken_date = models.DateField(help_text="Date when photo/video was taken")
    photographer = models.CharField(max_length=100, blank=True, help_text="Photographer/videographer name")
    location = models.CharField(max_length=200, blank=True, help_text="Location where media was captured")
    
    # Display settings
    is_featured = models.BooleanField(default=False, help_text="Show in featured gallery")
    is_public = models.BooleanField(default=True, help_text="Visible to public")
    display_order = models.PositiveIntegerField(default=0, help_text="Order for display (0 = first)")
    
    # Timestamps
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Gallery Items"
        ordering = ['display_order', '-taken_date', '-uploaded_at']
    
    def __str__(self):
        return f"{self.title} ({self.media_type})"
    
    def clean(self):
        """Validate that appropriate URLs are provided based on media type"""
        from django.core.exceptions import ValidationError
        
        if self.media_type == 'photo' and not self.image_url:
            raise ValidationError({'image_url': 'Image URL is required for photos.'})
        
        if self.media_type == 'video' and not self.video_url:
            raise ValidationError({'video_url': 'Video URL is required for videos.'})
    
    @property
    def display_url(self):
        """Return the appropriate URL for display"""
        if self.media_type == 'photo':
            return self.image_url
        elif self.media_type == 'video':
            return self.thumbnail_url or self.video_url
        return None
    
    @property
    def is_youtube_video(self):
        """Check if video is from YouTube"""
        return self.video_url and 'youtube.com' in self.video_url or 'youtu.be' in self.video_url
    
    @property
    def is_vimeo_video(self):
        """Check if video is from Vimeo"""
        return self.video_url and 'vimeo.com' in self.video_url
