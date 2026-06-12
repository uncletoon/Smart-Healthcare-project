
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter

# Import viewsets from apps and register them on a single router so
# the API root at /api/ shows all endpoints.
from facilities.views import (
    CategoryViewSet, LocationViewSet, InsuranceViewSet,
    LanguageViewSet, FacilityViewSet,
)
from services_app.views import ServiceViewSet, ServiceCategoryViewSet
from medicines.views import MedicineViewSet, MedicineCategoryViewSet
from bookings.views import BookingViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'insurances', InsuranceViewSet)
router.register(r'languages', LanguageViewSet)
router.register(r'facilities', FacilityViewSet)
router.register(r'services', ServiceViewSet)
router.register(r'servicecategories', ServiceCategoryViewSet)
router.register(r'medicine-categories', MedicineCategoryViewSet)
router.register(r'medicines', MedicineViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
