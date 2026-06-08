from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (MedicineViewSet, MedicineCategoryViewSet)

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet)
router.register(r'medicinescategory', MedicineCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
