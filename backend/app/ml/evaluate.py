import os
import json
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
from backend.app.ml.train import generate_synthetic_training_data, FEATURE_NAMES, CLASS_NAMES
from backend.app.ml.model import flamex_classifier

def evaluate_flamex_model():
    print("Evaluating FlameX AI Classifier Model...")
    X_test, y_test = generate_synthetic_training_data(n_samples=600)

    # Force reloading latest model
    flamex_classifier.load_model()

    predictions = []
    for idx, row in X_test.iterrows():
        df_row = pd.DataFrame([row])[FEATURE_NAMES]
        probs = flamex_classifier.predict_proba(df_row)
        pred_class = max(probs, key=probs.get)
        predictions.append(pred_class)

    acc = accuracy_score(y_test, predictions)
    report = classification_report(y_test, predictions, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_test, predictions, labels=CLASS_NAMES)

    ind_fire_prec = report.get("industrial_fire", {}).get("precision", 0.0)
    ind_fire_rec = report.get("industrial_fire", {}).get("recall", 0.0)
    ind_fire_f1 = report.get("industrial_fire", {}).get("f1-score", 0.0)

    metrics = {
        "model_version": "v1.0.0-hybrid",
        "dataset": "Synthetic Ground Truth Benchmark (600 samples)",
        "accuracy": round(float(acc), 4),
        "industrial_fire_metrics": {
            "precision": round(float(ind_fire_prec), 4),
            "recall": round(float(ind_fire_rec), 4),
            "f1_score": round(float(ind_fire_f1), 4)
        },
        "per_class_metrics": {
            c: {
                "precision": round(float(report.get(c, {}).get("precision", 0.0)), 4),
                "recall": round(float(report.get(c, {}).get("recall", 0.0)), 4),
                "f1_score": round(float(report.get(c, {}).get("f1-score", 0.0)), 4),
                "support": int(report.get(c, {}).get("support", 0))
            } for c in CLASS_NAMES
        },
        "confusion_matrix": cm.tolist(),
        "classes": CLASS_NAMES
    }

    report_dir = os.path.join(os.path.dirname(__file__), "..", "..", "..", "reports")
    os.makedirs(report_dir, exist_ok=True)
    report_path = os.path.join(report_dir, "model_metrics.json")

    with open(report_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"Model Evaluation Complete! Accuracy: {acc*100:.2f}%. Industrial Fire Recall: {ind_fire_rec*100:.2f}%. Saved to {report_path}.")
    return metrics

if __name__ == "__main__":
    evaluate_flamex_model()
