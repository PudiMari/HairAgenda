import pytest
from django.conf import settings

@pytest.fixture(autouse=True)
def override_cache_settings(settings):
    settings.CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
