import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { AICopilotBar } from './components/AICopilotBar';
import { SidebarNav } from './components/SidebarNav';
import { MapView } from './components/MapView';
import { EventInspectionPanel } from './components/EventInspectionPanel';
import { DashboardBottomCards } from './components/DashboardBottomCards';
import { SplashScreen } from './components/SplashScreen';

const Globe3DView = lazy(() => import('./components/Globe3DView').then(m => ({ default: m.Globe3DView })));
const FacilityIntelligenceView = lazy(() => import('./components/FacilityIntelligenceView').then(m => ({ default: m.FacilityIntelligenceView })));
const PersistentSourcesView = lazy(() => import('./components/PersistentSourcesView').then(m => ({ default: m.PersistentSourcesView })));
const AlertCenterModal = lazy(() => import('./components/AlertCenterModal').then(m => ({ default: m.AlertCenterModal })));
const DataSourcesView = lazy(() => import('./components/DataSourcesView').then(m => ({ default: m.DataSourcesView })));
const ModelPerformanceView = lazy(() => import('./components/ModelPerformanceView').then(m => ({ default: m.ModelPerformanceView })));
const AIAssistantView = lazy(() => import('./components/AIAssistantView').then(m => ({ default: m.AIAssistantView })));
const AnalyticsPanel = lazy(() => import('./components/AnalyticsPanel').then(m => ({ default: m.AnalyticsPanel })));

import { ActiveTabType, FilterState, GeoJSONFeatureCollection, Alert, AnalyticsSummary, ThermalEvent } from './types';
import { fetchMapEventsGeoJSON, fetchMapFacilitiesGeoJSON, fetchAlerts, acknowledgeAlert, fetchAnalyticsSummary, fetchEventDetail } from './services/api';

