from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.utils import timezone
from datetime import datetime, timedelta
from .models import (
    Service, Appointment, ProfessionalProfile, OpeningHour, ProfessionalBlock, PortfolioItem
)
from .serializers import (
    ServiceSerializer,
    AppointmentSerializer,
    ProfessionalProfileSerializer,
    OpeningHourSerializer,
    ProfessionalBlockSerializer,
    PortfolioItemSerializer,
)


class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)
        else:
            # Prevent returning all services if no ID is specified
            queryset = queryset.none()
        return queryset


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        client_id = self.request.query_params.get('client_id')

        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)

        if client_id:
            queryset = queryset.filter(client_user_id=client_id)

        return queryset


class ProfessionalProfileViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalProfile.objects.all()
    serializer_class = ProfessionalProfileSerializer
    lookup_field = 'user_id'

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @action(detail=False, methods=['get'])
    def me(self, request):
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response(
                {"detail": "user_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            profile = ProfessionalProfile.objects.get(user_id=user_id)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ProfessionalProfile.DoesNotExist:
            return Response(
                {"detail": "Not found."},
                status=status.HTTP_404_NOT_FOUND
            )
    @action(detail=True, methods=['get'], url_path='available-slots')
    def available_slots(self, request, user_id=None):
        """
        Returns available time slots for a specific date and service.
        Implements 'Smart Gap Filler' logic to recommend slots that minimize fragmentation.
        """
        profile = self.get_object()
        date_str = request.query_params.get('date')
        service_id = request.query_params.get('service_id')

        if not date_str or not service_id:
            return Response(
                {"detail": "Parâmetros 'date' e 'service_id' são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            service = Service.objects.get(id=service_id, professional=profile)
        except (ValueError, Service.DoesNotExist):
            return Response(
                {"detail": "Data inválida ou serviço não encontrado para este profissional."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Get Opening Hours
        weekday = target_date.weekday()
        # Django weekday is 0=Mon, 6=Sun. OpeningHour.day_of_week matches this.
        opening_hour = OpeningHour.objects.filter(
            professional=profile, 
            day_of_week=weekday, 
            is_open=True
        ).first()
        
        if not opening_hour:
            return Response([])

        # 2. Get existing bookings and blocks for the target date
        appointments = Appointment.objects.filter(
            professional=profile,
            date_time__date=target_date,
            status__in=['pending', 'confirmed']
        ).select_related('service')

        blocks = ProfessionalBlock.objects.filter(
            professional=profile,
            date=target_date
        )

        # Check for full day block
        if blocks.filter(start_time__isnull=True, end_time__isnull=True).exists():
            return Response([])

        # 3. Generate slots (30 min interval)
        slots = []
        current_dt = datetime.combine(target_date, opening_hour.work_start)
        end_limit_dt = datetime.combine(target_date, opening_hour.work_end)
        # Helper to convert time to minutes for easy comparison
        def to_min(t): return t.hour * 60 + t.minute

        # Prepare adjacency anchors for "Smart" logic
        anchors = set()
        anchors.add(to_min(opening_hour.work_start))
        anchors.add(to_min(opening_hour.work_end))
        anchors.add(to_min(opening_hour.lunch_start))
        anchors.add(to_min(opening_hour.lunch_end))

        booked_intervals = []
        for appt in appointments:
            # Shift to local time for comparison if needed
            start_t = appt.date_time.time()
            duration = appt.service.duration_minutes
            # Use datetime for math to handle end_time cross-day
            appt_end_dt = appt.date_time + timedelta(minutes=duration)
            end_t = appt_end_dt.time()

            booked_intervals.append((to_min(start_t), to_min(end_t)))
            anchors.add(to_min(start_t))
            anchors.add(to_min(end_t))

        for block in blocks:
            if block.start_time and block.end_time:
                interval = (to_min(block.start_time), to_min(block.end_time))
                booked_intervals.append(interval)
                anchors.add(to_min(block.start_time))
                anchors.add(to_min(block.end_time))

        service_duration = service.duration_minutes
        lunch_start_min = to_min(opening_hour.lunch_start)
        lunch_end_min = to_min(opening_hour.lunch_end)

        while current_dt + timedelta(minutes=service_duration) <= end_limit_dt:
            slot_start_min = to_min(current_dt.time())
            slot_end_min = slot_start_min + service_duration

            # Check availability
            is_available = True

            # Lunch break check
            if not (slot_end_min <= lunch_start_min or
                    slot_start_min >= lunch_end_min):
                is_available = False

            # Bookings check
            if is_available:
                for b_start, b_end in booked_intervals:
                    if slot_start_min < b_end and b_start < slot_end_min:
                        is_available = False
                        break

            if is_available:
                is_recommended = (slot_start_min in anchors or
                                  slot_end_min in anchors)

                slots.append({
                    "time": current_dt.strftime('%H:%M'),
                    "is_recommended": is_recommended
                })

            current_dt += timedelta(minutes=30)

        return Response(slots)


class OpeningHourViewSet(viewsets.ModelViewSet):
    queryset = OpeningHour.objects.all()
    serializer_class = OpeningHourSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(
                    professional__user_id=professional_id
                )
            else:
                queryset = queryset.filter(professional_id=professional_id)
        return queryset


class ProfessionalBlockViewSet(viewsets.ModelViewSet):
    queryset = ProfessionalBlock.objects.all()
    serializer_class = ProfessionalBlockSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(
                    professional__user_id=professional_id
                )
            else:
                queryset = queryset.filter(professional_id=professional_id)
        return queryset


class PortfolioItemViewSet(viewsets.ModelViewSet):
    queryset = PortfolioItem.objects.all()
    serializer_class = PortfolioItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(
                    professional__user_id=professional_id
                )
            else:
                queryset = queryset.filter(professional_id=professional_id)
        return queryset
