from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Activity, UpcomingEvent, Gallery
from .serializers import ActivitySerializer, UpcomingEventSerializer, GallerySerializer, GalleryListSerializer


class ActivityViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']


class UpcomingEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UpcomingEvent.objects.all()
    serializer_class = UpcomingEventSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type']
    search_fields = ['title', 'description']
    ordering_fields = ['date', 'created_at']
    ordering = ['date']


class GalleryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing gallery items (photos and videos).
    Provides list and detail views for gallery items.
    """
    queryset = Gallery.objects.filter(is_public=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['media_type', 'category', 'is_featured', 'activity', 'upcoming_event']
    search_fields = ['title', 'description', 'photographer', 'location']
    ordering_fields = ['taken_date', 'uploaded_at', 'display_order']
    ordering = ['display_order', '-taken_date']
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'list':
            return GalleryListSerializer
        return GallerySerializer
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured gallery items"""
        featured_items = self.queryset.filter(is_featured=True)
        page = self.paginate_queryset(featured_items)
        if page is not None:
            serializer = GalleryListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = GalleryListSerializer(featured_items, many=True)
        return Response({
            'count': featured_items.count(),
            'next': None,
            'previous': None,
            'results': serializer.data
        })
    
    @action(detail=False, methods=['get'])
    def photos(self, request):
        """Get only photos"""
        photos = self.queryset.filter(media_type='photo')
        page = self.paginate_queryset(photos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(photos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def videos(self, request):
        """Get only videos"""
        videos = self.queryset.filter(media_type='video')
        page = self.paginate_queryset(videos)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(videos, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get gallery items grouped by category"""
        categories = Gallery.GALLERY_CATEGORIES
        result = {}
        
        for category_key, category_name in categories:
            items = self.queryset.filter(category=category_key)[:6]  # Limit to 6 per category
            serializer = GalleryListSerializer(items, many=True)
            result[category_key] = {
                'name': category_name,
                'items': serializer.data,
                'total_count': self.queryset.filter(category=category_key).count()
            }
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get gallery statistics"""
        stats = {
            'total_items': self.queryset.count(),
            'photos': self.queryset.filter(media_type='photo').count(),
            'videos': self.queryset.filter(media_type='video').count(),
            'featured': self.queryset.filter(is_featured=True).count(),
            'by_category': {}
        }
        
        for category_key, category_name in Gallery.GALLERY_CATEGORIES:
            stats['by_category'][category_key] = {
                'name': category_name,
                'count': self.queryset.filter(category=category_key).count()
            }
        
        return Response(stats)
