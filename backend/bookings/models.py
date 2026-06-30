from django.db import models

class Booking(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
    ]
    
    patient_name = models.CharField(max_length=255)
    service = models.ForeignKey('services_app.Service', on_delete=models.CASCADE, related_name='bookings')
    date_time = models.DateTimeField()
    phone = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        service_name = self.service.name if self.service else "Unknown Service"
        return f"{self.patient_name} - {service_name} ({self.status})"
