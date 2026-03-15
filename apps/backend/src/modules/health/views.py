from django.http import JsonResponse
from django.db import connections

from django.db.utils import OperationalError


def health_check(request):
    db_conn = connections['default']
    db_status = "ok"
    try:
        db_conn.cursor()
    except OperationalError:
        db_status = "error"

    return JsonResponse({
        "status": "ok",
        "message": "Backend API is running",
        "database": db_status
    })
