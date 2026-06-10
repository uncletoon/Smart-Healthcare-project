from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceViewSet, ServiceCategoryViewSet

router = DefaultRouter()
router.register(r'services', ServiceViewSet)
router.register(r'servicecategories', ServiceCategoryViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
