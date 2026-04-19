import os
import django
from datetime import date, datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from booking.models import ProfessionalProfile, Appointment, Service, OpeningHour, ProfessionalBlock

def debug_slots(user_id, date_str, service_id):
    profile = ProfessionalProfile.objects.get(user_id=user_id)
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    service = Service.objects.get(id=service_id)
    
    weekday = target_date.weekday()
    oh = OpeningHour.objects.filter(professional=profile, day_of_week=weekday).first()
    
    print(f"Professional: {profile.name}")
    print(f"Date: {target_date} ({weekday})")
    print(f"Service: {service.name} ({service.duration_minutes} min)")
    print(f"Opening Hours: {oh.work_start} - {oh.work_end} (Lunch: {oh.lunch_start} - {oh.lunch_end})")
    
    appts = Appointment.objects.filter(professional=profile, date_time__date=target_date, status__in=['pending', 'confirmed'])
    print("\nAppointments (UTC):")
    for a in appts:
        print(f"  {a.date_time} - {a.service.name} ({a.service.duration_minutes} min) - Status: {a.status}")
        local_dt = timezone.localtime(a.date_time)
        print(f"  (Local: {local_dt.time()})")

    blocks = ProfessionalBlock.objects.filter(professional=profile, date=target_date)
    print("\nBlocks:")
    for b in blocks:
        print(f"  {b.start_time} - {b.end_time} ({b.reason})")

if __name__ == '__main__':
    # Assuming the first profile and a recent date
    p = ProfessionalProfile.objects.first()
    if p:
        s = p.services.first()
        # Use date in the screenshot if possible, otherwise use tomorrow
        debug_slots(p.user_id, '2026-04-18', s.id)
