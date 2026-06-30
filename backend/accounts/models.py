from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager

class User(AbstractUser):
    """
    Custom User model representing either a Patient or a Facility Admin.
    Email is used as the unique username identifier for login.
    """
    CLIENT_USER = 'clientUser'
    ADMIN_USER = 'adminUser'
    
    ROLE_CHOICES = (
        (CLIENT_USER, 'Patient'),
        (ADMIN_USER, 'Facility Admin'),
    )

    # Disable default username field and configure email as the main username field
    username = None
    email = models.EmailField('email address', unique=True)
    
    # Custom required profile fields
    full_name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    # Set email as unique identifier for authentication
    USERNAME_FIELD = 'email'
    # Required when running createsuperuser CLI script
    REQUIRED_FIELDS = ['full_name', 'phone_number', 'role']

    objects = CustomUserManager()

    def __str__(self):
        return f"{self.email} ({self.role})"
