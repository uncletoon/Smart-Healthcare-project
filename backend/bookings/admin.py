from django.contrib import admin
from .models import Booking

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_name', 'service', 'date_time', 'phone', 'status', 'created_at')
    list_filter = ('status', 'created_at', 'date_time')
    search_fields = ('patient_name', 'phone', 'service__name')
