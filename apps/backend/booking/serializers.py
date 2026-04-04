from rest_framework import serializers
from .models import Service, Appointment, ProfessionalProfile, OpeningHour


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    service_name = serializers.ReadOnlyField(source='service.name')
    service_price = serializers.ReadOnlyField(source='service.price')
    professional_name = serializers.ReadOnlyField(source='professional.name')

    class Meta:
        model = Appointment
        fields = [
            'id', 'professional', 'professional_name', 'client_name',
            'client_whatsapp', 'service', 'service_name', 'service_price',
            'date_time', 'client_user_id', 'status', 'created_at'
        ]


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        fields = '__all__'


class OpeningHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHour
        fields = '__all__'
