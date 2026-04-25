from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ServiceViewSet,
    AppointmentViewSet,
    ProfessionalProfileViewSet,
    OpeningHourViewSet,
    ProfessionalBlockViewSet,
    PortfolioItemViewSet,
    health_check,
)

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'professional-profile', ProfessionalProfileViewSet)
router.register(r'opening-hours', OpeningHourViewSet)
router.register(r'professional-blocks', ProfessionalBlockViewSet)
router.register(r'portfolio-items', PortfolioItemViewSet)

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('', include(router.urls)),
]