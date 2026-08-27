import { ThermalEvent, IndustrialFacility, GeoJSONFeatureCollection, Alert, AnalyticsSummary, FilterState } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchMapEventsGeoJSON(filters: FilterState): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams();
  if (filters.classification !== 'all') params.append('classification', filters.classification);
  if (filters.severity !== 'all') params.append('severity', filters.severity);
  if (filters.facility_type !== 'all') params.append('facility_type', filters.facility_type);

  const res = await fetch(`${API_BASE}/map/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch map events GeoJSON');
  return res.json();
}

export async function fetchPersistentSources(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/events/persistent-sources`);
  if (!res.ok) throw new Error('Failed to fetch persistent sources');
  return res.json();
}

export async function fetchFacilitiesList(): Promise<IndustrialFacility[]> {
  const res = await fetch(`${API_BASE}/facilities`);
  if (!res.ok) throw new Error('Failed to fetch facilities list');
  return res.json();
}

export async function fetchFacilityIntelligence(facilityId: number): Promise<any> {
  const res = await fetch(`${API_BASE}/facilities/${facilityId}/intelligence`);
  if (!res.ok) throw new Error(`Failed to fetch intelligence for facility ${facilityId}`);
  return res.json();
}

export async function fetchMapFacilitiesGeoJSON(facilityType: string): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams();
  if (facilityType !== 'all') params.append('facility_type', facilityType);

  const res = await fetch(`${API_BASE}/map/facilities?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch map facilities GeoJSON');
  return res.json();
}

export async function fetchEvents(filters: FilterState): Promise<ThermalEvent[]> {
  const params = new URLSearchParams();
  if (filters.classification !== 'all') params.append('classification', filters.classification);
  if (filters.severity !== 'all') params.append('severity', filters.severity);
  if (filters.facility_type !== 'all') params.append('facility_type', filters.facility_type);
  if (filters.satellite !== 'all') params.append('satellite', filters.satellite);
  if (filters.is_persistent !== null) params.append('is_persistent', String(filters.is_persistent));
  if (filters.is_abnormal !== null) params.append('is_abnormal', String(filters.is_abnormal));
  if (filters.min_confidence > 0) params.append('min_confidence', String(filters.min_confidence));

  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventDetail(eventId: number): Promise<ThermalEvent> {
  const res = await fetch(`${API_BASE}/events/${eventId}`);
  if (!res.ok) throw new Error(`Failed to fetch event detail for ID ${eventId}`);
  return res.json();
}

export async function fetchEventHistory(eventId: number): Promise<any[]> {
  const res = await fetch(`${API_BASE}/events/${eventId}/history`);
  if (!res.ok) throw new Error(`Failed to fetch history for event ${eventId}`);
  return res.json();
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch analytics summary');
  return res.json();
}

export async function fetchAnalyticsTimeline(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/analytics/timeline`);
  if (!res.ok) throw new Error('Failed to fetch analytics timeline');
  return res.json();
}

export async function fetchAnalyticsClassifications(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/classifications`);
  if (!res.ok) throw new Error('Failed to fetch analytics classifications');
  return res.json();
}

export async function fetchAlerts(unacknowledgedOnly = false): Promise<Alert[]> {
  const params = unacknowledgedOnly ? '?unacknowledged_only=true' : '';
  const res = await fetch(`${API_BASE}/alerts${params}`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function acknowledgeAlert(alertId: number): Promise<Alert> {
  const res = await fetch(`${API_BASE}/alerts/${alertId}`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error(`Failed to acknowledge alert ${alertId}`);
  return res.json();
}

export async function triggerFirmsIngestion(): Promise<any> {
  const res = await fetch(`${API_BASE}/ingestion/firms`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to trigger FIRMS ingestion');
  return res.json();
}

export async function fetchModelPerformance(): Promise<any> {
  const res = await fetch(`${API_BASE}/analytics/model-performance`);
  if (!res.ok) throw new Error('Failed to fetch model performance');
  return res.json();
}

export async function fetchTopAbnormalFacilities(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/analytics/top-abnormal-facilities`);
  if (!res.ok) throw new Error('Failed to fetch top abnormal facilities');
  return res.json();
}

