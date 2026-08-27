import math
from typing import List, Dict, Any
from backend.app.models.models import EventHistory

class AbnormalityAnalyzer:
    """
    Compares current thermal intensity against historical baseline statistics to detect abnormal surges.
    """

    @staticmethod
    def analyze_abnormality(
        current_temp: float,
        current_frp: float,
        history_records: List[EventHistory],
        min_historical_samples: int = 3
    ) -> Dict[str, Any]:
        """
        Calculates historical mean, std dev, current z-score, and baseline ratio.
        """
        if not history_records or len(history_records) < min_historical_samples:
            # Fallback when minimal history is available
            default_mean = 310.0
            ratio = current_temp / default_mean if default_mean > 0 else 1.0
            return {
                "historical_mean_temperature": default_mean,
                "historical_std_temperature": 15.0,
                "thermal_anomaly_ratio": round(ratio, 2),
                "z_score": round((current_temp - default_mean) / 15.0, 2),
                "is_abnormal": ratio > 1.8,
                "description": f"Thermal intensity is {round(ratio, 1)}x historical baseline."
            }

        # Temperature statistics
        temps = [h.brightness_temperature for h in history_records if h.brightness_temperature > 0]
        if not temps:
            temps = [310.0]

        mean_temp = sum(temps) / len(temps)
        variance = sum((t - mean_temp) ** 2 for t in temps) / len(temps)
        std_temp = math.sqrt(variance) if variance > 0 else 10.0

        # FRP statistics
        frps = [h.frp for h in history_records if h.frp > 0]
        mean_frp = sum(frps) / len(frps) if frps else 10.0

        # Calculate metrics
        ratio = current_temp / mean_temp if mean_temp > 0 else 1.0
        z_score = (current_temp - mean_temp) / std_temp if std_temp > 0 else 0.0

        is_abnormal = z_score >= 2.5 or ratio >= 1.8

        description = f"Thermal intensity is {round(ratio, 1)}x historical baseline."
        if is_abnormal:
            description += f" (Z-score: {round(z_score, 1)} SD above normal)."

        return {
            "historical_mean_temperature": round(mean_temp, 1),
            "historical_std_temperature": round(std_temp, 1),
            "historical_mean_frp": round(mean_frp, 1),
            "thermal_anomaly_ratio": round(ratio, 2),
            "z_score": round(z_score, 2),
            "is_abnormal": is_abnormal,
            "description": description
        }
