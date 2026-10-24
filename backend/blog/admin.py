from django.contrib import admin
from .models import BlogCategory, BlogPost, BlogTag, BlogPostTag


class BlogPostTagInline(admin.TabularInline):
    model = BlogPostTag
    extra = 1


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'featured', 'created_at', 'published_at']
    list_filter = ['category', 'featured', 'created_at', 'published_at']
    search_fields = ['title', 'excerpt', 'content', 'author']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [BlogPostTagInline]
    date_hierarchy = 'created_at'


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}
