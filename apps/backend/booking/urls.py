from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet,
    AppointmentViewSet,
    ProfessionalProfileViewSet,
    OpeningHourViewSet
)

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'professional-profile', ProfessionalProfileViewSet)
router.register(r'opening-hours', OpeningHourViewSet)

urlpatterns = [
    path('', include(router.urls)),
]