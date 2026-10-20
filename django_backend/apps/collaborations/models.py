import uuid
from django.db import models
from django.conf import settings
from apps.projects.models import Project

class Collaboration(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Confirmation'),
        ('active', 'Active Partnership'),
        ('completed', 'Successfully Completed'),
        ('cancelled', 'Cancelled'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='collaborations')
    expert = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='expert_collaborations')
    organization = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='org_collaborations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    confirmed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'collaborations'
        ordering = ['-created_at']

    def __str__(self):
        return f"Collaboration: {self.project.title} ({self.status})"
