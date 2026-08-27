export type ActiveTabType = 'command' | 'events' | 'globe3d' | 'facility' | 'persistent' | 'alerts' | 'analytics' | 'ai-assistant' | 'data-sources' | 'model' | 'reports';

export interface PersistentSourceItem {
  event_id: number;
  external_id: string;
  facility_name: string;
  facility_type: string;
  frequency_str: string;
  persistence_score: number;
  anomaly_ratio: number;
  status: 'NORMAL' | 'ABNORMAL';
  brightness_temperature: number;
  latitude: number;
  longitude: number;
  detected_at: string;
}

export interface FacilityIntelligence {
  facility: IndustrialFacility;
  overall_status: 'NORMAL' | 'MONITORING' | 'ABNORMAL';
  status_color: string;
  status_breakdown: {
    normal_pct: number;
    monitoring_pct: number;
    abnormal_pct: number;
  };
  thermal_sources_count: number;
  active_events_count: number;
  persistent_sources_count: number;
  abnormal_events_count: number;
  events: any[];
}

export type ClassificationClass = 
  | 'industrial_fire' 
  | 'gas_flare' 
  | 'forest_fire' 
  | 'agricultural_burn' 
  | 'mining_activity' 
  | 'unknown';

export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface FeatureContribution {
  feature_name: string;
  impact: '+' | '-';
  description: string;
  value: any;
}

export interface ClassificationEvidence {
  top_factors: string[];
  contributions: FeatureContribution[];
  summary: string;
}

export interface EventClassification {
  id?: number;
  predicted_class: ClassificationClass;
  confidence: number; // 0.0 to 1.0
  model_version: string;
  industrial_probability: number;
  wildfire_probability: number;
  agriculture_probability: number;
  mining_probability: number;
  flare_probability: number;
  unknown_probability: number;
  evidence?: ClassificationEvidence;
}

export interface EventFeature {
  distance_to_industrial_facility: number;
  distance_to_forest: number;
  distance_to_agriculture: number;
  distance_to_mine: number;
  distance_to_powerplant: number;
  event_frequency: number;
  persistence_score: number;
  thermal_intensity: number;
  historical_mean_temperature: number;
  thermal_anomaly_ratio: number;
  nearby_facility_count: number;
  smoke_detected: boolean;
  spatial_growth: number;
  time_of_day: number;
  day_of_week: number;
  land_cover_class: string;
  nearest_facility_name?: string;
  nearest_facility_type?: string;
}

export interface OpticalPatch {
  date: string;
  url: string;
  type: string;
}

export interface OpticalMetadata {
  satellite: string;
  resolution: string;
  cloud_cover_percentage: number;
  smoke_detected: boolean;
  smoke_plume_heading_deg: number;
  patches: {
    before: OpticalPatch;
    event: OpticalPatch;
    after: OpticalPatch;
  };
}

export interface RiskBreakdown {
  score: number;
  severity: SeverityLevel;
  factors: Record<string, number>;
  disclaimer: string;
}

export interface ThermalEvent {
  id: number;
  external_id?: string;
  latitude: number;
  longitude: number;
  detected_at: string;
  satellite: string;
  brightness_temperature: number;
  confidence: number;
  frp: number;
  scan_angle: number;
  source: string;
  created_at: string;
  classification?: EventClassification;
  features?: EventFeature;
  risk_score?: number;
  risk_severity?: SeverityLevel;
  risk_breakdown?: RiskBreakdown;
  optical_imagery?: OpticalMetadata;
}

export interface IndustrialFacility {
  id: number;
  name: string;
  facility_type: string;
  latitude: number;
  longitude: number;
  geom_json?: string;
  operator?: string;
  country: string;
  capacity?: string;
  source: string;
}

export interface GeoJSONEventProperties {
  id: number;
  external_id?: string;
  classification: ClassificationClass;
  confidence: number;
  severity: SeverityLevel;
  risk_score: number;
  brightness_temperature: number;
  frp: number;
  satellite: string;
  detected_at: string;
  nearest_facility?: string;
  distance_to_facility?: number;
  land_cover: string;
  persistence_score: number;
  thermal_anomaly_ratio: number;
  is_abnormal: boolean;
  is_persistent: boolean;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: any;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export interface Alert {
  id: number;
  event_id: number;
  alert_type: string;
  severity: SeverityLevel;
  message: string;
  acknowledged: boolean;
  created_at: string;
  event?: ThermalEvent;
}

export interface AnalyticsSummary {
  total_events: number;
  industrial_fires: number;
  gas_flares: number;
  wildfires: number;
  agricultural_burns: number;
  mining_activity: number;
  unknown_events: number;
  high_severity_alerts: number;
  avg_persistence_score: number;
  total_facilities: number;
}

export interface FilterState {
  classification: string;
  severity: string;
  facility_type: string;
  satellite: string;
  is_persistent: boolean | null;
  is_abnormal: boolean | null;
  min_confidence: number;
}
