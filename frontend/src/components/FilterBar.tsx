import React from 'react';
import { Filter, RotateCcw, AlertTriangle, Factory, Flame, Layers } from 'lucide-react';
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
    <div className="h-12 bg-[#0B0F19] border-b border-gray-800 px-6 flex items-center justify-between shrink-0 text-xs gap-4 overflow-x-auto">
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
          <Filter className="w-3.5 h-3.5 text-orange-500" />
          <span>Filters:</span>
        </div>

        {/* Classification Filter */}
        <select
          value={filters.classification}
          onChange={(e) => updateField('classification', e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-orange-500 font-medium"
        >
          <option value="all">All Classifications</option>
          <option value="industrial_fire">🔥 Industrial Fire</option>
          <option value="gas_flare">🏭 Persistent Gas Flare</option>
          <option value="forest_fire">🌲 Wildfire / Forest Fire</option>
          <option value="agricultural_burn">🌾 Agricultural Burn</option>
          <option value="mining_activity">⛏️ Mining Activity</option>
          <option value="unknown">❓ Unknown Anomaly</option>
        </select>

        {/* Severity Filter */}
        <select
          value={filters.severity}
          onChange={(e) => updateField('severity', e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-orange-500 font-medium"
        >
          <option value="all">All Risk Severities</option>
          <option value="HIGH">🚨 High Risk</option>
          <option value="MEDIUM">⚠️ Medium Risk</option>
          <option value="LOW">🟢 Low Risk</option>
        </select>

        {/* Facility Type Filter */}
        <select
          value={filters.facility_type}
          onChange={(e) => updateField('facility_type', e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-orange-500 font-medium"
        >
          <option value="all">All Facility Types</option>
          <option value="refinery">Oil Refinery</option>
          <option value="petrochemical">Petrochemical Works</option>
          <option value="power_plant">Thermal Power Plant</option>
          <option value="steel">Steel Smelter</option>
          <option value="mining">Mining & Quarry</option>
          <option value="lng">LNG Terminal</option>
          <option value="manufacturing">Manufacturing</option>
        </select>

        {/* Persistent Toggle */}
        <button
          onClick={() => updateField('is_persistent', filters.is_persistent === true ? null : true)}
          className={`px-2.5 py-1 rounded-md border font-medium transition ${
            filters.is_persistent === true
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
          }`}
        >
          Persistent Flares
        </button>

        {/* Abnormal Toggle */}
        <button
          onClick={() => updateField('is_abnormal', filters.is_abnormal === true ? null : true)}
          className={`px-2.5 py-1 rounded-md border font-medium transition ${
            filters.is_abnormal === true
              ? 'bg-red-500/20 text-red-300 border-red-500/40'
              : 'bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-700'
          }`}
        >
          ⚡ Abnormal Surges
        </button>
      </div>

      {/* Right Stats & Reset */}
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-gray-400 font-mono text-[11px]">
          Showing <strong className="text-white font-bold">{totalFilteredCount}</strong> thermal anomalies
        </span>

        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-gray-400 hover:text-white transition text-xs"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};
