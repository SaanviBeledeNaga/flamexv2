import React, { useEffect, useState } from 'react';
import { Database, Satellite, Globe, Factory, Users, CheckCircle, RefreshCw, Wifi, AlertTriangle } from 'lucide-react';

interface DataSource {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'degraded' | 'offline';
  lastSync: string;
  dataPoints: string;
  provider: string;
  color: string;
}

const sources: DataSource[] = [
  {
    id: 'firms',
    name: 'NASA FIRMS',
    description: 'Fire Information for Resource Management System — real-time global active fire detections from MODIS and VIIRS satellite sensors.',
    icon: <Satellite className="w-5 h-5" />,
    status: 'connected',
    lastSync: '2 min ago',
    dataPoints: '~1M daily',
    provider: 'NASA EOSDIS',
    color: 'orange',
  },
  {
    id: 'sentinel',
    name: 'Sentinel-2 / Copernicus',
    description: 'European Space Agency multispectral optical imagery at 10m resolution for before/during/after fire analysis.',
    icon: <Globe className="w-5 h-5" />,
    status: 'connected',
    lastSync: '14 min ago',
    dataPoints: '290 TB/yr',
    provider: 'ESA Copernicus',
    color: 'blue',
  },
  {
    id: 'worldcover',
    name: 'ESA WorldCover',
    description: '10m resolution global land use / land cover map — classifies terrain as forest, agriculture, urban, industrial, water, etc.',
    icon: <Globe className="w-5 h-5" />,
    status: 'connected',
    lastSync: 'Static dataset',
    dataPoints: '37 billion px',
    provider: 'ESA / VITO',
    color: 'emerald',
  },
  {
    id: 'facilities',
    name: 'Industrial Facilities DB',
    description: 'Global registry of industrial sites — refineries, power plants, steel mills, LNG terminals, mining zones — from OSM and SEDAC.',
    icon: <Factory className="w-5 h-5" />,
    status: 'connected',
    lastSync: 'Static dataset',
    dataPoints: '500+ facilities',
    provider: 'OSM / SEDAC',
    color: 'amber',
  },
  {
    id: 'worldpop',
    name: 'WorldPop Population',
    description: '100m resolution global population density estimates used to assess human exposure risk near thermal anomalies.',
    icon: <Users className="w-5 h-5" />,
    status: 'connected',
    lastSync: 'Static dataset',
    dataPoints: '8B+ records',
    provider: 'University of Southampton',
    color: 'purple',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  orange:  { bg: 'bg-orange-950/30',  border: 'border-orange-500/30',  text: 'text-orange-400',  dot: 'bg-orange-500' },
  blue:    { bg: 'bg-blue-950/30',    border: 'border-blue-500/30',    text: 'text-blue-400',    dot: 'bg-blue-500' },
  emerald: { bg: 'bg-emerald-950/30', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-500' },
  amber:   { bg: 'bg-amber-950/30',   border: 'border-amber-500/30',   text: 'text-amber-400',   dot: 'bg-amber-500' },
  purple:  { bg: 'bg-purple-950/30',  border: 'border-purple-500/30',  text: 'text-purple-400',  dot: 'bg-purple-500' },
};

export const DataSourcesView: React.FC = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0F19]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-orange-500" />
            Data Sources
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            FlameX integrates satellite, environmental and industrial data to power AI investigation.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          All systems operational
        </div>
      </div>

      {/* Source cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sources.map((src) => {
          const c = colorMap[src.color];
          return (
            <div key={src.id} className={`rounded-2xl ${c.bg} border ${c.border} p-5 space-y-4`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${c.bg} border ${c.border} ${c.text}`}>
                    {src.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{src.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono">{src.provider}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${c.text}`}>
                  <span className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
                  CONNECTED
                </div>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">{src.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Last Sync</p>
                  <p className={`text-sm font-mono font-bold ${c.text}`}>{src.lastSync}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Volume</p>
                  <p className={`text-sm font-mono font-bold ${c.text}`}>{src.dataPoints}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline diagram */}
      <div className="rounded-2xl bg-gray-900/60 border border-gray-800 p-5 space-y-3">
        <h3 className="font-bold text-white text-sm flex items-center gap-2">
          <Wifi className="w-4 h-4 text-orange-500" />
          FlameX Data Pipeline
        </h3>
        <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
          {[
            '🛰 NASA FIRMS',
            '→',
            '⚙️ Ingestion',
            '→',
            '🧠 AI Classification',
            '→',
            '🔍 Risk Engine',
            '→',
            '🚨 Alert Generation',
            '→',
            '📊 Dashboard',
          ].map((step, i) => (
            <span
              key={i}
              className={step === '→'
                ? 'text-orange-500 font-bold'
                : 'px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-700 text-gray-300'}
            >
              {step}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Last full pipeline run: <span className="text-emerald-400 font-mono">{now.toLocaleTimeString()}</span> — 
          Processing latency: <span className="text-emerald-400 font-mono">&lt;2 min end-to-end</span>
        </p>
      </div>
    </div>
  );
};
