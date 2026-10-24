from django.urls import path

from expenses.views import ExpenseStatsView
from tasks.views import NotificationsView, TaskNotesView, TaskSummaryView

from . import views
from .team_logins import TeamMemberLoginView

urlpatterns = [
    path('auth/login/', views.LoginView.as_view()),
    path('me/', views.MeView.as_view()),
    path('me/password/', views.MePasswordView.as_view()),
    path('index/', views.IndexView.as_view()),
    path('tasks/summary/', TaskSummaryView.as_view()),
    path('tasks/<int:pk>/notes/', TaskNotesView.as_view()),
    path('notifications/', NotificationsView.as_view()),
    path('expenses/stats/', ExpenseStatsView.as_view()),
    path('team-members/<int:pk>/login/', TeamMemberLoginView.as_view()),
    path('models/<str:key>/', views.ModelListView.as_view()),
    path('models/<str:key>/form/', views.ModelFormView.as_view()),
    path('models/<str:key>/action/', views.ActionView.as_view()),
    path('models/<str:key>/bulk-edit/', views.BulkEditView.as_view()),
    path('models/<str:key>/options/', views.OptionsView.as_view()),
    path('models/<str:key>/<str:pk>/', views.ModelDetailView.as_view()),
    path('models/<str:key>/<str:pk>/delete-preview/', views.DeletePreviewView.as_view()),
    path('models/<str:key>/<str:pk>/history/', views.HistoryView.as_view()),
    path('models/<str:key>/<str:pk>/password/', views.UserPasswordView.as_view()),
]
