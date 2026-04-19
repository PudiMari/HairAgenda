import pytest
from rest_framework import status
from booking.tests.factories import ProfessionalProfileFactory, ServiceFactory
from booking.models import Service


@pytest.mark.django_db
class TestServiceViewSet:
    def test_list_services_with_professional_id(self, client):
        professional = ProfessionalProfileFactory()
        ServiceFactory(professional=professional, name="Corte")
        ServiceFactory(professional=professional, name="Barba")

        # Test using database ID
        response = client.get(f'/api/services/?professional_id={professional.id}')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

        # Test using user_id (Clerk)
        response = client.get(f'/api/services/?professional_id={professional.user_id}')
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2

    def test_list_services_empty_without_id(self, client):
        ProfessionalProfileFactory()
        ServiceFactory()

        response = client.get('/api/services/')
        assert response.status_code == status.HTTP_200_OK
        # Should be empty because no professional_id was provided (custom logic in get_queryset)
        assert len(response.data) == 0

    def test_create_service(self, client):
        professional = ProfessionalProfileFactory()
        data = {
            "professional": professional.id,
            "name": "Novo Serviço",
            "price": "100.00",
            "duration_minutes": 60
        }

        response = client.post('/api/services/', data)
        assert response.status_code == status.HTTP_201_CREATED
        assert Service.objects.filter(name="Novo Serviço").exists()
