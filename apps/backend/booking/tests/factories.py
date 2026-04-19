import factory
from factory.django import DjangoModelFactory
from booking.models import ProfessionalProfile, Service, Appointment
from django.utils import timezone
from datetime import timedelta


class ProfessionalProfileFactory(DjangoModelFactory):
    class Meta:
        model = ProfessionalProfile

    user_id = factory.Sequence(lambda n: f'user_{n}')
    name = factory.Faker('name')
    description = factory.Faker('text')
    is_setup_completed = True


class ServiceFactory(DjangoModelFactory):
    class Meta:
        model = Service

    professional = factory.SubFactory(ProfessionalProfileFactory)
    name = 'Corte Masculino'
    description = 'Corte de cabelo tesoura e máquina'
    price = 50.00
    duration_minutes = 30


class AppointmentFactory(DjangoModelFactory):
    class Meta:
        model = Appointment

    professional = factory.SubFactory(ProfessionalProfileFactory)
    service = factory.SubFactory(ServiceFactory)
    client_name = factory.Faker('name')
    client_whatsapp = '11999999999'
    date_time = timezone.now() + timedelta(days=1)
    status = 'pending'
