import React, { useState } from 'react';
import { Flame, Factory, Database, ShieldAlert, Radio, Search, Bell, User, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AnalyticsSummary } from '../types';

interface HeaderProps {
  summary: AnalyticsSummary | null;
  onSearchSubmit?: (query: string) => void;
  unacknowledgedAlertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  onSearchSubmit,
  unacknowledgedAlertsCount = 5
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="h-16 bg-[#0B0F17] border-b border-[#1E2738] px-5 flex items-center justify-between gap-4 shrink-0 z-30 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/30" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-lg font-black tracking-tight text-white">Flame<span className="text-orange-500">X</span></span>
          </div>
          <p className="text-[10px] text-gray-400 tracking-tight font-medium mt-0.5">AI Thermal Intelligence</p>
        </div>
      </div>

      {/* KPI Cards Strip (Center-Right Grouped) */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#111724]/90 border border-[#1E2738]">
        {/* Active Thermal */}
        <div className="flex items-center gap-2.5 px-3 py-1 border-r border-[#1E2738]/80">
          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Flame className="w-4 h-4 fill-orange-500/20" />
          </div>
          <div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Active Thermal Events</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-white leading-tight">{summary?.total_events || 100}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center">
                ↑ 12%
              </span>
            </div>
            <div className="text-[8px] text-gray-500">vs yesterday</div>
          </div>
        </div>

        {/* Industrial Fires */}
        <div className="flex items-center gap-2.5 px-3 py-1 border-r border-[#1E2738]/80">
          <div className="w-8 h-8 rounded-full bg-red-500/15 flex items-center justify-center text-red-400">
            <Factory className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Industrial Fires</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-white leading-tight">{summary?.industrial_fires || 14}</span>
              <span className="text-[10px] font-mono text-red-400 font-bold flex items-center">
                ↑ 2
              </span>
            </div>
            <div className="text-[8px] text-gray-500">vs yesterday</div>
          </div>
        </div>

        {/* Persistent Sources */}
        <div className="flex items-center gap-2.5 px-3 py-1 border-r border-[#1E2738]/80">
          <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">Persistent Sources</div>
            <div className="text-sm font-bold font-mono text-white leading-tight">{summary?.gas_flares || 27}</div>
            <div className="text-[8px] text-amber-400/80 font-mono font-medium">&gt;30d avg</div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="flex items-center gap-2.5 px-3 py-1 border-r border-[#1E2738]/80">
          <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Critical Alerts</div>
            <div className="text-sm font-bold font-mono text-white leading-tight">{summary?.high_severity_alerts || 9}</div>
            <div className="text-[8px] text-red-400 font-semibold">Requires Action</div>
          </div>
        </div>

        {/* Last Sync */}
        <div className="flex items-center gap-2.5 px-3 py-1">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Last Sync</div>
            <div className="text-xs font-bold font-mono text-white leading-tight">4 min ago</div>
            <div className="text-[8px] text-emerald-400/80 font-mono">● Next: in 1:56 min</div>
          </div>
        </div>
      </div>

      {/* Right: Search + Notifications + Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Search Bar with ⌘K */}
        <form onSubmit={handleSearch} className="relative hidden md:block w-64 xl:w-72">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facility, anomaly or location..."
            className="w-full bg-[#111724] border border-[#1E2738] text-white rounded-xl pl-8 pr-10 py-1.5 text-xs focus:outline-none focus:border-orange-500 transition placeholder-gray-500"
          />
          <span className="absolute right-2.5 top-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
            ⌘K
          </span>
        </form>

        {/* Notifications Bell */}
        <div className="relative">
          <button className="w-9 h-9 rounded-xl bg-[#111724] border border-[#1E2738] flex items-center justify-center text-gray-300 hover:text-white transition">
            <Bell className="w-4 h-4" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-lg shadow-red-600/40">
            {unacknowledgedAlertsCount}
          </span>
        </div>

        {/* User Profile Avatar */}
        <button className="w-9 h-9 rounded-xl bg-[#111724] border border-[#1E2738] flex items-center justify-center text-gray-300 hover:text-white transition">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
