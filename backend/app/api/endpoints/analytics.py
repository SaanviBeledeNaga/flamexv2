from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from backend.app.db.session import get_db
from backend.app.models.models import ThermalEvent, EventClassification, EventFeature, IndustrialFacility, Alert
from backend.app.schemas.schemas import AnalyticsSummary

router = APIRouter()

@router.get("/summary", response_model=AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    total = db.query(ThermalEvent).count()
    
    ind_fires = db.query(EventClassification).filter(EventClassification.predicted_class == "industrial_fire").count()
    flares = db.query(EventClassification).filter(EventClassification.predicted_class == "gas_flare").count()
    wildfires = db.query(EventClassification).filter(EventClassification.predicted_class == "forest_fire").count()
    agri = db.query(EventClassification).filter(EventClassification.predicted_class == "agricultural_burn").count()
    mining = db.query(EventClassification).filter(EventClassification.predicted_class == "mining_activity").count()
    unknown = db.query(EventClassification).filter(EventClassification.predicted_class == "unknown").count()
    
    high_alerts = db.query(Alert).filter(Alert.severity == "HIGH").count()
    total_facs = db.query(IndustrialFacility).count()

    avg_pers = db.query(func.avg(EventFeature.persistence_score)).scalar() or 0.0

    return AnalyticsSummary(
        total_events=total,
        industrial_fires=ind_fires,
        gas_flares=flares,
        wildfires=wildfires,
        agricultural_burns=agri,
        mining_activity=mining,
        unknown_events=unknown,
        high_severity_alerts=high_alerts,
        avg_persistence_score=round(float(avg_pers), 2),
        total_facilities=total_facs
    )

@router.get("/timeline", response_model=List[Dict[str, Any]])
def get_analytics_timeline(db: Session = Depends(get_db)):
    events = db.query(ThermalEvent).join(EventClassification, isouter=True).order_by(ThermalEvent.detected_at.asc()).all()
    
    # Group by date
    timeline_dict = {}
    for ev in events:
        day_str = ev.detected_at.strftime("%Y-%m-%d")
        if day_str not in timeline_dict:
            timeline_dict[day_str] = {
                "date": day_str,
                "industrial_fire": 0,
                "gas_flare": 0,
                "forest_fire": 0,
                "agricultural_burn": 0,
                "mining_activity": 0,
                "unknown": 0,
                "total": 0
            }
        
        cclass = ev.classification.predicted_class if ev.classification else "unknown"
        if cclass in timeline_dict[day_str]:
            timeline_dict[day_str][cclass] += 1
        timeline_dict[day_str]["total"] += 1

    return list(timeline_dict.values())

@router.get("/classifications", response_model=Dict[str, Any])
def get_analytics_classifications(db: Session = Depends(get_db)):
    class_counts = db.query(
        EventClassification.predicted_class, 
        func.count(EventClassification.id)
    ).group_by(EventClassification.predicted_class).all()

    facility_counts = db.query(
        EventFeature.nearest_facility_type,
        func.count(EventFeature.id)
    ).group_by(EventFeature.nearest_facility_type).all()

    return {
        "classifications": [{"name": c.replace("_", " ").title(), "key": c, "count": count} for c, count in class_counts],
        "facility_types": [{"name": (ft or "Unknown").replace("_", " ").title(), "count": count} for ft, count in facility_counts if ft]
    }
