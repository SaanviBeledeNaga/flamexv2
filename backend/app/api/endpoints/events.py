import json
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.db.session import get_db
from backend.app.models.models import ThermalEvent, EventClassification, EventFeature, EventHistory, IndustrialFacility
from backend.app.schemas.schemas import ThermalEventOut, EventClassificationOut, EventFeatureOut
from backend.app.services.risk_engine import RiskEngine
from backend.app.ingestion.optical_ingestor import OpticalImageryIngestor
from backend.app.ml.predict import HybridClassifierEngine

router = APIRouter()

@router.get("/persistent-sources", response_model=List[Dict[str, Any]])
def get_persistent_sources(db: Session = Depends(get_db)):
    """
    Returns dedicated list of persistent thermal sources across industrial facilities.
    """
    events = db.query(ThermalEvent).join(EventFeature).join(EventClassification).filter(
        EventFeature.persistence_score >= 0.5
    ).order_by(EventFeature.persistence_score.desc()).all()

    results = []
    for ev in events:
        ratio = ev.features.thermal_anomaly_ratio if ev.features else 1.0
        pers = ev.features.persistence_score if ev.features else 0.0
        
        is_abnormal = ratio >= 1.8
        status = "ABNORMAL" if is_abnormal else "NORMAL"

        days_count = int(pers * 30)
        
        results.append({
            "event_id": ev.id,
            "external_id": ev.external_id or f"TH-{ev.id}",
            "facility_name": ev.features.nearest_facility_name if ev.features else "Industrial Complex",
            "facility_type": ev.features.nearest_facility_type if ev.features else "Refinery",
            "frequency_str": f"{max(14, days_count)}/30 days",
            "persistence_score": round(pers * 100, 1),
            "anomaly_ratio": round(ratio, 1),
            "status": status,
            "brightness_temperature": ev.brightness_temperature,
            "latitude": ev.latitude,
            "longitude": ev.longitude,
            "detected_at": ev.detected_at.isoformat()
        })
    return results

@router.get("", response_model=List[ThermalEventOut])
def get_events(
    db: Session = Depends(get_db),
    classification: Optional[str] = None,
    severity: Optional[str] = None,
    satellite: Optional[str] = None,
    facility_type: Optional[str] = None,
    is_persistent: Optional[bool] = None,
    is_abnormal: Optional[bool] = None,
    min_confidence: Optional[float] = None,
    limit: int = Query(200, le=500),
    offset: int = 0
):
    query = db.query(ThermalEvent).join(EventClassification, isouter=True).join(EventFeature, isouter=True)

    if classification and classification != "all":
        query = query.filter(EventClassification.predicted_class == classification)
    if satellite and satellite != "all":
        query = query.filter(ThermalEvent.satellite == satellite)
    if min_confidence:
        query = query.filter(EventClassification.confidence >= (min_confidence / 100.0 if min_confidence > 1 else min_confidence))
    if facility_type and facility_type != "all":
        query = query.filter(EventFeature.nearest_facility_type == facility_type)
    if is_persistent is not None:
        if is_persistent:
            query = query.filter(EventFeature.persistence_score >= 0.6)
        else:
            query = query.filter(EventFeature.persistence_score < 0.6)
    if is_abnormal is not None:
        if is_abnormal:
            query = query.filter(EventFeature.thermal_anomaly_ratio >= 1.8)
        else:
            query = query.filter(EventFeature.thermal_anomaly_ratio < 1.8)

    events = query.order_by(ThermalEvent.detected_at.desc()).offset(offset).limit(limit).all()

    results = []
    for ev in events:
        out_ev = ThermalEventOut.model_validate(ev)
        
        # Calculate dynamic risk score
        if ev.classification and ev.features:
            feat_dict = {
                "distance_to_industrial_facility": ev.features.distance_to_industrial_facility,
                "distance_to_refinery": ev.features.distance_to_industrial_facility,
                "thermal_anomaly_ratio": ev.features.thermal_anomaly_ratio,
                "frp": ev.frp,
                "persistence_score": ev.features.persistence_score,
                "inside_industrial_boundary": ev.features.distance_to_industrial_facility < 200
            }
            score, sev, _ = RiskEngine.calculate_risk_score(
                ev.classification.predicted_class,
                ev.classification.confidence,
                feat_dict
            )
            out_ev.risk_score = score
            out_ev.risk_severity = sev

        if severity and severity != "all":
            if out_ev.risk_severity != severity:
                continue

        results.append(out_ev)

    return results

