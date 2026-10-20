from rest_framework import generics, permissions
from .models import Profile, ExpertAvailability
from .serializers import ProfileSerializer, ExpertAvailabilitySerializer

class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile

class ExpertAvailabilityListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpertAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return ExpertAvailability.objects.all()
        return ExpertAvailability.objects.filter(expert=self.request.user)

    def perform_create(self, serializer):
        serializer.save(expert=self.request.user)

class ExpertAvailabilityDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExpertAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return ExpertAvailability.objects.all()
        return ExpertAvailability.objects.filter(expert=self.request.user)

class ProfileListView(generics.ListAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['is_diaspora', 'city', 'country']
    search_fields = ['full_name', 'organization_name', 'specialty']

class ProfileAdminDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

