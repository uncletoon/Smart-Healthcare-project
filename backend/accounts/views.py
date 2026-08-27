from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
import os
import json
from django.conf import settings

CONFIG_FILE_PATH = os.path.join(settings.BASE_DIR, "system_config.json")

def read_config():
    if os.path.exists(CONFIG_FILE_PATH):
        try:
            with open(CONFIG_FILE_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "ostrabacus_ai_enabled": True,
        "ostrabacus_ai_bookings_allowed": True,
        "ostrabacus_disabled_services": []
    }

def write_config(data):
    try:
        with open(CONFIG_FILE_PATH, "w") as f:
            json.dump(data, f, indent=4)
        return True
    except Exception:
        return False


class RegisterView(APIView):
    """
    API View to register a new user (Patient or Facility Admin).
    Upon successful registration, it automatically generates and returns
    a rest_framework.authtoken Token for session authentication.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # rest_framework.authtoken generates a unique token key for authentication
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    API View to authenticate existing user credentials (email & password).
    Returns the user profile details and their unique rest_framework.authtoken Token key.
    Clients should send this token key in the HTTP 'Authorization' header prefixing it with 'Token '.
    Example header: Authorization: Token <token_key>
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            # Fetch or generate a token key for authentication session
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    """
    API View to retrieve profile details for the currently logged-in user.
    Requires header: Authorization: Token <token_key>
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # request.user is authenticated and set dynamically by TokenAuthentication
        return Response(UserSerializer(request.user).data)


class AiConfigView(APIView):
    """
    API View to read and write Ostrabacus AI System configurations.
    GET is public so that both public assistant and dashboard can load config.
    POST requires authentication and permits settings modification by roles.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(read_config(), status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        is_super = (getattr(user, 'role', None) == 'superAdmin' or user.is_superuser)
        is_facility = (getattr(user, 'role', None) == 'adminUser')

        if not is_super and not is_facility:
            return Response({"detail": "Only authorized administrators can modify configurations."}, status=status.HTTP_403_FORBIDDEN)

        current = read_config()

        # Super Admin updates global settings
        if is_super:
            if "ostrabacus_ai_enabled" in request.data:
                current["ostrabacus_ai_enabled"] = bool(request.data["ostrabacus_ai_enabled"])
            if "ostrabacus_ai_bookings_allowed" in request.data:
                current["ostrabacus_ai_bookings_allowed"] = bool(request.data["ostrabacus_ai_bookings_allowed"])

        # Super Admin and Facility Admin can update service AI permissions
        if "ostrabacus_disabled_services" in request.data:
            current["ostrabacus_disabled_services"] = [str(x) for x in request.data["ostrabacus_disabled_services"]]

        if write_config(current):
            return Response(current, status=status.HTTP_200_OK)
        return Response({"detail": "Failed to save configuration file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


LOGS_FILE_PATH = os.path.join(settings.BASE_DIR, "system_ai_logs.json")

def read_logs():
    if os.path.exists(LOGS_FILE_PATH):
        try:
            with open(LOGS_FILE_PATH, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return []

def write_logs(data):
    try:
        with open(LOGS_FILE_PATH, "w") as f:
            json.dump(data[-100:], f, indent=4)
        return True
    except Exception:
        return False


class AiLogView(APIView):
    """
    API View to submit and retrieve Ostrabacus AI System logs.
    GET is accessible by administrators to view interaction history.
    POST is public so the public assistant widget can log patient queries.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated or (getattr(user, 'role', None) not in ['superAdmin', 'adminUser'] and not user.is_superuser):
            return Response({"detail": "Only administrators can view system logs."}, status=status.HTTP_403_FORBIDDEN)
        return Response(read_logs(), status=status.HTTP_200_OK)

    def post(self, request):
        query = request.data.get("query")
        intent = request.data.get("intent")
        execution_strategy = request.data.get("executionStrategy")

        if not query or not intent or not execution_strategy:
            return Response({"detail": "Missing log parameters"}, status=status.HTTP_400_BAD_REQUEST)

        current_logs = read_logs()
        import datetime
        new_log = {
            "id": "ai-" + os.urandom(4).hex(),
            "query": query,
            "intent": intent,
            "executionStrategy": execution_strategy,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
        }

        current_logs.append(new_log)
        if write_logs(current_logs):
            return Response(new_log, status=status.HTTP_201_CREATED)
        return Response({"detail": "Failed to write log to file"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
