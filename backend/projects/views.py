from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project
from .serializers import ProjectListSerializer, ProjectDetailSerializer


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Project.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'project_type']
    search_fields = ['title', 'description', 'client']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    lookup_field = 'slug'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectListSerializer
