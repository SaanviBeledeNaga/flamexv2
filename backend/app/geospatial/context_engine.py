import math
import json
from typing import List, Dict, Any, Tuple, Optional
from shapely.geometry import Point, Polygon, shape
from backend.app.models.models import IndustrialFacility, LandCover

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c

class GeospatialContextEngine:
    """
    Engine to extract spatial context and relationship metrics for thermal anomalies.
    """

    @staticmethod
    def calculate_facility_distances(
        event_lat: float, 
        event_lon: float, 
        facilities: List[IndustrialFacility]
    ) -> Dict[str, Any]:
        """
        Calculates distances to nearest facility, specific facility types, and facility counts within 1km/5km.
        """
        if not facilities:
            return {
                "distance_to_industrial_facility": 99999.0,
                "distance_to_refinery": 99999.0,
                "distance_to_powerplant": 99999.0,
                "distance_to_mine": 99999.0,
                "nearby_1km_count": 0,
                "nearby_5km_count": 0,
                "nearest_facility_name": None,
                "nearest_facility_type": None,
                "inside_industrial_boundary": False
            }

        min_dist_overall = 99999.0
        nearest_fac_name = None
        nearest_fac_type = None

        min_dists_by_type = {
            "refinery": 99999.0,
            "power_plant": 99999.0,
            "mining": 99999.0,
            "petrochemical": 99999.0,
            "steel": 99999.0,
            "lng": 99999.0,
            "manufacturing": 99999.0
        }

        count_1km = 0
        count_5km = 0
        inside_boundary = False
        event_point = Point(event_lon, event_lat)

        for fac in facilities:
            dist = haversine_distance(event_lat, event_lon, fac.latitude, fac.longitude)

            # Check polygon boundary if available
            if fac.geom_json:
                try:
                    poly_data = json.loads(fac.geom_json)
                    poly = shape(poly_data)
                    if poly.contains(event_point):
                        inside_boundary = True
                        dist = 0.0
                except Exception:
                    pass

            if dist < min_dist_overall:
                min_dist_overall = dist
                nearest_fac_name = fac.name
                nearest_fac_type = fac.facility_type

            ftype = fac.facility_type.lower()
            if ftype in min_dists_by_type:
                if dist < min_dists_by_type[ftype]:
                    min_dists_by_type[ftype] = dist
            elif "refinery" in ftype:
                min_dists_by_type["refinery"] = min(min_dists_by_type["refinery"], dist)
            elif "power" in ftype:
                min_dists_by_type["power_plant"] = min(min_dists_by_type["power_plant"], dist)
            elif "mine" in ftype:
                min_dists_by_type["mining"] = min(min_dists_by_type["mining"], dist)

            if dist <= 1000.0:
                count_1km += 1
            if dist <= 5000.0:
                count_5km += 1

        return {
            "distance_to_industrial_facility": round(min_dist_overall, 1),
            "distance_to_refinery": round(min_dists_by_type["refinery"], 1),
            "distance_to_powerplant": round(min_dists_by_type["power_plant"], 1),
            "distance_to_mine": round(min_dists_by_type["mining"], 1),
            "nearby_1km_count": count_1km,
            "nearby_5km_count": count_5km,
            "nearest_facility_name": nearest_fac_name,
            "nearest_facility_type": nearest_fac_type,
            "inside_industrial_boundary": inside_boundary
        }

    @staticmethod
    def get_land_cover_context(
        event_lat: float, 
        event_lon: float, 
        land_covers: List[LandCover]
    ) -> Dict[str, Any]:
        """
        Determines current land cover class and distances to forest, agriculture, mining landcover zones.
        """
        event_point = Point(event_lon, event_lat)
        matched_class = "other"
        
        min_dist_forest = 99999.0
        min_dist_agri = 99999.0
        min_dist_mine = 99999.0

        for lc in land_covers:
            try:
                poly_data = json.loads(lc.geom_json)
                poly = shape(poly_data)
                
                cname = lc.class_name.lower()
                
                # Check point-in-polygon
                if poly.contains(event_point):
                    matched_class = lc.class_name

                # Calculate center point distance for proximity fallback
                centroid = poly.centroid
                dist = haversine_distance(event_lat, event_lon, centroid.y, centroid.x)

                if "forest" in cname:
                    min_dist_forest = min(min_dist_forest, dist)
                elif "agri" in cname or "crop" in cname:
                    min_dist_agri = min(min_dist_agri, dist)
                elif "mine" in cname or "quarry" in cname:
                    min_dist_mine = min(min_dist_mine, dist)

            except Exception:
                continue

        return {
            "land_cover_class": matched_class,
            "distance_to_forest": round(min_dist_forest, 1),
            "distance_to_agriculture": round(min_dist_agri, 1),
            "distance_to_mine": round(min_dist_mine, 1),
            "inside_forest": matched_class == "forest",
            "inside_agriculture": matched_class == "agriculture"
        }
