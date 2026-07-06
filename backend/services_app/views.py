from rest_framework import viewsets, exceptions
from .models import Service, ServiceCategory
from .serializers import ServiceSerializer, ServiceCategorySerializer

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer

    def get_queryset(self):
        user = self.request.user
        # Guests and superadmins see all services
        if not user or not user.is_authenticated or user.is_superuser or getattr(user, 'role', None) == 'superAdmin':
            return Service.objects.all()
        
        # Facility admins see only their own facility's services
        if hasattr(user, 'facility') and user.facility:
            return Service.objects.filter(facility=user.facility)
        return Service.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_superuser or getattr(user, 'role', None) == 'superAdmin':
            serializer.save()
        else:
            if hasattr(user, 'facility') and user.facility:
                serializer.save(facility=user.facility)
            else:
                raise exceptions.ValidationError("You must register a facility before adding services.")

class ServiceCategoryViewSet(viewsets.ModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer

