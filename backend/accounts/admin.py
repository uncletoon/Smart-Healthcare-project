from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAdmin(BaseUserAdmin):
    """
    Custom UserAdmin class to handle our custom email-based User model in the Django Admin.
    """
    list_display = ('email', 'full_name', 'phone_number', 'role', 'is_staff', 'is_superuser')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    
    # Details layout in Django Admin
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'phone_number', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    # Layout for creating a user in Django Admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'full_name', 'phone_number', 'role'),
        }),
    )
    
    search_fields = ('email', 'full_name')
    ordering = ('email',)

admin.site.register(User, UserAdmin)
