from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer to represent and format user profile details.
    """
    facility_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone_number', 'role', 'facility_id']

    def get_facility_id(self, obj):
        return obj.facility.id if hasattr(obj, 'facility') else None


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for self-registration. Validates required fields:
    email, password, full_name, phone_number, and role.
    """
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['email', 'password', 'full_name', 'phone_number', 'role']

    def validate_role(self, value):
        if value not in [User.CLIENT_USER, User.ADMIN_USER]:
            raise serializers.ValidationError("Invalid role. Role must be 'clientUser' or 'adminUser'.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone_number=validated_data['phone_number'],
            role=validated_data['role']
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer to validate user login request.
    Authenticates email and password credentials.
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Unable to log in with provided credentials.")
        else:
            raise serializers.ValidationError("Must include 'email' and 'password'.")

        data['user'] = user
        return data
