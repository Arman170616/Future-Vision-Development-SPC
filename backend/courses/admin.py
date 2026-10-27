from django.contrib import admin
from django.utils.html import format_html
from .models import Course, CourseAttachment, CourseInterest, CourseRegistration


class CourseAttachmentInline(admin.TabularInline):
    model = CourseAttachment
    extra = 1
    fields = ['file', 'title', 'order', 'preview']
    readonly_fields = ['preview']

    def preview(self, obj):
        if not obj.pk or not obj.file:
            return '-'
        if obj.is_image:
            return format_html('<img src="{}" style="max-height:60px;border-radius:6px" />', obj.file.url)
        return format_html('<a href="{}" target="_blank">Open file</a>', obj.file.url)


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    inlines = [CourseAttachmentInline]
    list_display = ['name', 'instructor', 'level', 'course_type', 'price', 'current_enrollments', 'is_active', 'created_at']
    list_filter = ['level', 'course_type', 'is_active', 'is_featured', 'created_at']
    search_fields = ['name', 'instructor', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at', 'current_enrollments']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'short_description', 'description')
        }),
        ('Course Details', {
            'fields': ('instructor', 'duration', 'level', 'course_type', 'price')
        }),
        ('Content', {
            'fields': ('curriculum', 'prerequisites', 'learning_outcomes'),
            'classes': ('collapse',)
        }),
        ('Scheduling', {
            'fields': ('start_date', 'end_date')
        }),
        ('Status', {
            'fields': ('is_active', 'is_featured')
        }),
        ('Statistics', {
            'fields': ('current_enrollments',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(CourseRegistration)
class CourseRegistrationAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'course', 'email', 'phone', 'status', 'registered_at']
    list_filter = ['status', 'course', 'registered_at']
    search_fields = ['full_name', 'email', 'student_id', 'course__name']
    readonly_fields = ['registered_at', 'updated_at']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('full_name', 'student_id', 'email', 'phone')
        }),
        ('Course & Interest', {
            'fields': ('course', 'interest_reason')
        }),
        ('Registration Status', {
            'fields': ('status', 'admin_notes')
        }),
        ('Timestamps', {
            'fields': ('registered_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['approve_registrations', 'reject_registrations', 'move_to_waitlist']
    
    def approve_registrations(self, request, queryset):
        updated = queryset.update(status='confirmed')
        self.message_user(request, f'{updated} registrations were approved.')
    approve_registrations.short_description = "Approve selected registrations"
    
    def reject_registrations(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} registrations were rejected.')
    reject_registrations.short_description = "Reject selected registrations"
    
    def move_to_waitlist(self, request, queryset):
        updated = queryset.update(status='waitlist')
        self.message_user(request, f'{updated} registrations were moved to waitlist.')
    move_to_waitlist.short_description = "Move selected registrations to waitlist"


@admin.register(CourseInterest)
class CourseInterestAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'course', 'email', 'phone', 'contacted', 'created_at']
    list_filter = ['contacted', 'course', 'created_at']
    list_editable = ['contacted']
    search_fields = ['full_name', 'email', 'phone', 'course__name']
    readonly_fields = ['created_at']
