import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.router import api_router
from backend.app.db.init_db import init_db
from backend.app.ml.model import flamex_classifier

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="FlameX – AI-Powered Industrial Thermal Intelligence & Fire Monitoring Platform API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    print(f"Starting {settings.PROJECT_NAME} Backend Engine...")
    # Initialize database tables
    try:
        init_db()
        print("Database initialized.")
    except Exception as e:
        print(f"Database init notice: {e}")

    # Load ML Model once at startup
    loaded = flamex_classifier.load_model()
    if loaded:
        print("FlameX AI Classification model loaded successfully.")
    else:
        print("ML model file not found yet. Hybrid rule fallback active until training completes.")

app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "ml_model_loaded": flamex_classifier.is_loaded,
        "environment": settings.ENV
    }
