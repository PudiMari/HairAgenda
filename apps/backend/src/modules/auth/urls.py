from django.urls import path
from .views import AuthMeView

urlpatterns = [
    path('me/', AuthMeView.as_view(), name='auth-me'),
]
