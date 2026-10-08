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
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#209B47] hover:bg-[#1B843C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Open SIU Priority Queue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive ClaimShield Intelligence Pipeline */}
      <div className="health-panel p-4.5 rounded-xl space-y-3 bg-white border border-[#042126]/10 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-[#209B47]" />
            <h2 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
              ClaimShield Nexus Program Integrity Pipeline
            </h2>
          </div>
          <span className="text-[10px] text-[#005F68] font-semibold bg-[#F2FCFF] px-2 py-0.5 rounded border border-[#042126]/10">
            Click any stage to inspect behavior
          </span>
        </div>

        {/* 7-Step Horizontal Pipeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {[
            {
              id: 'ingestion',
              step: '01',
              title: 'Claims Intake',
              desc: 'Batch EDI 837 encounters',
              details: `Ingests raw synthetic claim records across medical specialties with CPT/HCPCS codes, ICD-10 diagnoses, billing NPIs, and service dates. Currently processing ${metrics.total_claims_analyzed.toLocaleString()} claims.`
            },
            {
              id: 'detection',
              step: '02',
              title: 'FWA Detection',
              desc: 'NCCI rules + ML anomalies',
              details: 'Dual-engine screening evaluates deterministic clinical rules (upcoding, modifier-25 unbundling, phantom billing) alongside an unsupervised Isolation Forest anomaly detector.'
            },
            {
              id: 'synthesis',
              step: '03',
              title: 'Risk Synthesis',
              desc: 'Weighted 0-100 composite',
              details: 'Normalizes and synthesizes signals using the multi-modal formula (0.35 Rule + 0.25 ML + 0.25 Graph + 0.15 Velocity) into a single explainable 0–100 composite risk score.'
            },
            {
              id: 'network_temp',
              step: '04',
              title: 'Network & Velocity',
              desc: 'Collusion rings & 30d epochs',
              details: 'NetworkX bipartite graphs identify shared patient collusion loops and centrality hubs, while the temporal engine calculates 1st and 2nd derivative risk velocity.'
            },
            {
              id: 'prioritization',
              step: '05',
              title: 'SIU Prioritization',
              desc: 'Capacity K=5..50 ranking',
              details: 'Multi-attribute utility optimization ranks cases by risk, financial exposure, velocity, and network centrality, constrained by investigator team capacity.'
            },
            {
              id: 'evidence',
              step: '06',
              title: 'Evidence Review',
              desc: '9-tab clinical console',
              details: 'Special Investigators review the 9-tab workspace, including trace evidence DAGs, 10-D Fraud Genome radar, counterfactual simulators, and statutory AI briefs (42 CFR § 455).'
            },
            {
              id: 'decision',
              step: '07',
              title: 'Human Decision',
              desc: 'SHA-256 Merkle ledger',
              details: 'Human-in-the-loop sign-off logs clinical dispositions to an immutable SHA-256 Merkle chain, requiring secondary authorization for prepayment holds.'
            }
          ].map((stage, idx) => {
            const isSelected = (metrics as any).selectedPipelineStage === stage.id || (!((metrics as any).selectedPipelineStage) && idx === 0);
            return (
              <div
                key={stage.id}
                onClick={() => setMetrics({ ...metrics, selectedPipelineStage: stage.id } as any)}
                className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#209B47]/10 border-[#209B47] shadow-xs'
                    : 'bg-[#F2FCFF] border-[#042126]/10 hover:bg-[#042126]/5'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-[#005F68]">
                  <span>STAGE {stage.step}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#209B47]" />}
                </div>
                <p className="text-xs font-bold text-[#042126] mt-0.5 leading-tight">{stage.title}</p>
                <p className="text-[10px] text-[#042126]/60 mt-0.5 leading-tight truncate">{stage.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Dynamic Pipeline Stage Explanation Card */}
        {(() => {
          const selectedId = (metrics as any).selectedPipelineStage || 'ingestion';
          const pipelineStages: Record<string, { title: string; step: string; desc: string; details: string }> = {
            ingestion: {
              step: '01',
              title: 'Claims Intake & Benchmark Ingestion',
              desc: 'Standardized EDI 837 / CMS-1500 Encounter Ingestion',
              details: `Raw encounter records are ingested and normalized across clinical specialties. Encounters include rendering NPIs, facility identifiers, CPT/HCPCS procedure codes, ICD-10 diagnosis codes, and billed amounts. Currently analyzing ${metrics.total_claims_analyzed.toLocaleString()} synthetic claims with Zero PHI.`
            },
            detection: {
              step: '02',
              title: 'Multi-Modal FWA Detection Engine',
              desc: 'Deterministic NCCI Rules + Unsupervised Isolation Forest ML',
              details: 'Claims are simultaneously screened through deterministic CMS NCCI rules (identifying Level 4/5 upcoding, unbundled modifier-25 procedures, phantom impossible travel, and duplicate submissions) and an unsupervised 10-dimensional Isolation Forest model that isolates statistical anomalies without requiring labeled training fraud.'
            },
            synthesis: {
              step: '03',
              title: 'Multi-Detector Risk Synthesis',
              desc: 'Deterministic & Probabilistic Ensemble Consensus',
              details: 'Multi-modal detection signals are synthesized into a composite 0–100 risk score using verified weighting (0.35 Rule Engine + 0.25 Isolation Forest ML + 0.25 Graph Network + 0.15 Risk Velocity), preventing single-detector false positives while maximizing detection sensitivity.'
            },
            network_temp: {
              step: '04',
              title: 'Healthcare Network & Temporal Intelligence',
              desc: 'Bipartite Graph Centrality & 1st/2nd Derivative Risk Velocity',
              details: 'Constructs bipartite graphs connecting Providers, Billing Facilities, and Beneficiaries to expose hidden collusion rings and shared patient syndicates. The temporal engine calculates the rate of risk escalation (1st derivative) and scheme acceleration (2nd derivative) across 30-day epoch windows.'
            },
            prioritization: {
              step: '05',
              title: 'SIU Workload Capacity Optimization',
              desc: 'Multi-Attribute Utility Prioritization (Capacity K=5..50)',
              details: 'Because Special Investigations Units operate with limited headcount, ClaimShield Nexus ranks cases using a multi-attribute utility function (Risk, Potential Financial Exposure, Velocity, Network Centrality). Toggling investigator capacity (K) dynamically optimizes the caseload for maximum financial recovery.'
            },
            evidence: {
              step: '06',
              title: 'Clinical Investigation Console & Briefs',
              desc: '9-Tab Master-Detail Investigation Workspace',
              details: 'Investigators conduct root-cause analysis through 9 dedicated views: Trace Evidence Accordions, Hierarchical Evidence DAGs, Network Collusion Graphs, 10-D Fraud Genome Radars, 30/60/90-Day Loss Forecasts, Counterfactual What-If Sandboxes, and Automated Clinical Briefs with 42 CFR § 455 citations.'
            },
            decision: {
              step: '07',
              title: 'Human-in-the-Loop Sign-Off & Merkle Audit Trail',
              desc: 'Cryptographic SHA-256 Ledger & Dual-Authorization Gates',
              details: 'Every human finding, chart review note, and operational disposition is cryptographically hashed and sealed to an immutable SHA-256 Merkle chain. High-severity prepayment medical review holds require secondary authorization from a Senior Investigator, ensuring strict regulatory compliance.'
            }
          };
          const currentStage = pipelineStages[selectedId] || pipelineStages.ingestion;
          return (
            <div className="p-3.5 rounded-lg bg-[#F2FCFF] border border-[#209B47]/20 flex items-start space-x-3 text-xs">
              <div className="p-1.5 rounded-md bg-[#209B47]/10 text-[#209B47] font-bold font-mono text-[11px] mt-0.5">
                {currentStage.step}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#042126]">{currentStage.title}</span>
                  <span className="text-[#042126]/30">•</span>
                  <span className="text-[#005F68] font-medium">{currentStage.desc}</span>
                </div>
                <p className="text-[#042126]/80 leading-relaxed">{currentStage.details}</p>
              </div>
            </div>
          );
        })()}
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
