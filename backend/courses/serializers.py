from rest_framework import serializers
from .models import Course, CourseAttachment, CourseInterest, CourseRegistration


class CourseAttachmentSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    is_image = serializers.ReadOnlyField()

    class Meta:
        model = CourseAttachment
        fields = ['id', 'title', 'name', 'url', 'is_image']

    def get_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url

    def get_name(self, obj):
        return obj.file.name.rsplit('/', 1)[-1]


class CourseSerializer(serializers.ModelSerializer):
    """Serializer for Course model"""
    attachments = CourseAttachmentSerializer(many=True, read_only=True)
    current_enrollments = serializers.ReadOnlyField()
    spots_remaining = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'duration', 'instructor', 'price', 'level', 'course_type',
            'max_students', 'curriculum', 'prerequisites', 'learning_outcomes',
            'start_date', 'end_date', 'is_active', 'is_featured',
            'current_enrollments', 'spots_remaining', 'is_full',
            'attachments', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'current_enrollments', 'spots_remaining', 'is_full']


class CourseListSerializer(serializers.ModelSerializer):
    """Course listing — includes full details so the Courses page can expand each course inline"""
    attachments = CourseAttachmentSerializer(many=True, read_only=True)
    current_enrollments = serializers.ReadOnlyField()
    spots_remaining = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'slug', 'short_description', 'description', 'duration',
            'instructor', 'price', 'level', 'course_type', 'max_students',
            'curriculum', 'prerequisites', 'learning_outcomes',
            'current_enrollments', 'spots_remaining', 'is_full',
            'start_date', 'end_date', 'is_active', 'is_featured', 'attachments'
        ]


class CourseRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for Course Registration"""
    course_name = serializers.CharField(source='course.name', read_only=True)
    course_instructor = serializers.CharField(source='course.instructor', read_only=True)
    
    class Meta:
        model = CourseRegistration
        fields = [
            'id', 'course', 'course_name', 'course_instructor',
            'full_name', 'student_id', 'email', 'phone',
            'interest_reason', 'status', 'registered_at', 'updated_at'
        ]
        read_only_fields = ['id', 'course_name', 'course_instructor', 'status', 'registered_at', 'updated_at']
    
    def validate_email(self, value):
        """Check if user already registered for this course"""
        course_id = self.initial_data.get('course')
        if course_id:
            if CourseRegistration.objects.filter(course_id=course_id, email=value).exists():
                raise serializers.ValidationError(
                    "You have already registered for this course with this email address."
                )
        return value
    
    def validate(self, data):
        """Additional validation for course registration"""
        course = data.get('course')
        
        if course and not course.is_active:
            raise serializers.ValidationError("This course is not currently accepting registrations.")
        
        return data


class CourseRegistrationCreateSerializer(serializers.ModelSerializer):
    """Serializer specifically for creating course registrations"""
    
    class Meta:
        model = CourseRegistration
        fields = [
            'course', 'full_name', 'student_id', 'email', 'phone', 'interest_reason'
        ]
    
    def validate_email(self, value):
        """Check if user already registered for this course"""
        course_id = self.initial_data.get('course')
        if course_id:
            if CourseRegistration.objects.filter(course_id=course_id, email=value).exists():
                raise serializers.ValidationError(
                    "You have already registered for this course with this email address."
                )
        return value
    
    def validate(self, data):
        """Additional validation for course registration"""
        course = data.get('course')
        
        if course and not course.is_active:
            raise serializers.ValidationError("This course is not currently accepting registrations.")
        
        return data


class CourseInterestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseInterest
        fields = ['id', 'course', 'full_name', 'email', 'phone', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_course(self, course):
        if not course.is_active:
            raise serializers.ValidationError("This course is not currently available.")
        return course
