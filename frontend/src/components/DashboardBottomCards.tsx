import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardBottomCardsProps {
  onViewAllFacilities?: () => void;
}

const timelineData = [
  { date: '20 Aug', all_events: 42, industrial_fires: 6 },
  { date: '21 Aug', all_events: 55, industrial_fires: 8 },
  { date: '22 Aug', all_events: 48, industrial_fires: 7 },
  { date: '23 Aug', all_events: 68, industrial_fires: 11 },
  { date: '24 Aug', all_events: 75, industrial_fires: 9 },
  { date: '25 Aug', all_events: 94, industrial_fires: 12 },
  { date: '26 Aug', all_events: 128, industrial_fires: 14 }
];

const eventTypeData = [
  { name: 'Industrial Fire', count: 14, pct: '10.9%', color: '#EF4444' },
  { name: 'Persistent Source', count: 27, pct: '21.1%', color: '#F97316' },
  { name: 'Wildfire', count: 31, pct: '24.2%', color: '#EAB308' },
  { name: 'Agricultural Burn', count: 16, pct: '12.5%', color: '#22C55E' },
  { name: 'Mining Activity', count: 9, pct: '7.0%', color: '#A855F7' },
  { name: 'Unknown', count: 31, pct: '24.2%', color: '#6B7280' }
];

const topFacilitiesData = [
  { name: 'XYZ Petrochemical Complex', count: 4, width: '100%' },
  { name: 'ABC Refinery', count: 3, width: '75%' },
  { name: 'Power Plant 04', count: 2, width: '50%' },
  { name: 'Steel Plant 02', count: 2, width: '50%' },
  { name: 'LNG Terminal 01', count: 1, width: '25%' }
];

const alertSummaryData = [
  { name: 'Critical', count: 3, color: '#EF4444' },
  { name: 'High', count: 3, color: '#F97316' },
  { name: 'Medium', count: 2, color: '#EAB308' },
  { name: 'Low', count: 1, color: '#22C55E' }
];

export const DashboardBottomCards: React.FC<DashboardBottomCardsProps> = ({ onViewAllFacilities }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 p-3.5 bg-[#0B0F17] border-t border-[#1E2738] shrink-0 select-none text-xs">
      {/* CARD 1: Events Over Time */}
      <div className="p-4 rounded-2xl bg-[#101623] border border-[#1E2738] flex flex-col justify-between space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-[11px] text-gray-300">Events Over Time <span className="text-gray-500 font-normal">(Last 7 Days)</span></span>
        </div>

        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5 text-orange-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
            <span>All Events</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
            <span>Industrial Fires</span>
          </div>
        </div>

        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2738" />
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 9 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 9 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111724', borderColor: '#232D40', borderRadius: '0.5rem', fontSize: '11px' }}
              />
              <Line type="monotone" dataKey="all_events" stroke="#FF6B00" strokeWidth={2} dot={{ fill: '#FF6B00', r: 3 }} />
              <Line type="monotone" dataKey="industrial_fires" stroke="#EF4444" strokeWidth={2} dot={{ fill: '#EF4444', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CARD 2: Events By Type */}
      <div className="p-4 rounded-2xl bg-[#101623] border border-[#1E2738] flex flex-col justify-between space-y-2">
        <span className="font-bold uppercase tracking-wider text-[11px] text-gray-300">Events By Type</span>

        <div className="flex items-center gap-2">
          {/* Donut Chart with Center Total */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventTypeData}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={42}
                  stroke="none"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold font-mono text-white leading-none">128</span>
              <span className="text-[8px] text-gray-400">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-1 text-[10px]">
            {eventTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-gray-300">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </div>
                <span className="font-mono text-gray-400 shrink-0 ml-1">{item.count} ({item.pct})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD 3: Top Facilities By Events */}
      <div className="p-4 rounded-2xl bg-[#101623] border border-[#1E2738] flex flex-col justify-between space-y-2">
        <span className="font-bold uppercase tracking-wider text-[11px] text-gray-300">Top Facilities By Events</span>

        <div className="space-y-2">
          {topFacilitiesData.map((fac) => (
            <div key={fac.name} className="space-y-0.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-gray-300 font-semibold truncate">{fac.name}</span>
                <span className="font-mono font-bold text-white ml-2">{fac.count}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-[#FF6B00]" style={{ width: fac.width }} />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onViewAllFacilities}
          className="text-[10px] font-bold text-gray-400 hover:text-orange-400 transition text-center pt-1"
        >
          View All Facilities →
        </button>
      </div>

      {/* CARD 4: Alert Summary */}
      <div className="p-4 rounded-2xl bg-[#101623] border border-[#1E2738] flex flex-col justify-between space-y-2">
        <span className="font-bold uppercase tracking-wider text-[11px] text-gray-300">Alert Summary</span>

        <div className="flex items-center gap-3">
          {/* Donut Chart with Center Total */}
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={alertSummaryData}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={42}
                  stroke="none"
                >
                  {alertSummaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold font-mono text-white leading-none">9</span>
              <span className="text-[8px] text-gray-400">Total</span>
            </div>
          </div>

          {/* Legend Breakdown */}
          <div className="flex-1 space-y-1.5 text-[11px]">
            {alertSummaryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-white">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
