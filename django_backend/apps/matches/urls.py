from django.urls import path
from .views import RecommendationListView, MatchDetailView, MatchRespondView, MatchListCreateView

urlpatterns = [
    path('', MatchListCreateView.as_view(), name='match-list-create'),
    path('recommendations/', RecommendationListView.as_view(), name='match-recommendations'),
    path('<uuid:pk>/', MatchDetailView.as_view(), name='match-detail'),
    path('<uuid:pk>/respond/', MatchRespondView.as_view(), name='match-respond'),
]
