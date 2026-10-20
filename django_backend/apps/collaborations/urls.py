from django.urls import path
from .views import CollaborationListView, CollaborationConfirmView, CollaborationDetailView

urlpatterns = [
    path('', CollaborationListView.as_view(), name='collaboration-list'),
    path('confirm/', CollaborationConfirmView.as_view(), name='collaboration-confirm'),
    path('<uuid:pk>/', CollaborationDetailView.as_view(), name='collaboration-detail'),
]
