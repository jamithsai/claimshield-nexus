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
          <Activity className="w-8 h-8 text-sky-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Loading Program Integrity Overview...</p>
        </div>
      </div>
    );
  }

  // Scheme Bar Data
  const schemeData = Object.entries(metrics.detected_schemes_breakdown || {}).map(([name, count]) => ({
    name: name.split(' (')[0],
    rule: name.includes('(') ? name.split('(')[1].replace(')', '') : '',
    count,
  }));

  // Risk Tier Donut Data
  const tierColors: Record<string, string> = {
    CRITICAL: '#dc2626',
    HIGH: '#d97706',
    MEDIUM: '#2563eb',
    LOW: '#16a34a',
  };

  const tierData = Object.entries(metrics.risk_tier_distribution || {}).map(([tier, count]) => ({
    name: tier,
    value: count,
    color: tierColors[tier] || '#64748b',
  }));

  const totalFlaggedClaims = Object.values(metrics.detected_schemes_breakdown || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Banner */}
      <div className="health-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Program Integrity Overview</h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Monitor claims activity, emerging FWA risk, financial exposure and investigator workload across{' '}
              <span className="font-mono text-sky-700 font-bold tabular-nums">
                {metrics.total_claims_analyzed.toLocaleString()}
              </span>{' '}
              synthetic encounters.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToQueue}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <span>Open SIU Priority Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Claims Reviewed */}
        <div className="health-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Claims Reviewed</span>
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.total_claims_analyzed.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Ingested
            </span>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            Multi-specialty synthetic provider network
          </p>
        </div>

        {/* Card 2: Potential FWA Alerts */}
        <div className="health-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Potential FWA Alerts</span>
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {totalFlaggedClaims.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
              {metrics.fwa_exposure_percentage ? `${metrics.fwa_exposure_percentage.toFixed(1)}% Exposure` : 'Dual Engine'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            Triggered by dual-engine consensus
          </p>
        </div>

        {/* Card 3: High-Risk Open Cases */}
        <div className="health-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">High-Risk Cases</span>
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-700 tabular-nums">
              {metrics.critical_risk_entities_count + metrics.high_risk_entities_count}
            </span>
            <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            Composite Risk Score &ge; 50
          </p>
        </div>

        {/* Card 4: Flagged Financial Exposure */}
        <div className="health-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Potential Exposure</span>
            <div className="p-1.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              ${(metrics.flagged_fwa_exposure_usd / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Flagged Billed
            </span>
          </div>
          <p className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
            Subject to pre/post-pay recovery review
          </p>
        </div>
      </div>

      {/* 30-Day Epoch Temporal Chart: Longitudinal Surveillance */}
      <div className="health-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-slate-900">30-Day Epoch Temporal Risk Surveillance</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                Day 0 – 90 Longitudinal View
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks claim volume and flagged financial exposure as fraudulent schemes transition from baseline billing into active acceleration.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-sky-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Daily Encounters</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block"></span>
              <span className="text-slate-600 font-medium">Flagged Exposure ($)</span>
            </div>
          </div>
        </div>

        <div className="h-[260px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="claimVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="flaggedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)} 
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#64748b', fontSize: 11 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#cbd5e1', 
                  borderRadius: '8px', 
                  color: '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
                formatter={(value: any, name: string) => [
                  name === 'Flagged ($)' ? `$${Number(value).toLocaleString()}` : Number(value).toLocaleString(),
                  name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="total_claims" 
                name="Total Encounters"
                stroke="#0284c7" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#claimVolumeGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="flagged_amount" 
                name="Flagged ($)"
                stroke="#dc2626" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#flaggedGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Scheme Breakdown & Risk Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheme Distribution */}
        <div className="lg:col-span-7 health-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Detected Scheme Taxonomy Breakdown</h2>
              <p className="text-xs text-slate-500 mt-0.5">Encounters categorized by specific billing anomaly rule triggers</p>
            </div>
            <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold">
              5 Schemes Active
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schemeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#64748b" 
                  tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }} 
                  width={110}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#cbd5e1', 
                    borderRadius: '8px', 
                    color: '#0f172a',
                    fontSize: '12px' 
                  }}
                  formatter={(value: any) => [`${value} flagged claims`, 'Volume']}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Tier Donut */}
        <div className="lg:col-span-5 health-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Risk Severity Stratification</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution of provider entities by risk tier</p>
            </div>
            <div className="p-1 rounded bg-slate-100 text-slate-600">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="h-[180px] w-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {tierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1', 
                      borderRadius: '8px', 
                      color: '#0f172a',
                      fontSize: '12px' 
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="space-y-2 flex-1 pl-4">
              {tierData.map((tier) => (
                <div key={tier.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span className="font-semibold text-slate-700">{tier.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 tabular-nums">{tier.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Priority Watchlist Table */}
      <div className="health-panel p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Priority SIU Triage Watchlist</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              High-yield investigation targets ranked by multi-attribute utility optimization
            </p>
          </div>
          <button
            onClick={onNavigateToQueue}
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 flex items-center space-x-1"
          >
            <span>View Full Queue ({metrics.critical_risk_entities_count + metrics.high_risk_entities_count} Cases)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Target Provider / Entity</th>
                <th className="py-2.5 px-3">Primary Scheme</th>
                <th className="py-2.5 px-3 text-right">Composite Risk</th>
                <th className="py-2.5 px-3 text-right">Flagged Exposure</th>
                <th className="py-2.5 px-3 text-right">Members</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topCases.map((c) => {
                const isCrit = c.risk_tier === 'CRITICAL';
                return (
                  <tr key={c.case_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-sky-700">{c.case_id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{c.target_entity_name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">NPI: {c.target_entity_id} • {c.specialty}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {c.primary_fwa_pattern}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
                        isCrit ? 'badge-critical' : 'badge-high'
                      }`}>
                        {c.composite_risk_score.toFixed(1)} / 100
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${c.potential_financial_exposure.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {c.member_impact_count}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectCase(c.case_id)}
                        className="px-3 py-1 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 border border-sky-200 text-xs font-semibold transition-colors"
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
