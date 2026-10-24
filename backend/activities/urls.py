from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityViewSet, UpcomingEventViewSet, GalleryViewSet

router = DefaultRouter()
router.register(r'activities', ActivityViewSet)
router.register(r'upcoming-events', UpcomingEventViewSet)
router.register(r'gallery', GalleryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
