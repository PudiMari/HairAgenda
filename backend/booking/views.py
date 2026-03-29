from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Service, Appointment, ProfessionalProfile
from .serializers import ServiceSerializer, AppointmentSerializer, ProfessionalProfileSerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalProfile.objects.all()
    serializer_class = ProfessionalProfileSerializer
    lookup_field = 'user_id'

    @action(detail=False, methods=['get'])
    def me(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({"detail": "user_id parameter is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profile = ProfessionalProfile.objects.get(user_id=user_id)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ProfessionalProfile.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)