from rest_framework.permissions import BasePermission, SAFE_METHODS

class ReadOnlyOrIsAuthenticated(BasePermission):
    """
    Allow unauthenticated access only for safe (read-only) methods like GET, HEAD, OPTIONS.
    For all other methods, the user must be authenticated.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated
