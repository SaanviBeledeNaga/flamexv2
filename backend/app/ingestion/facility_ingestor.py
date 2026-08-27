import json
from typing import List, Dict, Any

class FacilityIngestor:
    """
    Ingestor for Industrial Facility databases (Refineries, Power Plants, Mines, Steel Mills).
    """

    @staticmethod
    def parse_facility_geojson(geojson_str: str) -> List[Dict[str, Any]]:
        facilities = []
        try:
            data = json.loads(geojson_str)
            features = data.get("features", [])
            for feat in features:
                props = feat.get("properties", {})
                geom = feat.get("geometry", {})
                coords = geom.get("coordinates", [0, 0])
                
                # Handle Point or Polygon centroid
                if geom.get("type") == "Point":
                    lon, lat = coords[0], coords[1]
                elif geom.get("type") == "Polygon":
                    # Simple centroid calculation
                    poly_coords = coords[0]
                    lon = sum(p[0] for p in poly_coords) / len(poly_coords)
                    lat = sum(p[1] for p in poly_coords) / len(poly_coords)
                else:
                    lon, lat = 0.0, 0.0

                facilities.append({
                    "name": props.get("name", "Industrial Facility"),
                    "facility_type": props.get("facility_type", "manufacturing"),
                    "latitude": lat,
                    "longitude": lon,
                    "operator": props.get("operator", "Unknown"),
                    "capacity": props.get("capacity"),
                    "geom_json": json.dumps(geom)
                })
        except Exception as e:
            print(f"Error parsing facility GeoJSON: {e}")
        return facilities
