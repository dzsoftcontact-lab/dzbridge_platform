from rest_framework import generics, permissions
from .models import Rating
from .serializers import RatingSerializer

class RatingListCreateView(generics.ListCreateAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['collaboration', 'overall_score', 'is_private_admin_only']

    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)

class RatingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
