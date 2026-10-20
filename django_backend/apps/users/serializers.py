from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'status', 'email_verified_at', 'created_at')
        read_only_fields = ('id', 'status', 'email_verified_at', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    full_name = serializers.CharField(write_only=True, required=False)
    country = serializers.CharField(write_only=True, required=False)
    city = serializers.CharField(write_only=True, required=False)
    is_diaspora = serializers.BooleanField(write_only=True, default=False)

    class Meta:
        model = User
        fields = ('id', 'email', 'password', 'role', 'full_name', 'country', 'city', 'is_diaspora')

    def create(self, validated_data):
        full_name = validated_data.pop('full_name', '')
        country = validated_data.pop('country', 'Algeria')
        city = validated_data.pop('city', 'Algiers')
        is_diaspora = validated_data.pop('is_diaspora', False)
        password = validated_data.pop('password')
        
        user = User.objects.create_user(password=password, **validated_data)
        
        # Polymorphic profile creation
        from apps.profiles.models import Profile
        Profile.objects.create(
            user=user,
            full_name=full_name or user.email.split('@')[0],
            country=country,
            city=city,
            is_diaspora=is_diaspora
        )
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['role'] = user.role
        token['status'] = user.status
        return token
