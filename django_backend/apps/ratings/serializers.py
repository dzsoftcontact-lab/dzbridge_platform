from rest_framework import serializers
from .models import Rating

class RatingSerializer(serializers.ModelSerializer):
    from_user_email = serializers.EmailField(source='from_user.email', read_only=True)
    to_user_email = serializers.EmailField(source='to_user.email', read_only=True)

    class Meta:
        model = Rating
        fields = [
            'id',
            'collaboration',
            'from_user',
            'to_user',
            'from_user_email',
            'to_user_email',
            'overall_score',
            'category_scores',
            'comment',
            'is_private_admin_only',
            'created_at',
        ]
        read_only_fields = ['id', 'from_user', 'created_at']
