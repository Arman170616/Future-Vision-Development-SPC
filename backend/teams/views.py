from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Department, TeamMember
from .serializers import DepartmentSerializer, TeamMemberSerializer


class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name']
    ordering = ['name']


class TeamMemberViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department']
    search_fields = ['name', 'position', 'bio']
    ordering_fields = ['name', 'created_at']
    ordering = ['department', 'name']
