from django.db import models

class MedicineCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class Medicine(models.Model):

    DOSAGE_FORMS = [
        ("tablet", "Tablet"),
        ("capsule", "Capsule"),
        ("syrup", "Syrup"),
        ("injection", "Injection"),
        ("cream", "Cream"),
        ("drops", "Drops"),
    ]

    medicine_name = models.CharField(max_length=255)
    brand_name = models.CharField(max_length=255, blank=True)
    # generic_name = models.CharField(max_length=255, blank=True)

    category = models.ForeignKey(MedicineCategory,on_delete=models.SET_NULL,null=True,blank=True)
    dosage_form = models.CharField(max_length=20,choices=DOSAGE_FORMS)
    strength = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=255, blank=True)
    prescription_required = models.BooleanField(max_length=250, default=False)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="medicines/",blank=True, null=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.medicine_name
