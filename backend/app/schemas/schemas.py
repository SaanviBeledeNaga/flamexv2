from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Feature & Classification Evidence
class FeatureContribution(BaseModel):
    feature_name: str
    impact: str  # positive (+) or negative (-)
    description: str
    value: Any

class ClassificationEvidence(BaseModel):
    top_factors: List[str]
    contributions: List[FeatureContribution]
    summary: str

# Event Classification Schema
class EventClassificationBase(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    predicted_class: str
    confidence: float
    model_version: str = "v1.0.0-hybrid"
    industrial_probability: float = 0.0
    wildfire_probability: float = 0.0
    agriculture_probability: float = 0.0
    mining_probability: float = 0.0
    flare_probability: float = 0.0
    unknown_probability: float = 0.0
    evidence: Optional[ClassificationEvidence] = None

class EventClassificationOut(EventClassificationBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: int
    thermal_event_id: int
    created_at: datetime

# Event Feature Schema
class EventFeatureOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: int
    thermal_event_id: int
    distance_to_industrial_facility: float
    distance_to_forest: float
    distance_to_agriculture: float
    distance_to_mine: float
    distance_to_powerplant: float
    event_frequency: float
    persistence_score: float
    thermal_intensity: float
    historical_mean_temperature: float
    thermal_anomaly_ratio: float
    nearby_facility_count: int
    smoke_detected: bool
    spatial_growth: float
    time_of_day: float
    day_of_week: int
    land_cover_class: str
    nearest_facility_name: Optional[str] = None
    nearest_facility_type: Optional[str] = None

# Thermal Event Schema
class ThermalEventBase(BaseModel):
    external_id: Optional[str] = None
    latitude: float
    longitude: float
    detected_at: datetime
    satellite: str = "MODIS/VIIRS"
    brightness_temperature: float = 320.0
    confidence: float = 85.0
    frp: float = 15.0
    scan_angle: float = 0.0
    source: str = "FIRMS"

class ThermalEventCreate(ThermalEventBase):
    pass

class ThermalEventOut(ThermalEventBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: int
    created_at: datetime
    classification: Optional[EventClassificationOut] = None
    features: Optional[EventFeatureOut] = None
    risk_score: Optional[int] = None
    risk_severity: Optional[str] = None

# Industrial Facility Schema
class IndustrialFacilityBase(BaseModel):
    name: str
    facility_type: str
    latitude: float
    longitude: float
    geom_json: Optional[str] = None
    operator: Optional[str] = None
    country: str = "Global"
    state: Optional[str] = None
    district: Optional[str] = None
    capacity: Optional[str] = None
    source: str = "OSM/FacilityDB"

class IndustrialFacilityOut(IndustrialFacilityBase):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: int

# Land Cover Schema
class LandCoverOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: int
    class_name: str
    geom_json: str
    source: str
    resolution: str

# GeoJSON Schemas
class GeoJSONGeometry(BaseModel):
    type: str  # Point, Polygon, etc.
    coordinates: Any

class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    geometry: GeoJSONGeometry
    properties: Dict[str, Any]

class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: List[GeoJSONFeature]

# Alert Schema
class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    id: int
    event_id: int
    alert_type: str
    severity: str
    message: str
    acknowledged: bool
    created_at: datetime
    event: Optional[ThermalEventOut] = None

# Analytics Summary Schema
class AnalyticsSummary(BaseModel):
    total_events: int
    industrial_fires: int
    gas_flares: int
    wildfires: int
    agricultural_burns: int
    mining_activity: int
    unknown_events: int
    high_severity_alerts: int
    avg_persistence_score: float
    total_facilities: int
