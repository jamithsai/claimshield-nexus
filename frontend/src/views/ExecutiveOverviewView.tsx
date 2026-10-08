import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  ShieldAlert, 
  FileText, 
  Activity, 
  TrendingUp, 
  Layers, 
  AlertOctagon,
  CheckCircle2, 
  PieChart as PieIcon,
  BarChart2,
  ArrowUpRight,
  Clock,
  ArrowRight,
  Zap,
  Users
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { ExecutiveMetrics } from '../types';
import { api } from '../services/api';

interface ExecutiveOverviewViewProps {
  onSelectCase: (caseId: string) => void;
  onNavigateToQueue: () => void;
}

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  onSelectCase,
  onNavigateToQueue,
}) => {
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [topCases, setTopCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [m, t, q] = await Promise.all([
          api.getMetrics(), 
          api.getTrends(),
          api.getQueue(5, 'priority')
        ]);
        setMetrics(m);
        setTrends(t);
        setTopCases(q.cases || []);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <Activity className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading Healthcare Program Integrity Command Center...</p>
        </div>
      </div>
    );
  }

  // Scheme Bar Data
  const schemeData = Object.entries(metrics.detected_schemes_breakdown).map(([name, count]) => ({
    name: name.split(' (')[0],
    rule: name.includes('(') ? name.split('(')[1].replace(')', '') : '',
    count,
  }));

  // Risk Tier Donut Data
  const tierColors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#d97706',
    MEDIUM: '#2563eb',
    LOW: '#059669',
  };

  const tierData = Object.entries(metrics.risk_tier_distribution).map(([tier, count]) => ({
    name: tier,
    value: count,
    color: tierColors[tier] || '#64748b',
  }));

  return (
    <div className="space-y-6">
      {/* Top Cockpit Header Banner */}
      <div className="cockpit-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-800 bg-[#0f172a]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Program Integrity Command Center</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Population-level multi-detector surveillance across <span className="font-mono text-blue-300 font-bold tabular-nums">{metrics.total_claims_analyzed.toLocaleString()}</span> synthetic claims encounters.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToQueue}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
          >
            <span>Open SIU Priority Queue</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Claims Analyzed */}
        <div className="cockpit-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Claims Analyzed</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">{metrics.total_claims_analyzed.toLocaleString()}</p>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Program Spend:</span>
            <span className="text-slate-200 font-bold font-mono tabular-nums">${(metrics.total_financial_volume_usd / 1000000).toFixed(2)}M</span>
          </div>
        </div>

        {/* Flagged FWA Exposure */}
        <div className="cockpit-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Flagged FWA Exposure</span>
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 font-mono tabular-nums">
            ${(metrics.flagged_fwa_exposure_usd / 1000).toFixed(1)}k
          </p>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span className="text-rose-300/90 font-semibold">{metrics.fwa_exposure_percentage}% of spend</span>
            <span className="text-slate-400 font-mono">Triage target</span>
          </div>
        </div>

        {/* Active Investigation Cases */}
        <div className="cockpit-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Active SIU Cases</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">{metrics.active_investigation_cases}</p>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span className="text-rose-400 font-bold font-mono">{metrics.critical_risk_entities_count} Critical</span>
            <span className="text-amber-400 font-bold font-mono">{metrics.high_risk_entities_count} High Tier</span>
          </div>
        </div>

        {/* Data Quality Index */}
        <div className="cockpit-panel p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Data Quality Index</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{(metrics.data_quality_index_overall * 100).toFixed(1)}%</p>
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
            <span>Zero PHI / Drift</span>
            <span className="text-emerald-400 font-mono font-semibold">Validated</span>
          </div>
        </div>
      </div>

      {/* Main Visualizations Row: 30-Day Epoch Progression & Scheme Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 30-Day Epoch Temporal Progression Area Chart */}
        <div className="lg:col-span-2 cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                30-Day Epoch Temporal Progression (Day 0 → Day 90)
              </h3>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
                <span className="text-slate-400">Normal Baseline</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span className="text-rose-400 font-semibold">Flagged FWA Volume</span>
              </div>
            </div>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="epoch" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  content={({ payload, label }) => {
                    if (payload && payload.length > 0) {
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl text-xs space-y-1">
                          <p className="font-bold text-white">{label} Epoch</p>
                          <p className="text-blue-400 font-mono">Normal Claims: {payload[0]?.value}</p>
                          <p className="text-rose-400 font-mono font-bold">Flagged Claims: {payload[1]?.value}</p>
                          <p className="text-slate-300 font-mono text-[11px]">Exposure: ${(payload[0]?.payload.exposure_usd || 0).toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area type="monotone" dataKey="normal_volume" stackId="1" stroke="#2563eb" fill="#1e3a8a" fillOpacity={0.6} />
                <Area type="monotone" dataKey="flagged_volume" stackId="2" stroke="#dc2626" fill="#7f1d1d" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FWA Scheme Distribution */}
        <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Detected FWA Schemes</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Multi-Detector</span>
          </div>

          <div className="space-y-3 pt-1">
            {schemeData.map((scheme, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{scheme.name}</span>
                  <span className="font-mono font-bold text-blue-400 tabular-nums">{scheme.count} entities</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${Math.min(100, (scheme.count / 15) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escalating Risk Velocity Watchlist Table */}
      <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Top Escalating Investigation Opportunities (Ranked by Multi-Attribute Utility)
            </h3>
          </div>
          <button 
            onClick={onNavigateToQueue}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>View Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Case ID</th>
                <th className="p-3 font-semibold">Target Entity / Provider</th>
                <th className="p-3 font-semibold">Primary Scheme</th>
                <th className="p-3 font-semibold text-right">Exposure ($)</th>
                <th className="p-3 font-semibold text-center">Patients</th>
                <th className="p-3 font-semibold text-center">Risk Velocity</th>
                <th className="p-3 font-semibold text-center">Composite Risk</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {topCases.map((c, i) => {
                const isCritical = c.risk_tier === 'CRITICAL';
                return (
                  <tr key={c.case_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-400">#{i + 1}</td>
                    <td className="p-3 font-mono font-bold text-slate-200">{c.case_id}</td>
                    <td className="p-3">
                      <p className="font-bold text-white">{c.target_entity_name}</p>
                      <p className="text-[11px] text-slate-400">{c.specialty} • NPI: {c.target_entity_id}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                        {c.primary_fwa_pattern}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-rose-400 tabular-nums">
                      ${c.potential_financial_exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-center font-mono text-slate-300 tabular-nums">{c.member_impact_count}</td>
                    <td className="p-3 text-center font-mono">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${c.risk_velocity > 5.0 ? 'text-amber-400 bg-amber-950/80 border border-amber-800' : 'text-slate-400'}`}>
                        {c.risk_velocity > 0 ? `+${c.risk_velocity.toFixed(1)}/mo` : `${c.risk_velocity.toFixed(1)}/mo`}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full border ${isCritical ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-amber-950 text-amber-300 border-amber-800'}`}>
                        {c.composite_risk_score}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onSelectCase(c.case_id)}
                        className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
