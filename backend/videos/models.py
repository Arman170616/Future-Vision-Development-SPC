import re
from urllib.parse import parse_qs, quote, urlparse

from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator
from django.db import models

VIDEO_EXTENSIONS = ['mp4', 'webm', 'mov', 'm4v']
IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
MAX_VIDEO_MB = 100


def validate_video_size(file):
    if file.size > MAX_VIDEO_MB * 1024 * 1024:
        raise ValidationError(f'The video is larger than {MAX_VIDEO_MB} MB. Upload it to YouTube or Instagram and paste the link instead.')


def embed_for(url):
    """(platform, embed URL) for a video link, or (None, None) when the link is not supported.

    'direct' means a link straight to a video file, played by the browser itself.
    """
    if not url:
        return None, None
    parsed = urlparse(url.strip())
    host = (parsed.hostname or '').lower().removeprefix('www.').removeprefix('m.')
    path = parsed.path.rstrip('/')

    if host in ('youtube.com', 'youtube-nocookie.com', 'youtu.be'):
        video_id = None
        if host == 'youtu.be':
            video_id = path.lstrip('/')
        elif match := re.match(r'^/(?:shorts|embed|live|v)/([\w-]{6,})', path):
            video_id = match.group(1)
        else:
            video_id = (parse_qs(parsed.query).get('v') or [None])[0]
        if video_id and re.fullmatch(r'[\w-]{6,}', video_id):
            return 'youtube', f'https://www.youtube-nocookie.com/embed/{video_id}?autoplay=1&rel=0&playsinline=1'
    elif host in ('vimeo.com', 'player.vimeo.com'):
        if match := re.search(r'/(\d{5,})', path):
            return 'vimeo', f'https://player.vimeo.com/video/{match.group(1)}?autoplay=1'
    elif host == 'instagram.com':
        if match := re.match(r'^/(?:[\w.]+/)?(reels?|p|tv)/([\w-]+)', path):
            kind = 'reel' if match.group(1).startswith('reel') else match.group(1)
            return 'instagram', f'https://www.instagram.com/{kind}/{match.group(2)}/embed'
    elif host == 'tiktok.com':
        if match := re.search(r'/video/(\d+)', path):
            return 'tiktok', f'https://www.tiktok.com/embed/v2/{match.group(1)}'
    elif host in ('facebook.com', 'fb.watch'):
        return 'facebook', f'https://www.facebook.com/plugins/video.php?href={quote(url.strip(), safe="")}&show_text=false'

    if path.rsplit('.', 1)[-1].lower() in VIDEO_EXTENSIONS and parsed.scheme in ('http', 'https'):
        return 'direct', url.strip()
    return None, None


def youtube_thumbnail(embed_url):
    match = re.search(r'/embed/([\w-]+)', embed_url or '')
    return f'https://i.ytimg.com/vi/{match.group(1)}/hqdefault.jpg' if match else ''


class Video(models.Model):
    """A video or reel on the website's home page: an uploaded file or a link (YouTube, Instagram, TikTok …)."""

    FORMAT_CHOICES = [
        ('reel', 'Reel (vertical, 9:16)'),
        ('video', 'Video (landscape, 16:9)'),
    ]

    title = models.CharField(max_length=200)
    title_ar = models.CharField('Title (Arabic)', max_length=200, blank=True)
    caption = models.CharField(max_length=300, blank=True, help_text='Optional short line shown under the title')
    caption_ar = models.CharField('Caption (Arabic)', max_length=300, blank=True)
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES, default='reel',
                              help_text='Reels are shown tall like on Instagram / TikTok, videos wide like on YouTube')
    video_file = models.FileField(
        'Video file', upload_to='videos/', blank=True,
        validators=[FileExtensionValidator(VIDEO_EXTENSIONS), validate_video_size],
        help_text=f'Upload an MP4 (best), WEBM or MOV — up to {MAX_VIDEO_MB} MB. Leave empty when using a link.',
    )
    video_url = models.URLField(
        'Video link', max_length=500, blank=True,
        help_text='Or paste a link: YouTube, YouTube Shorts, Instagram reel, TikTok, Facebook, Vimeo, or a direct .mp4 link.',
    )
    thumbnail = models.FileField(
        'Cover image', upload_to='videos/covers/', blank=True,
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS)],
        help_text='Optional (JPG, PNG, WEBP). YouTube links get their cover automatically.',
    )
    is_published = models.BooleanField('Show on website', default=True)
    order = models.PositiveIntegerField(default=0, help_text='Lower numbers are shown first')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', '-created_at']
        verbose_name = 'Video / Reel'
        verbose_name_plural = 'Videos & Reels'

    def __str__(self):
        return self.title

    def clean(self):
        has_file, has_url = bool(self.video_file), bool(self.video_url)
        if has_file == has_url:
            raise ValidationError('Add either a video file or a video link — one of the two.')
        if has_url and embed_for(self.video_url)[0] is None:
            raise ValidationError({'video_url': 'This link is not supported. Use a YouTube, Instagram, TikTok, Facebook or Vimeo link '
                                                '(full TikTok links: tiktok.com/@name/video/123…), or a direct .mp4 link.'})

    @property
    def platform(self):
        return 'file' if self.video_file else embed_for(self.video_url)[0]
