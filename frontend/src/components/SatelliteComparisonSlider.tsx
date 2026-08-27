import React, { useState } from 'react';
import { OpticalMetadata } from '../types';
import { Sliders, Layers } from 'lucide-react';

interface SatelliteComparisonSliderProps {
  optical: OpticalMetadata;
}

export const SatelliteComparisonSlider: React.FC<SatelliteComparisonSliderProps> = ({ optical }) => {
  const [sliderPos, setSliderPos] = useState(50); // 0 to 100%

  return (
    <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-gray-300">
        <span className="flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-orange-500" />
          <span>Optical Satellite Comparison (Sentinel-2 10m)</span>
        </span>
        <span className="text-gray-400 font-mono text-[11px]">← BEFORE | CURRENT →</span>
      </div>

      {/* Interactive Visual Slider Box */}
      <div className="relative w-full h-44 rounded-lg overflow-hidden border border-gray-800 bg-black">
        {/* BEFORE Patch (Left Layer) */}
        <div className="absolute inset-0 bg-emerald-950/60 flex flex-col items-center justify-center p-4">
          <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">BEFORE (Aug 20)</span>
          <p className="text-[11px] text-gray-400 mt-1">Sentinel-2 True Color RGB</p>
          <div className="w-16 h-16 mt-2 rounded border border-emerald-500/40 bg-emerald-900/30 flex items-center justify-center text-[10px] text-emerald-300">
            Industrial Complex
          </div>
        </div>

        {/* CURRENT Patch (Right Layer Overlay clipped by slider) */}
        <div
          className="absolute top-0 right-0 bottom-0 bg-orange-950/90 border-l-2 border-orange-500 flex flex-col items-center justify-center p-4 shadow-2xl transition-all"
          style={{ width: `${100 - sliderPos}%` }}
        >
          <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">CURRENT (Active Fire)</span>
          <p className="text-[11px] text-gray-300 mt-1">SWIR Thermal Fire Patch</p>
          <div className="w-16 h-16 mt-2 rounded border border-orange-500 bg-orange-600/40 flex items-center justify-center text-xl font-bold text-yellow-300 animate-pulse">
            🔥
          </div>
        </div>
      </div>

      {/* Slider Range Control */}
      <div className="space-y-1">
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
        <div className="flex justify-between text-[10px] font-mono text-gray-400">
          <span>100% Baseline</span>
          <span>50/50 Compare</span>
          <span>100% Active Thermal</span>
        </div>
      </div>
    </div>
  );
};
