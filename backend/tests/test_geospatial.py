import pytest
from backend.app.geospatial.context_engine import haversine_distance, GeospatialContextEngine
from backend.app.geospatial.persistence import PersistenceDetector
from backend.app.geospatial.abnormality import AbnormalityAnalyzer
from backend.app.models.models import IndustrialFacility, LandCover, EventHistory
from datetime import datetime, timedelta

def test_haversine_distance():
    # Distance between lat: 17.45, lon: 78.52 and lat: 17.45, lon: 78.53 (~1.06 km)
    dist = haversine_distance(17.45, 78.52, 17.45, 78.53)
    assert 1000.0 < dist < 1100.0

def test_geospatial_context_engine():
    facilities = [
        IndustrialFacility(id=1, name="Test Refinery", facility_type="refinery", latitude=17.4502, longitude=78.5201)
    ]
    res = GeospatialContextEngine.calculate_facility_distances(17.4502, 78.5201, facilities)
    assert res["distance_to_industrial_facility"] == 0.0
    assert res["nearest_facility_name"] == "Test Refinery"
    assert res["nearby_1km_count"] == 1

def test_persistence_detector():
    now = datetime.utcnow()
    records = [
        EventHistory(id=i, latitude=17.4502, longitude=78.5201, detected_at=now - timedelta(days=i, hours=21), brightness_temperature=320.0, frp=15.0)
        for i in range(10)
    ]
    res = PersistenceDetector.calculate_persistence(17.4502, 78.5201, now, records)
    assert res["persistence_score"] >= 0.7
    assert res["is_persistent_source"] is True

def test_abnormality_analyzer():
    records = [
        EventHistory(id=i, latitude=17.4502, longitude=78.5201, detected_at=datetime.utcnow(), brightness_temperature=310.0, frp=15.0)
        for i in range(5)
    ]
    # Current temperature 434 K vs historical 310 K -> ~1.4x ratio
    res = AbnormalityAnalyzer.analyze_abnormality(434.0, 150.0, records)
    assert res["thermal_anomaly_ratio"] >= 1.3
    assert res["is_abnormal"] is True
