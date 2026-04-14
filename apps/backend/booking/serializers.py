from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers
from .models import (
    Service, Appointment, ProfessionalProfile, OpeningHour, ProfessionalBlock
)


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

    def validate(self, data):
        professional = data.get('professional')
        date_time = data.get('date_time')
        service = data.get('service')

        if not professional or not date_time:
            return data

        day_index = date_time.weekday()
        
        # Convert to local time (America/Sao_Paulo) before extracting the time component
        local_date_time = timezone.localtime(date_time)
        appointment_time = local_date_time.time()

        try:
            opening_hour = OpeningHour.objects.get(
                professional=professional,
                day_of_week=day_index
            )
        except OpeningHour.DoesNotExist:
            raise serializers.ValidationError(
                "O profissional não atende neste dia da semana."
            )

        if not opening_hour.is_open:
            raise serializers.ValidationError(
                "O profissional está fechado neste dia."
            )

        if (appointment_time < opening_hour.work_start
                or appointment_time >= opening_hour.work_end):
            raise serializers.ValidationError(
                f"Horário fora do expediente. O profissional atende das "
                f"{opening_hour.work_start.strftime('%H:%M')} às "
                f"{opening_hour.work_end.strftime('%H:%M')}."
            )

        if (opening_hour.lunch_start <= appointment_time
                < opening_hour.lunch_end):
            raise serializers.ValidationError(
                "O profissional está em horário de almoço neste momento."
            )

        if service:
            end_dt = date_time + timedelta(minutes=service.duration_minutes)
            if end_dt.time() > opening_hour.work_end:
                raise serializers.ValidationError(
                    "O serviço termina após o horário de expediente."
                )

        return data


class ProfessionalProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalProfile
        fields = '__all__'


class OpeningHourSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHour
        fields = '__all__'


class ProfessionalBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfessionalBlock
        fields = '__all__'
