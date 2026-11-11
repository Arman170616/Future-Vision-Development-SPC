from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Video
from .serializers import VideoSerializer


class VideoListView(generics.ListAPIView):
    """Published videos and reels for the website's home page."""

    queryset = Video.objects.filter(is_published=True)
    serializer_class = VideoSerializer
    permission_classes = [AllowAny]
