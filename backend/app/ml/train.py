import os
import pickle
import numpy as np
import pandas as pd
from typing import Tuple
from sklearn.ensemble import RandomForestClassifier
from backend.app.ml.feature_engineering import FEATURE_NAMES, CLASS_NAMES

def generate_synthetic_training_data(n_samples: int = 1200) -> Tuple[pd.DataFrame, pd.Series]:
    np.random.seed(42)
    rows = []
    labels = []

    samples_per_class = n_samples // len(CLASS_NAMES)

    for cname in CLASS_NAMES:
        for _ in range(samples_per_class):
            row = {}
            if cname == "industrial_fire":
                row["thermal_intensity"] = np.random.uniform(340, 480)
                row["confidence"] = np.random.uniform(80, 100)
                row["frp"] = np.random.uniform(35, 180)
                row["distance_to_industry"] = np.random.uniform(10, 350)
                row["distance_to_forest"] = np.random.uniform(1500, 8000)
                row["distance_to_agriculture"] = np.random.uniform(2000, 9000)
                row["distance_to_mine"] = np.random.uniform(3000, 10000)
                row["distance_to_powerplant"] = np.random.choice([np.random.uniform(10, 500), 99999])
                row["persistence_score"] = np.random.uniform(0.0, 0.35)
                row["event_frequency"] = np.random.uniform(0.0, 0.2)
                row["historical_mean"] = np.random.uniform(300, 320)
                row["thermal_anomaly_ratio"] = np.random.uniform(2.0, 4.5)
                row["nearby_facility_count"] = np.random.randint(1, 6)
                row["inside_industrial_boundary"] = np.random.choice([1.0, 0.0], p=[0.7, 0.3])
                row["inside_forest"] = 0.0
                row["inside_agriculture"] = 0.0
                row["time_of_day"] = np.random.uniform(0, 24)
                row["day_of_week"] = np.random.randint(0, 7)

            elif cname == "gas_flare":
                row["thermal_intensity"] = np.random.uniform(315, 360)
                row["confidence"] = np.random.uniform(85, 98)
                row["frp"] = np.random.uniform(12, 45)
                row["distance_to_industry"] = np.random.uniform(10, 400)
                row["distance_to_forest"] = np.random.uniform(2000, 10000)
                row["distance_to_agriculture"] = np.random.uniform(2000, 10000)
                row["distance_to_mine"] = np.random.uniform(4000, 10000)
                row["distance_to_powerplant"] = np.random.choice([np.random.uniform(50, 400), 99999])
                row["persistence_score"] = np.random.uniform(0.70, 1.0)
                row["event_frequency"] = np.random.uniform(0.7, 1.0)
                row["historical_mean"] = np.random.uniform(310, 350)
                row["thermal_anomaly_ratio"] = np.random.uniform(0.9, 1.3)
                row["nearby_facility_count"] = np.random.randint(1, 5)
                row["inside_industrial_boundary"] = 1.0
                row["inside_forest"] = 0.0
                row["inside_agriculture"] = 0.0
                row["time_of_day"] = np.random.uniform(18, 23)
                row["day_of_week"] = np.random.randint(0, 7)

            elif cname == "forest_fire":
                row["thermal_intensity"] = np.random.uniform(325, 420)
                row["confidence"] = np.random.uniform(75, 98)
                row["frp"] = np.random.uniform(25, 150)
                row["distance_to_industry"] = np.random.uniform(3000, 20000)
                row["distance_to_forest"] = np.random.uniform(0, 200)
                row["distance_to_agriculture"] = np.random.uniform(1000, 8000)
                row["distance_to_mine"] = np.random.uniform(5000, 20000)
                row["distance_to_powerplant"] = 99999.0
                row["persistence_score"] = np.random.uniform(0.0, 0.2)
                row["event_frequency"] = np.random.uniform(0.0, 0.1)
                row["historical_mean"] = np.random.uniform(295, 310)
                row["thermal_anomaly_ratio"] = np.random.uniform(1.2, 3.0)
                row["nearby_facility_count"] = 0
                row["inside_industrial_boundary"] = 0.0
                row["inside_forest"] = 1.0
                row["inside_agriculture"] = 0.0
                row["time_of_day"] = np.random.uniform(10, 18)
                row["day_of_week"] = np.random.randint(0, 7)

            elif cname == "agricultural_burn":
                row["thermal_intensity"] = np.random.uniform(305, 335)
                row["confidence"] = np.random.uniform(60, 85)
                row["frp"] = np.random.uniform(8, 30)
                row["distance_to_industry"] = np.random.uniform(2000, 15000)
                row["distance_to_forest"] = np.random.uniform(1000, 6000)
                row["distance_to_agriculture"] = np.random.uniform(0, 150)
                row["distance_to_mine"] = np.random.uniform(4000, 15000)
                row["distance_to_powerplant"] = 99999.0
                row["persistence_score"] = np.random.uniform(0.0, 0.15)
                row["event_frequency"] = np.random.uniform(0.0, 0.1)
                row["historical_mean"] = np.random.uniform(298, 310)
                row["thermal_anomaly_ratio"] = np.random.uniform(1.0, 1.6)
                row["nearby_facility_count"] = 0
                row["inside_industrial_boundary"] = 0.0
                row["inside_forest"] = 0.0
                row["inside_agriculture"] = 1.0
                row["time_of_day"] = np.random.uniform(11, 16)
                row["day_of_week"] = np.random.randint(0, 7)

            elif cname == "mining_activity":
                row["thermal_intensity"] = np.random.uniform(315, 350)
                row["confidence"] = np.random.uniform(70, 90)
                row["frp"] = np.random.uniform(15, 50)
                row["distance_to_industry"] = np.random.uniform(2000, 10000)
                row["distance_to_forest"] = np.random.uniform(2000, 10000)
                row["distance_to_agriculture"] = np.random.uniform(3000, 10000)
                row["distance_to_mine"] = np.random.uniform(0, 300)
                row["distance_to_powerplant"] = 99999.0
                row["persistence_score"] = np.random.uniform(0.2, 0.6)
                row["event_frequency"] = np.random.uniform(0.2, 0.5)
                row["historical_mean"] = np.random.uniform(305, 320)
                row["thermal_anomaly_ratio"] = np.random.uniform(1.1, 1.8)
                row["nearby_facility_count"] = 0
                row["inside_industrial_boundary"] = 0.0
                row["inside_forest"] = 0.0
                row["inside_agriculture"] = 0.0
                row["time_of_day"] = np.random.uniform(8, 20)
                row["day_of_week"] = np.random.randint(0, 7)

            else:  # unknown
                row["thermal_intensity"] = np.random.uniform(300, 330)
                row["confidence"] = np.random.uniform(40, 70)
                row["frp"] = np.random.uniform(5, 20)
                row["distance_to_industry"] = np.random.uniform(1500, 6000)
                row["distance_to_forest"] = np.random.uniform(1500, 6000)
                row["distance_to_agriculture"] = np.random.uniform(1500, 6000)
                row["distance_to_mine"] = np.random.uniform(1500, 6000)
                row["distance_to_powerplant"] = 99999.0
                row["persistence_score"] = np.random.uniform(0.0, 0.2)
                row["event_frequency"] = np.random.uniform(0.0, 0.1)
                row["historical_mean"] = np.random.uniform(300, 310)
                row["thermal_anomaly_ratio"] = np.random.uniform(1.0, 1.4)
                row["nearby_facility_count"] = 0
                row["inside_industrial_boundary"] = 0.0
                row["inside_forest"] = 0.0
                row["inside_agriculture"] = 0.0
                row["time_of_day"] = np.random.uniform(0, 24)
                row["day_of_week"] = np.random.randint(0, 7)

            rows.append(row)
            labels.append(cname)

    X = pd.DataFrame(rows)[FEATURE_NAMES]
    y = pd.Series(labels)
    return X, y

def train_flamex_model():
    print("Generating synthetic training dataset...")
    X, y = generate_synthetic_training_data(1800)
    
    print("Training FlameX Random Forest / XGBoost Classifier...")
    clf = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12)
    clf.fit(X, y)

    model_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "models")
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, "flamex_classifier.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(clf, f)

    print(f"FlameX ML model trained and saved successfully to {model_path}.")

if __name__ == "__main__":
    train_flamex_model()
