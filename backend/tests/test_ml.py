import pytest
from backend.app.ml.feature_engineering import FeatureEngineering
from backend.app.ml.predict import HybridClassifierEngine
from backend.app.ml.explainability import ExplainabilityEngine

def test_feature_engineering_extraction():
    feat_dict = {
        "thermal_intensity": 445.0,
        "confidence": 94.0,
        "frp": 165.0,
        "distance_to_industrial_facility": 180.0,
        "persistence_score": 0.1,
        "thermal_anomaly_ratio": 3.8
    }
    df = FeatureEngineering.extract_feature_vector(feat_dict)
    assert df.shape == (1, 18)
    assert df["thermal_intensity"].iloc[0] == 445.0
    assert df["distance_to_industry"].iloc[0] == 180.0

def test_hybrid_classification_industrial_fire():
    feat_dict = {
        "thermal_intensity": 445.0,
        "confidence": 94.0,
        "frp": 165.0,
        "distance_to_industrial_facility": 180.0,
        "distance_to_refinery": 180.0,
        "distance_to_forest": 5000.0,
        "distance_to_agriculture": 5000.0,
        "persistence_score": 0.05,
        "thermal_anomaly_ratio": 3.8,
        "inside_industrial_boundary": True,
        "nearest_facility_name": "XYZ Refinery",
        "nearest_facility_type": "refinery"
    }
    res = HybridClassifierEngine.classify_event(feat_dict)
    assert res["predicted_class"] == "industrial_fire"
    assert res["confidence"] >= 0.70
    assert "top_factors" in res["evidence"]
    assert len(res["evidence"]["top_factors"]) >= 2

def test_explainability_engine():
    res = ExplainabilityEngine.generate_explanation(
        predicted_class="gas_flare",
        confidence=0.92,
        features={
            "distance_to_industrial_facility": 150.0,
            "persistence_score": 0.85,
            "thermal_anomaly_ratio": 1.1,
            "nearest_facility_name": "Coastal Refinery"
        }
    )
    assert len(res["top_factors"]) > 0
    assert "Gas Flare" in res["summary"]
