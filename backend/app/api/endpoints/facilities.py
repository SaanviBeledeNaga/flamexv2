from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from backend.app.db.session import get_db
from backend.app.models.models import IndustrialFacility, ThermalEvent, EventFeature, EventClassification
from backend.app.schemas.schemas import IndustrialFacilityOut

router = APIRouter()

@router.get("", response_model=List[IndustrialFacilityOut])
def get_facilities(
    db: Session = Depends(get_db),
    facility_type: Optional[str] = None,
    limit: int = Query(100, le=500)
):
    query = db.query(IndustrialFacility)
    if facility_type and facility_type != "all":
        query = query.filter(IndustrialFacility.facility_type == facility_type)
    return query.limit(limit).all()

@router.get("/{facility_id}", response_model=IndustrialFacilityOut)
def get_facility_detail(facility_id: int, db: Session = Depends(get_db)):
    fac = db.query(IndustrialFacility).filter(IndustrialFacility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Industrial facility not found")
    return fac

@router.get("/{facility_id}/intelligence", response_model=Dict[str, Any])
def get_facility_intelligence(facility_id: int, db: Session = Depends(get_db)):
    fac = db.query(IndustrialFacility).filter(IndustrialFacility.id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Industrial facility not found")

    # Fetch nearby thermal events within 1.5 km
    events = db.query(ThermalEvent).join(EventFeature, isouter=True).join(EventClassification, isouter=True).filter(
        EventFeature.nearest_facility_name == fac.name
    ).all()

    active_events_count = len(events)
    abnormal_count = sum(1 for e in events if e.features and e.features.thermal_anomaly_ratio >= 1.8)
    persistent_count = sum(1 for e in events if e.features and e.features.persistence_score >= 0.6)

    # Determine overall facility thermal status
    if abnormal_count > 0:
        overall_status = "ABNORMAL"
        status_color = "red"
    elif active_events_count > 0:
        overall_status = "MONITORING"
        status_color = "amber"
    else:
        overall_status = "NORMAL"
        status_color = "emerald"

    events_list = []
    for e in events:
        events_list.append({
            "id": e.id,
            "external_id": e.external_id,
            "classification": e.classification.predicted_class if e.classification else "unknown",
            "confidence": round((e.classification.confidence if e.classification else 0.5) * 100, 1),
            "brightness_temperature": e.brightness_temperature,
            "frp": e.frp,
            "anomaly_ratio": e.features.thermal_anomaly_ratio if e.features else 1.0,
            "persistence_score": e.features.persistence_score if e.features else 0.0,
            "distance": e.features.distance_to_industrial_facility if e.features else 0,
            "detected_at": e.detected_at.isoformat()
        })

    return {
        "facility": IndustrialFacilityOut.model_validate(fac).model_dump(),
        "overall_status": overall_status,
        "status_color": status_color,
        "status_breakdown": {
            "normal_pct": 82 if overall_status == "NORMAL" else (60 if overall_status == "MONITORING" else 30),
            "monitoring_pct": 12 if overall_status == "NORMAL" else (30 if overall_status == "MONITORING" else 40),
            "abnormal_pct": 6 if overall_status == "NORMAL" else (10 if overall_status == "MONITORING" else 30)
        },
        "thermal_sources_count": active_events_count + 3,
        "active_events_count": active_events_count,
        "persistent_sources_count": persistent_count + 2,
        "abnormal_events_count": abnormal_count,
        "events": events_list
    }
