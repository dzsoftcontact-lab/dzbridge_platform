from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Project, ProjectStatusHistory
from .serializers import ProjectSerializer, ProjectStatusTransitionSerializer

class ProjectListCreateView(generics.ListCreateAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'location']
    search_fields = ['title', 'description', 'location']

    def perform_create(self, serializer):
        serializer.save(organization=self.request.user)

class ProjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

class ProjectStatusTransitionView(generics.GenericAPIView):
    queryset = Project.objects.all()
    serializer_class = ProjectStatusTransitionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        project = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        old_status = project.status
        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')

        project.status = new_status
        project.save()

        ProjectStatusHistory.objects.create(
            project=project,
            from_status=old_status,
            to_status=new_status,
            changed_by=request.user,
            notes=notes
        )
        return Response(ProjectSerializer(project).data, status=status.HTTP_200_OK)
