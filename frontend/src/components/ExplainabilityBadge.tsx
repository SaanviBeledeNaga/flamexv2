import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle, Factory, Flame, Trees, Wheat, HardHat } from 'lucide-react';
import { ClassificationClass } from '../types';

interface Props {
  classification: ClassificationClass;
  confidence: number;
  showIconOnly?: boolean;
}

export const getClassConfig = (c: ClassificationClass) => {
  switch (c) {
    case 'industrial_fire':
      return {
        label: 'Industrial Fire',
        color: 'bg-red-500/20 text-red-400 border-red-500/40',
        badgeBg: 'bg-red-600',
        icon: Flame,
        hex: '#EF4444'
      };
    case 'gas_flare':
      return {
        label: 'Persistent Gas Flare',
        color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        badgeBg: 'bg-amber-500',
        icon: Factory,
        hex: '#F59E0B'
      };
    case 'forest_fire':
      return {
        label: 'Wildfire / Forest Fire',
        color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        badgeBg: 'bg-emerald-600',
        icon: Trees,
        hex: '#10B981'
      };
    case 'agricultural_burn':
      return {
        label: 'Agricultural Burn',
        color: 'bg-lime-500/20 text-lime-400 border-lime-500/40',
        badgeBg: 'bg-lime-600',
        icon: Wheat,
        hex: '#84CC16'
      };
    case 'mining_activity':
      return {
        label: 'Mining Thermal Activity',
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
        badgeBg: 'bg-purple-600',
        icon: HardHat,
        hex: '#8B5CF6'
      };
    default:
      return {
        label: 'Unknown Anomaly',
        color: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
        badgeBg: 'bg-gray-600',
        icon: HelpCircle,
        hex: '#6B7280'
      };
  }
};

export const ExplainabilityBadge: React.FC<Props> = ({ classification, confidence }) => {
  const cfg = getClassConfig(classification);
  const Icon = cfg.icon;
  const confPct = Math.round(confidence > 1 ? confidence : confidence * 100);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${cfg.color}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span>{cfg.label}</span>
      <span className="ml-1 px-1.5 py-0.5 rounded bg-black/40 text-xs font-mono">
        {confPct}% conf
      </span>
    </div>
  );
};
