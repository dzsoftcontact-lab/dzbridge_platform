from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from apps.projects.models import Project
from .models import Match
from .serializers import MatchSerializer, MatchResponseSerializer
from .engine import calculate_match_score

User = get_user_model()

class RecommendationListView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        min_score = float(request.query_params.get('minScore', 50.0))
        results = []

        projects = Project.objects.exclude(status__in=['completed', 'cancelled', 'unsuccessful'])
        experts = User.objects.filter(role='expert').select_related('profile')

        for project in projects:
            for expert in experts:
                if not hasattr(expert, 'profile'):
                    continue
                avails = list(expert.availabilities.all())
                calc = calculate_match_score(project, expert.profile, avails)
                if calc['total_score'] >= min_score:
                    match, _ = Match.objects.update_or_create(
                        project=project,
                        expert=expert,
                        defaults={
                            'compatibility_score': calc['total_score'],
                            'score_breakdown': calc['breakdown']
                        }
                    )
                    results.append(MatchSerializer(match).data)

        return Response({
            'totalFound': len(results),
            'algorithmWeights': {
                'skills': '45%',
                'availability': '25%',
                'location': '15%',
                'diaspora_priority': '15%'
            },
            'matches': results
        }, status=status.HTTP_200_OK)

class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status']

class MatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer
    permission_classes = [permissions.IsAuthenticated]


class MatchRespondView(generics.GenericAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        match = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        decision = serializer.validated_data['decision']
        notes = serializer.validated_data.get('notes', '')

        match.status = decision
        match.responded_at = timezone.now()
        match.notes = notes
        match.save()

        # If accepted, update project state to contact_initiated
        if decision == 'accepted' and match.project.status in ['submitted', 'under_review', 'matched']:
            match.project.status = 'contact_initiated'
            match.project.save()

        return Response(MatchSerializer(match).data, status=status.HTTP_200_OK)
