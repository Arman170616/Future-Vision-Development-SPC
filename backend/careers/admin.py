from django.contrib import admin
from .models import JobOpening, JobRequirement, JobResponsibility, JobApplication


class JobRequirementInline(admin.TabularInline):
    model = JobRequirement
    extra = 1


class JobResponsibilityInline(admin.TabularInline):
    model = JobResponsibility
    extra = 1


@admin.register(JobOpening)
class JobOpeningAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'location', 'job_type', 'is_active', 'created_at']
    list_filter = ['department', 'job_type', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'location']
    inlines = [JobRequirementInline, JobResponsibilityInline]


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'job', 'email', 'experience_level', 'applied_at']
    list_filter = ['job', 'experience_level', 'applied_at']
    search_fields = ['name', 'email', 'job__title']
    readonly_fields = ['applied_at']
