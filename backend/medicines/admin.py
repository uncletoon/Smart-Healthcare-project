from django.contrib import admin
from .models import MedicineCategory, Medicine

# Register your models here.
admin.site.register(Medicine)
admin.site.register(MedicineCategory)