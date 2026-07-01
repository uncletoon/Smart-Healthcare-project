from django.db import models

try:
    from geopy.distance import geodesic
except ImportError:
    geodesic = None

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


class Facility(models.Model):
    company_name = models.CharField(max_length=255)
    company_categories = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    company_description = models.TextField(max_length=500, blank=False, null=False)
    company_logo = models.ImageField(upload_to='facility_logos/', default='facility_logos/default.png', blank=True, null=True)
    company_address = models.CharField(max_length=255, blank=False, null=False)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True)
    email = models.EmailField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    contact = models.CharField(max_length=255, blank=False, null=False)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_verified = models.BooleanField(default=False,)
    is_opened = models.BooleanField(default=True)
    
    # Many-to-many relationships for accepted insurances and services
    insurances = models.ManyToManyField(Insurance, blank=True)


    def __str__(self):
        return self.company_name

    def distance_to(self, lat, lng):
        """Return distance (km) from institution to given point"""
        if self.latitude is None or self.longitude is None:
            return None
        try:
            institution_pt = (float(self.latitude), float(self.longitude))
            user_pt = (float(lat), float(lng))
            if geodesic is not None:
                return geodesic(institution_pt, user_pt).kilometers
            
            # Math fallback using Haversine formula
            import math
            lat1, lon1 = institution_pt
            lat2, lon2 = user_pt
            R = 6371.0  # Earth's radius in kilometers
            
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c
        except Exception:
            return None

    def google_maps_link(self):
        if self.latitude is not None and self.longitude is not None:
            return f"https://www.google.com/maps/search/?api=1&query={self.latitude},{self.longitude}"
        if self.company_address:
            return f"https://www.google.com/maps/search/?api=1&query={self.company_address.replace(' ', '+')}"
        return ""
