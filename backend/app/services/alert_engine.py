from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.app.models.models import Alert, ThermalEvent

class AlertEngine:
    """
    Automated notification and alert generation engine for high-risk thermal events.
    """

    @staticmethod
    def evaluate_and_create_alert(
        db: Session,
        event: ThermalEvent,
        predicted_class: str,
        confidence: float,
        risk_score: int,
        severity: str,
        features: Dict[str, Any]
    ) -> Optional[Alert]:
        """
        Creates an Alert record in DB if event meets high-severity criteria.
        """
        ratio = features.get("thermal_anomaly_ratio", 1.0)
        facility_name = features.get("nearest_facility_name", "Industrial Complex")
        dist_ind = features.get("distance_to_industrial_facility", 99999.0)

        alert_type = None
        message = ""

        if predicted_class == "industrial_fire" and confidence >= 0.70:
            alert_type = "HIGH_CONFIDENCE_INDUSTRIAL_FIRE"
            message = f"🚨 HIGH SEVERITY: Industrial fire detected at {facility_name} ({int(dist_ind)}m away). Confidence: {int(confidence*100)}%, Thermal Surge: {round(ratio, 1)}x baseline."
        elif ratio >= 2.5 and dist_ind <= 1000.0:
            alert_type = "ABNORMAL_THERMAL_EVENT"
            message = f"⚠️ ABNORMAL SURGE: Severe thermal anomaly detected at {facility_name}. Thermal intensity is {round(ratio, 1)}x historical baseline."
        elif predicted_class == "forest_fire" and severity == "HIGH":
            alert_type = "WILDFIRE_ALERT"
            message = f"🔥 WILDFIRE WARNING: Rapidly spreading forest fire detected in wilderness canopy area."

        if alert_type:
            alert = Alert(
                event_id=event.id,
                alert_type=alert_type,
                severity=severity,
                message=message,
                acknowledged=False
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)
            return alert
        return None
