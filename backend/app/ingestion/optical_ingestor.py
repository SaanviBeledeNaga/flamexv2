from typing import Dict, Any, Optional

class OpticalImageryIngestor:
    """
    Ingestor & metadata provider for Satellite Optical Imagery patches (Sentinel-2 / Landsat 8/9).
    """

    @staticmethod
    def get_optical_patch_metadata(
        lat: float, 
        lon: float, 
        event_time_str: str
    ) -> Dict[str, Any]:
        """
        Returns optical satellite metadata including before image, event image, after image,
        cloud cover, and smoke detection indicator.
        """
        return {
            "satellite": "Sentinel-2 MSI",
            "resolution": "10m",
            "cloud_cover_percentage": 2.4,
            "smoke_detected": True,
            "smoke_plume_heading_deg": 45,
            "patches": {
                "before": {
                    "date": "2026-08-20",
                    "url": f"https://sentinel-hub.example.com/wms?lat={lat}&lon={lon}&date=2026-08-20&bands=B04,B03,B02",
                    "type": "Optical RGB (True Color)"
                },
                "event": {
                    "date": event_time_str[:10],
                    "url": f"https://sentinel-hub.example.com/wms?lat={lat}&lon={lon}&date={event_time_str[:10]}&bands=B12,B11,B04",
                    "type": "Short-Wave Infrared (SWIR Fire & Smoke Patch)"
                },
                "after": {
                    "date": "2026-08-27",
                    "url": f"https://sentinel-hub.example.com/wms?lat={lat}&lon={lon}&date=2026-08-27&bands=B08,B04,B03",
                    "type": "False Color Burn Scar Index (NDVI/NBR)"
                }
            }
        }
