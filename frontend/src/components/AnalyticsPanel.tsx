import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';
import { Flame, Factory, Trees, Wheat, HardHat, AlertTriangle, ShieldAlert, Activity, BarChart3, TrendingUp } from 'lucide-react';
import { AnalyticsSummary } from '../types';
import { fetchAnalyticsSummary, fetchAnalyticsTimeline, fetchAnalyticsClassifications, fetchTopAbnormalFacilities } from '../services/api';

export const AnalyticsPanel: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [distData, setDistData] = useState<any>(null);
  const [topAbnormal, setTopAbnormal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchAnalyticsSummary(),
      fetchAnalyticsTimeline(),
      fetchAnalyticsClassifications(),
      fetchTopAbnormalFacilities().catch(() => [])
    ])
      .then(([sum, time, dist, abnormal]) => {
        setSummary(sum);
        setTimeline(time);
        setDistData(dist);
        setTopAbnormal(abnormal);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load analytics:', err);
        setError('Could not connect to the FlameX backend. Make sure the API server is running.');
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
      <Activity className="w-8 h-8 text-orange-500 animate-pulse" />
      <p className="text-sm font-medium">Loading thermal analytics...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-8">
      <AlertTriangle className="w-10 h-10 text-amber-500" />
      <p className="text-sm font-semibold text-white">Analytics Unavailable</p>
      <p className="text-xs text-gray-400 max-w-sm">{error}</p>
      <button
        onClick={() => { setLoading(true); setError(null); }}
        className="mt-2 px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-lg transition"
      >Retry</button>
    </div>
  );

  if (!summary) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-500">
      <BarChart3 className="w-8 h-8" />
      <p className="text-sm">No analytics data available yet.</p>
    </div>
  );

  const pieColors: Record<string, string> = {
    industrial_fire: '#EF4444',
    gas_flare: '#F59E0B',
    forest_fire: '#10B981',
    agricultural_burn: '#84CC16',
    mining_activity: '#8B5CF6',
    unknown: '#6B7280'
  };

  const classPieData = distData?.classifications?.map((item: any) => ({
    name: item.name,
    value: item.count,
    color: pieColors[item.key] || '#6B7280'
  })) || [];

  return (
    <div className="bg-[#0B0F19] border-t border-gray-800 p-4 space-y-4 max-h-[380px] overflow-y-auto shrink-0">
      {/* Metric Cards Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Total Events</span>
          <div className="text-xl font-bold font-mono text-white mt-1">{summary.total_events}</div>
        </div>

        <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-red-400 font-semibold uppercase flex items-center gap-1">
            <Flame className="w-3 h-3" /> Industrial Fires
          </span>
          <div className="text-xl font-bold font-mono text-red-400 mt-1">{summary.industrial_fires}</div>
        </div>

        <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-amber-400 font-semibold uppercase flex items-center gap-1">
            <Factory className="w-3 h-3" /> Gas Flares
          </span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{summary.gas_flares}</div>
        </div>

        <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
            <Trees className="w-3 h-3" /> Wildfires
          </span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{summary.wildfires}</div>
        </div>

        <div className="p-3 rounded-lg bg-lime-950/30 border border-lime-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-lime-400 font-semibold uppercase flex items-center gap-1">
            <Wheat className="w-3 h-3" /> Agri Burns
          </span>
          <div className="text-xl font-bold font-mono text-lime-400 mt-1">{summary.agricultural_burns}</div>
        </div>

        <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 flex flex-col justify-between">
          <span className="text-[10px] text-purple-400 font-semibold uppercase flex items-center gap-1">
            <HardHat className="w-3 h-3" /> Mining Events
          </span>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{summary.mining_activity}</div>
        </div>

        <div className="p-3 rounded-lg bg-red-950/40 border border-red-600/50 flex flex-col justify-between">
          <span className="text-[10px] text-red-300 font-bold uppercase flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-500 animate-pulse" /> High Alerts
          </span>
          <div className="text-xl font-bold font-mono text-red-500 mt-1">{summary.high_severity_alerts}</div>
        </div>

        <div className="p-3 rounded-lg bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Avg Persistence</span>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">{Math.round(summary.avg_persistence_score * 100)}%</div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
        {/* Chart 1: Time Series Timeline */}
        <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
          <div className="font-semibold text-gray-300 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>Thermal Detections Timeline</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 9 }} />
                <YAxis stroke="#6B7280" tick={{ fontSize: 9 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }} 
                  itemStyle={{ color: '#F3F4F6' }} 
                  labelStyle={{ color: '#9CA3AF' }} 
                />
                <Bar dataKey="industrial_fire" name="Industrial Fire" stackId="a" fill="#EF4444" />
                <Bar dataKey="gas_flare" name="Gas Flare" stackId="a" fill="#F59E0B" />
                <Bar dataKey="forest_fire" name="Wildfire" stackId="a" fill="#10B981" />
                <Bar dataKey="agricultural_burn" name="Agri Burn" stackId="a" fill="#84CC16" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Classification Pie Distribution */}
        <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
          <div className="font-semibold text-gray-300 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-amber-500" />
            <span>AI Classification Distribution</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={classPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={55} innerRadius={30}>
                  {classPieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }} 
                  itemStyle={{ color: '#F3F4F6' }} 
                  labelStyle={{ color: '#9CA3AF' }} 
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Facility Type Breakdown */}
        <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
          <div className="font-semibold text-gray-300 flex items-center gap-1.5">
            <Factory className="w-4 h-4 text-emerald-500" />
            <span>Events by Nearest Facility Type</span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData?.facility_types || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 9 }} />
                <YAxis dataKey="name" type="category" stroke="#6B7280" tick={{ fontSize: 9 }} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }} 
                  itemStyle={{ color: '#F3F4F6' }} 
                  labelStyle={{ color: '#9CA3AF' }} 
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section: Top Abnormal Facilities Ranking */}
      {topAbnormal && topAbnormal.length > 0 && (
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-200 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
              <span>Top Abnormal Industrial Facilities (Thermal Intensity Surges)</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500">Ranked by Historical Baseline Deviation</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] text-gray-500 uppercase font-bold">
                  <th className="pb-2">Facility Name</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Max Surge</th>
                  <th className="pb-2">Avg Ratio</th>
                  <th className="pb-2">Active Events</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 font-medium">
                {topAbnormal.map((fac, idx) => (
                  <tr key={idx} className="hover:bg-gray-800/40 transition">
                    <td className="py-2.5 font-bold text-white flex items-center gap-2">
                      <span className="text-orange-500 font-mono">#{idx + 1}</span>
                      <span>{fac.facility_name}</span>
                    </td>
                    <td className="py-2.5 text-gray-400">{fac.facility_type}</td>
                    <td className="py-2.5 font-mono text-red-400 font-bold">{fac.max_anomaly_ratio}× baseline</td>
                    <td className="py-2.5 font-mono text-amber-400">{fac.avg_anomaly_ratio}×</td>
                    <td className="py-2.5 font-mono text-gray-300">{fac.event_count}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        fac.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {fac.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
