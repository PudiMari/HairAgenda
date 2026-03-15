from django.urls import path, include
from django.http import JsonResponse
from src.modules.health.views import health_check


def root_view(request):
    return JsonResponse({"message": "HairAgenda Backend is running!", "status": "ok"})


urlpatterns = [
    path('', root_view, name='root'),
    path('api/health/', health_check, name='health_check'),
    path('api/', include('src.modules.booking.urls')),
]
