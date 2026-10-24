from rest_framework import mixins, viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from .models import Course, CourseInterest, CourseRegistration
from .serializers import (
    CourseSerializer, CourseListSerializer, 
    CourseRegistrationSerializer, CourseRegistrationCreateSerializer, CourseInterestSerializer
)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing courses.
    Provides list and detail views for courses.
    """
    queryset = Course.objects.filter(is_active=True).prefetch_related('attachments')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['level', 'course_type', 'is_featured']
    search_fields = ['name', 'slug', 'instructor', 'description', 'short_description']
    ordering_fields = ['name', 'price', 'start_date', 'created_at']
    ordering = ['-created_at']
    lookup_field = 'slug'  # Allow lookup by slug instead of just ID
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return CourseListSerializer
        return CourseSerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured courses"""
        featured_courses = self.queryset.filter(is_featured=True)
        serializer = CourseListSerializer(featured_courses, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def registrations(self, request, pk=None):
        """Get registrations for a specific course (admin only in production)"""
        course = self.get_object()
        registrations = CourseRegistration.objects.filter(course=course)
        serializer = CourseRegistrationSerializer(registrations, many=True)
        return Response({
            'course': course.name,
            'total_registrations': registrations.count(),
            'confirmed': registrations.filter(status='confirmed').count(),
            'pending': registrations.filter(status='pending').count(),
            'waitlist': registrations.filter(status='waitlist').count(),
            'registrations': serializer.data
        })


class CourseRegistrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for course registrations.
    Allows students to register for courses and view their registrations.
    """
    queryset = CourseRegistration.objects.all()
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['course', 'status']
    ordering_fields = ['registered_at']
    ordering = ['-registered_at']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return CourseRegistrationCreateSerializer
        return CourseRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        """Create a new course registration"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get the course to check availability
        course = serializer.validated_data['course']
        
        # Check if course is full and set appropriate status
        if course.is_full:
            serializer.save(status='waitlist')
            message = f'Registration successful! You have been added to the waitlist for {course.name}. We will notify you if a spot becomes available.'
        else:
            serializer.save(status='pending')
            message = f'Registration successful! Your application for {course.name} is pending review. We will contact you soon.'
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            {
                'message': message,
                'registration': serializer.data,
                'course_status': {
                    'is_full': course.is_full,
                    'spots_remaining': course.spots_remaining,
                    'current_enrollments': course.current_enrollments
                }
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        """Get registrations for a specific email (query param: email)"""
        email = request.query_params.get('email')
        if not email:
            return Response(
                {'error': 'Email parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        registrations = self.queryset.filter(email=email)
        serializer = self.get_serializer(registrations, many=True)
        return Response({
            'email': email,
            'total_registrations': registrations.count(),
            'registrations': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get registration statistics"""
        total_registrations = self.queryset.count()
        stats = {
            'total_registrations': total_registrations,
            'confirmed': self.queryset.filter(status='confirmed').count(),
            'pending': self.queryset.filter(status='pending').count(),
            'waitlist': self.queryset.filter(status='waitlist').count(),
            'rejected': self.queryset.filter(status='rejected').count(),
        }
        return Response(stats)


class CourseInterestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    """Public "I'm interested" endpoint — create only; leads are reviewed in the Django admin."""
    queryset = CourseInterest.objects.all()
    serializer_class = CourseInterestSerializer
