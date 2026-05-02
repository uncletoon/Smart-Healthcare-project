from django.contrib import admin
from .models import Category, Location, Insurance, Language, Facility

admin.site.register(Category)
admin.site.register(Location)
admin.site.register(Insurance)
admin.site.register(Language)
admin.site.register(Facility)
