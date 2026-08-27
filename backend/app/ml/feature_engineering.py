import pandas as pd
import numpy as np
from typing import Dict, Any, List

FEATURE_NAMES = [
    "thermal_intensity",
    "confidence",
    "frp",
    "distance_to_industry",
    "distance_to_forest",
    "distance_to_agriculture",
    "distance_to_mine",
    "distance_to_powerplant",
    "persistence_score",
    "event_frequency",
    "historical_mean",
    "thermal_anomaly_ratio",
    "nearby_facility_count",
    "inside_industrial_boundary",
    "inside_forest",
    "inside_agriculture",
    "time_of_day",
    "day_of_week"
]

CLASS_NAMES = [
    "industrial_fire",
    "gas_flare",
    "forest_fire",
    "agricultural_burn",
    "mining_activity",
    "unknown"
]

class FeatureEngineering:
    """
    Transforms raw thermal event metrics and geospatial context into ML feature vectors.
    """

    @staticmethod
    def extract_feature_vector(feature_dict: Dict[str, Any]) -> pd.DataFrame:
        """
        Converts feature dictionary into a single-row Pandas DataFrame matching training features.
        """
        row = {
            "thermal_intensity": float(feature_dict.get("thermal_intensity", 320.0)),
            "confidence": float(feature_dict.get("confidence", 85.0)),
            "frp": float(feature_dict.get("frp", 15.0)),
            "distance_to_industry": float(feature_dict.get("distance_to_industrial_facility", 99999.0)),
            "distance_to_forest": float(feature_dict.get("distance_to_forest", 99999.0)),
            "distance_to_agriculture": float(feature_dict.get("distance_to_agriculture", 99999.0)),
            "distance_to_mine": float(feature_dict.get("distance_to_mine", 99999.0)),
            "distance_to_powerplant": float(feature_dict.get("distance_to_powerplant", 99999.0)),
            "persistence_score": float(feature_dict.get("persistence_score", 0.0)),
            "event_frequency": float(feature_dict.get("event_frequency", 0.0)),
            "historical_mean": float(feature_dict.get("historical_mean_temperature", 310.0)),
            "thermal_anomaly_ratio": float(feature_dict.get("thermal_anomaly_ratio", 1.0)),
            "nearby_facility_count": int(feature_dict.get("nearby_facility_count", 0)),
            "inside_industrial_boundary": 1.0 if feature_dict.get("inside_industrial_boundary", False) else 0.0,
            "inside_forest": 1.0 if feature_dict.get("inside_forest", False) else 0.0,
            "inside_agriculture": 1.0 if feature_dict.get("inside_agriculture", False) else 0.0,
            "time_of_day": float(feature_dict.get("time_of_day", 12.0)),
            "day_of_week": float(feature_dict.get("day_of_week", 0))
        }
        return pd.DataFrame([row])[FEATURE_NAMES]
