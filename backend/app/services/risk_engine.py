import math
from typing import Dict, Any, Tuple

class RiskEngine:
    """
    Computes transparent Prototype Risk Score (0-100) and severity level
    for evaluated thermal anomalies.
    """

    @staticmethod
    def calculate_risk_score(
        predicted_class: str,
        confidence: float,
        features: Dict[str, Any]
    ) -> Tuple[int, str, Dict[str, Any]]:
        """
        Calculates risk score (0-100) and severity (HIGH, MEDIUM, LOW).
        Returns breakdown of risk factors.
        """
        base_score = 10.0
        
        dist_ind = features.get("distance_to_industrial_facility", 99999.0)
        dist_ref = features.get("distance_to_refinery", 99999.0)
        ratio = features.get("thermal_anomaly_ratio", 1.0)
        frp = features.get("frp", 15.0)
        pers = features.get("persistence_score", 0.0)
        inside_ind = features.get("inside_industrial_boundary", False)
        pop_dist = features.get("population_distance_meters", 1500.0)

        factor_scores = {}

        # 1. Classification Weight
        if predicted_class == "industrial_fire":
            class_score = 40.0 * confidence
            factor_scores["Classification (Industrial Fire)"] = round(class_score, 1)
        elif predicted_class == "gas_flare" and ratio >= 2.0:
            class_score = 25.0 * confidence
            factor_scores["Classification (Abnormal Flare)"] = round(class_score, 1)
        elif predicted_class == "forest_fire":
            class_score = 30.0 * confidence
            factor_scores["Classification (Wildfire)"] = round(class_score, 1)
        elif predicted_class == "gas_flare":
            class_score = 5.0
            factor_scores["Classification (Normal Flare)"] = 5.0
        else:
            class_score = 15.0 * confidence
            factor_scores["Classification"] = round(class_score, 1)

        base_score += class_score

        # 2. Facility Proximity Weight
        if inside_ind or dist_ind <= 200.0:
            prox_score = 25.0
        elif dist_ind <= 1000.0:
            prox_score = 15.0
        elif dist_ind <= 3000.0:
            prox_score = 5.0
        else:
            prox_score = 0.0
        factor_scores["Facility Proximity"] = prox_score
        base_score += prox_score

        # 3. Abnormality Ratio Weight
        if ratio >= 3.0:
            abn_score = 20.0
        elif ratio >= 1.8:
            abn_score = 12.0
        elif ratio >= 1.3:
            abn_score = 5.0
        else:
            abn_score = 0.0
        factor_scores["Thermal Abnormality"] = abn_score
        base_score += abn_score

        # 4. Population Proximity Weight (optional high value)
        if pop_dist <= 1000.0:
            pop_score = 10.0
            factor_scores["Population Proximity"] = pop_score
            base_score += pop_score

        # Final Score Cap (0-100)
        final_score = int(min(100, max(0, round(base_score))))

        if final_score >= 70:
            severity = "HIGH"
        elif final_score >= 40:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        breakdown = {
            "score": final_score,
            "severity": severity,
            "factors": factor_scores,
            "disclaimer": "Prototype Risk Score - For Operational Decision Support Only"
        }

        return final_score, severity, breakdown
