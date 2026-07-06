from rest_framework import viewsets
from .models import Booking
from .serializers import BookingSerializer

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

    def get_queryset(self):
        user = self.request.user
        # Guests and superadmins see all bookings
        if not user or not user.is_authenticated or user.is_superuser or getattr(user, 'role', None) == 'superAdmin':
            return Booking.objects.all().order_by('-created_at')
        
        # Facility admins see only their own facility's bookings
        if hasattr(user, 'facility') and user.facility:
            return Booking.objects.filter(service__facility=user.facility).order_by('-created_at')
        return Booking.objects.none()
