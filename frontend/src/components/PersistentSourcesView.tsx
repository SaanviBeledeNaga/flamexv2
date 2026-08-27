import React, { useEffect, useState } from 'react';
import { Database, Activity, AlertTriangle, CheckCircle2, Flame, ExternalLink } from 'lucide-react';
import { PersistentSourceItem } from '../types';
import { fetchPersistentSources } from '../services/api';

interface PersistentSourcesViewProps {
  onSelectEvent: (eventId: number) => void;
}

export const PersistentSourcesView: React.FC<PersistentSourcesViewProps> = ({ onSelectEvent }) => {
  const [sources, setSources] = useState<PersistentSourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPersistentSources()
      .then(setSources)
      .catch((err) => console.error('Failed to load persistent sources:', err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex-1 bg-[#0B0F19] p-6 overflow-y-auto space-y-6 text-sm">
      {/* Header */}
      <div className="border-b border-gray-800 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-500" />
          <span>Persistent Thermal Source Monitoring</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Tracking operational refinery flare stacks and recurring industrial thermal emissions over multi-day rolling windows.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">
          <Activity className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span>Analyzing Historical Thermal Persistence Patterns...</span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-gray-400">
            <span>Showing {sources.length} active persistent thermal flare sources</span>
            <span className="text-amber-400 font-mono font-bold">14-Day Spatial Window</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950 text-gray-400 font-semibold border-b border-gray-800">
                <tr>
                  <th className="p-3">SOURCE ID</th>
                  <th className="p-3">FACILITY</th>
                  <th className="p-3">TYPE</th>
                  <th className="p-3">RECURRENCE FREQUENCY</th>
                  <th className="p-3">PERSISTENCE</th>
                  <th className="p-3">ANOMALY SURGE</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {sources.map((item) => (
                  <tr key={item.event_id} className="hover:bg-gray-800/50 transition">
                    <td className="p-3 font-mono font-bold text-amber-400">
                      {item.external_id}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {item.facility_name}
                    </td>
                    <td className="p-3 font-semibold text-gray-300 capitalize">
                      {item.facility_type.replace('_', ' ')}
                    </td>
                    <td className="p-3 font-mono text-gray-300">
                      {item.frequency_str}
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-300">
                      {item.persistence_score}%
                    </td>
                    <td className="p-3 font-mono">
                      <span className={item.anomaly_ratio >= 1.8 ? 'text-red-400 font-bold' : 'text-gray-300'}>
                        {item.anomaly_ratio}x baseline
                      </span>
                    </td>
                    <td className="p-3">
                      {item.status === 'ABNORMAL' ? (
                        <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 font-bold flex items-center gap-1 w-fit">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                          🔴 ABNORMAL SURGE
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium flex items-center gap-1 w-fit">
                          🟠 Normal Flare
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => onSelectEvent(item.event_id)}
                        className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded text-xs transition flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
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
