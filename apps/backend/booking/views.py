from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import (
    Service, Appointment, ProfessionalProfile, OpeningHour, ProfessionalBlock, PortfolioItem
)
from .serializers import (
    ServiceSerializer,
    AppointmentSerializer,
    ProfessionalProfileSerializer,
    OpeningHourSerializer,
    ProfessionalBlockSerializer,
    PortfolioItemSerializer,
)


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)
        else:
            # Prevent returning all services if no ID is specified
            queryset = queryset.none()
        return queryset


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        client_id = self.request.query_params.get('client_id')

        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)

        if client_id:
            queryset = queryset.filter(client_user_id=client_id)

        return queryset


class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalProfile.objects.all()
    serializer_class = ProfessionalProfileSerializer
    lookup_field = 'user_id'

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @action(detail=False, methods=['get'])
    def me(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"detail": "user_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile = ProfessionalProfile.objects.get(user_id=user_id)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ProfessionalProfile.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND
            )


class OpeningHourViewSet(viewsets.ModelViewSet):
    queryset = OpeningHour.objects.all()
    serializer_class = OpeningHourSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)
        return queryset


class ProfessionalBlockViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalBlock.objects.all()
    serializer_class = ProfessionalBlockSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)
        return queryset


class PortfolioItemViewSet(viewsets.ModelViewSet):
    queryset = PortfolioItem.objects.all()
    serializer_class = PortfolioItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)
        return queryset
