from django.shortcuts import render
from django.http import JsonResponse

def test_client_view(request):
    """
    Renders the dedicated, simple HTML front-end test harness for Django REST Framework.
    """
    return render(request, 'test_client.html', {
        'title': 'DZ-Bridge Django REST Framework Interactive Client',
        'api_version': 'v1',
    })

def health_check_view(request):
    """
    Provides a quick health check endpoint for gateway connectivity.
    """
    return JsonResponse({
        'status': 'healthy',
        'service': 'DZ-Bridge Django Backend',
        'framework': 'Django 5.1 + Django REST Framework',
        'database': 'PostgreSQL 16 Relational Engine',
    })
