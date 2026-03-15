from django.apps import AppConfig


class AuthConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'src.modules.auth'
    label = 'auth_module'  # Use a custom label to avoid conflict with django.contrib.auth
