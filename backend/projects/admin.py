from django.contrib import admin
from .models import (
    Project, ProjectTechnology, ProjectFeature, ProjectResult,
    ProjectGallery, ProjectTestimonial
)


class ProjectTechnologyInline(admin.TabularInline):
    model = ProjectTechnology
    extra = 1


class ProjectFeatureInline(admin.TabularInline):
    model = ProjectFeature
    extra = 1


class ProjectResultInline(admin.TabularInline):
    model = ProjectResult
    extra = 1


class ProjectGalleryInline(admin.TabularInline):
    model = ProjectGallery
    extra = 1


class ProjectTestimonialInline(admin.StackedInline):
    model = ProjectTestimonial
    extra = 0


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'project_type', 'category', 'status', 'client', 'created_at']
    list_filter = ['project_type', 'category', 'status', 'created_at']
    search_fields = ['title', 'description', 'client']
    prepopulated_fields = {'slug': ('title',)}
    fieldsets = [
        (None, {'fields': ['project_type', 'title', 'slug', 'category', 'status', 'image', 'description']}),
        ('In-house product', {
            'fields': ['tagline', 'product_url'],
            'description': 'For in-house products: a one-line pitch and a link to the live product or demo.',
        }),
        ('Client project details', {
            'fields': ['client', 'duration', 'team_size', 'budget', 'completion_date',
                       'challenge', 'solution', 'impact', 'next_steps'],
        }),
        ('Arabic (optional)', {
            'fields': ['title_ar', 'tagline_ar', 'description_ar'],
            'description': 'Shown when the site is in Arabic. Leave empty to fall back to English.',
        }),
    ]
    inlines = [
        ProjectTechnologyInline, ProjectFeatureInline, ProjectResultInline,
        ProjectGalleryInline, ProjectTestimonialInline
    ]
