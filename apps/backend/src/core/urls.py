from django.urls import path, include
from src.modules.health.views import health_check

urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    path('api/', include('src.modules.booking.urls')),
]
