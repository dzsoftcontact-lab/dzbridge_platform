from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .views import test_client_view, health_check_view

urlpatterns = [
    # 1. Simple Frontend Test Harness for DRF (Dedicated Test Client)
    path('', test_client_view, name='home-test-client'),
    path('test-client/', test_client_view, name='test-client'),
    path('health/', health_check_view, name='health-check'),
    
    # 2. Django Admin
    path('admin/', admin.site.urls),
    
    # 3. OpenAPI Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # 4. Core Domain API Routes (v1)
    path('api/v1/auth/', include('apps.users.urls')),
    path('api/v1/profiles/', include('apps.profiles.urls')),
    path('api/v1/projects/', include('apps.projects.urls')),
    path('api/v1/matches/', include('apps.matches.urls')),
    path('api/v1/collaborations/', include('apps.collaborations.urls')),
    path('api/v1/ratings/', include('apps.ratings.urls')),
    path('api/v1/audit/', include('apps.audit.urls')),
]
