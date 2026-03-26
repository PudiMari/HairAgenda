from django.db import models
from django.core.exceptions import ValidationError


class Service(models.Model):
    name = models.CharField("Nome do Serviço", max_length=100)
    description = models.TextField("Descrição", blank=True)
    price = models.DecimalField("Preço", max_digits=8, decimal_places=2)
    duration_minutes = models.PositiveIntegerField(
        "Duração (minutos)", default=30
    )

    def __str__(self):
        return f"{self.name} - R$ {self.price}"


class Appointment(models.Model):
    cliente = models.ForeignKey(
        'auth_module.Cliente',
        on_delete=models.CASCADE,
        verbose_name="Cliente",
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
        conflicts = Appointment.objects.filter(
            date_time=self.date_time
        ).exclude(pk=self.pk)
        if conflicts.exists():
            raise ValidationError(
                "Este horário já está ocupado por outra cliente."
            )

    def __str__(self):
        return f"{self.date_time.strftime('%d/%m %H:%M')} - {self.client_name}"


class ProfessionalProfile(models.Model):
    user_id = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    photo_url = models.URLField(max_length=500, blank=True)
    location = models.CharField(max_length=255, blank=True)
    is_setup_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name