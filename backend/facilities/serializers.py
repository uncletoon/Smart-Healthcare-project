from rest_framework import serializers
from .models import Category, Location, Insurance, Language, Facility

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class InsuranceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insurance
        fields = '__all__'

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = '__all__'

class FacilitySerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField()
    google_maps_link = serializers.SerializerMethodField()

    class Meta:
        model = Facility
        fields = '__all__'

    def get_distance(self, obj):
        request = self.context.get('request')
        if not request:
            return None
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        if lat is not None and lng is not None:
            return obj.distance_to(lat, lng)
        return None

    def get_google_maps_link(self, obj):
        return obj.google_maps_link()
