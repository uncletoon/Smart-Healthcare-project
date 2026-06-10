from django.db import models

class ServiceCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self) :
        return self.name

class Service(models.Model):
    facility = models.ForeignKey('facilities.Facility', on_delete=models.CASCADE, related_name='services')
    category = models.ForeignKey('ServiceCategory',null=True, on_delete=models.SET_NULL, related_name='service')
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=500, blank=False, null=False)
    image = models.ImageField(upload_to='services/', default='services/default.jpg', blank=True, null=True)
    languages = models.ManyToManyField('facilities.Language', blank=True)
    requirements = models.TextField(blank=True, default='')
    insurances = models.ManyToManyField('facilities.Insurance', blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    service_hours = models.CharField(max_length=100, default="24/7")
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        facility_name = self.facility.company_name if self.facility else "Unknown Facility"
        return f"{self.name} - {facility_name}"