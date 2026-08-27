import React, { useState, useRef, useEffect } from 'react';
import { Flame, Factory, Database, ShieldAlert, Zap, Radio, Search, Download, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { AnalyticsSummary } from '../types';

interface TopKPIBarProps {
  summary: AnalyticsSummary | null;
  onSearchSubmit?: (query: string) => void;
  onSelectPreset?: (preset: string) => void;
}

const SEARCH_SUGGESTIONS = [
  { text: 'Show abnormal activity in refineries today', preset: 'abnormal_fires', icon: '🚨' },
  { text: 'XYZ Petrochemical Complex (Event #1)', eventId: 1, icon: '🔥' },
  { text: 'Persistent flaring sources near LNG terminals', preset: 'persistent_flares', icon: '🟠' },
  { text: 'Natural wildfires in forest buffer zones', category: 'forest_fire', icon: '🟢' },
  { text: 'High severity alerts requiring immediate action', severity: 'HIGH', icon: '⚠️' }
];

export const TopKPIBar: React.FC<TopKPIBarProps> = ({ summary, onSearchSubmit, onSelectPreset }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery);
      setIsSuggestionsOpen(false);
    }
  };

  const handleSelectSuggestion = (s: typeof SEARCH_SUGGESTIONS[0]) => {
    setSearchQuery(s.text);
    setIsSuggestionsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(s.text);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    // Create quick client-side CSV report
    const headers = "Event_ID,Classification,Facility_Name,Severity,FRP_MW,Temperature_K,Persistence_Score,Anomaly_Ratio,Status\n";
    const sampleRows = [
      "FL-1042,industrial_fire,XYZ Petrochemical Complex,HIGH,380.0,395.4,0.35,3.8,ABNORMAL",
      "FL-1088,gas_flare,Southern Gas Processing Plant #04,MEDIUM,115.0,338.2,0.92,1.2,NORMAL",
      "FL-1102,gas_flare,Coastal LNG Terminal,MEDIUM,145.0,342.0,0.88,1.4,NORMAL",
      "FL-1154,forest_fire,Western Forest Reserve,HIGH,210.0,365.1,0.05,1.0,NATURAL",
      "FL-1190,agricultural_burn,Krishna Valley Agricultural Zone,LOW,45.0,322.0,0.10,1.0,NATURAL",
      "FL-1210,industrial_fire,Steel Smelter Works 02,HIGH,265.0,378.0,0.40,2.6,ABNORMAL"
    ].join("\n");

    const blob = new Blob([headers + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FlameX_Investigation_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsExporting(false), 800);
  };

  return (
    <div className="h-14 bg-[#0B0F19] border-b border-gray-800 px-4 flex items-center justify-between gap-3 text-xs shrink-0 z-30">
      {/* KPI Cards Strip */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1 flex-1">
        {/* Active Events */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-900/90 border border-gray-800 shrink-0">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Active Thermal</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-white leading-tight">{summary?.total_events || 127}</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +12%
              </span>
            </div>
          </div>
        </div>

        {/* Industrial Fires */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-red-950/20 border border-red-500/30 shrink-0">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
            <Factory className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-red-400 font-semibold uppercase tracking-wider">Industrial Fires</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-red-400 leading-tight">{summary?.industrial_fires || 18}</span>
              <span className="text-[10px] font-mono text-red-400 font-bold flex items-center">
                <ArrowUpRight className="w-3 h-3" /> +2 new
              </span>
            </div>
          </div>
        </div>

        {/* Persistent Sources */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-amber-950/20 border border-amber-500/30 shrink-0">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Persistent Sources</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-amber-300 leading-tight">{summary?.gas_flares || 34}</span>
              <span className="text-[10px] font-mono text-gray-400 font-bold flex items-center">
                30d avg
              </span>
            </div>
          </div>
        </div>

        {/* High Severity Alerts */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/40 shrink-0">
          <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
            <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-red-300 font-bold uppercase tracking-wider">Critical Alerts</div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold font-mono text-red-500 leading-tight">{summary?.high_severity_alerts || 9}</span>
              <span className="text-[10px] font-mono text-red-400 font-bold">
                Requires Action
              </span>
            </div>
          </div>
        </div>

        {/* Live Satellite Feed */}
        <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 shrink-0 text-gray-400 font-mono text-[11px]">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Last Sync: <strong className="text-white">4 min ago</strong> (FIRMS)</span>
        </div>
      </div>

      {/* Right Controls: Search + Export Report */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search Bar with Auto-Suggestions */}
        <div ref={searchRef} className="relative hidden md:block w-72 lg:w-80">
          <form onSubmit={handleSearch} className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSuggestionsOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facility, anomaly, or query..."
              className="w-full bg-gray-900/90 border border-gray-700 text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-orange-500 transition placeholder-gray-500"
            />
          </form>

          {/* Suggestions Dropdown */}
          {isSuggestionsOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-gray-800 text-xs">
              <div className="p-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Suggested Inquiries
              </div>
              {SEARCH_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectSuggestion(s)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-800 flex items-center gap-2 text-gray-200 hover:text-orange-400 transition"
                >
                  <span>{s.icon}</span>
                  <span className="truncate">{s.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Download CSV Report Button */}
        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shrink-0"
          title="Download full investigation report as CSV"
        >
          <Download className={`w-3.5 h-3.5 text-orange-400 ${isExporting ? 'animate-bounce' : ''}`} />
          <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Export Report'}</span>
        </button>
      </div>
    </div>
  );
};

