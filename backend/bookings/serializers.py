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

    def validate(self, attrs):
        service = attrs.get('service')
        date_time = attrs.get('date_time')
        status_val = attrs.get('status')
        
        if not service and self.instance:
            service = self.instance.service
        if not date_time and self.instance:
            date_time = self.instance.date_time

        if service and date_time and status_val not in ['Cancelled', 'Completed']:
            booking_date = date_time.date()
            existing_query = Booking.objects.filter(
                service=service,
                date_time__date=booking_date
            ).exclude(status__in=['Cancelled', 'Completed'])
            
            if self.instance:
                existing_query = existing_query.exclude(pk=self.instance.pk)
                
            count = existing_query.count()
            if count >= 5:
                raise serializers.ValidationError(
                    "This service has reached the maximum limit of 5 bookings for this day. Please try booking for another day."
                )
                
        return attrs
