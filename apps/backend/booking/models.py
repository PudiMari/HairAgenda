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

        # 1. Verifica se a data/hora está bloqueada pelo profissional
        appt_date = self.date_time.date()
        appt_start_time = self.date_time.time()
        appt_end_dt = self.date_time + timedelta(minutes=self.service.duration_minutes)
        appt_end_time = appt_end_dt.time()

        # Busca bloqueios para este dia
        blocks = ProfessionalBlock.objects.filter(
            professional=self.professional,
            date=appt_date
        )

        for block in blocks:
            # Se for bloqueio de dia inteiro (sem horários)
            if not block.start_time or not block.end_time:
                raise ValidationError(f"A data {appt_date.strftime('%d/%m/%Y')} está bloqueada (Dia Inteiro) pelo profissional.")

            # Se for bloqueio parcial, verifica interseção [start, end)
            if (appt_start_time < block.end_time) and (block.start_time < appt_end_time):
                raise ValidationError(
                    f"Este horário conflita com um bloqueio manual do profissional "
                    f"({block.start_time.strftime('%H:%M')} - {block.end_time.strftime('%H:%M')})."
                )

        # 2. Verifica conflito de horários com outros agendamentos (Overlap)
        # Busca agendamentos do mesmo profissional que se sobrepõem
        conflicts = Appointment.objects.filter(
            professional=self.professional,
            status__in=['confirmed', 'pending']
        ).exclude(pk=self.pk)

        for conflict in conflicts:
            conflict_end = conflict.date_time + timedelta(minutes=conflict.service.duration_minutes)

            # Checa se há interseção de intervalos [start, end)
            if (self.date_time < conflict_end) and (conflict.date_time < appt_end_dt):
                raise ValidationError(f"Conflito de horário: {conflict.client_name} já agendou entre {conflict.date_time.strftime('%H:%M')} e {conflict_end.strftime('%H:%M')}.")

    def __str__(self):
        return f"{self.date_time.strftime('%d/%m %H:%M')} - {self.client_name}"


class OpeningHour(models.Model):
    DAY_CHOICES = [
        (0, 'Segunda-feira'),
        (1, 'Terça-feira'),
        (2, 'Quarta-feira'),
        (3, 'Quinta-feira'),
        (4, 'Sexta-feira'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]

    professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='opening_hours'
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    is_open = models.BooleanField(default=True)
    work_start = models.TimeField(default="08:00")
    work_end = models.TimeField(default="18:00")
    lunch_start = models.TimeField(default="12:00")
    lunch_end = models.TimeField(default="13:00")

    class Meta:
        unique_together = ('professional', 'day_of_week')
        ordering = ['day_of_week']

    def __str__(self):
        return f"{self.professional.name} - {self.get_day_of_week_display()}"


class ProfessionalBlock(models.Model):
    professional = models.ForeignKey(
        ProfessionalProfile,
        on_delete=models.CASCADE,
        related_name='blocks'
    )
    date = models.DateField("Data Bloqueada")
    start_time = models.TimeField("Hora Início", null=True, blank=True)
    end_time = models.TimeField("Hora Fim", null=True, blank=True)
    reason = models.CharField("Motivo", max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.professional.name} - Bloqueio {self.date}"
