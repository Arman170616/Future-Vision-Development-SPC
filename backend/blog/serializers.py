from rest_framework import serializers
from .models import BlogCategory, BlogPost, BlogTag, BlogPostTag


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug']


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = ['id', 'name', 'slug']


class BlogPostListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'author', 'category', 
            'category_name', 'image', 'read_time', 'featured', 
            'tags', 'created_at', 'published_at'
        ]
    
    def get_tags(self, obj):
        return [tag.tag.name for tag in obj.tags.all()]


class BlogPostDetailSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'author', 
            'category', 'category_name', 'image', 'read_time', 
            'featured', 'tags', 'created_at', 'updated_at', 'published_at'
        ]
    
    def get_tags(self, obj):
        return [tag.tag.name for tag in obj.tags.all()]
