import os
import sys
import json
import random
from datetime import datetime, timedelta

# Ensure backend path is in python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.db.session import SessionLocal, engine, Base
from backend.app.models.models import (
    ThermalEvent, IndustrialFacility, LandCover, EventClassification,
    EventFeature, EventHistory, Alert
)
from backend.app.geospatial.context_engine import GeospatialContextEngine
from backend.app.geospatial.persistence import PersistenceDetector
from backend.app.geospatial.abnormality import AbnormalityAnalyzer
from backend.app.ml.predict import HybridClassifierEngine
from backend.app.services.risk_engine import RiskEngine
from backend.app.services.alert_engine import AlertEngine

def generate_demo_dataset():
    print("Initializing Database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing demo data
    db.query(Alert).delete()
    db.query(EventClassification).delete()
    db.query(EventFeature).delete()
    db.query(ThermalEvent).delete()
    db.query(IndustrialFacility).delete()
    db.query(LandCover).delete()
    db.query(EventHistory).delete()
    db.commit()

    print("Generating Industrial Facilities (20+)...")
    # Centered around lat: 17.45, lon: 78.52 (XYZ Petrochemical Complex) & adjacent hubs
    facilities_data = [
        # XYZ Petrochemical Complex Cluster (Lat ~17.45, Lon ~78.52)
        {"name": "XYZ Refinery Stack A", "facility_type": "refinery", "lat": 17.4502, "lon": 78.5201, "operator": "XYZ Petroleum Corp", "capacity": "15,000 bpd"},
        {"name": "XYZ Petrochemical Cracker Unit", "facility_type": "petrochemical", "lat": 17.4525, "lon": 78.5230, "operator": "XYZ Chemicals", "capacity": "500 ktpa"},
        {"name": "XYZ LNG Storage Facility", "facility_type": "lng", "lat": 17.4480, "lon": 78.5180, "operator": "XYZ Gas Ltd", "capacity": "2.5 MTPA"},
        {"name": "Metro Power Station Unit 1", "facility_type": "power_plant", "lat": 17.4580, "lon": 78.5310, "operator": "State Energy Co", "capacity": "800 MW"},
        {"name": "Metro Power Station Unit 2", "facility_type": "power_plant", "lat": 17.4595, "lon": 78.5325, "operator": "State Energy Co", "capacity": "800 MW"},
        
        # Apex Industrial Hub Cluster (Lat ~17.62, Lon ~78.35)
        {"name": "Apex Steel Smelter", "facility_type": "steel", "lat": 17.6210, "lon": 78.3510, "operator": "Apex Metallurgy", "capacity": "1.2 MT steel"},
        {"name": "Apex Thermal Power Hub", "facility_type": "power_plant", "lat": 17.6250, "lon": 78.3580, "operator": "Apex Power", "capacity": "1200 MW"},
        {"name": "Apex Chemical Synthesis Plant", "facility_type": "petrochemical", "lat": 17.6180, "lon": 78.3480, "operator": "Apex Fine Chem", "capacity": "200 ktpa"},
        {"name": "Apex Heavy Manufacturing Facility", "facility_type": "manufacturing", "lat": 17.6140, "lon": 78.3420, "operator": "Apex Machines", "capacity": "Industrial Equipment"},

        # Ironstone Mining Belt (Lat ~17.30, Lon ~78.70)
        {"name": "Ironstone Pit Quarry A", "facility_type": "mining", "lat": 17.3010, "lon": 78.7010, "operator": "Ironstone Mining Ltd", "capacity": "Open-pit Iron Ore"},
        {"name": "Ironstone Processing Works", "facility_type": "mining", "lat": 17.3050, "lon": 78.7080, "operator": "Ironstone Mining Ltd", "capacity": "Crushing & Beneficiation"},
        {"name": "Highland Coal Washery", "facility_type": "mining", "lat": 17.2950, "lon": 78.6920, "operator": "Highland Energy", "capacity": "Coal Processing"},

        # North-West Industrial Corridor (Lat ~17.55, Lon ~78.20)
        {"name": "Valley Gas Liquefaction Terminal", "facility_type": "lng", "lat": 17.5520, "lon": 78.2040, "operator": "Valley Hydrocarbons", "capacity": "1.8 MTPA"},
        {"name": "Valley Fertilizer Works", "facility_type": "petrochemical", "lat": 17.5560, "lon": 78.2110, "operator": "Valley AgriChem", "capacity": "400 kt Urea"},
        {"name": "Northwest Rolling Mill", "facility_type": "steel", "lat": 17.5480, "lon": 78.1980, "operator": "Northwest Steel", "capacity": "600 kt Rebar"},
        
        # East Coast Refinery Hub (Lat ~17.15, Lon ~78.85)
        {"name": "East Coast Oil Terminal", "facility_type": "refinery", "lat": 17.1520, "lon": 78.8520, "operator": "Coastal Oil Inc", "capacity": "250,000 bpd"},
        {"name": "East Coast Flare Tower #1", "facility_type": "refinery", "lat": 17.1540, "lon": 78.8550, "operator": "Coastal Oil Inc", "capacity": "Flare Stack"},
        {"name": "Coastal Polymer Plant", "facility_type": "petrochemical", "lat": 17.1480, "lon": 78.8480, "operator": "Polymer Corp", "capacity": "300 kt Polyethylene"},
        {"name": "Coastal Cogeneration Plant", "facility_type": "power_plant", "lat": 17.1590, "lon": 78.8610, "operator": "Coastal Power", "capacity": "450 MW"},
        {"name": "Central Machine Foundry", "facility_type": "manufacturing", "lat": 17.4200, "lon": 78.4500, "operator": "Foundry Works", "capacity": "Casting"}
    ]

    facility_objs = []
    for f in facilities_data:
        # Create a 200m polygon boundary around facility centroid
        delta = 0.002
        poly_json = json.dumps({
            "type": "Polygon",
            "coordinates": [[
                [f["lon"] - delta, f["lat"] - delta],
                [f["lon"] + delta, f["lat"] - delta],
                [f["lon"] + delta, f["lat"] + delta],
                [f["lon"] - delta, f["lat"] + delta],
                [f["lon"] - delta, f["lat"] - delta]
            ]]
        })
        fac = IndustrialFacility(
            name=f["name"],
            facility_type=f["facility_type"],
            latitude=f["lat"],
            longitude=f["lon"],
            geom_json=poly_json,
            operator=f["operator"],
            country="India",
            capacity=f["capacity"],
            source="Demo Facility DB"
        )
        db.add(fac)
        facility_objs.append(fac)
    db.commit()

    print("Generating Land Cover Polygons...")
    land_covers_data = [
        # Industrial zones
        {"class_name": "industrial", "center": (17.4500, 78.5200), "radius": 0.02},
        {"class_name": "industrial", "center": (17.6200, 78.3500), "radius": 0.025},
        {"class_name": "industrial", "center": (17.1500, 78.8500), "radius": 0.02},
        
        # Forest zones (Black Forest Timber Reserve: Lat ~17.50, Lon ~78.75)
        {"class_name": "forest", "center": (17.5000, 78.7500), "radius": 0.04},
        {"class_name": "forest", "center": (17.7000, 78.4500), "radius": 0.05},

        # Agricultural zones (High Plains Cropland: Lat ~17.38, Lon ~78.25)
        {"class_name": "agriculture", "center": (17.3800, 78.2500), "radius": 0.04},
        {"class_name": "agriculture", "center": (17.2000, 78.5000), "radius": 0.035},

        # Mining zones
        {"class_name": "mining", "center": (17.3000, 78.7000), "radius": 0.025}
    ]

    land_cover_objs = []
    for lc in land_covers_data:
        lat, lon = lc["center"]
        r = lc["radius"]
        poly_json = json.dumps({
            "type": "Polygon",
            "coordinates": [[
                [lon - r, lat - r],
                [lon + r, lat - r],
                [lon + r, lat + r],
                [lon - r, lat + r],
                [lon - r, lat - r]
            ]]
        })
        lcov = LandCover(
            class_name=lc["class_name"],
            geom_json=poly_json,
            source="Demo LandCover 10m",
            resolution="10m"
        )
        db.add(lcov)
        land_cover_objs.append(lcov)
    db.commit()

    print("Generating Historical Detections & Baseline Events...")
    # Generate 14 days of history for persistent gas flare stacks
    base_time = datetime.utcnow() - timedelta(days=14)
    history_records = []
    
    # 1. Historical flare detections at XYZ Refinery Stack A (17.4502, 78.5201)
    for day in range(14):
        h_time = base_time + timedelta(days=day, hours=21, minutes=random.randint(-5, 5))
        h_rec = EventHistory(
            location_hash="XYZ-REFINERY-FLARE",
            latitude=17.4502 + random.uniform(-0.0001, 0.0001),
            longitude=78.5201 + random.uniform(-0.0001, 0.0001),
            detected_at=h_time,
            brightness_temperature=320.0 + random.uniform(-5, 5),
            frp=18.0 + random.uniform(-2, 2)
        )
        db.add(h_rec)
        history_records.append(h_rec)

    # 2. Historical flare detections at East Coast Flare Tower (17.1540, 78.8550)
    for day in range(14):
        h_time = base_time + timedelta(days=day, hours=20, minutes=random.randint(-8, 8))
        h_rec = EventHistory(
            location_hash="COASTAL-FLARE",
            latitude=17.1540 + random.uniform(-0.0001, 0.0001),
            longitude=78.8550 + random.uniform(-0.0001, 0.0001),
            detected_at=h_time,
            brightness_temperature=322.0 + random.uniform(-4, 4),
            frp=22.0 + random.uniform(-3, 3)
        )
        db.add(h_rec)
        history_records.append(h_rec)
    db.commit()

    print("Generating 105 Synthetic Thermal Events with Realistic Spatial-Temporal Clusters...")

    events_to_create = []

    # Category A: 20 Industrial Fires (including the DEMO SCENARIO at XYZ Petrochemical Complex)
    # Event #1: XYZ Petrochemical Complex abnormal fire (The flagship demo scenario event)
    events_to_create.append({
        "lat": 17.4502 + 0.0012, # ~180m from refinery
        "lon": 78.5201 + 0.0008,
        "temp": 445.0, # 3.8x historical baseline
        "frp": 165.0,
        "conf": 94.0,
        "sat": "VIIRS_NRT",
        "ext_id": "TH-1042-XYZ-FIRE",
        "time_offset_hours": 2,
        "category_hint": "industrial_fire"
    })
    
    # 19 more industrial fires across facilities
    for i in range(19):
        fac = random.choice([f for f in facility_objs if f.facility_type in ["refinery", "power_plant", "steel", "petrochemical", "manufacturing"]])
        events_to_create.append({
            "lat": fac.latitude + random.uniform(-0.0015, 0.0015),
            "lon": fac.longitude + random.uniform(-0.0015, 0.0015),
            "temp": random.uniform(370.0, 460.0),
            "frp": random.uniform(50.0, 190.0),
            "conf": random.uniform(85.0, 99.0),
            "sat": random.choice(["VIIRS_NRT", "MODIS_Terra", "MODIS_Aqua"]),
            "ext_id": f"TH-IND-FIRE-{i+1:03d}",
            "time_offset_hours": random.randint(1, 48),
            "category_hint": "industrial_fire"
        })

    # Category B: 20 Persistent Gas Flares
    for i in range(20):
        if i < 10:
            # XYZ Refinery stack
            lat = 17.4502 + random.uniform(-0.0002, 0.0002)
            lon = 78.5201 + random.uniform(-0.0002, 0.0002)
        else:
            # East Coast Refinery stack
            lat = 17.1540 + random.uniform(-0.0002, 0.0002)
            lon = 78.8550 + random.uniform(-0.0002, 0.0002)

        events_to_create.append({
            "lat": lat,
            "lon": lon,
            "temp": random.uniform(318.0, 332.0), # Normal baseline flare
            "frp": random.uniform(14.0, 24.0),
            "conf": random.uniform(88.0, 98.0),
            "sat": "VIIRS_NRT",
            "ext_id": f"TH-FLARE-{i+1:03d}",
            "time_offset_hours": random.randint(1, 72),
            "category_hint": "gas_flare"
        })

    # Category C: 20 Forest Fires (Black Forest Timber Reserve: ~17.50, 78.75)
    for i in range(20):
        events_to_create.append({
            "lat": 17.5000 + random.uniform(-0.035, 0.035),
            "lon": 78.7500 + random.uniform(-0.035, 0.035),
            "temp": random.uniform(340.0, 420.0),
            "frp": random.uniform(40.0, 150.0),
            "conf": random.uniform(75.0, 96.0),
            "sat": random.choice(["VIIRS_NRT", "MODIS_Aqua"]),
            "ext_id": f"TH-WILDFIRE-{i+1:03d}",
            "time_offset_hours": random.randint(1, 96),
            "category_hint": "forest_fire"
        })

    # Category D: 15 Agricultural Burns (High Plains Cropland: ~17.38, 78.25)
    for i in range(15):
        events_to_create.append({
            "lat": 17.3800 + random.uniform(-0.03, 0.03),
            "lon": 78.2500 + random.uniform(-0.03, 0.03),
            "temp": random.uniform(308.0, 328.0),
            "frp": random.uniform(8.0, 28.0),
            "conf": random.uniform(65.0, 85.0),
            "sat": "VIIRS_NRT",
            "ext_id": f"TH-AGRI-{i+1:03d}",
            "time_offset_hours": random.randint(1, 48),
            "category_hint": "agricultural_burn"
        })

    # Category E: 10 Mining Thermal Events (Ironstone Mine: ~17.30, 78.70)
    for i in range(10):
        events_to_create.append({
            "lat": 17.3000 + random.uniform(-0.02, 0.02),
            "lon": 78.7000 + random.uniform(-0.02, 0.02),
            "temp": random.uniform(320.0, 345.0),
            "frp": random.uniform(18.0, 45.0),
            "conf": random.uniform(70.0, 90.0),
            "sat": "VIIRS_NRT",
            "ext_id": f"TH-MINE-{i+1:03d}",
            "time_offset_hours": random.randint(1, 60),
            "category_hint": "mining_activity"
        })

    # Category F: 15 Unknown Anomalies (Scattered background)
    for i in range(15):
        events_to_create.append({
            "lat": 17.2000 + random.uniform(-0.3, 0.5),
            "lon": 78.1000 + random.uniform(-0.3, 0.8),
            "temp": random.uniform(302.0, 322.0),
            "frp": random.uniform(6.0, 18.0),
            "conf": random.uniform(45.0, 70.0),
            "sat": "MODIS_Terra",
            "ext_id": f"TH-UNK-{i+1:03d}",
            "time_offset_hours": random.randint(1, 120),
            "category_hint": "unknown"
        })

    print("Running Geospatial Pipeline, Persistence Scoring, Abnormality Detection, ML Inference, and Risk Engine...")

    all_facilities = db.query(IndustrialFacility).all()
    all_landcovers = db.query(LandCover).all()
    all_history = db.query(EventHistory).all()

    now = datetime.utcnow()

    for item in events_to_create:
        det_time = now - timedelta(hours=item["time_offset_hours"])
        event = ThermalEvent(
            external_id=item["ext_id"],
            latitude=item["lat"],
            longitude=item["lon"],
            detected_at=det_time,
            satellite=item["sat"],
            brightness_temperature=item["temp"],
            confidence=item["conf"],
            frp=item["frp"],
            scan_angle=random.uniform(0.0, 15.0),
            source="Demo Dataset (Synthetic Ground Truth)"
        )
        db.add(event)
        db.flush()

        # 1. Spatial Context
        fac_ctx = GeospatialContextEngine.calculate_facility_distances(event.latitude, event.longitude, all_facilities)
        lc_ctx = GeospatialContextEngine.get_land_cover_context(event.latitude, event.longitude, all_landcovers)

        # 2. Persistence Analysis
        pers_ctx = PersistenceDetector.calculate_persistence(event.latitude, event.longitude, det_time, all_history)

        # 3. Abnormality Analysis
        abn_ctx = AbnormalityAnalyzer.analyze_abnormality(event.brightness_temperature, event.frp, all_history)

        # Build feature dict
        feat_dict = {
            "thermal_intensity": event.brightness_temperature,
            "confidence": event.confidence,
            "frp": event.frp,
            "distance_to_industrial_facility": fac_ctx["distance_to_industrial_facility"],
            "distance_to_refinery": fac_ctx["distance_to_refinery"],
            "distance_to_powerplant": fac_ctx["distance_to_powerplant"],
            "distance_to_mine": fac_ctx["distance_to_mine"],
            "distance_to_forest": lc_ctx["distance_to_forest"],
            "distance_to_agriculture": lc_ctx["distance_to_agriculture"],
            "nearby_facility_count": fac_ctx["nearby_1km_count"],
            "inside_industrial_boundary": fac_ctx["inside_industrial_boundary"],
            "inside_forest": lc_ctx["inside_forest"],
            "inside_agriculture": lc_ctx["inside_agriculture"],
            "land_cover_class": lc_ctx["land_cover_class"],
            "nearest_facility_name": fac_ctx["nearest_facility_name"],
            "nearest_facility_type": fac_ctx["nearest_facility_type"],
            "persistence_score": pers_ctx["persistence_score"],
            "event_frequency": pers_ctx["event_frequency"],
            "historical_mean_temperature": abn_ctx["historical_mean_temperature"],
            "thermal_anomaly_ratio": abn_ctx["thermal_anomaly_ratio"],
            "smoke_detected": item["category_hint"] in ["industrial_fire", "forest_fire"],
            "spatial_growth": 2.5 if item["category_hint"] == "forest_fire" else 0.0,
            "time_of_day": float(det_time.hour),
            "day_of_week": int(det_time.weekday())
        }

        # Create EventFeature DB Record
        feature_rec = EventFeature(
            thermal_event_id=event.id,
            distance_to_industrial_facility=fac_ctx["distance_to_industrial_facility"],
            distance_to_forest=lc_ctx["distance_to_forest"],
            distance_to_agriculture=lc_ctx["distance_to_agriculture"],
            distance_to_mine=fac_ctx["distance_to_mine"],
            distance_to_powerplant=fac_ctx["distance_to_powerplant"],
            event_frequency=pers_ctx["event_frequency"],
            persistence_score=pers_ctx["persistence_score"],
            thermal_intensity=event.brightness_temperature,
            historical_mean_temperature=abn_ctx["historical_mean_temperature"],
            thermal_anomaly_ratio=abn_ctx["thermal_anomaly_ratio"],
            nearby_facility_count=fac_ctx["nearby_1km_count"],
            smoke_detected=feat_dict["smoke_detected"],
            spatial_growth=feat_dict["spatial_growth"],
            time_of_day=feat_dict["time_of_day"],
            day_of_week=feat_dict["day_of_week"],
            land_cover_class=lc_ctx["land_cover_class"],
            nearest_facility_name=fac_ctx["nearest_facility_name"],
            nearest_facility_type=fac_ctx["nearest_facility_type"]
        )
        db.add(feature_rec)

        # 4. AI Hybrid ML Classifier
        classification_result = HybridClassifierEngine.classify_event(feat_dict)
        probs = classification_result["probabilities"]

        class_rec = EventClassification(
            thermal_event_id=event.id,
            predicted_class=classification_result["predicted_class"],
            confidence=classification_result["confidence"],
            model_version=classification_result["model_version"],
            industrial_probability=probs.get("industrial_fire", 0.0),
            wildfire_probability=probs.get("forest_fire", 0.0),
            agriculture_probability=probs.get("agricultural_burn", 0.0),
            mining_probability=probs.get("mining_activity", 0.0),
            flare_probability=probs.get("gas_flare", 0.0),
            unknown_probability=probs.get("unknown", 0.0),
            evidence_json=json.dumps(classification_result["evidence"])
        )
        db.add(class_rec)

        # 5. Risk Score & Alerts
        risk_score, severity, risk_breakdown = RiskEngine.calculate_risk_score(
            classification_result["predicted_class"],
            classification_result["confidence"],
            feat_dict
        )

        AlertEngine.evaluate_and_create_alert(
            db=db,
            event=event,
            predicted_class=classification_result["predicted_class"],
            confidence=classification_result["confidence"],
            risk_score=risk_score,
            severity=severity,
            features=feat_dict
        )

    db.commit()
    print(f"Successfully generated demo dataset with {len(events_to_create)} thermal events, 20 facilities, and active alerts.")

if __name__ == "__main__":
    generate_demo_dataset()
