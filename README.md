# FlameX – AI-Powered Industrial Thermal Intelligence & Fire Monitoring Platform

> *"See the heat. Understand the source."*
>
> **From Thermal Anomaly to Actionable Intelligence.**

---

## 1. Problem Statement & Vision

Traditional satellite fire monitoring platforms (such as NASA FIRMS) effectively answer:
> **"Where is a thermal anomaly?"**

However, industrial operators, environmental inspectors, emergency responders, and insurers need answers to crucial contextual questions:
> **"What is causing this thermal anomaly?"**  
> **"Is it an accidental industrial fire or a normal persistent gas flare?"**  
> **"Which industrial facility is affected?"**  
> **"How unusual is the current thermal behavior compared to historical baseline?"**  
> **"Why did the AI reach this conclusion?"**

**FlameX** is an end-to-end AI-powered geospatial intelligence platform designed to ingest satellite thermal anomalies, extract multi-layered spatial context, detect historical flare persistence, measure thermal intensity surges, and classify events into 6 distinct categories with itemized explainability.

---

## 2. System Architecture

```
                    SATELLITE DATA (FIRMS / Demo)
                                 |
            +--------------------+--------------------+
            |                    |                    |
       FIRMS Data          Optical Image          Land Cover
            |                    |                    |
            +--------------------+--------------------+
                                 |
                           DATA INGESTION
                                 |
                                 v
                     POSTGIS / SQLITE DATABASE
                                 |
                                 v
                     GEOSPATIAL CONTEXT ENGINE
                                 |
            +--------------------+--------------------+
            |                    |                    |
       Facilities            Land Cover           Historical
     (Refinery, Power)     (Forest, Agri)           Events
            |                    |                    |
            +--------------------+--------------------+
                                 |
                                 v
                          FEATURE ENGINE
             (Distances, Persistence, Abnormality)
                                 |
                                 v
                        AI CLASSIFICATION
                     (XGBoost / ML + Rules)
                                 |
            +--------------------+--------------------+
            |                    |                    |
        Event Type           Confidence            Evidence
      (6 Classes)             (0-100%)             (SHAP/WHY)
                                 |
                                 v
                   ANOMALY & RISK SCORE ENGINE
                                 |
                                 v
                         FASTAPI API & GEOJSON
                                 |
                                 v
                     REACT GIS DASHBOARD
                (Map, Analytics, Event Detail)
```

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Leaflet / React-Leaflet, Recharts, Lucide Icons.
- **Backend**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0.
- **Database**: PostgreSQL + PostGIS extension (with automatic SQLite + Shapely fallback for local dev).
- **Geospatial Engine**: Shapely, GeoPandas, PyProj, Haversine spatial math.
- **Machine Learning**: Scikit-Learn (RandomForest), XGBoost, Tabular Feature Engineering, SHAP / Feature-Contribution Explainability.
- **Containerization**: Docker, Docker Compose, Nginx.

---

## 4. Key AI & Geospatial Engines

### A. Geospatial Context Engine
For every thermal anomaly, FlameX calculates:
- Distance to nearest industrial facility (Refineries, Petrochemical plants, Steel smelters, Power plants, Mines, LNG terminals).
- Facility density counts within 1 km and 5 km radius.
- Point-in-polygon containment checks for industrial boundaries and land cover zones (Forest, Agriculture, Mining, Urban).

### B. Persistent Thermal Source Detection
Prevents recurring gas flares from being misclassified as accidental fires:
- Groups historical detections spatially (500m radius) and temporally over a 14-day rolling window.
- Calculates active day frequency and time-of-day regularity.
- Computes `persistence_score` (0.0 to 1.0). High persistence near refineries strongly indicates operational gas flares.

### C. Abnormality Analyzer
Detects sudden severe thermal surges:
- Calculates historical baseline temperature mean ($\mu$) and standard deviation ($\sigma$).
- Computes current intensity $Z$-score and `thermal_anomaly_ratio` (e.g., **3.8x baseline**).
- Automatically elevates severity for persistent flares experiencing massive unexpected surges.

