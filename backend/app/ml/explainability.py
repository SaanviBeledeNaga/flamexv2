from typing import Dict, Any, List
import pandas as pd

class ExplainabilityEngine:
    """
    Generates explainable factor contributions and human-readable evidence summaries
    for FlameX thermal classification decisions.
    """

    @staticmethod
    def generate_explanation(
        predicted_class: str,
        confidence: float,
        features: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates itemized evidence factors explaining WHY the AI reached the conclusion.
        """
        factors = []
        contributions = []

        dist_ind = features.get("distance_to_industrial_facility", 99999.0)
        dist_ref = features.get("distance_to_refinery", 99999.0)
        dist_power = features.get("distance_to_powerplant", 99999.0)
        dist_forest = features.get("distance_to_forest", 99999.0)
        dist_agri = features.get("distance_to_agriculture", 99999.0)
        dist_mine = features.get("distance_to_mine", 99999.0)
        
        pers = features.get("persistence_score", 0.0)
        ratio = features.get("thermal_anomaly_ratio", 1.0)
        land_cover = features.get("land_cover_class", "other")
        facility_name = features.get("nearest_facility_name")
        facility_type = features.get("nearest_facility_type")
        frp = features.get("frp", 0.0)
        temp = features.get("brightness_temperature", 320.0)
        inside_ind = features.get("inside_industrial_boundary", False)

        if predicted_class == "industrial_fire":
            if inside_ind or dist_ind <= 200.0:
                fac_str = f"{facility_name} ({facility_type})" if facility_name else "industrial complex"
                factors.append(f"Located directly inside or within {int(dist_ind)}m of {fac_str}")
                contributions.append({"feature_name": "Proximity to Facility", "impact": "+", "description": f"{int(dist_ind)}m from facility", "value": dist_ind})
            elif dist_ind <= 1000.0:
                factors.append(f"Proximity ({int(dist_ind)}m) to nearby industrial facility")
                contributions.append({"feature_name": "Industrial Proximity", "impact": "+", "description": f"{int(dist_ind)}m distance", "value": dist_ind})

            if ratio >= 2.0:
                factors.append(f"Abnormal thermal jump ({round(ratio, 1)}x historical baseline)")
                contributions.append({"feature_name": "Thermal Anomaly Ratio", "impact": "+", "description": f"{round(ratio, 1)}x surge over normal", "value": ratio})

            if pers < 0.3:
                factors.append("No recurring daily pattern (sudden non-persistent fire event)")
                contributions.append({"feature_name": "Persistence", "impact": "-", "description": "Low historical persistence", "value": pers})
            else:
                factors.append(f"Previously persistent flare stack experiencing major abnormal thermal surge ({round(ratio, 1)}x)")
                contributions.append({"feature_name": "Flare Surge", "impact": "+", "description": "Abnormal flare intensity hike", "value": ratio})

            if land_cover == "industrial" or inside_ind:
                factors.append("Industrial / Built-up land-cover classification")
                contributions.append({"feature_name": "Land Cover", "impact": "+", "description": "Industrial zone", "value": land_cover})

            if frp >= 40.0 or temp >= 350.0:
                factors.append(f"Extremely high thermal intensity (FRP {round(frp, 1)} MW, Temp {round(temp, 1)} K)")
                contributions.append({"feature_name": "Thermal Intensity", "impact": "+", "description": f"{round(frp, 1)} MW radiative power", "value": frp})

        elif predicted_class == "gas_flare":
            if pers >= 0.6:
                factors.append(f"High historical persistence score ({int(pers * 100)}% recurring thermal detections)")
                contributions.append({"feature_name": "Persistence Score", "impact": "+", "description": f"{int(pers * 100)}% temporal regularity", "value": pers})

            if dist_ind <= 1000.0 or dist_ref <= 1000.0:
                fac_str = facility_name if facility_name else "refinery/petrochemical plant"
                factors.append(f"Located near persistent industrial flare stack at {fac_str}")
                contributions.append({"feature_name": "Refinery Proximity", "impact": "+", "description": f"{int(dist_ref if dist_ref < 9999 else dist_ind)}m distance", "value": dist_ind})

            if 0.8 <= ratio <= 1.5:
                factors.append(f"Thermal intensity matches expected historical baseline ({round(ratio, 1)}x)")
                contributions.append({"feature_name": "Baseline Ratio", "impact": "+", "description": "Normal flare operating range", "value": ratio})

        elif predicted_class == "forest_fire":
            if land_cover == "forest" or dist_forest <= 500.0:
                factors.append("Dense forest canopy land-cover classification")
                contributions.append({"feature_name": "Forest Land Cover", "impact": "+", "description": "Forest zone", "value": land_cover})

            if dist_ind > 3000.0:
                factors.append(f"Significant distance ({round(dist_ind/1000.0, 1)}km) from any industrial facility")
                contributions.append({"feature_name": "Industrial Distance", "impact": "-", "description": "Remote from industry", "value": dist_ind})

            if features.get("spatial_growth", 0.0) > 1.0:
                factors.append("Spatially expanding thermal perimeter over time")
                contributions.append({"feature_name": "Spatial Growth", "impact": "+", "description": "Expanding fire boundary", "value": features.get("spatial_growth")})

        elif predicted_class == "agricultural_burn":
            if land_cover == "agriculture" or dist_agri <= 500.0:
                factors.append("Agricultural / cropland field land-cover classification")
                contributions.append({"feature_name": "Agricultural Land Cover", "impact": "+", "description": "Cropland zone", "value": land_cover})

            if pers < 0.2:
                factors.append("Short-lived transient thermal signature typical of crop residue burning")
                contributions.append({"feature_name": "Transient Duration", "impact": "+", "description": "Single-day crop burn", "value": pers})

        elif predicted_class == "mining_activity":
            if dist_mine <= 1000.0 or land_cover == "barren":
                factors.append(f"Located within mining pit / quarry area ({int(dist_mine)}m to mine)")
                contributions.append({"feature_name": "Mine Proximity", "impact": "+", "description": f"{int(dist_mine)}m distance", "value": dist_mine})

        else:  # unknown
            factors.append("Thermal signature lacks definitive industrial, forestry, or agricultural context")
            contributions.append({"feature_name": "Uncertain Features", "impact": "-", "description": "Ambiguous spatial features", "value": 0})

        summary = f"Classified as {predicted_class.replace('_', ' ').title()} ({int(confidence * 100)}% confidence) based on {len(factors)} key spatial and historical indicators."

        return {
            "top_factors": factors if factors else ["Standard thermal pattern"],
            "contributions": contributions,
            "summary": summary
        }
