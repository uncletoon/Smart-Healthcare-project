from rest_framework import serializers
from .models import Booking

class BookingSerializer(serializers.ModelSerializer):
    service_name = serializers.CharField(source='service.name', read_only=True)
    facility_name = serializers.CharField(source='service.facility.company_name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'patient_name', 'service', 'service_name', 'facility_name',
            'date_time', 'phone', 'status', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ('created_at', 'updated_at')
