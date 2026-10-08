import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Clock, TrendingUp, Users, Building, DollarSign, AlertCircle } from 'lucide-react';
import { SchemeEvolutionSnapshot } from '../types';

interface SchemeEvolutionTimelineProps {
  history: SchemeEvolutionSnapshot[];
}

export const SchemeEvolutionTimeline: React.FC<SchemeEvolutionTimelineProps> = ({ history }) => {
  const [selectedEpochIndex, setSelectedEpochIndex] = useState<number>(history.length - 1);
  const activeSnapshot = history[selectedEpochIndex] || history[0];

  const chartData = history.map((h) => ({
    name: h.epoch_label.split(' ')[0],
    fullLabel: h.epoch_label,
    exposure: h.financial_exposure,
    risk: h.risk_score,
    claims: h.claim_volume,
  }));

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Scheme Evolution Radar (Day 0 → Day 90)
            </h3>
            <p className="text-xs text-slate-400">Tracks expansion of providers, facilities, volume, and exposure over time</p>
          </div>
        </div>

        {/* Epoch Selector Buttons */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {history.map((h, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedEpochIndex(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                selectedEpochIndex === idx
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {h.epoch_label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Epoch Detail Banner */}
      {activeSnapshot && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 mb-4">
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Observation Window</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{activeSnapshot.date_start} → {activeSnapshot.date_end}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Linked Entities</p>
            <p className="text-xs font-bold text-sky-400 mt-0.5 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>{activeSnapshot.active_providers_count} Prov • {activeSnapshot.active_facilities_count} Fac</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Claim Volume</p>
            <p className="text-xs font-bold text-slate-200 mt-0.5">{activeSnapshot.claim_volume} claims</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Cumulative Paid</p>
            <p className="text-xs font-bold text-rose-400 mt-0.5 font-mono">
              ${activeSnapshot.financial_exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Risk Level</p>
            <p className="text-xs font-bold text-amber-400 mt-0.5 font-mono">{activeSnapshot.risk_score} / 100</p>
          </div>
        </div>
      )}

      {/* Evolution Area Chart */}
      <div className="w-full h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="exposureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip
              content={({ payload, label }) => {
                if (payload && payload.length > 0) {
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="font-bold text-white">{label}</p>
                      <p className="text-rose-400">Exposure: ${payload[0]?.value?.toLocaleString()}</p>
                      <p className="text-sky-400">Risk Score: {payload[1]?.value} / 100</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="exposure" 
              stroke="#ef4444" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#exposureGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="risk" 
              stroke="#0ea5e9" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#riskGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
