import pytest
from booking.tests.factories import ProfessionalProfileFactory, ServiceFactory, AppointmentFactory
from django.core.exceptions import ValidationError
from datetime import timedelta
from django.utils import timezone

@pytest.mark.django_db
class TestBookingModels:
    def test_professional_profile_creation(self):
        profile = ProfessionalProfileFactory(name="João Silva")
        assert profile.name == "João Silva"
        assert str(profile) == "João Silva"

    def test_service_creation(self):
        service = ServiceFactory(name="Barba", price=30.00)
        assert service.name == "Barba"
        assert "R$ 30.0" in str(service)

    def test_appointment_no_overlap(self):
        professional = ProfessionalProfileFactory()
        service = ServiceFactory(professional=professional, duration_minutes=30)
        
        # Primeiro agendamento: Amanhã às 10:00
        start_time = timezone.now().replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)
        AppointmentFactory(
            professional=professional,
            service=service,
            date_time=start_time,
            status='confirmed'
        )

        # Segundo agendamento: Amanhã às 10:15 (Sobrepõe o anterior que vai até 10:30)
        overlap_time = start_time + timedelta(minutes=15)
        new_appointment = AppointmentFactory.build(
            professional=professional,
            service=service,
            date_time=overlap_time
        )
        
        with pytest.raises(ValidationError) as exc:
            new_appointment.clean()
        
        assert "Conflito de horário" in str(exc.value)

    def test_appointment_valid_scheduling(self):
        professional = ProfessionalProfileFactory()
        service = ServiceFactory(professional=professional, duration_minutes=30)
        
        # Amanhã às 10:00
        start_time = timezone.now().replace(hour=10, minute=0, second=0, microsecond=0) + timedelta(days=1)
        appt1 = AppointmentFactory(
            professional=professional,
            service=service,
            date_time=start_time,
            status='confirmed'
        )
        appt1.clean() # Não deve levantar erro

        # Amanhã às 10:30 (Logo após o anterior)
        next_time = start_time + timedelta(minutes=30)
        appt2 = AppointmentFactory.build(
            professional=professional,
            service=service,
            date_time=next_time
        )
        appt2.clean() # Não deve levantar erro
