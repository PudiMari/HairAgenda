from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from datetime import datetime, timedelta
from django.utils import timezone
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
        
        # Allow detail actions to proceed normally
        if self.detail:
            return queryset

        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(professional__user_id=professional_id)
            else:
                queryset = queryset.filter(professional_id=professional_id)
        else:
            # Prevent returning all services if no ID is specified during list
            queryset = queryset.none()
        return queryset


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Allow detail actions to proceed
        if self.detail:
            return queryset

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
                {"detail": "Data inválida ou serviço não encontrado."},
                status=status.HTTP_400_BAD_REQUEST
            )

        weekday = target_date.weekday()
        opening_hour = OpeningHour.objects.filter(
            professional=profile, day_of_week=weekday, is_open=True
        ).first()

        if not opening_hour:
            return Response([])

        # Check for full day block
        blocks = ProfessionalBlock.objects.filter(
            professional=profile, date=target_date
        )
        if blocks.filter(start_time__isnull=True, end_time__isnull=True).exists():
            return Response([])

        return Response(self._calculate_slots(target_date, service, opening_hour, profile, blocks))

    def _calculate_slots(self, target_date, service, opening_hour, profile, blocks):
        appointments = Appointment.objects.filter(
            professional=profile,
            date_time__date=target_date,
            status__in=['pending', 'confirmed']
        ).select_related('service')

        def to_min(t):
            return (t.hour * 60 + t.minute) if t else None

        # Build anchors set safely
        potential_anchors = [
            opening_hour.work_start, opening_hour.work_end,
            opening_hour.lunch_start, opening_hour.lunch_end
        ]
        anchors = {to_min(a) for a in potential_anchors if a is not None}

        booked_intervals = []
        for appt in appointments:
            # Localize before extracting time to handle timezone differences
            local_dt = timezone.localtime(appt.date_time)
            start_t = local_dt.time()
            duration_min = appt.service.duration_minutes
            appt_end_dt = local_dt + timedelta(minutes=duration_min)
            end_t = appt_end_dt.time()

            booked_intervals.append((to_min(start_t), to_min(end_t)))
            anchors.add(to_min(start_t))
            anchors.add(to_min(end_t))

        for block in blocks:
            if block.start_time is not None and block.end_time is not None:
                interval = (to_min(block.start_time), to_min(block.end_time))
                booked_intervals.append(interval)
                anchors.add(to_min(block.start_time))
                anchors.add(to_min(block.end_time))

        return self._generate_slot_list(
            target_date, service.duration_minutes, opening_hour, booked_intervals, anchors
        )

    def _generate_slot_list(self, target_date, duration, opening_hour, booked, anchors):
        def to_min(t):
            return (t.hour * 60 + t.minute) if t else None

        slots = []
        current_dt = datetime.combine(target_date, opening_hour.work_start)
        end_limit_dt = datetime.combine(target_date, opening_hour.work_end)

        lunch_start = to_min(opening_hour.lunch_start)
        lunch_end = to_min(opening_hour.lunch_end)

        while current_dt + timedelta(minutes=duration) <= end_limit_dt:
            s_start = to_min(current_dt.time())
            s_end = s_start + duration

            is_available = True
            # Professional might not have a lunch break
            if lunch_start is not None and lunch_end is not None:
                if not (s_end <= lunch_start or s_start >= lunch_end):
                    is_available = False

            if is_available:
                for b_start, b_end in booked:
                    if s_start < b_end and b_start < s_end:
                        is_available = False
                        break

            if is_available:
                is_rec = s_start in anchors or s_end in anchors
                # Frontend expects HH:mm:00 format
                slots.append({
                    "time": current_dt.strftime('%H:%M:00'),
                    "is_recommended": is_rec
                })

            current_dt += timedelta(minutes=30)
        return slots


class OpeningHourViewSet(viewsets.ModelViewSet):
    queryset = OpeningHour.objects.all()
    serializer_class = OpeningHourSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        
        if self.detail:
            return queryset

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
        
        if self.detail:
            return queryset

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
        
        if self.detail:
            return queryset

        professional_id = self.request.query_params.get('professional_id')
        if professional_id:
            if str(professional_id).startswith('user_'):
                queryset = queryset.filter(
                    professional__user_id=professional_id
                )
            else:
                queryset = queryset.filter(professional_id=professional_id)
        return queryset
