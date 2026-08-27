from django.test import TestCase
from django.utils import timezone
from bookings.models import Booking
from bookings.serializers import BookingSerializer
from services_app.models import Service
from facilities.models import Facility
import datetime

class BookingCapacityTestCase(TestCase):
    def setUp(self):
        # Create a dummy Facility
        self.facility = Facility.objects.create(
            company_name="Test Clinic",
            company_description="A test clinic",
            company_address="Kigali, Rwanda",
            contact="0788888888"
        )
        # Create a dummy Service
        self.service = Service.objects.create(
            facility=self.facility,
            name="Teeth Cleaning",
            description="Dental care",
            price=5000
        )
        
    def test_booking_capacity_limit(self):
        # Create 5 active bookings for tomorrow
        target_date = datetime.date.today() + datetime.timedelta(days=1)
        target_datetime = datetime.datetime.combine(target_date, datetime.time(10, 0))
        target_datetime = timezone.make_aware(target_datetime)
        
        for i in range(5):
            Booking.objects.create(
                patient_name=f"Patient {i}",
                service=self.service,
                date_time=target_datetime,
                phone=f"078000000{i}",
                status="Pending"
            )
            
        # Try to validate a 6th booking via the serializer
        data = {
            "patient_name": "Sixth Patient",
            "service": self.service.id,
            "date_time": target_datetime.isoformat(),
            "phone": "0789999999",
            "status": "Pending"
        }
        
        serializer = BookingSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("non_field_errors", serializer.errors)
        self.assertIn(
            "This service has reached the maximum limit of 5 bookings for this day. Please try booking for another day.",
            serializer.errors["non_field_errors"][0]
        )
        
    def test_booking_capacity_limit_ignores_cancelled_and_completed(self):
        target_date = datetime.date.today() + datetime.timedelta(days=2)
        target_datetime = datetime.datetime.combine(target_date, datetime.time(10, 0))
        target_datetime = timezone.make_aware(target_datetime)
        
        # Create 3 Pending bookings, 1 Cancelled booking, and 2 Completed bookings
        for i in range(3):
            Booking.objects.create(
                patient_name=f"Patient {i}",
                service=self.service,
                date_time=target_datetime,
                phone=f"078000000{i}",
                status="Pending"
            )
        Booking.objects.create(
            patient_name="Cancelled Patient",
            service=self.service,
            date_time=target_datetime,
            phone="0780000009",
            status="Cancelled"
        )
        for i in range(2):
            Booking.objects.create(
                patient_name=f"Completed Patient {i}",
                service=self.service,
                date_time=target_datetime,
                phone=f"078000001{i}",
                status="Completed"
            )
            
        # Verify a 4th pending booking validation succeeds (since only 3 active ones exist)
        data = {
            "patient_name": "Fourth Patient",
            "service": self.service.id,
            "date_time": target_datetime.isoformat(),
            "phone": "0789999999",
            "status": "Pending"
        }
        
        serializer = BookingSerializer(data=data)
        self.assertTrue(serializer.is_valid())