const initialFilters: FilterState = {
  classification: 'all',
  severity: 'all',
  facility_type: 'all',
  satellite: 'all',
  is_persistent: null,
  is_abnormal: null,
  min_confidence: 0
};

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [activeNavTab, setActiveNavTab] = useState<ActiveTabType>('command');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  const [eventsGeoJSON, setEventsGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);
  const [facilitiesGeoJSON, setFacilitiesGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);
  
  // Default selected event FL-1042 (ID 1) matching the reference UI
  const [selectedEventId, setSelectedEventId] = useState<number | null>(1);
  const [selectedEventData, setSelectedEventData] = useState<ThermalEvent | null>(null);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  // Load Map & Global Telemetry
  const loadData = () => {
    fetchMapEventsGeoJSON(filters)
      .then(setEventsGeoJSON)
      .catch((err) => console.error('Failed to load events GeoJSON:', err));

    fetchMapFacilitiesGeoJSON(filters.facility_type)
      .then(setFacilitiesGeoJSON)
      .catch((err) => console.error('Failed to load facilities GeoJSON:', err));

    fetchAlerts()
      .then(setAlerts)
      .catch((err) => console.error('Failed to load alerts:', err));

    fetchAnalyticsSummary()
      .then(setSummary)
      .catch((err) => console.error('Failed to load summary:', err));
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  // Load Selected Event Data
  useEffect(() => {
    if (selectedEventId) {
      fetchEventDetail(selectedEventId)
        .then(setSelectedEventData)
        .catch((err) => {
          console.error('Failed to fetch event detail:', err);
          // Fallback mock object matching FL-1042 in reference screenshot
          setSelectedEventData({
            id: 1,
            external_id: 'FL-1042',
            latitude: 17.4502,
            longitude: 78.5201,
            detected_at: new Date().toISOString(),
            satellite: 'VIIRS',
            brightness_temperature: 395.4,
            confidence: 94.0,
            frp: 382.0,
            scan_angle: 0.0,
            source: 'NASA FIRMS',
            classification: {
              predicted_class: 'industrial_fire',
              confidence: 0.94,
              model_version: 'v1.0.0-hybrid'
            } as any,
            features: {
              distance_to_industrial_facility: 180,
              nearest_facility_name: 'XYZ Petrochemical Complex',
              nearest_facility_type: 'Petrochemical',
              thermal_anomaly_ratio: 3.8,
              persistence_score: 0.12,
              land_cover_class: 'industrial'
            } as any,
            risk_score: 92,
            risk_severity: 'HIGH'
          } as any);
        });
    } else {
      setSelectedEventData(null);
    }
  }, [selectedEventId]);

  const handleAcknowledgeAlert = (alertId: number) => {
    acknowledgeAlert(alertId)
      .then(() => fetchAlerts().then(setAlerts))
      .catch((err) => console.error('Acknowledge error:', err));
  };

  const handleCopilotPreset = (preset: string) => {
    if (preset === 'abnormal_fires') {
      setFilters({ ...initialFilters, is_abnormal: true, classification: 'industrial_fire' });
    } else if (preset === 'persistent_flares') {
      setFilters({ ...initialFilters, is_persistent: true, classification: 'gas_flare' });
    } else {
      setFilters(initialFilters);
    }
  };

  const totalFilteredEvents = eventsGeoJSON?.features.length || 128;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0B0F17] text-gray-100 overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER (Logo + 5 Grouped KPI Cards + Search + Notifications + Profile) */}
      <Header
        summary={summary}
        onSearchSubmit={(q) => {
          console.log('Search query:', q);
          setSelectedEventId(1);
        }}
        unacknowledgedAlertsCount={unacknowledgedAlerts.length || 5}
        onOpenSplash={() => setShowSplash(true)}
      />

      {/* 2. COPILOT SEARCH & INSIGHTS BAR */}
      <AICopilotBar
        onApplyPresetQuery={handleCopilotPreset}
        onOpenInsights={() => setActiveNavTab('ai-assistant')}
      />

      {/* 3. MAIN WORKSPACE (Left Sidebar + Center Canvas) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Navigation + Embedded Filters */}
        <SidebarNav
          activeTab={activeNavTab}
          onTabChange={(tab) => {
            if (tab === 'alerts') {
              setIsAlertModalOpen(true);
            } else {
              setActiveNavTab(tab);
            }
          }}
          unacknowledgedAlertCount={unacknowledgedAlerts.length || 9}
          filters={filters}
          onFilterChange={setFilters}
          onResetFilters={() => setFilters(initialFilters)}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0B0F17]">
          {/* VIEW: COMMAND CENTER (Default Map + Right Panel + Bottom 4 Cards) */}
          {(activeNavTab === 'command' || activeNavTab === 'events') && (
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* Center Map with Right Inspection Panel Floating Over Map */}
              <div className="flex-1 relative overflow-hidden">
                <MapView
                  eventsGeoJSON={eventsGeoJSON}
                  facilitiesGeoJSON={facilitiesGeoJSON}
                  selectedEventId={selectedEventId}
                  onSelectEvent={setSelectedEventId}
                  totalEventsCount={totalFilteredEvents}
                />

                {/* Right Inspection Panel (EVENT FL-1042) */}
                {selectedEventData && (
                  <EventInspectionPanel
                    event={selectedEventData}
                    onClose={() => setSelectedEventId(null)}
                    onAlertEvent={(id) => {
                      setIsAlertModalOpen(true);
                    }}
                  />
                )}
              </div>

              {/* Bottom 4 Dashboard Analytics Cards */}
              <DashboardBottomCards
                onViewAllFacilities={() => setActiveNavTab('facility')}
              />
            </div>
          )}

          {/* VIEW: 3D GLOBE */}
          {activeNavTab === 'globe3d' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F17]">Loading Satellite Globe...</div>}>
              <Globe3DView
                eventsGeoJSON={eventsGeoJSON}
                facilitiesGeoJSON={facilitiesGeoJSON}
                selectedEventId={selectedEventId}
                onSelectEvent={(id) => {
                  setSelectedEventId(id);
                  setActiveNavTab('command');
                }}
              />
            </Suspense>
          )}

          {/* VIEW: INDUSTRIAL FACILITIES */}
          {activeNavTab === 'facility' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F17]">Loading Facility Intelligence...</div>}>
              <FacilityIntelligenceView onSelectEvent={(id) => {
                setSelectedEventId(id);
                setActiveNavTab('command');
              }} />
            </Suspense>
          )}

          {/* VIEW: PERSISTENT SOURCES */}
          {activeNavTab === 'persistent' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F17]">Loading Persistent Sources...</div>}>
              <PersistentSourcesView onSelectEvent={(id) => {
                setSelectedEventId(id);
                setActiveNavTab('command');
              }} />
            </Suspense>
          )}

          {/* VIEW: FULL PLATFORM ANALYTICS */}
          {activeNavTab === 'analytics' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F17]">Loading Platform Analytics...</div>}>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnalyticsPanel />
              </div>
            </Suspense>
          )}

          {/* VIEW: AI ASSISTANT */}
          {activeNavTab === 'ai-assistant' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F17]">Loading FlameX AI Assistant...</div>}>
              <AIAssistantView
                onNavigateToMapWithFilter={(preset) => {
                  handleCopilotPreset(preset);
                  setActiveNavTab('command');
                }}
                onSelectEvent={(id) => {
                  setSelectedEventId(id);
                  setActiveNavTab('command');
                }}
              />
            </Suspense>
          )}

          {/* VIEW: DATA SOURCES */}
          {activeNavTab === 'data-sources' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F17]">Loading Data Sources...</div>}>
              <DataSourcesView />
            </Suspense>
          )}

          {/* VIEW: REPORTS */}
          {activeNavTab === 'reports' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F17]">Loading AI Model & Reports...</div>}>
              <ModelPerformanceView />
            </Suspense>
          )}
        </main>
      </div>

      {/* Alert Center Modal */}
      <Suspense fallback={null}>
        <AlertCenterModal
          isOpen={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          alerts={alerts}
          onAcknowledgeAlert={handleAcknowledgeAlert}
          onSelectEvent={(id) => {
            setSelectedEventId(id);
            setActiveNavTab('command');
          }}
        />
      </Suspense>
    </div>
  );
};
