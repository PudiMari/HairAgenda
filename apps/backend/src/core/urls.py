from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings
from src.modules.health.views import health_check
import os


def root_view(request):
    db_engine = settings.DATABASES.get('default', {}).get('ENGINE', 'unknown')
    has_db_url = 'DATABASE_URL' in os.environ

    return JsonResponse({
        "message": "HairAgenda Backend is running!",
        "status": "ok",
        "debug": {
            "db_engine": db_engine,
            "has_db_url": has_db_url,
            "using_sqlite_fallback": "sqlite" in db_engine.lower()
        }
    })


urlpatterns = [
    path('', root_view, name='root'),
    path('api/health/', health_check, name='health_check'),
    path('api/', include('src.modules.booking.urls')),
]