@router.get("/{event_id}", response_model=Dict[str, Any])
def get_event_detail(event_id: int, db: Session = Depends(get_db)):
    event = db.query(ThermalEvent).filter(ThermalEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Thermal event not found")

    out_ev = ThermalEventOut.model_validate(event).model_dump()
    
    # Extract evidence JSON
    if event.classification and event.classification.evidence_json:
        try:
            out_ev["classification"]["evidence"] = json.loads(event.classification.evidence_json)
        except Exception:
            pass

    # Extract risk breakdown
    feat_dict = {}
    if event.features:
        feat_dict = {
            "distance_to_industrial_facility": event.features.distance_to_industrial_facility,
            "distance_to_refinery": event.features.distance_to_industrial_facility,
            "thermal_anomaly_ratio": event.features.thermal_anomaly_ratio,
            "frp": event.frp,
            "brightness_temperature": event.brightness_temperature,
            "persistence_score": event.features.persistence_score,
            "inside_industrial_boundary": event.features.distance_to_industrial_facility < 200,
            "nearest_facility_name": event.features.nearest_facility_name,
            "nearest_facility_type": event.features.nearest_facility_type,
            "land_cover_class": event.features.land_cover_class
        }
    
    pred_class = event.classification.predicted_class if event.classification else "unknown"
    conf = event.classification.confidence if event.classification else 0.5

    score, sev, risk_breakdown = RiskEngine.calculate_risk_score(pred_class, conf, feat_dict)
    out_ev["risk_score"] = score
    out_ev["risk_severity"] = sev
    out_ev["risk_breakdown"] = risk_breakdown

    # Add optical imagery patch metadata (Sentinel-2)
    out_ev["optical_imagery"] = OpticalImageryIngestor.get_optical_patch_metadata(
        event.latitude, event.longitude, str(event.detected_at)
    )

    # Add WorldPop population density context
    from backend.app.ingestion.population_ingestor import WorldPopIngestor
    out_ev["population_context"] = WorldPopIngestor.get_population_risk_context(
        event.latitude, event.longitude
    )

    return out_ev

@router.get("/{event_id}/classification", response_model=Dict[str, Any])
def get_event_classification(event_id: int, db: Session = Depends(get_db)):
    event = db.query(ThermalEvent).filter(ThermalEvent.id == event_id).first()
    if not event or not event.classification:
        raise HTTPException(status_code=404, detail="Classification not found for event")

    out_class = EventClassificationOut.model_validate(event.classification).model_dump()
    if event.classification.evidence_json:
        try:
            out_class["evidence"] = json.loads(event.classification.evidence_json)
        except Exception:
            pass
    return out_class

@router.get("/{event_id}/history", response_model=List[Dict[str, Any]])
def get_event_history_timeline(event_id: int, db: Session = Depends(get_db)):
    event = db.query(ThermalEvent).filter(ThermalEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Fetch historical detections near this location
    lat_min, lat_max = event.latitude - 0.005, event.latitude + 0.005
    lon_min, lon_max = event.longitude - 0.005, event.longitude + 0.005

    history = db.query(EventHistory).filter(
        EventHistory.latitude >= lat_min, EventHistory.latitude <= lat_max,
        EventHistory.longitude >= lon_min, EventHistory.longitude <= lon_max
    ).order_by(EventHistory.detected_at.asc()).all()

    timeline = []
    for h in history:
        timeline.append({
            "date": h.detected_at.strftime("%b %d %H:%M"),
            "temperature": h.brightness_temperature,
            "frp": h.frp,
            "is_current": False,
            "classification": "gas_flare" if h.brightness_temperature < 335 else "industrial_fire"
        })

    # Add current event to timeline
    timeline.append({
        "date": event.detected_at.strftime("%b %d %H:%M"),
        "temperature": event.brightness_temperature,
        "frp": event.frp,
        "is_current": True,
        "classification": event.classification.predicted_class if event.classification else "current_event"
    })

    return timeline

@router.get("/{event_id}/features", response_model=Dict[str, Any])
def get_event_features(event_id: int, db: Session = Depends(get_db)):
    event = db.query(ThermalEvent).filter(ThermalEvent.id == event_id).first()
    if not event or not event.features:
        raise HTTPException(status_code=404, detail="Features not found for event")
    return EventFeatureOut.model_validate(event.features).model_dump()
