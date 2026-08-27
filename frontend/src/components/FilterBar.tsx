import React from 'react';
import { Filter, RotateCcw, AlertTriangle, Factory, Flame, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  totalFilteredCount
}) => {
  const updateField = (field: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [field]: value });
  };

  return (
    <div className="h-12 bg-[#0B0F19] border-b border-gray-800 px-4 md:px-6 flex items-center justify-between shrink-0 text-xs gap-3 overflow-x-auto select-none">
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="flex items-center gap-1.5 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
          <Filter className="w-3.5 h-3.5 text-orange-500" />
          <span>Filters:</span>
        </div>

        {/* Classification Filter (SIH Aligned) */}
        <select
          value={filters.classification}
          onChange={(e) => updateField('classification', e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500 font-semibold"
        >
          <option value="all">🔥 All Thermal Events</option>
          <option value="industrial_fire">🔴 Industrial Fires</option>
          <option value="gas_flare">🟠 Persistent Sources (Gas Flares)</option>
          <option value="forest_fire">🟢 Natural Fires (Wildfires)</option>
          <option value="agricultural_burn">🟢 Agricultural Crop Burns</option>
          <option value="mining_activity">⛏️ Mining Thermal Activity</option>
          <option value="unknown">⚪ Abnormal / Uncertain</option>
        </select>

        {/* Severity Level Filter */}
        <select
          value={filters.severity}
          onChange={(e) => updateField('severity', e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500 font-semibold"
        >
          <option value="all">All Risk Levels</option>
          <option value="HIGH">🚨 High Risk (Critical)</option>
          <option value="MEDIUM">⚠️ Medium Risk</option>
          <option value="LOW">🟢 Low Risk</option>
        </select>

        {/* Facility Context Filter */}
        <select
          value={filters.facility_type}
          onChange={(e) => updateField('facility_type', e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-orange-500 font-semibold hidden lg:block"
        >
          <option value="all">All Industrial Facilities</option>
          <option value="refinery">Oil Refineries</option>
          <option value="petrochemical">Petrochemical Complexes</option>
          <option value="power_plant">Thermal Power Plants</option>
          <option value="steel">Steel Smelters</option>
          <option value="mining">Mining Zones</option>
          <option value="lng">LNG Gas Terminals</option>
        </select>

        {/* Quick SIH Goal Toggles */}
        <button
          onClick={() => updateField('is_persistent', filters.is_persistent === true ? null : true)}
          className={`px-2.5 py-1 rounded-lg border font-semibold transition text-[11px] flex items-center gap-1 ${
            filters.is_persistent === true
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
              : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
          }`}
        >
          <span>🟠 Persistent (30d)</span>
        </button>

        <button
          onClick={() => updateField('is_abnormal', filters.is_abnormal === true ? null : true)}
          className={`px-2.5 py-1 rounded-lg border font-semibold transition text-[11px] flex items-center gap-1 ${
            filters.is_abnormal === true
              ? 'bg-red-500/20 text-red-300 border-red-500/50 shadow-sm'
              : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
          }`}
        >
          <span>⚡ Abnormal Surges</span>
        </button>
      </div>

      {/* Right Stats & Reset */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-gray-400 font-mono text-[11px]">
          Showing <strong className="text-white font-bold">{totalFilteredCount}</strong> detections
        </span>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition text-xs font-semibold px-2 py-1 rounded hover:bg-gray-800"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