### D. Multi-Class Tabular ML & Hybrid Rule Engine
Predicts probabilities across 6 classes:
1. `industrial_fire` (Accidental industrial facility fire)
2. `gas_flare` (Operational refinery flare stack)
3. `forest_fire` (Wildfire in forest canopy)
4. `agricultural_burn` (Crop residue field burning)
5. `mining_activity` (Thermal activity at open-pit mines)
6. `unknown` (Unclassified thermal anomaly)

**Hybrid Architecture**: Blends supervised Random Forest / XGBoost predictions with domain-expert safety rules to prevent misclassification.

---

## 5. Flagship Demo Scenario: XYZ Petrochemical Complex

The platform comes pre-loaded with a geographically coherent benchmark scenario:

- **Location**: `17.4502° N, 78.5201° E` (XYZ Petrochemical Complex).
- **Normal History**: 14 consecutive days of low/moderate thermal signatures at flare stack (baseline mean = 320 K, FRP = 18 MW, persistence = 88%).
- **Abnormal Surge Event**: Sudden jump to **445 K** (FRP = 165 MW).
- **FlameX Output**:
  - **Classification**: `Industrial Fire` (Confidence: 94%)
  - **Proximity**: 180 meters from XYZ Refinery
  - **Baseline Ratio**: **3.8x baseline surge**
  - **Risk Score**: 87/100 (HIGH SEVERITY 🚨)
  - **Why?**: Itemized evidence breakdown showing facility boundary containment, 3.8x surge over baseline, and non-persistent surge spike.

---

## 6. Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Docker (optional for containerized setup)

### Step 1: Install Dependencies
```bash
# Backend dependencies
pip install -r backend/requirements.txt

# Frontend dependencies
cd frontend && npm install && cd ..
```

### Step 2: Generate Realistic Demo Dataset
```bash
python -c "import sys; sys.path.append('.'); from scripts.generate_demo_data import generate_demo_dataset; generate_demo_dataset()"
```
*Creates 100+ thermal events, 20 industrial facilities, land cover zones, historical flares, and active alerts.*

### Step 3: Train & Evaluate AI Classifier
```bash
# Train ML model
python -m backend.app.ml.train

# Evaluate model metrics (Outputs reports/model_metrics.json)
python -m backend.app.ml.evaluate
```

### Step 4: Run Application locally
```bash
# Terminal 1: Run FastAPI Backend
uvicorn backend.app.main:app --reload --port 8000

# Terminal 2: Run React Frontend
cd frontend && npm run dev
```
*Open http://localhost:5173 in your browser.*

---

## 7. Running with Docker Compose

To deploy full stack with PostgreSQL + PostGIS:

```bash
docker-compose up -d --build
```
- **GIS Dashboard UI**: `http://localhost:5173`
- **FastAPI REST API**: `http://localhost:8000`
- **Swagger Interactive Docs**: `http://localhost:8000/docs`

---

## 8. API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/map/events` | Standard GeoJSON FeatureCollection of thermal events |
| `GET` | `/api/map/facilities` | GeoJSON FeatureCollection of industrial facility overlays |
| `GET` | `/api/events` | Filtered list of thermal anomalies |
| `GET` | `/api/events/{id}` | Complete event detail, AI diagnosis, evidence, and risk breakdown |
| `GET` | `/api/events/{id}/history` | 14-day historical thermal timeline for location |
| `GET` | `/api/analytics/summary` | Dashboard metric card summaries |
| `GET` | `/api/analytics/timeline` | Time series event breakdown |
| `GET` | `/api/alerts` | Active high-severity alerts list |
| `PATCH` | `/api/alerts/{id}` | Acknowledge system alert |

---

## 9. Data Architecture & Disclaimers

- **DEMO DATA**: Synthetic geographically coherent dataset generated via `scripts/generate_demo_data.py` for reproducible offline testing.
- **REAL DATA SOURCES**: Interfaces with NASA FIRMS API (`FIRMS_API_KEY`) and Sentinel-2 optical metadata.
- **ML MODEL**: Supervised tabular classifier trained on engineered geospatial features (`models/flamex_classifier.pkl`).
- **PROTOTYPE RISK SCORE**: Transparent score (0-100) intended for operational decision support, not official regulatory certification.

---

## 10. Verification & Tests

Run test suite:
```bash
pytest backend/tests
```
- Passes all geospatial distance math tests, ML classification tests, and FastAPI REST endpoint tests.
