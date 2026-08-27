import json
from typing import List, Dict, Any

class LandCoverIngestor:
    """
    Ingestor for GIS land-cover datasets (Forest, Agriculture, Industrial, Urban, Mining).
    """

    @staticmethod
    def parse_landcover_geojson(geojson_str: str) -> List[Dict[str, Any]]:
        landcovers = []
        try:
            data = json.loads(geojson_str)
            features = data.get("features", [])
            for feat in features:
                props = feat.get("properties", {})
                geom = feat.get("geometry", {})
                landcovers.append({
                    "class_name": props.get("class_name", "other"),
                    "geom_json": json.dumps(geom),
                    "source": props.get("source", "GlobalLandCover"),
                    "resolution": props.get("resolution", "10m")
                })
        except Exception as e:
            print(f"Error parsing land cover GeoJSON: {e}")
        return landcovers
