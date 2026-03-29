from django.db import models
from django.core.exceptions import ValidationError


class ProfessionalProfile(models.Model):
    user_id = models.CharField("ID do Usuário (Clerk)", max_length=100, unique=True)
    name = models.CharField("Nome Profissional", max_length=100)
    description = models.TextField("Bio/Descrição", blank=True)
    photo_url = models.URLField("URL da Foto", blank=True, null=True)
    location = models.CharField("Localização", max_length=200, blank=True)
    is_setup_completed = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Service(models.Model):
    professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='services',
        null=True,
        blank=True
    )
    name = models.CharField("Nome do Serviço", max_length=100)
    description = models.TextField("Descrição", blank=True)
    price = models.DecimalField("Preço", max_digits=8, decimal_places=2)
    duration_minutes = models.PositiveIntegerField("Duração (minutos)", default=30)

    def __str__(self):
        return f"{self.name} - R$ {self.price}"


class Appointment(models.Model):
    professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='appointments',
        null=True,
        blank=True
    )
    client_name = models.CharField("Nome da Cliente", max_length=100)
    client_whatsapp = models.CharField("WhatsApp", max_length=20)
    service = models.ForeignKey(Service, on_delete=models.CASCADE)
    date_time = models.DateTimeField("Data e Hora")
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        # Validação para evitar conflito de horários
        conflicts = Appointment.objects.filter(date_time=self.date_time).exclude(pk=self.pk)
        if conflicts.exists():
            raise ValidationError("Este horário já está ocupado por outra cliente.")

    def __str__(self):
        return f"{self.date_time.strftime('%d/%m %H:%M')} - {self.client_name}"