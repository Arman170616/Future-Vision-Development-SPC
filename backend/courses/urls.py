from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, CourseRegistrationViewSet, CourseInterestViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet)
router.register(r'registrations', CourseRegistrationViewSet)
router.register(r'course-interests', CourseInterestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
