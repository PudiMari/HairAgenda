from django.contrib import admin
from .models import Service, Appointment


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'professional', 'price', 'duration_minutes')
    list_filter = ('professional',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('date_time', 'professional', 'client_name', 'service')
    list_filter = ('date_time', 'professional', 'service')