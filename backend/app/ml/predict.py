from typing import Dict, Any
from backend.app.ml.feature_engineering import FeatureEngineering, CLASS_NAMES
from backend.app.ml.model import flamex_classifier
from backend.app.ml.explainability import ExplainabilityEngine

class HybridClassifierEngine:
    """
    Hybrid Classification Pipeline combining Machine Learning probabilities
    with domain-expert rule safety overrides.
    """

    @staticmethod
    def classify_event(feature_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs feature extraction, ML inference, rule-based safety adjustment,
        and explainability analysis.
        """
        # 1. Convert feature dict into DataFrame for ML model
        df_features = FeatureEngineering.extract_feature_vector(feature_dict)

        # 2. Get ML probabilities
        raw_probs = flamex_classifier.predict_proba(df_features)

        # 3. Apply transparent Hybrid Rule Adjustments
        adjusted_probs = raw_probs.copy()

        dist_ind = feature_dict.get("distance_to_industrial_facility", 99999.0)
        dist_ref = feature_dict.get("distance_to_refinery", 99999.0)
        dist_forest = feature_dict.get("distance_to_forest", 99999.0)
        dist_agri = feature_dict.get("distance_to_agriculture", 99999.0)
        dist_mine = feature_dict.get("distance_to_mine", 99999.0)
        
        pers = feature_dict.get("persistence_score", 0.0)
        ratio = feature_dict.get("thermal_anomaly_ratio", 1.0)
        land_cover = feature_dict.get("land_cover_class", "other")
        inside_ind = feature_dict.get("inside_industrial_boundary", False)

        # Rule 1: High persistence near refinery / petrochemical facility -> Gas Flare
        if (dist_ref <= 800.0 or dist_ind <= 500.0) and pers >= 0.7 and ratio <= 1.8:
            adjusted_probs["gas_flare"] = max(adjusted_probs.get("gas_flare", 0.0), 0.85)

        # Rule 2: Sudden thermal surge at industrial facility -> Industrial Fire
        if (inside_ind or dist_ind <= 500.0) and (ratio >= 2.2 or (pers < 0.3 and ratio >= 1.5)):
            adjusted_probs["industrial_fire"] = max(adjusted_probs.get("industrial_fire", 0.0), 0.88)

        # Rule 3: Deep in forest away from industry -> Wildfire / Forest Fire
        if (land_cover == "forest" or dist_forest <= 300.0) and dist_ind >= 3000.0:
            adjusted_probs["forest_fire"] = max(adjusted_probs.get("forest_fire", 0.0), 0.88)

        # Rule 4: Cropland with short persistence -> Agricultural Burn
        if (land_cover == "agriculture" or dist_agri <= 300.0) and dist_ind >= 2000.0 and pers < 0.3:
            adjusted_probs["agricultural_burn"] = max(adjusted_probs.get("agricultural_burn", 0.0), 0.84)

        # Rule 5: Open pit mine region -> Mining Activity
        if (dist_mine <= 500.0) and dist_ind >= 2000.0:
            adjusted_probs["mining_activity"] = max(adjusted_probs.get("mining_activity", 0.0), 0.80)

        # Normalize probabilities
        total = sum(adjusted_probs.values())
        normalized_probs = {k: round(v / total, 4) for k, v in adjusted_probs.items()}

        # 4. Determine top predicted class and confidence
        top_class = max(normalized_probs, key=normalized_probs.get)
        confidence = normalized_probs[top_class]

        # 5. Generate human-readable explainability evidence
        evidence = ExplainabilityEngine.generate_explanation(top_class, confidence, feature_dict)

        return {
            "predicted_class": top_class,
            "confidence": confidence,
            "model_version": "v1.0.0-hybrid",
            "probabilities": normalized_probs,
            "evidence": evidence
        }
