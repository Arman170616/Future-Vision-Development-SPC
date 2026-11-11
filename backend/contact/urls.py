from django.urls import path

from .views import ContactMessageCreateView

urlpatterns = [
    path('contact-messages/', ContactMessageCreateView.as_view()),
]
