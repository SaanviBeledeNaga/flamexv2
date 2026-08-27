import React from 'react';
import { Flame, ShieldAlert, Activity, RefreshCw, Layers, Database } from 'lucide-react';
import { Alert } from '../types';

interface HeaderProps {
  unacknowledgedAlerts: Alert[];
  onOpenAlerts: () => void;
  onRefreshData: () => void;
  isRefreshing: boolean;
  totalEventsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  unacknowledgedAlerts,
  onOpenAlerts,
  onRefreshData,
  isRefreshing,
  totalEventsCount
}) => {
  const alertCount = unacknowledgedAlerts.length;

  return (
    <header className="h-16 bg-[#111827]/90 backdrop-blur-md border-b border-gray-800 px-6 flex items-center justify-between shrink-0 z-30">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-orange-500/20">
          <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500/20" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Flame<span className="text-orange-500">X</span>
            </h1>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-full tracking-wide">
              PROTOTYPE PLATFORM
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium">
            AI-Powered Industrial Thermal Intelligence & Fire Monitoring
          </p>
        </div>
      </div>

      {/* Right Navigation & Status Controls */}
      <div className="flex items-center gap-4">
        {/* Dataset Mode Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300">
          <Database className="w-3.5 h-3.5 text-blue-400" />
          <span>Demo Data Mode</span>
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-gray-500 font-mono">({totalEventsCount} anomalies)</span>
        </div>

        {/* AI Engine Status Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Hybrid AI Engine</span>
          <span className="text-emerald-400 font-semibold font-mono">Online</span>
        </div>

        {/* Google Earth KML Export Button */}
        <a
          href="/api/export/kml"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 transition"
          title="Export all thermal intelligence & facilities to Google Earth Pro / Web (.kml)"
        >
          <span>🌎 Google Earth KML</span>
        </a>

        {/* FIRMS Refresh Button */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition disabled:opacity-50"
          title="Trigger NASA FIRMS satellite data refresh"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : 'text-gray-400'}`} />
          <span>Sync Satellite</span>
        </button>

        {/* Alert Bell Button */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition"
          title="Active System Alerts"
        >
          <ShieldAlert className={`w-5 h-5 ${alertCount > 0 ? 'text-red-400 animate-pulse' : 'text-gray-400'}`} />
          {alertCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-600 text-white font-mono text-[10px] font-bold rounded-full min-w-[18px] text-center shadow-lg shadow-red-600/40">
              {alertCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
