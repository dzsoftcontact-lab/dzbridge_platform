"""
Deterministic Algorithmic Compatibility Engine for Algerian Scholar Transfer.
Calculates: (Skills * 0.45) + (Availability * 0.25) + (Location * 0.15) + (Diaspora * 0.15)
"""
from typing import Dict, Any, List

def calculate_match_score(project, expert_profile, availabilities: List[Any]) -> Dict[str, Any]:
    project_skills = set(s.strip().lower() for s in (project.skills_required or []))
    expert_skills = set(s.strip().lower() for s in (expert_profile.expertise_tags or []))

    # 1. Technical Skills Score (45% weight)
    matched_skills = list(project_skills.intersection(expert_skills))
    if len(project_skills) > 0:
        skills_score = min(100.0, (len(matched_skills) / len(project_skills)) * 100.0)
    else:
        skills_score = 70.0

    # 2. Availability Score (25% weight)
    availability_score = 30.0
    overlapping_days = 0
    if project.start_date and project.end_date:
        for avail in availabilities:
            start_overlap = max(project.start_date, avail.start_date)
            end_overlap = min(project.end_date, avail.end_date)
            if start_overlap <= end_overlap:
                days = (end_overlap - start_overlap).days + 1
                if days > overlapping_days:
                    overlapping_days = days
        if overlapping_days >= 3:
            availability_score = 100.0
        elif overlapping_days > 0:
            availability_score = 75.0
        elif len(availabilities) > 0:
            availability_score = 60.0
    else:
        availability_score = 80.0

    # 3. Location Score (15% weight)
    host_city = (project.location or '').strip().lower()
    expert_city = (expert_profile.city or '').strip().lower()
    if host_city == 'remote' or expert_city == host_city:
        location_score = 100.0
    elif any(a.city.strip().lower() == host_city for a in availabilities):
        location_score = 100.0
    elif project.logistics_offered.get('travel', False):
        location_score = 85.0
    else:
        location_score = 50.0

    # 4. Diaspora Priority Bonus (15% weight)
    diaspora_bonus = 100.0 if expert_profile.is_diaspora else 65.0

    # Total Weighted Score
    total_score = round(
        (skills_score * 0.45) +
        (availability_score * 0.25) +
        (location_score * 0.15) +
        (diaspora_bonus * 0.15),
        2
    )

    return {
        'total_score': total_score,
        'breakdown': {
            'skills_score': round(skills_score, 1),
            'availability_score': round(availability_score, 1),
            'location_score': round(location_score, 1),
            'diaspora_bonus': round(diaspora_bonus, 1),
            'matched_skills': matched_skills,
            'overlapping_days': overlapping_days,
        }
    }
