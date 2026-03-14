import os
from pathlib import Path
import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR.parent.parent, '.env'))

SECRET_KEY = env('DJANGO_SECRET_KEY', default='django-insecure-fallback-key')
DEBUG = env.bool('DEBUG', default=False)
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'corsheaders',
    'rest_framework',
    'src.modules.health',
    'src.modules.booking',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
]

ROOT_URLCONF = 'src.core.urls'

CORS_ALLOW_ALL_ORIGINS = True

DATABASES = {
    'default': env.db()
}

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_TZ = True
