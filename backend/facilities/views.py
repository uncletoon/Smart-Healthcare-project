from rest_framework import viewsets
from .models import Category, Location, Insurance, Facility
from .serializers import (
    CategorySerializer, LocationSerializer, InsuranceSerializer,
    FacilitySerializer
)
from .permissions import IsFacilityAdminOwnerOrReadOnly

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class InsuranceViewSet(viewsets.ModelViewSet):
    queryset = Insurance.objects.all()
    serializer_class = InsuranceSerializer

class FacilityViewSet(viewsets.ModelViewSet):
    queryset = Facility.objects.all()
    serializer_class = FacilitySerializer
    permission_classes = [IsFacilityAdminOwnerOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        # Guests and superadmins see all facilities
        if not user or not user.is_authenticated or user.is_superuser or getattr(user, 'role', None) == 'superAdmin':
            return Facility.objects.all()
        # Facility admins see only their own facility
        return Facility.objects.filter(admin=user)

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)
