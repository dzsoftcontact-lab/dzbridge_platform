import uuid
from django.db import models
from django.conf import settings

class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    full_name = models.CharField(max_length=255)
    organization_name = models.CharField(max_length=255, null=True, blank=True)
    organization_type = models.CharField(max_length=100, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, default='Algeria')
    city = models.CharField(max_length=100, null=True, blank=True)
    is_diaspora = models.BooleanField(default=False)
    expertise_tags = models.JSONField(default=list, blank=True)
    collaboration_preferences = models.JSONField(default=dict, blank=True)
    documents = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profiles'

    def __str__(self):
        return f"{self.full_name} ({self.country})"

class ExpertAvailability(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    expert = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='availabilities')
    city = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    duration_days = models.PositiveIntegerField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'expert_availabilities'
        ordering = ['start_date']

    def save(self, *args, **kwargs):
        if self.start_date and self.end_date:
            self.duration_days = (self.end_date - self.start_date).days + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.expert.email} - {self.city} ({self.start_date} to {self.end_date})"
