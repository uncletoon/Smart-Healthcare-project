from django.db import models

class Category(models.Model):
    category_name = models.CharField(max_length=255)

    def __str__(self):
        return self.category_name

class Location(models.Model):
    location_name = models.CharField(max_length=255)

    def __str__(self):
        return self.location_name

class Insurance(models.Model):
    insurance_name = models.CharField(max_length=255)

    def __str__(self):
        return self.insurance_name

class Language(models.Model):
    language_name = models.CharField(max_length=255)

    def __str__(self):
        return self.language_name

class Facility(models.Model):
    company_name = models.CharField(max_length=255)
    company_categories = models.OneToOneField(Category, on_delete=models.SET_NULL, null=True)
    company_description = models.TextField(max_length=500, blank=False, null=False)
    company_logo = models.ImageField(upload_to='facility_logos/', blank=True, null=True)
    company_address = models.CharField(max_length=255, blank=False, null=False)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    contact = models.CharField(max_length=255, blank=False, null=False)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_verified = models.BooleanField(default=False,)
    
    # Many-to-many relationships for accepted insurances and provided language services
    insurances = models.ManyToManyField(Insurance, blank=True)
    languages = models.ManyToManyField(Language, blank=True)

    def __str__(self):
        return self.company_name
