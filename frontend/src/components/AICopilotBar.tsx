import React, { useState } from 'react';
import { Sparkles, Send, Bot, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

interface AICopilotBarProps {
  onApplyPresetQuery: (presetType: string) => void;
}

export const AICopilotBar: React.FC<AICopilotBarProps> = ({ onApplyPresetQuery }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [responseMsg, setResponseMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const q = inputQuery.toLowerCase();
    if (q.includes('abnormal') || q.includes('fire') || q.includes('today')) {
      setResponseMsg('🤖 FlameX AI Copilot: 3 facilities show abnormal thermal activity today. Flagship event: XYZ Refinery (3.8x baseline surge).');
      onApplyPresetQuery('abnormal_fires');
    } else if (q.includes('flare') || q.includes('persistent')) {
      setResponseMsg('🤖 FlameX AI Copilot: 34 persistent thermal flare sources identified across refineries and LNG terminals.');
      onApplyPresetQuery('persistent_flares');
    } else {
      setResponseMsg(`🤖 FlameX AI Copilot: Analyzed queries for "${inputQuery}". Filtered active map view to matching thermal anomalies.`);
      onApplyPresetQuery('all');
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800 px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shrink-0 z-30">
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 max-w-2xl">
        <div className="flex items-center gap-1.5 text-orange-400 font-bold shrink-0">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span>Ask FlameX AI Copilot:</span>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder='e.g., "Which industrial facilities have abnormal thermal activity today?"'
            className="w-full bg-black/60 border border-gray-700 text-white rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:border-orange-500"
          />
          <button type="submit" className="absolute right-2 top-2 text-gray-400 hover:text-orange-400">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {responseMsg && (
        <div className="flex items-center justify-between gap-2 bg-orange-500/10 border border-orange-500/30 px-3 py-1 rounded-lg text-orange-300 animate-fadeIn text-xs">
          <span>{responseMsg}</span>
          <button onClick={() => setResponseMsg(null)} className="text-gray-400 hover:text-white font-bold ml-2">×</button>
        </div>
      )}
    </div>
  );
};
