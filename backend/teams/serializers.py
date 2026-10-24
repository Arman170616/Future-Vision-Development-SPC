from rest_framework import serializers
from .models import Department, TeamMember, Expertise, Achievement


class ExpertiseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expertise
        fields = ['skill']


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['achievement']


class DepartmentSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'icon', 'color', 'member_count']
    
    def get_member_count(self, obj):
        return obj.members.count()


class TeamMemberSerializer(serializers.ModelSerializer):
    expertise = ExpertiseSerializer(many=True, read_only=True)
    achievements = AchievementSerializer(many=True, read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'position', 'department', 'department_name',
            'image', 'bio', 'linkedin_url', 'email', 'expertise', 
            'achievements', 'created_at', 'updated_at'
        ]
