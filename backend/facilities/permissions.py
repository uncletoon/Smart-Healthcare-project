from rest_framework import permissions

class IsFacilityAdminOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to allow only the facility owner (admin) to edit it.
    """
    def has_permission(self, request, view):
        # Allow safe methods (GET, HEAD, OPTIONS) for any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write operations require authentication
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read-only permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        # Superuser / SuperAdmin bypasses ownership check
        if request.user.is_superuser or getattr(request.user, 'role', None) == 'superAdmin':
            return True
        # Instance must have an attribute named `admin`.
        return obj.admin == request.user
