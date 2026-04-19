import pytest


@pytest.fixture(autouse=True)
def override_cache_settings(settings):
    """
    Ensure tests use local memory cache instead of Redis.
    """
    settings.CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
