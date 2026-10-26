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
from django.urls import path, include, re_path
from django.views.static import serve
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.clickjacking import xframe_options_exempt


@xframe_options_exempt
def serve_media(request, path):
    """Uploaded files, readable inside the website's document viewer (course PDFs) — but only framed by our own sites."""
    response = serve(request, path, document_root=settings.MEDIA_ROOT)
    sites = ["'self'", 'https://futureinnvo.com', 'https://www.futureinnvo.com', *settings.CORS_ALLOWED_ORIGINS]
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
    path('api/admin/', include('adminapi.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    print("Debug mode enabled")

# cPanel's Python app has no separate media server, so Django serves uploaded files (course files)
urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_media),
]
