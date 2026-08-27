import React from 'react';
import { X, ShieldAlert, Check, Bell, Flame, Zap, Clock } from 'lucide-react';
import { Alert } from '../types';

interface AlertCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAcknowledgeAlert: (alertId: number) => void;
  onSelectEvent: (eventId: number) => void;
}

export const AlertCenterModal: React.FC<AlertCenterModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onAcknowledgeAlert,
  onSelectEvent
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[3000] flex items-center justify-center p-4 text-sm">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-base font-bold text-white">System Alert Center</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-mono text-xs font-semibold">
              {alerts.filter(a => !a.acknowledged).length} Unacknowledged
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <Bell className="w-8 h-8 text-gray-600 mx-auto" />
              <p>No active system alerts detected.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition space-y-2 ${
                  alert.acknowledged
                    ? 'bg-gray-900/40 border-gray-800 opacity-60'
                    : alert.severity === 'HIGH'
                    ? 'bg-red-950/20 border-red-500/40 shadow-lg shadow-red-950/30'
                    : 'bg-amber-950/20 border-amber-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                      alert.severity === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono font-bold text-orange-400 text-xs">
                      {alert.alert_type}
                    </span>
                  </div>

                  <span className="text-gray-400 text-xs flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-xs text-gray-200 leading-relaxed font-medium">
                  {alert.message}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                  <button
                    onClick={() => {
                      onSelectEvent(alert.event_id);
                      onClose();
                    }}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2"
                  >
                    View Event Inspection Panel →
                  </button>

                  {!alert.acknowledged ? (
                    <button
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Acknowledge</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Acknowledged
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
