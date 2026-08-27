import React from 'react';
import { Flame, Factory, Database, ShieldAlert, Zap, Radio, Search } from 'lucide-react';
import { AnalyticsSummary } from '../types';

interface TopKPIBarProps {
  summary: AnalyticsSummary | null;
  onSearchSubmit?: (query: string) => void;
}

export const TopKPIBar: React.FC<TopKPIBarProps> = ({ summary, onSearchSubmit }) => {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <div className="h-14 bg-[#111827] border-b border-gray-800 px-4 flex items-center justify-between gap-3 text-xs shrink-0 z-30">
      {/* KPI Cards Strip */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 flex-1">
        {/* Active Events */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 shrink-0">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500/20" />
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase">Active Thermal</div>
            <div className="text-sm font-bold font-mono text-white leading-tight">{summary?.total_events || 105}</div>
          </div>
        </div>

        {/* Industrial Events */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 shrink-0">
          <Factory className="w-4 h-4 text-red-400" />
          <div>
            <div className="text-[10px] text-red-400 font-semibold uppercase">Industrial</div>
            <div className="text-sm font-bold font-mono text-red-400 leading-tight">{summary?.industrial_fires || 18}</div>
          </div>
        </div>

        {/* Persistent Sources */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 shrink-0">
          <Database className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-[10px] text-amber-400 font-semibold uppercase">Persistent</div>
            <div className="text-sm font-bold font-mono text-amber-400 leading-tight">{summary?.gas_flares || 34}</div>
          </div>
        </div>

        {/* High Severity Alerts */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-red-900/40 border border-red-600/50 shrink-0">
          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          <div>
            <div className="text-[10px] text-red-300 font-bold uppercase">High Severity</div>
            <div className="text-sm font-bold font-mono text-red-500 leading-tight">{summary?.high_severity_alerts || 9}</div>
          </div>
        </div>

        {/* Abnormal Surges */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-yellow-950/40 border border-yellow-500/30 shrink-0">
          <Zap className="w-4 h-4 text-yellow-400" />
          <div>
            <div className="text-[10px] text-yellow-400 font-semibold uppercase">Abnormal</div>
            <div className="text-sm font-bold font-mono text-yellow-300 leading-tight">6</div>
          </div>
        </div>

        {/* Satellite Sync Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 shrink-0 text-gray-400 font-mono text-[11px]">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Last Satellite: <strong className="text-white">4 min ago</strong></span>
        </div>
      </div>

      {/* Quick Search & AI Copilot Bar */}
      <form onSubmit={handleSearch} className="relative hidden lg:block w-72 shrink-0">
        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search facility, location, event ID..."
          className="w-full bg-gray-900 border border-gray-700 text-white rounded-lg pl-8 pr-3 py-1 text-xs focus:outline-none focus:border-orange-500 placeholder-gray-500"
        />
      </form>
    </div>
  );
};
