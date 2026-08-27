from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.app.db.session import Base

class ThermalEvent(Base):
    __tablename__ = "thermal_events"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String, unique=True, index=True, nullable=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    detected_at = Column(DateTime, default=datetime.utcnow, index=True)
    satellite = Column(String, default="MODIS/VIIRS")
    brightness_temperature = Column(Float, default=320.0)
    confidence = Column(Float, default=85.0)
    frp = Column(Float, default=15.0)  # Fire Radiative Power (MW)
    scan_angle = Column(Float, default=0.0)
    source = Column(String, default="FIRMS")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    classification = relationship("EventClassification", back_populates="event", uselist=False, cascade="all, delete-orphan")
    features = relationship("EventFeature", back_populates="event", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="event", cascade="all, delete-orphan")

class IndustrialFacility(Base):
    __tablename__ = "industrial_facilities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    facility_type = Column(String, index=True, nullable=False)  # refinery, petrochemical, power_plant, steel, mining, lng, manufacturing, other
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geom_json = Column(Text, nullable=True)  # Polygon/Point boundary GeoJSON
    operator = Column(String, nullable=True)
    country = Column(String, default="Global")
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    capacity = Column(String, nullable=True)
    source = Column(String, default="OSM/FacilityDB")

class LandCover(Base):
    __tablename__ = "land_cover"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String, index=True, nullable=False)  # forest, agriculture, urban, industrial, water, barren, wetland, other
    geom_json = Column(Text, nullable=False)  # Polygon GeoJSON string
    source = Column(String, default="GlobalLandCover")
    resolution = Column(String, default="10m")

class EventClassification(Base):
    __tablename__ = "event_classifications"

    id = Column(Integer, primary_key=True, index=True)
    thermal_event_id = Column(Integer, ForeignKey("thermal_events.id", ondelete="CASCADE"), nullable=False)
    predicted_class = Column(String, nullable=False)  # industrial_fire, gas_flare, forest_fire, agricultural_burn, mining_activity, unknown
    confidence = Column(Float, nullable=False)  # 0.0 to 1.0
    model_version = Column(String, default="v1.0.0-hybrid")
    
    industrial_probability = Column(Float, default=0.0)
    wildfire_probability = Column(Float, default=0.0)
    agriculture_probability = Column(Float, default=0.0)
    mining_probability = Column(Float, default=0.0)
    flare_probability = Column(Float, default=0.0)
    unknown_probability = Column(Float, default=0.0)
    
    evidence_json = Column(Text, nullable=True)  # JSON string of SHAP/feature contributions
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("ThermalEvent", back_populates="classification")

class EventFeature(Base):
    __tablename__ = "event_features"

    id = Column(Integer, primary_key=True, index=True)
    thermal_event_id = Column(Integer, ForeignKey("thermal_events.id", ondelete="CASCADE"), nullable=False)
    
    distance_to_industrial_facility = Column(Float, default=99999.0)  # meters
    distance_to_forest = Column(Float, default=99999.0)
    distance_to_agriculture = Column(Float, default=99999.0)
    distance_to_mine = Column(Float, default=99999.0)
    distance_to_powerplant = Column(Float, default=99999.0)
    
    event_frequency = Column(Float, default=0.0)
    persistence_score = Column(Float, default=0.0)  # 0.0 - 1.0
    thermal_intensity = Column(Float, default=0.0)
    historical_mean_temperature = Column(Float, default=300.0)
    thermal_anomaly_ratio = Column(Float, default=1.0)
    nearby_facility_count = Column(Integer, default=0)
    
    smoke_detected = Column(Boolean, default=False)
    spatial_growth = Column(Float, default=0.0)
    time_of_day = Column(Float, default=12.0)  # hour 0..24
    day_of_week = Column(Integer, default=0)    # 0..6
    
    land_cover_class = Column(String, default="other")
    nearest_facility_name = Column(String, nullable=True)
    nearest_facility_type = Column(String, nullable=True)

    event = relationship("ThermalEvent", back_populates="features")

class EventHistory(Base):
    __tablename__ = "event_history"

    id = Column(Integer, primary_key=True, index=True)
    location_hash = Column(String, index=True)  # Geohash or rounded lat/lon
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    detected_at = Column(DateTime, nullable=False)
    brightness_temperature = Column(Float, nullable=False)
    frp = Column(Float, default=0.0)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("thermal_events.id", ondelete="CASCADE"), nullable=False)
    alert_type = Column(String, nullable=False)  # HIGH_CONFIDENCE_INDUSTRIAL_FIRE, ABNORMAL_THERMAL_EVENT, etc.
    severity = Column(String, nullable=False)    # HIGH, MEDIUM, LOW
    message = Column(String, nullable=False)
    acknowledged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("ThermalEvent", back_populates="alerts")
