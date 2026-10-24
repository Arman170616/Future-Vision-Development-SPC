from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, TeamMemberViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'members', TeamMemberViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
