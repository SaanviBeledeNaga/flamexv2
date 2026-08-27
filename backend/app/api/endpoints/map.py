import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from backend.app.db.session import get_db
from backend.app.models.models import ThermalEvent, EventClassification, EventFeature, IndustrialFacility
from backend.app.services.risk_engine import RiskEngine

router = APIRouter()

@router.get("/events", response_model=Dict[str, Any])
def get_map_events_geojson(
    db: Session = Depends(get_db),
    classification: Optional[str] = None,
    severity: Optional[str] = None,
    facility_type: Optional[str] = None
):
    """
    Returns standard GeoJSON FeatureCollection of thermal anomalies for GIS map layers.
    """
    query = db.query(ThermalEvent).join(EventClassification, isouter=True).join(EventFeature, isouter=True)

    if classification and classification != "all":
        query = query.filter(EventClassification.predicted_class == classification)
    if facility_type and facility_type != "all":
        query = query.filter(EventFeature.nearest_facility_type == facility_type)

    events = query.all()

    features = []
    for ev in events:
        pred_class = ev.classification.predicted_class if ev.classification else "unknown"
        conf = ev.classification.confidence if ev.classification else 0.5

        feat_dict = {}
        if ev.features:
            feat_dict = {
                "distance_to_industrial_facility": ev.features.distance_to_industrial_facility,
                "distance_to_refinery": ev.features.distance_to_industrial_facility,
                "thermal_anomaly_ratio": ev.features.thermal_anomaly_ratio,
                "frp": ev.frp,
                "persistence_score": ev.features.persistence_score,
                "inside_industrial_boundary": ev.features.distance_to_industrial_facility < 200
            }

        score, sev, _ = RiskEngine.calculate_risk_score(pred_class, conf, feat_dict)

        if severity and severity != "all" and sev != severity:
            continue

        feature = {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [ev.longitude, ev.latitude]
            },
            "properties": {
                "id": ev.id,
                "external_id": ev.external_id,
                "classification": pred_class,
                "confidence": round(conf * 100, 1),
                "severity": sev,
                "risk_score": score,
                "brightness_temperature": round(ev.brightness_temperature, 1),
                "frp": round(ev.frp, 1),
                "satellite": ev.satellite,
                "detected_at": ev.detected_at.isoformat(),
                "nearest_facility": ev.features.nearest_facility_name if ev.features else None,
                "distance_to_facility": ev.features.distance_to_industrial_facility if ev.features else None,
                "land_cover": ev.features.land_cover_class if ev.features else "other",
                "persistence_score": ev.features.persistence_score if ev.features else 0.0,
                "thermal_anomaly_ratio": ev.features.thermal_anomaly_ratio if ev.features else 1.0,
                "is_abnormal": (ev.features.thermal_anomaly_ratio >= 1.8) if ev.features else False,
                "is_persistent": (ev.features.persistence_score >= 0.6) if ev.features else False
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.get("/facilities", response_model=Dict[str, Any])
def get_map_facilities_geojson(
    db: Session = Depends(get_db),
    facility_type: Optional[str] = None
):
    """
    Returns standard GeoJSON FeatureCollection of industrial facilities for GIS map overlays.
    """
    query = db.query(IndustrialFacility)
    if facility_type and facility_type != "all":
        query = query.filter(IndustrialFacility.facility_type == facility_type)

    facilities = query.all()

    features = []
    for fac in facilities:
        geometry = None
        if fac.geom_json:
            try:
                geometry = json.loads(fac.geom_json)
            except Exception:
                pass
        
        if not geometry:
            geometry = {
                "type": "Point",
                "coordinates": [fac.longitude, fac.latitude]
            }

        feature = {
            "type": "Feature",
            "geometry": geometry,
            "properties": {
                "id": fac.id,
                "name": fac.name,
                "facility_type": fac.facility_type,
                "operator": fac.operator,
                "capacity": fac.capacity,
                "latitude": fac.latitude,
                "longitude": fac.longitude
            }
        }
        features.append(feature)

    return {
        "type": "FeatureCollection",
        "features": features
    }
