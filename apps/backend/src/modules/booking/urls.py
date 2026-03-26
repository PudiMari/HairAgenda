from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, AppointmentViewSet, ProfessionalProfileViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'professional-profile', ProfessionalProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]