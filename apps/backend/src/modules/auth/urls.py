from django.urls import path
from .views import AuthMeView, LoginURLView

urlpatterns = [
    path('me/', AuthMeView.as_view(), name='auth-me'),
    path('login-url/', LoginURLView.as_view(), name='auth-login-url'),
]
