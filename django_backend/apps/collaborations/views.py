from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.projects.models import Project
from .models import Collaboration
from .serializers import CollaborationSerializer, CollaborationConfirmSerializer

User = get_user_model()

class CollaborationListView(generics.ListAPIView):
    queryset = Collaboration.objects.all()
    serializer_class = CollaborationSerializer
    permission_classes = [permissions.IsAuthenticated]

class CollaborationConfirmView(generics.GenericAPIView):
    serializer_class = CollaborationConfirmSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        project = Project.objects.get(id=serializer.validated_data['project_id'])
        expert = User.objects.get(id=serializer.validated_data['expert_id'])

        collab, created = Collaboration.objects.get_or_create(
            project=project,
            expert=expert,
            organization=project.organization,
            defaults={
                'status': 'active',
                'confirmed_at': timezone.now(),
                'notes': serializer.validated_data.get('notes', '')
            }
        )

        project.status = 'confirmed'
        project.save()

        return Response(CollaborationSerializer(collab).data, status=status.HTTP_201_CREATED)

class CollaborationDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Collaboration.objects.all()
    serializer_class = CollaborationSerializer
    permission_classes = [permissions.IsAuthenticated]

