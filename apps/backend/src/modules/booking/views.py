from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Service, Appointment, ProfessionalProfile
from .serializers import ServiceSerializer, AppointmentSerializer, ProfessionalProfileSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        client_id = self.request.query_params.get('client_id')
        if client_id:
            queryset = queryset.filter(client_user_id=client_id)
        return queryset


class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalProfile.objects.all()
    serializer_class = ProfessionalProfileSerializer
    lookup_field = 'user_id'

    @action(detail=False, methods=['get'])
    def me(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=400)

        profile = ProfessionalProfile.objects.filter(user_id=user_id).first()
        if not profile:
            return Response({"error": "Profile not found"}, status=404)

        serializer = ProfessionalProfileSerializer(profile)
        return Response(serializer.data)
