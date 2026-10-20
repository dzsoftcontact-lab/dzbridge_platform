from django.urls import path
from .views import RatingListCreateView, RatingDetailView

urlpatterns = [
    path('', RatingListCreateView.as_view(), name='rating-list-create'),
    path('<uuid:pk>/', RatingDetailView.as_view(), name='rating-detail'),
]
