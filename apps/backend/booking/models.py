from django.db import models
from django.core.exceptions import ValidationError
from datetime import timedelta


class ProfessionalProfile(models.Model):
    user_id = models.CharField("ID do Usuário (Clerk)", max_length=100, unique=True)
    name = models.CharField("Nome Profissional", max_length=100)
    description = models.TextField("Bio/Descrição", blank=True)
    photo_url = models.URLField("URL da Foto", blank=True, null=True)
    location = models.CharField("Localização", max_length=200, blank=True)
    whatsapp = models.CharField("WhatsApp", max_length=20, blank=True)
    instagram = models.CharField("Instagram", max_length=100, blank=True)
    is_setup_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    client_user_id = models.CharField("ID Usuário (Clerk)", max_length=100, blank=True, null=True)
    status = models.CharField("Status", max_length=20, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        # Validação para evitar conflito de horários (Overlap)
        if not self.date_time or not self.service:
            return

        end_time = self.date_time + timedelta(minutes=self.service.duration_minutes)
        
        # Busca agendamentos do mesmo profissional que se sobrepõem
        conflicts = Appointment.objects.filter(
            professional=self.professional,
            status='confirmed' # Apenas confirmados ou pendentes impactam a agenda
        ).exclude(pk=self.pk)

        for conflict in conflicts:
            conflict_end = conflict.date_time + timedelta(minutes=conflict.service.duration_minutes)
            
            # Checa se há interseção de intervalos [start, end)
            if (self.date_time < conflict_end) and (conflict.date_time < end_time):
                raise ValidationError(f"Conflito de horário: {conflict.client_name} já agendou entre {conflict.date_time.strftime('%H:%M')} e {conflict_end.strftime('%H:%M')}.")

    def __str__(self):
        return f"{self.date_time.strftime('%d/%m %H:%M')} - {self.client_name}"
