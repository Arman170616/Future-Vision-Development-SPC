from rest_framework import serializers
from .models import (
    Project, ProjectTechnology, ProjectFeature, ProjectResult, 
    ProjectGallery, ProjectTestimonial
)


class ProjectTechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTechnology
        fields = ['technology']


class ProjectFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFeature
        fields = ['feature']


class ProjectResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectResult
        fields = ['result']


class ProjectGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectGallery
        fields = ['image_url', 'caption']


class ProjectTestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTestimonial
        fields = ['quote', 'author', 'position']


class ProjectListSerializer(serializers.ModelSerializer):
    technologies = ProjectTechnologySerializer(many=True, read_only=True)
    features = ProjectFeatureSerializer(many=True, read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'category', 'status', 'project_type',
            'tagline', 'product_url', 'title_ar', 'tagline_ar', 'description_ar',
            'client', 'duration', 'team_size', 'image', 'description', 'impact',
            'technologies', 'features', 'created_at'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    technologies = ProjectTechnologySerializer(many=True, read_only=True)
    features = ProjectFeatureSerializer(many=True, read_only=True)
    results = ProjectResultSerializer(many=True, read_only=True)
    gallery = ProjectGallerySerializer(many=True, read_only=True)
    testimonial = ProjectTestimonialSerializer(read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'category', 'status', 'project_type',
            'tagline', 'product_url', 'title_ar', 'tagline_ar', 'description_ar',
            'client', 'duration', 'team_size', 'budget', 'completion_date',
            'image', 'description', 'challenge', 'solution', 'impact',
            'next_steps', 'technologies', 'features', 'results', 
            'gallery', 'testimonial', 'created_at', 'updated_at'
        ]
