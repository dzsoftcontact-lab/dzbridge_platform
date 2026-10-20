import json
from .models import ActivityLog

class ActivityLoggerMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Log mutating actions into activity_logs
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] and request.path.startswith('/api/v1/'):
            user = request.user if request.user.is_authenticated else None
            user_role = getattr(user, 'role', 'anonymous') if user else 'anonymous'

            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            parts = [p for p in request.path.strip('/').split('/') if p]
            entity = parts[2] if len(parts) > 2 else 'general'
            action_type = f"{request.method}_{entity.upper()}"

            try:
                ActivityLog.objects.create(
                    user=user,
                    user_role=user_role,
                    action_type=action_type,
                    entity_type=entity,
                    ip_address=ip,
                    metadata={
                        'path': request.path,
                        'status_code': response.status_code,
                        'method': request.method,
                    }
                )
            except Exception:
                pass

        return response
