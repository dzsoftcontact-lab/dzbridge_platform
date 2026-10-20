import uuid
from django.db import models
from django.conf import settings
from apps.projects.models import Project

class Match(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending Review / Acceptance'),
        ('accepted', 'Accepted by Expert'),
        ('rejected', 'Declined by Expert'),
        ('expired', 'Invitation Expired'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='matches')
    expert = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='matches')
    compatibility_score = models.DecimalField(max_digits=5, decimal_places=2)
    score_breakdown = models.JSONField(default=dict)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notified_at = models.DateTimeField(auto_now_add=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'matches'
        ordering = ['-compatibility_score', '-created_at']
        unique_together = ('project', 'expert')

    def __str__(self):
        return f"Match: {self.project.title} - {self.expert.email} ({self.compatibility_score}%)"
