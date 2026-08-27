from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any
from backend.app.db.session import get_db
from backend.app.ingestion.firms_ingestor import FIRMSIngestor

router = APIRouter()

@router.post("/firms", response_model=Dict[str, Any])
def trigger_firms_ingestion(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Triggers FIRMS satellite thermal anomaly data ingestion.
    """
    events = FIRMSIngestor.fetch_firms_anomalies()
    return {
        "status": "success",
        "ingested_count": len(events),
        "source": "NASA FIRMS API / Demo Fallback",
        "message": f"Successfully processed satellite thermal anomalies."
    }
