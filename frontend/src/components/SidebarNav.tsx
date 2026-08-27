import React, { useState } from 'react';
import {
  Flame,
  Factory,
  Database,
  ShieldAlert,
  BarChart2,
  Sparkles,
  Globe2,
  Wifi,
  FileText,
  Radio,
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  Calendar
} from 'lucide-react';
import { ActiveTabType, FilterState } from '../types';

interface SidebarNavProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  unacknowledgedAlertCount: number;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  unacknowledgedAlertCount,
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const [confidenceVal, setConfidenceVal] = useState<number>(filters.min_confidence || 80);

  const navItems = [
    { id: 'command',      label: 'Command Center',        icon: Flame,     isPrimary: true },
    { id: 'events',       label: 'Thermal Events',        icon: Flame },
    { id: 'facility',     label: 'Industrial Facilities', icon: Factory },
    { id: 'persistent',   label: 'Persistent Sources',    icon: Database,  badge: 'PRO', badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    { id: 'alerts',       label: 'Alerts Center',         icon: ShieldAlert, alertBadge: unacknowledgedAlertCount || 9 },
    { id: 'analytics',    label: 'Analytics',             icon: BarChart2 },
    { id: 'ai-assistant', label: 'AI Assistant',          icon: Sparkles,  badge: 'AI',  badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: 'globe3d',      label: 'Satellite Insights',    icon: Globe2 },
    { id: 'data-sources', label: 'Data Sources',          icon: Wifi },
    { id: 'reports',      label: 'Reports',               icon: FileText }
  ];

  const handleApply = () => {
    onFilterChange({
      ...filters,
      min_confidence: confidenceVal
    });
  };

  return (
    <aside className="w-64 bg-[#0B0F17] border-r border-[#1E2738] flex flex-col justify-between shrink-0 select-none overflow-y-auto z-20 text-xs">
      {/* Top Menu Links */}
      <div className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'events' && activeTab === 'command');
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as ActiveTabType)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition ${
                isActive
                  ? 'bg-[#FF5722] text-white shadow-lg shadow-orange-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#131926]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${item.badgeColor || 'bg-gray-800 text-gray-300'}`}>
                  {item.badge}
                </span>
              )}

              {item.alertBadge && item.alertBadge > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-red-600 text-white shadow-md shadow-red-600/40">
                  {item.alertBadge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Embedded Filters Section */}
      <div className="p-3.5 mx-3 my-2 bg-[#101623] border border-[#1E2738] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-white text-xs">Filters</span>
          <button
            onClick={onResetFilters}
            className="text-[10px] font-bold text-gray-500 hover:text-orange-400 transition"
          >
            Clear All
          </button>
        </div>

        {/* Date Range */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Date Range</label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <select className="w-full bg-[#161D2C] border border-[#26334A] text-gray-200 rounded-lg pl-8 pr-6 py-1.5 text-xs font-medium focus:outline-none focus:border-orange-500 appearance-none">
              <option value="24h">Last 24 Hours</option>
              <option value="48h">Last 48 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Risk Level */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Risk Level</label>
          <div className="relative">
            <select
              value={filters.severity}
              onChange={(e) => onFilterChange({ ...filters, severity: e.target.value })}
              className="w-full bg-[#161D2C] border border-[#26334A] text-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-orange-500 appearance-none"
            >
              <option value="all">All Risk Levels</option>
              <option value="HIGH">Critical / High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Event Type */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Event Type</label>
          <div className="relative">
            <select
              value={filters.classification}
              onChange={(e) => onFilterChange({ ...filters, classification: e.target.value })}
              className="w-full bg-[#161D2C] border border-[#26334A] text-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-orange-500 appearance-none"
            >
              <option value="all">All Event Types</option>
              <option value="industrial_fire">Industrial Fire</option>
              <option value="gas_flare">Persistent Gas Flare</option>
              <option value="forest_fire">Wildfire</option>
              <option value="agricultural_burn">Agricultural Burn</option>
              <option value="mining_activity">Mining Activity</option>
              <option value="unknown">Unknown</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Facility Type */}
        <div className="space-y-1">
          <label className="text-[10px] text-gray-400 font-semibold uppercase">Facility Type</label>
          <div className="relative">
            <select
              value={filters.facility_type}
              onChange={(e) => onFilterChange({ ...filters, facility_type: e.target.value })}
              className="w-full bg-[#161D2C] border border-[#26334A] text-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-orange-500 appearance-none"
            >
              <option value="all">All Facility Types</option>
              <option value="refinery">Oil Refinery</option>
              <option value="petrochemical">Petrochemical</option>
              <option value="power_plant">Power Plant</option>
              <option value="steel">Steel Plant</option>
              <option value="lng">LNG Terminal</option>
              <option value="mining">Mining Zone</option>
            </select>
            <ChevronDown className="w-3 h-3 text-gray-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Confidence Slider */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold">
            <span>Confidence</span>
            <span className="font-mono text-orange-400">{confidenceVal}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={confidenceVal}
            onChange={(e) => setConfidenceVal(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
          <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Apply Filters Button */}
        <button
          onClick={handleApply}
          className="w-full py-2 bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold rounded-xl shadow-lg shadow-orange-600/30 transition text-xs flex items-center justify-center gap-1.5"
        >
          <span>Apply Filters</span>
        </button>
      </div>

      {/* Bottom Live Sync Status */}
      <div className="p-3 border-t border-[#1E2738] flex items-center gap-2.5 text-gray-400 font-mono text-[10px]">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <div>
          <div>Last Sync <strong className="text-white">4 min ago</strong></div>
          <div className="text-gray-500 text-[9px]">Next Sync in 1:56 min</div>
        </div>
      </div>
    </aside>
  );
};
