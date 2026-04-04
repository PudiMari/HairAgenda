from django.contrib import admin
from .models import Service, Appointment, ProfessionalProfile, OpeningHour


@admin.register(ProfessionalProfile)
class ProfessionalProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'user_id', 'whatsapp', 'is_setup_completed')
    search_fields = ('name', 'user_id')


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'professional', 'price', 'duration_minutes')
    list_filter = ('professional',)


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('date_time', 'professional', 'client_name', 'service')
    list_filter = ('date_time', 'professional', 'service')


@admin.register(OpeningHour)
class OpeningHourAdmin(admin.ModelAdmin):
    list_display = ('professional', 'day_of_week', 'is_open', 'work_start', 'work_end')
    list_filter = ('professional', 'day_of_week', 'is_open')
