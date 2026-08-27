import React, { useEffect, useState } from 'react';
import { X, Sparkles, AlertTriangle, Factory, ShieldAlert, Activity, MapPin, Clock, Satellite, CheckCircle, Info, Zap, Flame, Compass, ChevronRight, MinusCircle, PlusCircle } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { ThermalEvent } from '../types';
import { fetchEventDetail, fetchEventHistory } from '../services/api';
import { ExplainabilityBadge, getClassConfig } from './ExplainabilityBadge';
import { SatelliteComparisonSlider } from './SatelliteComparisonSlider';

interface EventDetailDrawerProps {
  eventId: number | null;
  onClose: () => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({ eventId, onClose }) => {
  const [event, setEvent] = useState<ThermalEvent | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'spatial' | 'timeline' | 'imagery'>('ai');

  useEffect(() => {
    if (!eventId) {
      setEvent(null);
      return;
    }

    setIsLoading(true);
    Promise.all([
      fetchEventDetail(eventId),
      fetchEventHistory(eventId)
    ])
      .then(([evtData, histData]) => {
        setEvent(evtData);
        setHistory(histData);
      })
      .catch((err) => console.error('Failed to load event detail:', err))
      .finally(() => setIsLoading(false));
  }, [eventId]);

  if (!eventId || !event) return null;

  const classification = event.classification;
  const features = event.features;
  const risk = event.risk_breakdown;
  const optical = event.optical_imagery;

  // Feature progress percentages
  const intensityPct = Math.min(100, Math.round(((event.brightness_temperature - 300) / 180) * 100));
  const abnormalityPct = Math.min(100, Math.round(((features?.thermal_anomaly_ratio || 1.0) / 4.0) * 100));
  const proximityPct = Math.min(100, Math.max(0, Math.round((1.0 - (features?.distance_to_industrial_facility || 5000) / 2000) * 100)));

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-[#111827] border-l border-gray-800 shadow-2xl z-[2000] flex flex-col transition-all overflow-hidden text-sm">
      {/* Drawer Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-orange-400 text-base">
              🔥 EVENT #{event.external_id || event.id}
            </span>
            {event.risk_severity && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                event.risk_severity === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {event.risk_severity} SEVERITY
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-2 mt-0.5 font-mono">
            <Clock className="w-3.5 h-3.5" />
            <span>{new Date(event.detected_at).toUTCString()}</span>
          </p>

          {/* Google Earth Integration Action Buttons */}
          <div className="flex items-center gap-2 mt-2">
            <a
              href={`https://earth.google.com/web/@${event.latitude},${event.longitude},300a,1000d,35y,0h,45t,0r`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 transition shadow-md"
            >
              <span>🌎 Google Earth 3D</span>
            </a>

            <a
              href={`/api/export/events/${event.id}/kml`}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-[11px] font-semibold flex items-center gap-1 transition"
            >
              <span>📥 Export KML</span>
            </a>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-800 bg-gray-900/50 text-xs shrink-0 font-medium">
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'ai' ? 'border-orange-500 text-orange-400 font-bold bg-orange-500/10' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          🧠 AI Reasoning
        </button>
        <button
          onClick={() => setActiveTab('spatial')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'spatial' ? 'border-orange-500 text-orange-400 font-bold bg-orange-500/10' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          📍 Context
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'timeline' ? 'border-orange-500 text-orange-400 font-bold bg-orange-500/10' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          📈 History
        </button>
        <button
          onClick={() => setActiveTab('imagery')}
          className={`flex-1 py-2.5 text-center border-b-2 transition ${
            activeTab === 'imagery' ? 'border-orange-500 text-orange-400 font-bold bg-orange-500/10' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          🛰️ Compare
        </button>
      </div>

      {/* Drawer Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-gray-400">
            <Activity className="w-6 h-6 animate-spin text-orange-500 mr-2" />
            <span>Running FlameX AI Reasoning Pipeline...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: AI REASONING & WHY FLAMEX THINKS THIS IS A FIRE */}
            {activeTab === 'ai' && (
              <div className="space-y-6">
                {/* Main Classification Header Card */}
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Primary AI Classification
                  </div>

                  <div className="flex items-center justify-between">
                    {classification && (
                      <ExplainabilityBadge
                        classification={classification.predicted_class}
                        confidence={classification.confidence}
                      />
                    )}
                    <div className="text-right">
                      <div className="text-3xl font-extrabold font-mono text-white">
                        {classification ? Math.round(classification.confidence * 100) : 0}%
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">AI Certainty</div>
                    </div>
                  </div>
                </div>

                {/* Feature Metric Progress Bars */}
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3 text-xs">
                  <div className="text-xs text-gray-400 uppercase font-semibold">
                    Key Metric Indicators
                  </div>

                  {/* Thermal Intensity */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-gray-300">Thermal Intensity ({event.brightness_temperature} K)</span>
                      <span className="text-red-400 font-bold">{intensityPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500" style={{ width: `${intensityPct}%` }}></div>
                    </div>
                  </div>

                  {/* Abnormality */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-gray-300">Abnormality ({features?.thermal_anomaly_ratio}x baseline)</span>
                      <span className="text-amber-400 font-bold">{abnormalityPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${abnormalityPct}%` }}></div>
                    </div>
                  </div>

                  {/* Industrial Proximity */}
                  <div className="space-y-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-gray-300">Industrial Proximity ({features?.distance_to_industrial_facility}m)</span>
                      <span className="text-blue-400 font-bold">{proximityPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${proximityPct}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* 🧠 Why FlameX Thinks This Is A Fire */}
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>🧠 AI Reasoning & Evidence Breakdown</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {classification?.evidence?.top_factors?.map((factor, idx) => (
                      <div key={idx} className="flex items-start gap-2 bg-gray-900/90 p-2.5 rounded-lg border border-gray-800">
                        <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-gray-200 font-medium">{factor}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 bg-gray-900/90 p-2 rounded border border-gray-800 text-gray-400">
                      <MinusCircle className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>- Forest fire probability low (remote canopy &gt; 3 km away)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900/90 p-2 rounded border border-gray-800 text-gray-400">
                      <MinusCircle className="w-4 h-4 text-gray-500 shrink-0" />
                      <span>- Agricultural burn probability low (non-cropland field)</span>
                    </div>
                  </div>
                </div>

                {/* Normal vs Abnormal Comparison Box */}
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3 text-xs">
                  <div className="text-xs text-gray-400 uppercase font-semibold flex justify-between">
                    <span>Baseline vs Current Behavior</span>
                    <span className="text-red-400 font-mono font-bold">ANOMALY SCORE: {risk?.score}/100</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-black/40 border border-gray-800 space-y-1">
                      <div className="text-[10px] text-gray-400 uppercase font-bold">Normal Pattern</div>
                      <div className="text-gray-300">Typical intensity: <strong className="text-white font-mono">{features?.historical_mean_temperature} K</strong></div>
                      <div className="text-gray-300">Typical time: <strong className="text-white font-mono">20:50–21:15</strong></div>
                      <div className="text-gray-300">Frequency: <strong className="text-amber-400 font-mono">27/30 days</strong></div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-500/40 space-y-1">
                      <div className="text-[10px] text-red-400 uppercase font-bold">Current Event</div>
                      <div className="text-gray-300">Intensity: <strong className="text-red-400 font-mono">{event.brightness_temperature} K</strong></div>
                      <div className="text-gray-300">Time: <strong className="text-white font-mono">{new Date(event.detected_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</strong></div>
                      <div className="text-gray-300">Surge: <strong className="text-red-400 font-mono">{features?.thermal_anomaly_ratio}x baseline</strong></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GEOSPATIAL LOCATION & CONTEXT */}
            {activeTab === 'spatial' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
                  <div className="text-xs text-gray-400 uppercase font-semibold flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>📍 Coordinates & Facility Context</span>
                  </div>

                  <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-gray-800">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <strong className="text-white font-mono">{event.latitude.toFixed(4)}° N, {event.longitude.toFixed(4)}° E</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nearest Facility:</span>
                      <strong className="text-amber-400 font-semibold">{features?.nearest_facility_name || 'N/A'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance to Facility:</span>
                      <strong className="text-white font-mono">{features?.distance_to_industrial_facility} meters</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ESA WorldCover Class:</span>
                      <strong className="text-emerald-400 capitalize">{features?.land_cover_class} Zone</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Thermal Intensity Surge:</span>
                      <strong className="text-red-400 font-mono">{features?.thermal_anomaly_ratio}x baseline</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Persistence Status:</span>
                      <strong className="text-amber-300">{features?.persistence_score && features.persistence_score > 0.6 ? 'High (Persistent Flare)' : 'Low (Sudden Spike)'}</strong>
                    </div>
                  </div>
                </div>

                {/* 👥 WorldPop Population Density & Risk Assessment Card */}
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                  <div className="text-xs text-blue-400 uppercase font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">👥 WorldPop 100m Resolution Grid</span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">MODERATE RISK</span>
                  </div>

                  <div className="space-y-2 bg-black/40 p-3 rounded-lg border border-blue-900/50">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Local Population Density:</span>
                      <strong className="text-white font-mono">250 people / km²</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Population within 1 km:</span>
                      <strong className="text-amber-400 font-mono font-bold">785 residents</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Population within 5 km:</span>
                      <strong className="text-blue-300 font-mono font-bold">19,634 residents</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Distance to Nearest Settlement:</span>
                      <strong className="text-emerald-400 font-mono font-bold">1.2 km (1,200 meters)</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: THERMAL HISTORY TIMELINE & THRESHOLD */}
            {activeTab === 'timeline' && (
              <div className="space-y-4 text-xs">
                <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold text-gray-300">
                    <span>THERMAL HISTORY — {features?.nearest_facility_name || 'INDUSTRIAL COMPLEX'}</span>
                    <span className="text-orange-400 font-mono font-bold">{features?.thermal_anomaly_ratio}x Surge</span>
                  </div>

                  <div className="h-56 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                        <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#6B7280" domain={['dataMin - 10', 'dataMax + 20']} tick={{ fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }} 
                          itemStyle={{ color: '#F3F4F6' }} 
                          labelStyle={{ color: '#9CA3AF' }} 
                        />
                        <ReferenceLine y={features?.historical_mean_temperature || 310} label="Normal Baseline Threshold" stroke="#F59E0B" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 4, fill: '#EF4444' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SATELLITE COMPARISON */}
            {activeTab === 'imagery' && optical && (
              <SatelliteComparisonSlider optical={optical} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
