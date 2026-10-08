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
  profile?: any;
  history?: SchemeEvolutionSnapshot[];
}

export const SchemeEvolutionTimeline: React.FC<SchemeEvolutionTimelineProps> = ({ 
  profile,
  history: directHistory 
}) => {
  const history: SchemeEvolutionSnapshot[] = directHistory || profile?.evolution_snapshots || [
    {
      epoch_label: 'Day 0 - Baseline',
      date_start: '2025-10-01',
      date_end: '2025-10-31',
      active_providers_count: 1,
      active_facilities_count: 1,
      claim_volume: 42,
      financial_exposure: 12400,
      risk_score: 18.5,
      dominant_fwa_pattern: 'Normal Baseline',
    },
    {
      epoch_label: 'Day 30 - Emerging',
      date_start: '2025-11-01',
      date_end: '2025-11-30',
      active_providers_count: 2,
      active_facilities_count: 2,
      claim_volume: 98,
      financial_exposure: 41200,
      risk_score: 46.2,
      dominant_fwa_pattern: 'Modifier-25 Inception',
    },
    {
      epoch_label: 'Day 60 - Accelerating',
      date_start: '2025-12-01',
      date_end: '2025-12-31',
      active_providers_count: 3,
      active_facilities_count: 2,
      claim_volume: 247,
      financial_exposure: 118500,
      risk_score: 76.7,
      dominant_fwa_pattern: 'High-Volume Upcoding',
    },
    {
      epoch_label: 'Day 90 - High Risk Burst',
      date_start: '2026-01-01',
      date_end: '2026-01-31',
      active_providers_count: 4,
      active_facilities_count: 3,
      claim_volume: 412,
      financial_exposure: 215400,
      risk_score: 89.4,
      dominant_fwa_pattern: 'Collusive Ring Burst',
    },
  ];

  const [selectedEpochIndex, setSelectedEpochIndex] = useState<number>(history.length - 2);
  const activeSnapshot = history[selectedEpochIndex] || history[0];

  const chartData = history.map((h, i) => ({
    name: h.epoch_label.split(' - ')[0],
    fullLabel: h.epoch_label,
    exposure: h.financial_exposure,
    risk: h.risk_score,
    claims: h.claim_volume,
    isProjected: i >= history.length - 1,
  }));

  return (
    <div className="w-full space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Longitudinal Scheme Evolution
            </h3>
            <p className="text-[11px] text-slate-500">Tracks expansion of providers, facilities, volume, and exposure over 30-day epochs</p>
          </div>
        </div>

        {/* Epoch Selector Buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {history.map((h, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedEpochIndex(idx)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                selectedEpochIndex === idx
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {h.epoch_label.split(' - ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Epoch Detail Banner */}
      {activeSnapshot && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Epoch Window</p>
            <p className="font-bold text-slate-900 mt-0.5">{activeSnapshot.date_start} &rarr; {activeSnapshot.date_end}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Linked Entities</p>
            <p className="font-bold text-sky-700 mt-0.5 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5" />
              <span>{activeSnapshot.active_providers_count} Prov • {activeSnapshot.active_facilities_count} Fac</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Encounter Volume</p>
            <p className="font-bold text-slate-900 mt-0.5 tabular-nums">{activeSnapshot.claim_volume} claims</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Cumulative Exposure</p>
            <p className="font-bold text-rose-700 mt-0.5 font-mono tabular-nums">
              ${activeSnapshot.financial_exposure.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-semibold uppercase">Risk Level</p>
            <p className="font-bold text-amber-700 mt-0.5 font-mono tabular-nums">{activeSnapshot.risk_score.toFixed(1)} / 100</p>
          </div>
        </div>
      )}

      {/* Evolution Area Chart */}
      <div className="w-full h-60 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="exposureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip
              content={({ payload, label }) => {
                if (payload && payload.length > 0) {
                  return (
                    <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-md text-xs space-y-1">
                      <p className="font-bold text-slate-900">{label}</p>
                      <p className="text-rose-700 font-mono font-bold">Exposure: ${payload[0]?.value?.toLocaleString()}</p>
                      <p className="text-sky-700 font-mono">Risk Score: {payload[1]?.value} / 100</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="exposure" 
              name="Exposure ($)"
              stroke="#dc2626" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#exposureGradient)" 
            />
            <Area 
              type="monotone" 
              dataKey="risk" 
              name="Risk Score"
              stroke="#0284c7" 
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
