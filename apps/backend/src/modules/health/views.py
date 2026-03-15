from django.http import JsonResponse
from django.db import connections


import os

def health_check(request):
    db_conn = connections['default']
    db_status = "ok"
    db_error = None
    engine = db_conn.settings_dict.get('ENGINE', 'unknown')
    
    # Check if DATABASE_URL is present in environment
    db_url_present = "DATABASE_URL" in os.environ
    db_url_preview = os.environ.get("DATABASE_URL", "")[:10] + "..." if db_url_present else "missing"

    try:
        db_conn.cursor()
    except Exception as e:
        db_status = "error"
        db_error = str(e)

    return JsonResponse({
        "status": "ok",
        "message": "Backend API is running",
        "database": db_status,
        "database_error": db_error,
        "debug_info": {
            "engine": engine,
            "db_url_present": db_url_present,
            "db_url_preview": db_url_preview,
        }
    })
