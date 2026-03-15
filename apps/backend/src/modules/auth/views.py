from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny


class AuthMeView(APIView):
    permission_classes = [AllowAny]  # Middleware handles auth

    def get(self, request):
        if not request.cliente:
            return Response(
                {"error": "Não autenticado ou token inválido."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        cliente = request.cliente
        return Response({
            "id": cliente.id,
            "clerk_id": cliente.clerk_id,
            "email": cliente.email,
            "name": cliente.name,
            "whatsapp": cliente.whatsapp,
        })


class LoginURLView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # In a real app, these would come from settings or Clerk API
        clerk_domain = "https://powerful-bear-4.accounts.dev"
        redirect_url = request.query_params.get('redirect_url')

        sign_in_url = f"{clerk_domain}/sign-in"
        sign_up_url = f"{clerk_domain}/sign-up"

        if redirect_url:
            sign_in_url = f"{sign_in_url}?redirect_url={redirect_url}"
            sign_up_url = f"{sign_up_url}?redirect_url={redirect_url}"

        return Response({
            "sign_in_url": sign_in_url,
            "sign_up_url": sign_up_url,
        })
