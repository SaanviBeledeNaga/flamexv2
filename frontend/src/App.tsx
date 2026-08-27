import React, { useEffect, useState, Suspense, lazy } from 'react';
import { SidebarNav } from './components/SidebarNav';
import { TopKPIBar } from './components/TopKPIBar';
import { FilterBar } from './components/FilterBar';
import { MapView } from './components/MapView';
import { EventDetailDrawer } from './components/EventDetailDrawer';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AICopilotBar } from './components/AICopilotBar';

const Globe3DView = lazy(() => import('./components/Globe3DView').then(m => ({ default: m.Globe3DView })));
const FacilityIntelligenceView = lazy(() => import('./components/FacilityIntelligenceView').then(m => ({ default: m.FacilityIntelligenceView })));
const PersistentSourcesView = lazy(() => import('./components/PersistentSourcesView').then(m => ({ default: m.PersistentSourcesView })));
const AlertCenterModal = lazy(() => import('./components/AlertCenterModal').then(m => ({ default: m.AlertCenterModal })));

import { ActiveTabType, FilterState, GeoJSONFeatureCollection, Alert, AnalyticsSummary } from './types';
import { fetchMapEventsGeoJSON, fetchMapFacilitiesGeoJSON, fetchAlerts, acknowledgeAlert, fetchAnalyticsSummary } from './services/api';
import { BarChart2, ShieldAlert, Sparkles, Flame, Eye } from 'lucide-react';


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
  const [activeNavTab, setActiveNavTab] = useState<ActiveTabType>('command');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  
  const [eventsGeoJSON, setEventsGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);
  const [facilitiesGeoJSON, setFacilitiesGeoJSON] = useState<GeoJSONFeatureCollection | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isAnalyticsDrawerOpen, setIsAnalyticsDrawerOpen] = useState(false);

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

  const totalFilteredEvents = eventsGeoJSON?.features.length || 0;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="flex h-screen w-screen bg-[#0B0F19] text-gray-100 overflow-hidden font-sans">
      {/* Left Command Center Sidebar Navigation */}
      <SidebarNav
        activeTab={activeNavTab}
        onTabChange={(tab) => {
          if (tab === 'alerts') {
            setIsAlertModalOpen(true);
          } else {
            setActiveNavTab(tab);
          }
        }}
        unacknowledgedAlertCount={unacknowledgedAlerts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Top KPI Bar */}
        <TopKPIBar
          summary={summary}
          onSearchSubmit={(q) => {
            console.log('Search submit:', q);
            setSelectedEventId(1); // Jump to XYZ Petrochemical demo event
          }}
        />

        {/* AI Copilot Bar */}
        <AICopilotBar onApplyPresetQuery={handleCopilotPreset} />

        {/* PAGE VIEW 1: DASHBOARD / COMMAND CENTER */}
        {activeNavTab === 'command' && (
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Filter Toolbar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={() => setFilters(initialFilters)}
              totalFilteredCount={totalFilteredEvents}
            />

            {/* GIS Map Canvas (~65-70% height) */}
            <div className="flex-1 h-full relative">
              <MapView
                eventsGeoJSON={eventsGeoJSON}
                facilitiesGeoJSON={facilitiesGeoJSON}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />

              {/* Floating Action Shortcuts */}
              <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2">
                <button
                  onClick={() => setSelectedEventId(1)}
                  className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-xl shadow-xl shadow-orange-600/30 text-xs font-bold flex items-center gap-2 transition transform hover:scale-105 border border-orange-400/40"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Inspect XYZ Petrochemical Fire Demo</span>
                </button>

                <button
                  onClick={() => setIsAnalyticsDrawerOpen(!isAnalyticsDrawerOpen)}
                  className="px-3 py-2 bg-[#111827]/90 hover:bg-[#1F2937] text-gray-200 rounded-xl shadow-xl border border-gray-800 text-xs font-semibold flex items-center gap-1.5 backdrop-blur transition"
                >
                  <BarChart2 className="w-4 h-4 text-amber-500" />
                  <span>{isAnalyticsDrawerOpen ? 'Hide Analytics' : 'Show Analytics'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Analytics Panel (Toggleable) */}
            {isAnalyticsDrawerOpen && <AnalyticsPanel />}
          </div>
        )}

        {/* PAGE VIEW 2: NATIVE IN-PLATFORM 3D GLOBE */}
        {activeNavTab === 'globe3d' && (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F19]">Loading 3D Globe...</div>}>
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

        {/* PAGE VIEW 2: FACILITY INTELLIGENCE */}
        {activeNavTab === 'facility' && (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F19]">Loading Facility Intelligence...</div>}>
            <FacilityIntelligenceView onSelectEvent={(id) => {
              setSelectedEventId(id);
              setActiveNavTab('command');
            }} />
          </Suspense>
        )}

        {/* PAGE VIEW 3: PERSISTENT SOURCES TABLE */}
        {activeNavTab === 'persistent' && (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center text-gray-400 bg-[#0B0F19]">Loading Persistent Sources...</div>}>
            <PersistentSourcesView onSelectEvent={(id) => {
              setSelectedEventId(id);
              setActiveNavTab('command');
            }} />
          </Suspense>
        )}

        {/* PAGE VIEW 4: ANALYTICS DASHBOARD */}
        {activeNavTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-amber-500" />
              <span>Full Platform Thermal Analytics</span>
            </h2>
            <AnalyticsPanel />
          </div>
        )}

        {/* Event Detail Inspection Drawer (Right Side) */}
        <EventDetailDrawer
          eventId={selectedEventId}
          onClose={() => setSelectedEventId(null)}
        />
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
