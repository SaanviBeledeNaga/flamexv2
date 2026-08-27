from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.db.session import get_db
from backend.app.models.models import Alert
from backend.app.schemas.schemas import AlertOut

router = APIRouter()

@router.get("", response_model=List[AlertOut])
def get_alerts(db: Session = Depends(get_db), unacknowledged_only: bool = False):
    query = db.query(Alert)
    if unacknowledged_only:
        query = query.filter(Alert.acknowledged == False)
    return query.order_by(Alert.created_at.desc()).all()

@router.patch("/{alert_id}", response_model=AlertOut)
def acknowledge_alert(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.acknowledged = True
    db.commit()
    db.refresh(alert)
    return alert
