from django.contrib import admin
from .models import Service, Appointment

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'duration_minutes')

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('date_time', 'client_name', 'service')
    list_filter = ('date_time', 'service')