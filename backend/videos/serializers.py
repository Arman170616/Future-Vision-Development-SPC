from rest_framework import serializers

from .models import Video, embed_for, youtube_thumbnail


class VideoSerializer(serializers.ModelSerializer):
    platform = serializers.SerializerMethodField()
    src = serializers.SerializerMethodField()
    embed_url = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ['id', 'title', 'title_ar', 'caption', 'caption_ar', 'format', 'platform', 'src', 'embed_url', 'thumbnail', 'created_at']

    def _absolute(self, url):
        request = self.context.get('request')
        return request.build_absolute_uri(url) if request else url

    def get_platform(self, obj):
        return obj.platform

    def get_src(self, obj):
        """Playable file address (uploaded file or direct .mp4 link); empty for embedded platforms."""
        if obj.video_file:
            return self._absolute(obj.video_file.url)
        platform, url = embed_for(obj.video_url)
        return url if platform == 'direct' else ''

    def get_embed_url(self, obj):
        if obj.video_file:
            return ''
        platform, url = embed_for(obj.video_url)
        return '' if platform == 'direct' else (url or '')

    def get_thumbnail(self, obj):
        if obj.thumbnail:
            return self._absolute(obj.thumbnail.url)
        return youtube_thumbnail(self.get_embed_url(obj))
