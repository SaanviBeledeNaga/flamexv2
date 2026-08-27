import math
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from backend.app.models.models import EventHistory, ThermalEvent
from backend.app.geospatial.context_engine import haversine_distance

class PersistenceDetector:
    """
    Analyzes historical detections around a spatial location to measure persistence,
    recurrence patterns, and flare likelihood.
    """

    @staticmethod
    def calculate_persistence(
        current_lat: float,
        current_lon: float,
        current_time: datetime,
        history_records: List[EventHistory],
        spatial_radius_meters: float = 500.0,
        time_window_days: int = 14
    ) -> Dict[str, Any]:
        """
        Groups historical events within spatial_radius_meters and time_window_days.
        Returns persistence_score (0.0 to 1.0), event_frequency, and time regularity indicators.
        """
        if not history_records:
            return {
                "persistence_score": 0.0,
                "event_frequency": 0.0,
                "consecutive_days": 0,
                "time_pattern_regularity": 0.0,
                "historical_count": 0,
                "is_persistent_source": False
            }

        cutoff_date = current_time - timedelta(days=time_window_days)
        nearby_events = []

        for item in history_records:
            if item.detected_at >= cutoff_date:
                dist = haversine_distance(current_lat, current_lon, item.latitude, item.longitude)
                if dist <= spatial_radius_meters:
                    nearby_events.append(item)

        count = len(nearby_events)
        if count == 0:
            return {
                "persistence_score": 0.0,
                "event_frequency": 0.0,
                "consecutive_days": 0,
                "time_pattern_regularity": 0.0,
                "historical_count": 0,
                "is_persistent_source": False
            }

        # Calculate distinct active days
        distinct_days = set(item.detected_at.date() for item in nearby_events)
        num_days = len(distinct_days)

        # Frequency relative to time window
        frequency = num_days / float(time_window_days)

        # Time of day variance (hour pattern)
        hours = [item.detected_at.hour + item.detected_at.minute / 60.0 for item in nearby_events]
        if len(hours) > 1:
            mean_hour = sum(hours) / len(hours)
            variance_hour = sum((h - mean_hour) ** 2 for h in hours) / len(hours)
            std_hour = math.sqrt(variance_hour)
            # Regularity is high if detections occur at similar hours (std < 2 hours)
            regularity = max(0.0, 1.0 - (std_hour / 6.0))
        else:
            regularity = 0.5

        # Calculate persistence score formula
        # Combines active day coverage and temporal regularity
        persistence_score = min(1.0, (0.7 * (num_days / max(1.0, time_window_days * 0.7))) + (0.3 * regularity))
        persistence_score = round(persistence_score, 2)

        return {
            "persistence_score": persistence_score,
            "event_frequency": round(frequency, 2),
            "consecutive_days": num_days,
            "time_pattern_regularity": round(regularity, 2),
            "historical_count": count,
            "is_persistent_source": persistence_score >= 0.6
        }
