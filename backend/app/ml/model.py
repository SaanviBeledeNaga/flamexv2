import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from sklearn.ensemble import RandomForestClassifier
from backend.app.ml.feature_engineering import FEATURE_NAMES, CLASS_NAMES

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "flamex_classifier.pkl")

class FlameXClassifier:
    """
    Supervised tabular machine learning model for thermal anomaly classification.
    """

    def __init__(self):
        self.model = None
        self.is_loaded = False
        self.load_model()

    def load_model(self) -> bool:
        """
        Loads pre-trained model from file if available.
        """
        abs_path = os.path.abspath(MODEL_PATH)
        if os.path.exists(abs_path):
            try:
                with open(abs_path, "rb") as f:
                    self.model = pickle.load(f)
                self.is_loaded = True
                return True
            except Exception as e:
                print(f"Warning: Failed to load model from {abs_path}: {e}")
        return False

    def save_model(self, model_obj: Any) -> None:
        """
        Saves trained model object to disk.
        """
        abs_path = os.path.abspath(MODEL_PATH)
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        with open(abs_path, "wb") as f:
            pickle.dump(model_obj, f)
        self.model = model_obj
        self.is_loaded = True

    def predict_proba(self, X: pd.DataFrame) -> Dict[str, float]:
        """
        Returns class probabilities for given feature vector.
        """
        if not self.is_loaded or self.model is None:
            # Fallback heuristic probability estimation if model file is not trained yet
            return self._heuristic_fallback(X)

        try:
            probs = self.model.predict_proba(X)[0]
            classes = getattr(self.model, "classes_", CLASS_NAMES)
            prob_dict = {str(c): float(p) for c, p in zip(classes, probs)}
            
            # Ensure all standard classes exist
            for cname in CLASS_NAMES:
                if cname not in prob_dict:
                    prob_dict[cname] = 0.0
            return prob_dict
        except Exception as e:
            print(f"Error during ML inference: {e}")
            return self._heuristic_fallback(X)

    def _heuristic_fallback(self, X: pd.DataFrame) -> Dict[str, float]:
        """
        Calculates domain-informed probability prior when ML binary weights are missing.
        """
        row = X.iloc[0]
        dist_ind = row["distance_to_industry"]
        dist_forest = row["distance_to_forest"]
        dist_agri = row["distance_to_agriculture"]
        dist_mine = row["distance_to_mine"]
        pers = row["persistence_score"]
        ratio = row["thermal_anomaly_ratio"]
        frp = row["frp"]

        probs = {c: 0.05 for c in CLASS_NAMES}

        if pers >= 0.6 and dist_ind <= 1000.0:
            if ratio >= 2.2:
                probs["industrial_fire"] = 0.70
                probs["gas_flare"] = 0.20
            else:
                probs["gas_flare"] = 0.85
                probs["industrial_fire"] = 0.10
        elif dist_ind <= 500.0 or row["inside_industrial_boundary"] == 1.0:
            if ratio >= 1.5 or frp > 50:
                probs["industrial_fire"] = 0.82
                probs["gas_flare"] = 0.10
            else:
                probs["gas_flare"] = 0.60
                probs["industrial_fire"] = 0.30
        elif dist_forest <= 1000.0 or row["inside_forest"] == 1.0:
            probs["forest_fire"] = 0.88
        elif dist_agri <= 1000.0 or row["inside_agriculture"] == 1.0:
            probs["agricultural_burn"] = 0.84
        elif dist_mine <= 1000.0:
            probs["mining_activity"] = 0.80
        else:
            probs["unknown"] = 0.70

        # Normalize probabilities
        total = sum(probs.values())
        return {k: round(v / total, 4) for k, v in probs.items()}

flamex_classifier = FlameXClassifier()
