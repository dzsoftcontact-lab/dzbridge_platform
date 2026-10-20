from django.urls import path
from .views import (
    ProfileDetailView,
    ExpertAvailabilityListCreateView,
    ExpertAvailabilityDetailView,
    ProfileListView,
    ProfileAdminDetailView,
)

urlpatterns = [
    path('me/', ProfileDetailView.as_view(), name='profile-me'),
    path('', ProfileListView.as_view(), name='profile-list'),
    path('<uuid:pk>/', ProfileAdminDetailView.as_view(), name='profile-admin-detail'),
    path('availability/', ExpertAvailabilityListCreateView.as_view(), name='expert-availability'),
    path('availability/<uuid:pk>/', ExpertAvailabilityDetailView.as_view(), name='expert-availability-detail'),
]
