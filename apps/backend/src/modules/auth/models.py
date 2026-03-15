from django.db import models


class Cliente(models.Model):
    clerk_id = models.CharField("Clerk ID", max_length=100, unique=True, db_index=True)
    email = models.EmailField("E-mail", unique=True)
    name = models.CharField("Nome", max_length=255)
    whatsapp = models.CharField("WhatsApp", max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Cliente"
        verbose_name_plural = "Clientes"

    def __str__(self):
        return f"{self.name} ({self.email})"
