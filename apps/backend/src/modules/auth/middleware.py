from django.utils.deprecation import MiddlewareMixin
from .services import ClerkService


class ClerkAuthenticationMiddleware(MiddlewareMixin):
    def __init__(self, get_response):
        self.get_response = get_response
        self.clerk_service = ClerkService()

    def __call__(self, request):
        # Paths that don't require authentication
        public_paths = [
            '/api/health/',
            '/api/v1/auth/login/',
            '/api/v1/auth/register/',
        ]

        if any(request.path.startswith(path) for path in public_paths):
            return self.get_response(request)

        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            # If no token, we still proceed, but user won't be attached.
            # Views that require authentication should check request.cliente.
            request.cliente = None
            return self.get_response(request)

        auth_parts = auth_header.split(' ')
        if len(auth_parts) < 2:
            request.cliente = None
            return self.get_response(request)

        token = auth_parts[1]
        cliente = self.clerk_service.authenticate_token(token)

        request.cliente = cliente

        return self.get_response(request)
