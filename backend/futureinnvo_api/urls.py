"""
URL configuration for futureinnvo_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
import mimetypes
import os
import re

from django.core.exceptions import SuspiciousFileOperation
from django.http import Http404, HttpResponse, StreamingHttpResponse
from django.urls import path, include, re_path
from django.utils._os import safe_join
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.clickjacking import xframe_options_exempt


RANGE_RE = re.compile(r'^bytes=(\d*)-(\d*)$')


def _file_chunks(fh, length, chunk=64 * 1024):
    with fh:
        while length > 0:
            data = fh.read(min(chunk, length))
            if not data:
                break
            length -= len(data)
            yield data


def serve_range(path, start_s, end_s):
    """206 Partial Content for "Range: bytes=…" — Safari and iPhones only play videos served this way."""
    try:
        full = safe_join(settings.MEDIA_ROOT, path)
    except SuspiciousFileOperation:
        raise Http404
    if not os.path.isfile(full):
        raise Http404
    size = os.path.getsize(full)
    if start_s == '':  # "bytes=-500": the last 500 bytes
        start, end = max(size - int(end_s), 0), size - 1
    else:
        start, end = int(start_s), min(int(end_s), size - 1) if end_s else size - 1
    if size == 0 or start >= size or start > end:
        response = HttpResponse(status=416)
        response['Content-Range'] = f'bytes */{size}'
        return response
    fh = open(full, 'rb')
    fh.seek(start)
    length = end - start + 1
    response = StreamingHttpResponse(_file_chunks(fh, length), status=206,
                                     content_type=mimetypes.guess_type(full)[0] or 'application/octet-stream')
    response['Content-Length'] = str(length)
    response['Content-Range'] = f'bytes {start}-{end}/{size}'
    return response


@xframe_options_exempt
def serve_media(request, path):
    """Uploaded files, readable inside the website's document viewer (course PDFs) — but only framed by our own sites."""
    match = RANGE_RE.match(request.META.get('HTTP_RANGE', '').strip())
    if match and match.group(1) + match.group(2):
        response = serve_range(path, *match.groups())
    else:
        response = serve(request, path, document_root=settings.MEDIA_ROOT)
    response['Accept-Ranges'] = 'bytes'
    sites =["'self'", 'https://futureinnvo.com', 'https://www.futureinnvo.com', *settings.CORS_ALLOWED_ORIGINS]
    response['Content-Security-Policy'] = 'frame-ancestors ' + ' '.join(dict.fromkeys(sites))
    return response


urlpatterns = [
    # Django's own admin UI is intentionally not routed: the Next.js panel at futureinnvo.com/admin
    # (backed by api/admin/) replaces it. django.contrib.admin stays installed for ModelAdmin + history.
    path('api/v1/', include('activities.urls')),
    path('api/v1/', include('teams.urls')),
    path('api/v1/', include('projects.urls')),
    path('api/v1/', include('blog.urls')),
    path('api/v1/', include('careers.urls')),
    path('api/v1/', include('courses.urls')),
    path('api/v1/', include('contact.urls')),
    path('api/v1/', include('videos.urls')),
    path('api/admin/', include('adminapi.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    print("Debug mode enabled")

# cPanel's Python app has no separate media server, so Django serves uploaded files (course files)
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_media),
]
