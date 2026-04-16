from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers
from .models import (
    Service, Appointment, ProfessionalProfile,
    OpeningHour, ProfessionalBlock, PortfolioItem
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

    def _get_opening_hour(self, professional, date_time):
        """Return the OpeningHour for the given professional and weekday."""
        try:
            return OpeningHour.objects.get(
                professional=professional,
                day_of_week=date_time.weekday()
            )
        except OpeningHour.DoesNotExist:
            raise serializers.ValidationError(
                "O profissional não atende neste dia da semana."
            )

    def _validate_schedule(self, opening_hour, appointment_time, date_time, service):
        """Validate time against opening hours, lunch break and service end."""
        if not opening_hour.is_open:
            raise serializers.ValidationError(
                "O profissional está fechado neste dia."
            )

        if appointment_time < opening_hour.work_start or \
                appointment_time >= opening_hour.work_end:
            raise serializers.ValidationError(
                f"Horário fora do expediente. O profissional atende das "
                f"{opening_hour.work_start.strftime('%H:%M')} às "
                f"{opening_hour.work_end.strftime('%H:%M')}."
            )

        if opening_hour.lunch_start <= appointment_time < opening_hour.lunch_end:
            raise serializers.ValidationError(
                "O profissional está em horário de almoço neste momento."
            )

        if service:
            end_dt = date_time + timedelta(minutes=service.duration_minutes)
            end_time = end_dt.time()
            if end_time > opening_hour.work_end:
                raise serializers.ValidationError(
                    "O serviço termina após o horário de expediente."
                )
            if appointment_time < opening_hour.lunch_start and \
                    end_time > opening_hour.lunch_start:
                raise serializers.ValidationError(
                    "O serviço ultrapassaria o início do horário de almoço."
                )

    def _validate_conflicts(self, professional, date_time, service):
        """Check that the new appointment does not overlap existing ones."""
        duration = service.duration_minutes if service else 30
        new_end_dt = date_time + timedelta(minutes=duration)
        instance = self.instance

        conflicts = Appointment.objects.filter(
            professional=professional,
            status__in=['confirmed', 'pending'],
            date_time__date=date_time.date(),
        ).exclude(pk=instance.pk if instance else None)

        for existing in conflicts:
            existing_end = existing.date_time + timedelta(
                minutes=existing.service.duration_minutes
            )
            if date_time < existing_end and existing.date_time < new_end_dt:
                raise serializers.ValidationError(
                    f"Horário em conflito com outro agendamento às "
                    f"{existing.date_time.astimezone().strftime('%H:%M')}."
                )

    def validate(self, data):
        professional = data.get('professional')
        date_time = data.get('date_time')
        service = data.get('service')
        client_user_id = data.get('client_user_id')

        if not professional or not date_time:
            return data

        # Check if professional is booking for themselves
        if client_user_id and professional.user_id == client_user_id:
            raise serializers.ValidationError(
                "Profissionais não podem agendar serviços para si mesmos. "
                "Utilize o painel administrativo para controles internos."
            )

        local_dt = timezone.localtime(date_time)
        opening_hour = self._get_opening_hour(professional, date_time)
        self._validate_schedule(opening_hour, local_dt.time(), date_time, service)
        self._validate_conflicts(professional, date_time, service)

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


class PortfolioItemSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(
        source='get_category_display', read_only=True
    )

    class Meta:
        model = PortfolioItem
        fields = '__all__'
