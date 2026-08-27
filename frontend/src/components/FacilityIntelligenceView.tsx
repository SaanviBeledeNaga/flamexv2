import React, { useEffect, useState } from 'react';
import { Factory, ShieldAlert, Activity, CheckCircle2, AlertTriangle, Flame, Clock, MapPin, Search } from 'lucide-react';
import { IndustrialFacility, FacilityIntelligence } from '../types';
import { fetchFacilitiesList, fetchFacilityIntelligence } from '../services/api';

interface FacilityIntelligenceViewProps {
  onSelectEvent: (eventId: number) => void;
}

export const FacilityIntelligenceView: React.FC<FacilityIntelligenceViewProps> = ({ onSelectEvent }) => {
  const [facilities, setFacilities] = useState<IndustrialFacility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | null>(null);
  const [intel, setIntel] = useState<FacilityIntelligence | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFacilitiesList().then((facs) => {
      setFacilities(facs);
      if (facs.length > 0) {
        setSelectedFacilityId(facs[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedFacilityId) return;
    setIsLoading(true);
    fetchFacilityIntelligence(selectedFacilityId)
      .then(setIntel)
      .catch((err) => console.error('Failed to load facility intel:', err))
      .finally(() => setIsLoading(false));
  }, [selectedFacilityId]);

  if (facilities.length === 0) return null;

  return (
    <div className="flex-1 bg-[#0B0F19] p-6 overflow-y-auto space-y-6 text-sm">
      {/* Header & Facility Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Factory className="w-6 h-6 text-amber-500" />
            <span>Industrial Facility Thermal Intelligence</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Comprehensive facility thermal profile, persistent flare stacks, and nearby anomaly activity.
          </p>
        </div>

        {/* Facility Dropdown */}
        <select
          value={selectedFacilityId || ''}
          onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
          className="bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:border-orange-500"
        >
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              🏭 {f.name} ({f.facility_type.replace('_', ' ').toUpperCase()})
            </option>
          ))}
        </select>
      </div>

      {isLoading || !intel ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <Activity className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Loading Facility Thermal Intelligence...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status & KPI Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 uppercase font-semibold">Overall Thermal Status</span>
              <div className="mt-2 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  intel.overall_status === 'ABNORMAL' ? 'bg-red-500 animate-ping' : intel.overall_status === 'MONITORING' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></span>
                <span className={`text-xl font-extrabold ${
                  intel.overall_status === 'ABNORMAL' ? 'text-red-400' : intel.overall_status === 'MONITORING' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {intel.overall_status}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 uppercase font-semibold">Thermal Sources</span>
              <div className="mt-2 text-2xl font-bold font-mono text-white">
                {intel.thermal_sources_count} <span className="text-xs font-normal text-gray-500">stacks</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 uppercase font-semibold">Active Anomalies</span>
              <div className="mt-2 text-2xl font-bold font-mono text-orange-400">
                {intel.active_events_count} <span className="text-xs font-normal text-gray-500">events</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
              <span className="text-xs text-gray-400 uppercase font-semibold">Persistent Flares</span>
              <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
                {intel.persistent_sources_count} <span className="text-xs font-normal text-gray-500">flares</span>
              </div>
            </div>
          </div>

          {/* Status Distribution Progress */}
          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
              <span>Facility Operational Thermal Health</span>
              <span className="text-gray-400">Last abnormal event: <strong className="text-white">18 min ago</strong></span>
            </div>

            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${intel.status_breakdown.normal_pct}%` }} title="Normal"></div>
              <div className="bg-amber-500 h-full" style={{ width: `${intel.status_breakdown.monitoring_pct}%` }} title="Monitoring"></div>
              <div className="bg-red-500 h-full animate-pulse" style={{ width: `${intel.status_breakdown.abnormal_pct}%` }} title="Abnormal"></div>
            </div>

            <div className="flex gap-6 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Normal ({intel.status_breakdown.normal_pct}%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Monitoring ({intel.status_breakdown.monitoring_pct}%)
              </span>
              <span className="flex items-center gap-1.5 text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Abnormal ({intel.status_breakdown.abnormal_pct}%)
              </span>
            </div>
          </div>

          {/* Surrounding Thermal Anomalies Table */}
          <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
            <div className="font-bold text-white text-base">
              Active Thermal Anomalies around {intel.facility.name}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-950 text-gray-400 font-semibold border-b border-gray-800">
                  <tr>
                    <th className="p-3">EVENT ID</th>
                    <th className="p-3">CLASSIFICATION</th>
                    <th className="p-3">DISTANCE</th>
                    <th className="p-3">TEMPERATURE</th>
                    <th className="p-3">ANOMALY RATIO</th>
                    <th className="p-3">CONFIDENCE</th>
                    <th className="p-3">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {intel.events.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-gray-500">
                        No active thermal anomalies detected around this facility.
                      </td>
                    </tr>
                  ) : (
                    intel.events.map((e) => (
                      <tr key={e.id} className="hover:bg-gray-800/50 transition">
                        <td className="p-3 font-mono font-bold text-orange-400">
                          #{e.external_id || e.id}
                        </td>
                        <td className="p-3 font-semibold capitalize text-gray-200">
                          {e.classification.replace('_', ' ')}
                        </td>
                        <td className="p-3 font-mono text-gray-300">
                          {e.distance} m
                        </td>
                        <td className="p-3 font-mono font-bold text-white">
                          {e.brightness_temperature} K
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                            e.anomaly_ratio >= 1.8 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {e.anomaly_ratio}x baseline
                          </span>
                        </td>
                        <td className="p-3 font-mono text-gray-400">
                          {e.confidence}%
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => onSelectEvent(e.id)}
                            className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded text-xs transition"
                          >
                            Inspect AI →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
