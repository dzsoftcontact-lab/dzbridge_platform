import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.collaborations.models import Collaboration

class Rating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    collaboration = models.ForeignKey(Collaboration, on_delete=models.CASCADE, related_name='ratings')
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submitted_ratings')
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_ratings')
    overall_score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    category_scores = models.JSONField(default=dict)
    comment = models.TextField(null=True, blank=True)
    is_private_admin_only = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ratings'
        ordering = ['-created_at']
        unique_together = ('collaboration', 'from_user')

    def __str__(self):
        return f"Rating ({self.overall_score}/5) for {self.collaboration}"
