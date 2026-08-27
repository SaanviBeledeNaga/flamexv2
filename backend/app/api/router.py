from fastapi import APIRouter
from backend.app.api.endpoints import events, facilities, map, analytics, alerts, ingestion, export

api_router = APIRouter()

api_router.include_router(events.router, prefix="/events", tags=["Thermal Events"])
api_router.include_router(facilities.router, prefix="/facilities", tags=["Industrial Facilities"])
api_router.include_router(map.router, prefix="/map", tags=["GIS GeoJSON Layers"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics & Intelligence"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["Alert System"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["Data Ingestion"])
api_router.include_router(export.router, prefix="/export", tags=["Google Earth KML Export"])
