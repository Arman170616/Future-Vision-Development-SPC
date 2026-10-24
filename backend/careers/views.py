from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import JobOpening, JobApplication
from .serializers import JobOpeningSerializer, JobApplicationSerializer


class JobOpeningViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobOpening.objects.filter(is_active=True)
    serializer_class = JobOpeningSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'job_type']
    search_fields = ['title', 'description', 'location']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']


class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['job']
    ordering_fields = ['applied_at']
    ordering = ['-applied_at']

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            {'message': 'Application submitted successfully!', 'data': serializer.data},
            status=status.HTTP_201_CREATED,
            headers=headers
        )
