import React from 'react';
import { Zap, TrendingUp, AlertTriangle } from 'lucide-react';

interface RiskVelocitySparkProps {
  velocity: number;
  compact?: boolean;
}

export const RiskVelocitySpark: React.FC<RiskVelocitySparkProps> = ({ velocity, compact = false }) => {
  const isAccelerating = velocity >= 30.0;
  const isModerate = velocity >= 15.0 && velocity < 30.0;

  const badgeClass = isAccelerating
    ? 'bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse'
    : isModerate
    ? 'bg-amber-950/80 text-amber-300 border-amber-800'
    : 'bg-emerald-950/80 text-emerald-300 border-emerald-800';

  const label = isAccelerating
    ? 'ACCELERATING ESCALATION'
    : isModerate
    ? 'MODERATE GROWTH'
    : 'STATIC TRAJECTORY';

  if (compact) {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full border text-[11px] font-bold ${badgeClass}`}>
        <Zap className="w-3 h-3" />
        <span>+{velocity.toFixed(1)} pts</span>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Dynamic Risk Velocity</h4>
            <p className="text-lg font-black text-white font-mono mt-0.5">
              +{velocity.toFixed(1)} <span className="text-xs font-semibold text-slate-400">pts / 60 days</span>
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full border text-xs font-bold ${badgeClass}`}>
          {label}
        </div>
      </div>
    </div>
  );
};
