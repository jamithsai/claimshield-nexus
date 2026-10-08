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
          <Activity className="w-8 h-8 text-[#209B47] animate-spin" />
          <p className="text-xs font-semibold text-[#042126]/70">Loading Program Integrity Overview...</p>
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

  // Risk Tier Donut Data (Acentra Institutional Semantic Colors)
  const tierColors: Record<string, string> = {
    CRITICAL: '#B91C1C',
    HIGH: '#D97706',
    MEDIUM: '#15497E',
    LOW: '#209B47',
  };

  const tierData = Object.entries(metrics.risk_tier_distribution || {}).map(([tier, count]) => ({
    name: tier,
    value: count,
    color: tierColors[tier] || '#005F68',
  }));

  const totalFlaggedClaims = Object.values(metrics.detected_schemes_breakdown || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Banner */}
      <div className="health-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30">
            <ShieldAlert className="w-5 h-5 text-[#209B47]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#042126] tracking-tight">Program Integrity Overview</h1>
            <p className="text-xs text-[#042126]/70 mt-0.5">
              Monitor claims activity, emerging FWA risk, financial exposure and investigator workload across{' '}
              <span className="font-mono text-[#005F68] font-bold tabular-nums">
                {metrics.total_claims_analyzed.toLocaleString()}
              </span>{' '}
              synthetic encounters.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onNavigateToQueue}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#209B47] hover:bg-[#1B843C] text-white text-xs font-semibold shadow-xs transition-colors"
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
          <div className="flex items-center justify-between text-[#042126]/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Claims Reviewed</span>
            <div className="p-1.5 rounded-md bg-[#042126]/5 text-[#042126]">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#042126] tabular-nums">
              {metrics.total_claims_analyzed.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-[#1B843C] bg-[#E8F8EE] px-2 py-0.5 rounded border border-[#ACF2E5]">
              100% Ingested
            </span>
          </div>
          <p className="text-[11px] text-[#042126]/60 border-t border-[#042126]/10 pt-2">
            Multi-specialty synthetic provider network
          </p>
        </div>

        {/* Card 2: Potential FWA Alerts */}
        <div className="health-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-[#042126]/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Potential FWA Alerts</span>
            <div className="p-1.5 rounded-md bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#B45309] tabular-nums">
              {totalFlaggedClaims.toLocaleString()}
            </span>
            <span className="text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#FDE68A] font-mono">
              {metrics.fwa_exposure_percentage ? `${metrics.fwa_exposure_percentage.toFixed(1)}% Exposure` : 'Dual Engine'}
            </span>
          </div>
          <p className="text-[11px] text-[#042126]/60 border-t border-[#042126]/10 pt-2">
            Triggered by dual-engine consensus
          </p>
        </div>

        {/* Card 3: High-Risk Open Cases */}
        <div className="health-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-[#042126]/60">
            <span className="text-xs font-semibold uppercase tracking-wider">High-Risk Cases</span>
            <div className="p-1.5 rounded-md bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#B91C1C] tabular-nums">
              {metrics.critical_risk_entities_count + metrics.high_risk_entities_count}
            </span>
            <span className="text-[11px] font-semibold text-[#B91C1C] bg-[#FEE2E2] px-2 py-0.5 rounded border border-[#FECACA]">
              Action Required
            </span>
          </div>
          <p className="text-[11px] text-[#042126]/60 border-t border-[#042126]/10 pt-2">
            Composite Risk Score &ge; 50
          </p>
        </div>

        {/* Card 4: Flagged Financial Exposure */}
        <div className="health-panel p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-[#042126]/60">
            <span className="text-xs font-semibold uppercase tracking-wider">Potential Exposure</span>
            <div className="p-1.5 rounded-md bg-[#005F68]/10 text-[#005F68] border border-[#005F68]/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-[#042126] tabular-nums">
              ${(metrics.flagged_fwa_exposure_usd / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] font-semibold text-[#005F68] bg-[#005F68]/10 px-2 py-0.5 rounded border border-[#005F68]/20">
              Flagged Billed
            </span>
          </div>
          <p className="text-[11px] text-[#042126]/60 border-t border-[#042126]/10 pt-2">
            Subject to pre/post-pay recovery review
          </p>
        </div>
      </div>

      {/* 30-Day Epoch Temporal Chart: Longitudinal Surveillance */}
      <div className="health-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-[#042126]">30-Day Epoch Temporal Risk Surveillance</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30 font-semibold">
                Day 0 – 90 Longitudinal View
              </span>
            </div>
            <p className="text-xs text-[#042126]/70 mt-0.5">
              Tracks claim volume and flagged financial exposure as fraudulent schemes transition from baseline billing into active acceleration.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#209B47] inline-block"></span>
              <span className="text-[#042126]/80 font-medium">Daily Encounters</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#B91C1C] inline-block"></span>
              <span className="text-[#042126]/80 font-medium">Flagged Exposure ($)</span>
            </div>
          </div>
        </div>

        <div className="h-[260px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="claimVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#209B47" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#209B47" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="flaggedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#B91C1C" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#B91C1C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(4, 33, 38, 0.08)" />
              <XAxis 
                dataKey="date" 
                stroke="#042126" 
                tick={{ fill: 'rgba(4, 33, 38, 0.65)', fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)} 
              />
              <YAxis 
                stroke="#042126" 
                tick={{ fill: 'rgba(4, 33, 38, 0.65)', fontSize: 11 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: 'rgba(4, 33, 38, 0.15)', 
                  borderRadius: '8px', 
                  color: '#042126',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgba(4, 33, 38, 0.08)'
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
                stroke="#209B47" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#claimVolumeGradient)" 
              />
              <Area 
                type="monotone" 
                dataKey="flagged_amount" 
                name="Flagged ($)"
                stroke="#B91C1C" 
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
              <h2 className="text-sm font-bold text-[#042126]">Detected Scheme Taxonomy Breakdown</h2>
              <p className="text-xs text-[#042126]/70 mt-0.5">Encounters categorized by specific billing anomaly rule triggers</p>
            </div>
            <span className="text-[11px] font-mono text-[#005F68] bg-[#005F68]/10 px-2 py-0.5 rounded border border-[#005F68]/20 font-semibold">
              5 Schemes Active
            </span>
          </div>

          <div className="h-[220px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schemeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(4, 33, 38, 0.08)" horizontal={false} />
                <XAxis type="number" stroke="#042126" tick={{ fill: 'rgba(4, 33, 38, 0.65)', fontSize: 11 }} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#042126" 
                  tick={{ fill: '#042126', fontSize: 11, fontWeight: 500 }} 
                  width={110}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: 'rgba(4, 33, 38, 0.15)', 
                    borderRadius: '8px', 
                    color: '#042126',
                    fontSize: '12px' 
                  }}
                  formatter={(value: any) => [`${value} flagged claims`, 'Volume']}
                />
                <Bar dataKey="count" fill="#005F68" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Tier Donut */}
        <div className="lg:col-span-5 health-panel p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#042126]">Risk Severity Stratification</h2>
              <p className="text-xs text-[#042126]/70 mt-0.5">Distribution of provider entities by risk tier</p>
            </div>
            <div className="p-1 rounded bg-[#042126]/5 text-[#042126]">
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
                      borderColor: 'rgba(4, 33, 38, 0.15)', 
                      borderRadius: '8px', 
                      color: '#042126',
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
                    <span className="font-semibold text-[#042126]">{tier.name}</span>
                  </div>
                  <span className="font-mono font-bold text-[#042126] tabular-nums">{tier.value}</span>
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
            <h2 className="text-sm font-bold text-[#042126]">Priority SIU Triage Watchlist</h2>
            <p className="text-xs text-[#042126]/70 mt-0.5">
              High-yield investigation targets ranked by multi-attribute utility optimization
            </p>
          </div>
          <button
            onClick={onNavigateToQueue}
            className="text-xs font-semibold text-[#005F68] hover:text-[#042126] flex items-center space-x-1"
          >
            <span>View Full Queue ({metrics.critical_risk_entities_count + metrics.high_risk_entities_count} Cases)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto border border-[#042126]/10 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F2FCFF] text-[#042126] font-semibold border-b border-[#042126]/10">
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
            <tbody className="divide-y divide-[#042126]/5">
              {topCases.map((c) => {
                const isCrit = c.risk_tier === 'CRITICAL';
                return (
                  <tr key={c.case_id} className="hover:bg-[#F2FCFF]/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-[#005F68]">{c.case_id}</td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-[#042126]">{c.target_entity_name}</div>
                      <div className="text-[11px] text-[#042126]/60 font-mono">NPI: {c.target_entity_id} • {c.specialty}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#042126]/5 text-[#042126] border border-[#042126]/10">
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
                    <td className="py-3 px-3 text-right font-mono font-bold text-[#042126] tabular-nums">
                      ${c.potential_financial_exposure.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[#042126]/80 tabular-nums">
                      {c.member_impact_count}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onSelectCase(c.case_id)}
                        className="px-3 py-1 rounded bg-[#209B47]/10 hover:bg-[#209B47]/20 text-[#005F68] border border-[#209B47]/30 text-xs font-semibold transition-colors"
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
