from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, AiConfigView, AiLogView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('ai-config/', AiConfigView.as_view(), name='ai-config'),
    path('ai-log/', AiLogView.as_view(), name='ai-log'),
]
