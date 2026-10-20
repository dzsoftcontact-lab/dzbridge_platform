from rest_framework import serializers
from .models import Project, ProjectStatusHistory

class ProjectStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectStatusHistory
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    organization_email = serializers.EmailField(source='organization.email', read_only=True)
    status_history = ProjectStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('id', 'organization', 'created_at', 'updated_at')

class ProjectStatusTransitionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Project.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True)
