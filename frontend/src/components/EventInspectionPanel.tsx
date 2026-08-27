import React, { useState } from 'react';
import { X, CheckCircle2, Flame, Factory, Clock, MapPin, Satellite, ShieldAlert, Sparkles, Activity } from 'lucide-react';
import { ThermalEvent } from '../types';

interface EventInspectionPanelProps {
  event: ThermalEvent | null;
  onClose: () => void;
  onAlertEvent?: (eventId: number) => void;
}

export const EventInspectionPanel: React.FC<EventInspectionPanelProps> = ({
  event,
  onClose,
  onAlertEvent
}) => {
  const [activeTab, setActiveTab] = useState<'analysis' | 'history' | 'imagery' | 'nearby'>('analysis');

  if (!event) return null;

  const eventName = event.external_id || `FL-${1000 + event.id}`;
  const confidencePct = Math.round(event.classification ? event.classification.confidence * 100 : 94);
  const distance = event.features?.distance_to_industrial_facility || 180;
  const facilityName = event.features?.nearest_facility_name || 'XYZ Petrochemical Complex';
  const facilityType = event.features?.nearest_facility_type ? event.features.nearest_facility_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Petrochemical';
  const frp = event.frp ? Math.round(event.frp) : 382;
  const anomalyRatio = event.features?.thermal_anomaly_ratio ? event.features.thermal_anomaly_ratio.toFixed(1) : '3.8';
  const persistenceScore = event.features?.persistence_score ? event.features.persistence_score.toFixed(2) : '0.12';

  return (
    <div className="absolute top-3 right-3 bottom-3 w-80 lg:w-[350px] bg-[#0E1420]/95 backdrop-blur-md border border-[#1E2738] rounded-2xl shadow-2xl z-[1500] flex flex-col justify-between overflow-hidden text-xs select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#1E2738] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white text-sm">EVENT {eventName}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3 fill-red-400" />
              CRITICAL
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Classification Title & Confidence */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-center gap-1.5 text-base font-black text-white">
            <div className="w-5 h-5 rounded-md bg-red-500/20 flex items-center justify-center text-red-500">
              <Flame className="w-3.5 h-3.5 fill-red-500/30" />
            </div>
            <span>Industrial Fire</span>
          </div>
          <div className="text-right">
            <span className="text-base font-black text-white font-mono">{confidencePct}%</span>
            <span className="text-[10px] text-gray-400 block font-sans">Confidence</span>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="text-[10px] text-gray-400 font-mono grid grid-cols-2 gap-1 pt-1">
          <div>26 Aug 2026, 14:15 IST</div>
          <div className="text-right">{event.latitude.toFixed(4)}°N, {event.longitude.toFixed(4)}°E</div>
          <div>Satellite: VIIRS</div>
          <div className="text-right">Source: NASA FIRMS</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Nearest Facility Card */}
        <div className="p-3 rounded-xl bg-[#131A29] border border-[#1E2738] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400">
            <span>Nearest Facility</span>
            <span className="font-mono text-white font-bold">{distance} m Distance</span>
          </div>
          <div className="font-bold text-white text-xs truncate">{facilityName}</div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
            <span>Type: <strong className="text-gray-200">{facilityType}</strong></span>
            <span>Criticality: <strong className="text-red-400">High</strong></span>
          </div>
        </div>

        {/* Thermal Intensity Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400 font-semibold uppercase">Thermal Intensity</span>
            <span className="font-mono font-bold text-white">{frp} MW</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500"
              style={{ width: `${Math.min(100, Math.round((frp / 500) * 100))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[8px] text-gray-500 font-mono">
            <span>0</span>
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
            <span>500</span>
          </div>
        </div>

        {/* Abnormality Score */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-gray-400 font-semibold uppercase">Abnormality Score</span>
            <span className="font-mono font-bold text-red-400">{anomalyRatio}x <span className="text-[9px] text-gray-500 font-normal">vs baseline</span></span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-800 overflow-hidden">
            <div className="h-full rounded-full bg-[#EF4444]" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Persistence */}
        <div className="p-2.5 rounded-xl bg-[#131A29] border border-[#1E2738] text-[10px] text-gray-300">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 uppercase font-bold">Persistence</span>
            <span className="font-mono font-bold text-amber-400">Low ({persistenceScore})</span>
          </div>
          <div className="text-[9px] text-gray-400 mt-0.5">This is not a recurring source</div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center border-b border-[#1E2738] text-[11px] font-bold">
          {(['analysis', 'history', 'imagery', 'nearby'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 pb-1.5 capitalize transition ${
                activeTab === t
                  ? 'text-white border-b-2 border-orange-500 font-bold'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'analysis' ? 'AI Analysis' : t}
            </button>
          ))}
        </div>

        {/* AI Analysis Explanation Checklist */}
        {activeTab === 'analysis' && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-gray-400">
              Why FlameX classified this as Industrial Fire
            </div>
            <div className="space-y-1.5 text-[10px] text-gray-300">
              {[
                `Located ${distance}m from petrochemical facility`,
                'Industrial land cover',
                `Very high thermal intensity (${frp} MW)`,
                `${anomalyRatio}x above historical baseline`,
                'Low persistence (not a recurring source)',
                'No forest or agricultural activity nearby'
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-1.5 text-[10px] text-gray-400 font-mono">
            <div>20 Aug: 105 MW (Normal)</div>
            <div>21 Aug: 108 MW (Normal)</div>
            <div>22 Aug: 110 MW (Normal)</div>
            <div>23 Aug: 106 MW (Normal)</div>
            <div>24 Aug: 112 MW (Normal)</div>
            <div>25 Aug: 109 MW (Normal)</div>
            <div className="text-red-400 font-bold">26 Aug: 382 MW (🚨 ABNORMAL SURGE)</div>
          </div>
        )}

        {activeTab === 'imagery' && (
          <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 text-center space-y-1.5">
            <Satellite className="w-6 h-6 text-orange-500 mx-auto" />
            <div className="text-[10px] font-bold text-gray-200">Sentinel-2 10m Multispectral Patch</div>
            <div className="text-[9px] text-gray-500 font-mono">Bands B12/B8A/B4 SWIR Thermal Composite</div>
          </div>
        )}

        {activeTab === 'nearby' && (
          <div className="space-y-1 text-[10px] text-gray-300">
            <div>• XYZ Refinery Main Crude Unit (180m)</div>
            <div>• Flare Stack Alpha (340m)</div>
            <div>• Storage Tank Farm B (520m)</div>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-3 border-t border-[#1E2738] bg-[#0B0F17]">
        <button
          onClick={() => onAlertEvent && onAlertEvent(event.id)}
          className="w-full py-2.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-red-600/30"
        >
          <Flame className="w-4 h-4 fill-white" />
          <span>Alert This Event</span>
        </button>
      </div>
    </div>
  );
};
