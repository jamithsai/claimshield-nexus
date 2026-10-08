import React from 'react';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface RiskVelocitySparkProps {
  velocity: number;
  showText?: boolean;
  compact?: boolean;
}

export const RiskVelocitySpark: React.FC<RiskVelocitySparkProps> = ({ 
  velocity = 0, 
  showText = true,
  compact = false 
}) => {
  const isAccelerating = velocity >= 30.0;
  const isModerate = velocity >= 15.0 && velocity < 30.0;

  const badgeClass = isAccelerating
    ? 'bg-rose-50 text-rose-800 border border-rose-200 font-bold'
    : isModerate
    ? 'bg-amber-50 text-amber-800 border border-amber-200 font-bold'
    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold';

  const label = isAccelerating
    ? 'Accelerating'
    : isModerate
    ? 'Moderate'
    : 'Stable';

  if (compact) {
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono ${badgeClass}`}>
        <Zap className="w-3 h-3 text-rose-600" />
        <span>+{velocity.toFixed(1)}</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-xs font-mono ${badgeClass}`}>
      <Zap className="w-3 h-3" />
      <span>+{velocity.toFixed(1)} pts/mo</span>
      {showText && <span className="text-[10px] font-sans font-medium uppercase text-slate-500">({label})</span>}
    </div>
  );
};
