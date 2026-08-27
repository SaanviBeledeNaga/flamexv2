import React, { useState } from 'react';
import { Flame, Sparkles, Send, ChevronRight, Zap } from 'lucide-react';

interface AICopilotBarProps {
  onApplyPresetQuery: (presetType: string) => void;
  onOpenInsights?: () => void;
}

export const AICopilotBar: React.FC<AICopilotBarProps> = ({ onApplyPresetQuery, onOpenInsights }) => {
  const [inputQuery, setInputQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const q = inputQuery.toLowerCase();
    if (q.includes('abnormal') || q.includes('fire') || q.includes('today')) {
      onApplyPresetQuery('abnormal_fires');
    } else if (q.includes('flare') || q.includes('persistent')) {
      onApplyPresetQuery('persistent_flares');
    } else {
      onApplyPresetQuery('all');
    }
  };

  return (
    <div className="bg-[#0D121D] border-b border-[#1E2738] px-5 py-2.5 flex items-center justify-between gap-4 text-xs shrink-0 select-none z-20">
      {/* Left Input Field */}
      <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-3 max-w-4xl">
        <div className="flex items-center gap-2 text-orange-400 font-bold shrink-0 text-xs">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Flame className="w-3.5 h-3.5 fill-orange-500/30" />
          </div>
          <span>Ask FlameX AI Copilot:</span>
        </div>

        <div className="relative flex-1">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder='e.g., "Which industrial facilities have abnormal thermal activity today?"'
            className="w-full bg-[#131926] border border-[#232D40] text-gray-200 rounded-xl pl-3.5 pr-9 py-2 text-xs focus:outline-none focus:border-orange-500 transition placeholder-gray-500 font-medium"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 p-1 rounded-lg text-gray-400 hover:text-orange-400 transition"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Right Action: View AI Insights */}
      <button
        onClick={onOpenInsights}
        className="px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/40 text-orange-400 hover:text-orange-300 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-orange-500/10 shrink-0"
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
        <span>View AI Insights</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
