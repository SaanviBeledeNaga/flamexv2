import React from 'react';
import { Flame, Factory, Database, ShieldAlert, BarChart2, Radio, Sparkles, Globe2, Brain, Wifi } from 'lucide-react';
import { ActiveTabType } from '../types';

interface SidebarNavProps {
  activeTab: ActiveTabType;
  onTabChange: (tab: ActiveTabType) => void;
  unacknowledgedAlertCount: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  onTabChange,
  unacknowledgedAlertCount
}) => {
  const navItems = [
    { id: 'command',      label: 'Command Center',   icon: Flame,     badge: 'GIS' },
    { id: 'globe3d',      label: '3D Globe',          icon: Globe2,    badge: '3D' },
    { id: 'facility',     label: 'Facilities',        icon: Factory },
    { id: 'persistent',   label: 'Persistent Sources',icon: Database },
    { id: 'alerts',       label: 'Alert Center',      icon: ShieldAlert, alertBadge: unacknowledgedAlertCount },
    { id: 'analytics',    label: 'Analytics',         icon: BarChart2 },
    { id: 'ai-assistant', label: 'AI Assistant',      icon: Sparkles,  badge: 'AI' },
    { id: 'data-sources', label: 'Data Sources',      icon: Wifi },
    { id: 'model',        label: 'AI Model',          icon: Brain },
  ];

  return (
    <div className="w-16 md:w-56 bg-[#0B0F19] border-r border-gray-800 flex flex-col justify-between shrink-0 z-40 select-none">
      {/* Top Branding Section */}
      <div className="p-3 border-b border-gray-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-orange-500/20 shrink-0">
          <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />
          </div>
        </div>

        <div className="hidden md:block">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold tracking-tight text-white">Flame<span className="text-orange-500">X</span></span>
            <span className="px-1.5 py-0.2 text-[9px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">COMMAND</span>
          </div>
          <p className="text-[10px] text-gray-400 truncate">AI Thermal Intelligence</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <div className="hidden md:block px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">
          Command Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onTabChange(item.id as ActiveTabType)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold shadow-lg shadow-orange-600/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="hidden md:block truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span className="hidden md:block px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/40 text-orange-300 border border-orange-500/30">
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

      {/* Bottom Live System Indicator */}
      <div className="p-3 border-t border-gray-800 hidden md:block">
        <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400 font-medium">FIRMS Satellite</span>
            <span className="flex items-center gap-1 text-emerald-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          </div>
          <div className="text-[10px] text-gray-500 truncate">
            MODIS/VIIRS Sensor Active
          </div>
        </div>
      </div>
    </div>
  );
};
