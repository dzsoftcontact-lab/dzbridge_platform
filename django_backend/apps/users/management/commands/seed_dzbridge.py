"""
Django management command to seed DZ-Bridge with authentic Algerian Scholar Award laureates,
universities, collaboration requests, and test matches.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.profiles.models import Profile, ExpertAvailability
from apps.projects.models import Project
from apps.matches.models import Match
from apps.collaborations.models import Collaboration
from apps.audit.models import ActivityLog
import datetime

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds initial Algerian Scholar Award laureates, universities, and matches'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("Starting DZ-Bridge database seeding..."))

        # 1. Admin Account
        admin_user, _ = User.objects.get_or_create(
            email='admin@dz-bridge.dz',
            defaults={
                'role': 'admin',
                'status': 'active',
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('DzBridge2026!')
        admin_user.save()

        Profile.objects.update_or_create(
            user=admin_user,
            defaults={
                'full_name': 'Directeur Général DZ-Bridge',
                'organization_name': 'MESRS Directorate',
                'country': 'Algeria',
                'city': 'Algiers',
                'bio': 'National higher education technology transfer administrator.'
            }
        )
        self.stdout.write(f"  ✓ Admin created: admin@dz-bridge.dz")

        # 2. Diaspora Expert: Prof. Belgacem Haba
        haba_user, _ = User.objects.get_or_create(
            email='belgacem.haba@algerian-scholars.dz',
            defaults={
                'role': 'expert',
                'status': 'active'
            }
        )
        haba_user.set_password('DzBridge2026!')
        haba_user.save()

        Profile.objects.update_or_create(
            user=haba_user,
            defaults={
                'full_name': 'Prof. Belgacem Haba',
                'organization_name': 'Adeia / Silicon Valley',
                'country': 'United States',
                'city': 'San Jose, CA',
                'is_diaspora': True,
                'bio': 'Prolific Algerian inventor with 500+ US patents in semiconductor packaging & AI hardware.',
                'expertise_tags': ['Semiconductors', 'Microchip Packaging', 'Hardware Architecture', 'Deep Learning'],
                'collaboration_preferences': {'remote_ok': True, 'in_person_ok': True}
            }
        )

        ExpertAvailability.objects.update_or_create(
            expert=haba_user,
            city='Algiers',
            start_date=datetime.date(2026, 11, 1),
            end_date=datetime.date(2026, 11, 20),
            defaults={'notes': 'In-person university keynote lectures & doctoral mentorship at USTHB/ESI.'}
        )
        self.stdout.write(f"  ✓ Expert created: Prof. Belgacem Haba")

        # 3. Diaspora Expert: Dr. Amina Benali
        benali_user, _ = User.objects.get_or_create(
            email='amina.benali@cnrs.fr',
            defaults={
                'role': 'expert',
                'status': 'active'
            }
        )
        benali_user.set_password('DzBridge2026!')
        benali_user.save()

        Profile.objects.update_or_create(
            user=benali_user,
            defaults={
                'full_name': 'Dr. Amina Benali',
                'organization_name': 'CNRS Paris',
                'country': 'France',
                'city': 'Paris',
                'is_diaspora': True,
                'bio': 'Research Director at CNRS in Natural Language Processing and Arabic LLMs.',
                'expertise_tags': ['Natural Language Processing', 'Arabic LLMs', 'Deep Learning', 'Biomedical AI'],
                'collaboration_preferences': {'remote_ok': True, 'in_person_ok': True, 'travel_stipend_required': True}
            }
        )

        ExpertAvailability.objects.update_or_create(
            expert=benali_user,
            city='Algiers',
            start_date=datetime.date(2026, 11, 5),
            end_date=datetime.date(2026, 11, 18),
            defaults={'notes': 'Doctoral bootcamps at ESI Algiers.'}
        )
        self.stdout.write(f"  ✓ Expert created: Dr. Amina Benali")

        # 4. Algerian University: ESI Algiers
        esi_user, _ = User.objects.get_or_create(
            email='contact@esi.dz',
            defaults={
                'role': 'organization',
                'status': 'active'
            }
        )
        esi_user.set_password('DzBridge2026!')
        esi_user.save()

        Profile.objects.update_or_create(
            user=esi_user,
            defaults={
                'full_name': 'Dr. Rachid Haddad',
                'organization_name': 'École Nationale Supérieure d\'Informatique (ESI Alger)',
                'organization_type': 'public_university',
                'country': 'Algeria',
                'city': 'Algiers'
            }
        )
        self.stdout.write(f"  ✓ Organization created: ESI Algiers")

        # 5. Project
        project1, _ = Project.objects.update_or_create(
            organization=esi_user,
            title='Cycle Doctoral Intensif : Modèles de Fondation et NLP Arabe',
            defaults={
                'description': 'Séminaire doctoral intensif de 10 jours sur les fondations LLMs arabes.',
                'skills_required': ['Natural Language Processing', 'Arabic LLMs', 'Deep Learning'],
                'location': 'Algiers',
                'start_date': datetime.date(2026, 11, 5),
                'end_date': datetime.date(2026, 11, 15),
                'logistics_offered': {'travel': True, 'lodging': True, 'stipend': True},
                'status': 'matched'
            }
        )
        self.stdout.write(f"  ✓ Project created: {project1.title}")

        # 6. Pre-computed High Compatibility Match
        match1, _ = Match.objects.update_or_create(
            project=project1,
            expert=benali_user,
            defaults={
                'compatibility_score': 97.5,
                'score_breakdown': {
                    'skills_score': 100,
                    'availability_score': 100,
                    'location_score': 100,
                    'diaspora_bonus': 100,
                    'matched_skills': ['Natural Language Processing', 'Arabic LLMs', 'Deep Learning'],
                    'overlapping_days': 11
                },
                'status': 'accepted',
                'notes': 'Honored to mentor Algerian engineering researchers.'
            }
        )
        self.stdout.write(f"  ✓ Match created: 97.5% compatibility")

        # 7. Initial Activity Log
        ActivityLog.objects.create(
            user=admin_user,
            user_role='admin',
            action_type='DATABASE_SEEDED',
            entity_type='database',
            ip_address='127.0.0.1',
            metadata={'note': 'Initial baseline seeded with Algerian Scholar Award laureates.'}
        )

        self.stdout.write(self.style.SUCCESS("DZ-Bridge database successfully seeded!"))
