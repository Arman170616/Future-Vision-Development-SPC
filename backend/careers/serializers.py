from rest_framework import serializers
from .models import JobOpening, JobRequirement, JobResponsibility, JobApplication


class JobRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobRequirement
        fields = ['requirement']


class JobResponsibilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = JobResponsibility
        fields = ['responsibility']


class JobOpeningSerializer(serializers.ModelSerializer):
    requirements = JobRequirementSerializer(many=True, read_only=True)
    responsibilities = JobResponsibilitySerializer(many=True, read_only=True)
    
    class Meta:
        model = JobOpening
        fields = [
            'id', 'title', 'department', 'location', 'job_type', 
            'experience_required', 'description', 'requirements', 
            'responsibilities', 'is_active', 'created_at', 'updated_at'
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    
    class Meta:
        model = JobApplication
        fields = [
            'id', 'job', 'job_title', 'name', 'email', 'phone', 
            'experience_level', 'cover_letter', 'applied_at'
        ]
        read_only_fields = ['applied_at']
