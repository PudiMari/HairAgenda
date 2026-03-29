from rest_framework import serializers
from .models import Service, Appointment, ProfessionalProfile


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class AppointmentSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    service_price = serializers.DecimalField(source='service.price', max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'client_name', 'client_whatsapp', 'service',
            'service_name', 'service_price', 'date_time',
            'status', 'created_at', 'client_user_id'
        ]


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        fields = '__all__'