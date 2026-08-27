import os
import requests
from typing import List, Dict, Any
from datetime import datetime
from backend.app.core.config import settings

class FIRMSIngestor:
    """
    Ingestor for NASA FIRMS (Fire Information for Resource Management System) satellite data.
    Supports real API fetching with configured API key and fallback mode.
    """

    @staticmethod
    def fetch_firms_anomalies(
        country_code: str = "IND", 
        day_range: int = 1
    ) -> List[Dict[str, Any]]:
        api_key = settings.FIRMS_API_KEY or os.getenv("FIRMS_API_KEY", "")
        
        if not api_key:
            print("FIRMS API key not found. Using fallback demo ingestion mode.")
            return []

        # Example NASA FIRMS API endpoint
        url = f"https://firms.modaps.eosdis.nasa.gov/api/country/csv/{api_key}/VIIRS_SNPP_NRT/{country_code}/{day_range}"
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                lines = response.text.strip().split("\n")
                if len(lines) <= 1:
                    return []
                header = [h.strip() for h in lines[0].split(",")]
                events = []
                for line in lines[1:]:
                    parts = [p.strip() for p in line.split(",")]
                    if len(parts) == len(header):
                        row = dict(zip(header, parts))
                        events.append({
                            "external_id": f"FIRMS-{row.get('latitude')}-{row.get('longitude')}-{row.get('acq_date')}",
                            "latitude": float(row.get("latitude")),
                            "longitude": float(row.get("longitude")),
                            "brightness_temperature": float(row.get("bright_ti4", 320.0)),
                            "confidence": float(row.get("confidence", 85.0)),
                            "frp": float(row.get("frp", 15.0)),
                            "satellite": row.get("satellite", "VIIRS"),
                            "detected_at": datetime.strptime(f"{row.get('acq_date')} {row.get('acq_time', '1200')}", "%Y-%m-%d %H%M")
                        })
                return events
            else:
                print(f"FIRMS API HTTP Error: {response.status_code}")
                return []
        except Exception as e:
            print(f"FIRMS API connection error: {e}")
            return []
