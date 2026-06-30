from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer

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
