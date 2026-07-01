from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, LocationViewSet, InsuranceViewSet,
    FacilityViewSet
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'insurances', InsuranceViewSet)
router.register(r'facilities', FacilityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
