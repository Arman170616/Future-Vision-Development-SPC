from django.contrib import admin
from django.utils.html import format_html
from .models import Activity, ActivityHighlight, UpcomingEvent, Gallery


class ActivityHighlightInline(admin.TabularInline):
    model = ActivityHighlight
    extra = 1


class GalleryInline(admin.TabularInline):
    model = Gallery
    extra = 0
    fields = ['title', 'media_type', 'category', 'taken_date', 'is_featured']
    readonly_fields = ['uploaded_at']


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'type', 'participants', 'created_at']
    list_filter = ['type', 'date', 'created_at']
    search_fields = ['title', 'description']
    inlines = [ActivityHighlightInline, GalleryInline]
    date_hierarchy = 'date'


@admin.register(UpcomingEvent)
class UpcomingEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'type', 'created_at']
    list_filter = ['type', 'date', 'created_at']
    search_fields = ['title', 'description']
    inlines = [GalleryInline]
    date_hierarchy = 'date'


@admin.register(Gallery)
class GalleryAdmin(admin.ModelAdmin):
    list_display = ['title', 'media_type', 'category', 'taken_date', 'is_featured', 'is_public', 'display_order', 'display_thumbnail', 'uploaded_at']
    list_filter = ['media_type', 'category', 'is_featured', 'is_public', 'taken_date', 'uploaded_at']
    search_fields = ['title', 'description', 'photographer', 'location']
    readonly_fields = ['uploaded_at', 'updated_at', 'display_thumbnail']
    list_editable = ['is_featured', 'is_public', 'display_order']
    date_hierarchy = 'taken_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'media_type', 'category')
        }),
        ('Media URLs', {
            'fields': ('image_url', 'video_url', 'thumbnail_url'),
            'description': 'Provide appropriate URLs based on media type'
        }),
        ('Relationships', {
            'fields': ('activity', 'upcoming_event'),
            'classes': ('collapse',),
            'description': 'Optional: Link to specific activity or event'
        }),
        ('Metadata', {
            'fields': ('taken_date', 'photographer', 'location'),
            'classes': ('collapse',)
        }),
        ('Display Settings', {
            'fields': ('is_featured', 'is_public', 'display_order')
        }),
        ('Timestamps', {
            'fields': ('uploaded_at', 'updated_at'),
            'classes': ('collapse',)
        }),
        ('Preview', {
            'fields': ('display_thumbnail',),
            'classes': ('collapse',)
        })
    )
    
    def display_thumbnail(self, obj):
        """Display thumbnail in admin"""
        if obj.media_type == 'photo' and obj.image_url:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 8px;" />',
                obj.image_url
            )
        elif obj.media_type == 'video' and obj.thumbnail_url:
            return format_html(
                '<img src="{}" width="100" height="100" style="object-fit: cover; border-radius: 8px;" /><br/><small>Video Thumbnail</small>',
                obj.thumbnail_url
            )
        elif obj.media_type == 'video':
            return format_html(
                '<div style="width: 100px; height: 100px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; border-radius: 8px;"><span>🎥</span><br/><small>Video</small></div>'
            )
        return "No preview"
    display_thumbnail.short_description = "Preview"
    
    actions = ['mark_as_featured', 'mark_as_not_featured', 'make_public', 'make_private']
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} items marked as featured.')
    mark_as_featured.short_description = "Mark selected items as featured"
    
    def mark_as_not_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} items unmarked as featured.')
    mark_as_not_featured.short_description = "Remove featured status"
    
    def make_public(self, request, queryset):
        updated = queryset.update(is_public=True)
        self.message_user(request, f'{updated} items made public.')
    make_public.short_description = "Make selected items public"
    
    def make_private(self, request, queryset):
        updated = queryset.update(is_public=False)
        self.message_user(request, f'{updated} items made private.')
    make_private.short_description = "Make selected items private"
