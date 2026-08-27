import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

class Settings(BaseSettings):
    PROJECT_NAME: str = "FlameX – AI-Powered Industrial Thermal Intelligence & Fire Monitoring Platform"
    TAGLINE: str = "From Thermal Anomaly to Actionable Intelligence."
    ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    
    # Backend Server
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
    
    # Database (supports sqlite:/// fallback or postgresql://)
    DATABASE_URL: str = "sqlite:///./flamex.db"
    
    # Ingestion API Keys
    FIRMS_API_KEY: str = ""
    SENTINEL_HUB_CLIENT_ID: str = ""
    SENTINEL_HUB_CLIENT_SECRET: str = ""
    
    # Geospatial thresholds
    INDUSTRIAL_PROXIMITY_RADIUS: float = 1000.0  # meters
    FOREST_PROXIMITY_RADIUS: float = 2000.0      # meters
    PERSISTENCE_TIME_WINDOW_DAYS: int = 7
    ANOMALY_ZSCORE_THRESHOLD: float = 2.5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
