from django.urls import path
from .views import ProjectListCreateView, ProjectDetailView, ProjectStatusTransitionView

urlpatterns = [
    path('', ProjectListCreateView.as_view(), name='project-list-create'),
    path('<uuid:pk>/', ProjectDetailView.as_view(), name='project-detail'),
    path('<uuid:pk>/status/', ProjectStatusTransitionView.as_view(), name='project-status-transition'),
]
