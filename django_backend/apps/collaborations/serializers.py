from rest_framework import serializers
from .models import Collaboration
from apps.projects.serializers import ProjectSerializer

class CollaborationSerializer(serializers.ModelSerializer):
    project_details = ProjectSerializer(source='project', read_only=True)
    expert_email = serializers.EmailField(source='expert.email', read_only=True)
    organization_email = serializers.EmailField(source='organization.email', read_only=True)

    class Meta:
        model = Collaboration
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class CollaborationConfirmSerializer(serializers.Serializer):
    project_id = serializers.UUIDField()
    expert_id = serializers.UUIDField()
    notes = serializers.CharField(required=False, allow_blank=True)
