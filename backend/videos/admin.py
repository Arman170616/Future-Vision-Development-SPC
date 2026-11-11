from django.contrib import admin

from .models import Video


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ['title', 'format', 'source', 'is_published', 'order', 'created_at']
    list_filter = ['format', 'is_published']
    list_editable = ['is_published', 'order']
    search_fields = ['title', 'title_ar', 'caption']
    fieldsets = (
        (None, {'fields': (('title', 'title_ar'), ('caption', 'caption_ar'), 'format')}),
        ('Video — upload a file OR paste a link', {'fields': ('video_file', 'video_url', 'thumbnail')}),
        ('On the website', {'fields': (('is_published', 'order'),)}),
    )

    @admin.display(description='Source')
    def source(self, obj):
        return {'file': 'Uploaded file', 'youtube': 'YouTube', 'instagram': 'Instagram', 'tiktok': 'TikTok',
                'facebook': 'Facebook', 'vimeo': 'Vimeo', 'direct': 'Video link'}.get(obj.platform, '—')
