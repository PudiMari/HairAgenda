from django.http import JsonResponse
from django.db import connections

from django.db.utils import OperationalError


def health_check(request):
    db_conn = connections['default']
    db_status = "ok"
    db_error = None
    try:
        db_conn.cursor()
    except Exception as e:
        db_status = "error"
        db_error = str(e)

    return JsonResponse({
        "status": "ok",
        "message": "Backend API is running",
        "database": db_status,
        "database_error": db_error
    })
