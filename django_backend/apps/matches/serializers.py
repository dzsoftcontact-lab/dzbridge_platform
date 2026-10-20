from rest_framework import serializers
from .models import Match
from apps.projects.serializers import ProjectSerializer

class MatchSerializer(serializers.ModelSerializer):
    project_details = ProjectSerializer(source='project', read_only=True)
    expert_email = serializers.EmailField(source='expert.email', read_only=True)
    expert_name = serializers.CharField(source='expert.profile.full_name', read_only=True)

    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ('id', 'notified_at', 'created_at')

class MatchResponseSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=['accepted', 'rejected'])
    notes = serializers.CharField(required=False, allow_blank=True)
