from rest_framework import viewsets
from .models import Medicine, MedicineCategory
from .serializers import MedicineSerializer, MedicineCategorySerializer

class MedicineCategoryViewSet(viewsets.ModelViewSet):
    queryset = MedicineCategory.objects.all()
    serializer_class = MedicineCategorySerializer

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer