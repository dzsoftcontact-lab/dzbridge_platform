from rest_framework import serializers
from .models import Profile, ExpertAvailability

class ExpertAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpertAvailability
        fields = '__all__'
        read_only_fields = ('id', 'expert', 'duration_days', 'created_at')

class ProfileSerializer(serializers.ModelSerializer):
    availabilities = ExpertAvailabilitySerializer(source='user.availabilities', many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
