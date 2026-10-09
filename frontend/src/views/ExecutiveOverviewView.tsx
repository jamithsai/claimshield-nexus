import React, { useEffect, useState, useMemo } from 'react';
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
  ArrowRight, 
  ArrowDown,
  Zap, 
  Users, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  ShieldCheck,
  Compass,
  ArrowUpRight
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
import { useCurrency } from '../context/CurrencyContext';

interface ExecutiveOverviewViewProps {
  onSelectCase: (caseId: string) => void;
  onNavigateToQueue: () => void;
}

export const ExecutiveOverviewView: React.FC<ExecutiveOverviewViewProps> = ({
  onSelectCase,
  onNavigateToQueue,
}) => {
  const { currencySymbol, formatMoney, formatCompactMoney, formatAxisMoney } = useCurrency();
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [topCases, setTopCases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPipelineStage, setSelectedPipelineStage] = useState<string | null>(null);
  const [showPipeline, setShowPipeline] = useState(false);

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

  const scrollToIntelligence = () => {
    const el = document.getElementById('portfolio-intelligence');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Chart Data with robust fallback normalization
  const chartData = useMemo(() => {
    if (!trends || trends.length === 0) return [];
    return trends.map((t, idx) => {
      const epochLabel = t.epoch || t.date || `Day ${idx * 30}`;
      const totalEncounters = t.total_claims ?? t.total_encounters ?? ((t.normal_volume || 0) + (t.flagged_volume || 0));
      const flaggedExposure = t.flagged_amount ?? t.exposure_usd ?? 0;
      const avgRisk = t.avg_risk ?? 0;
      return {
        ...t,
        epoch: epochLabel,
        displayLabel: epochLabel,
        total_claims: totalEncounters,
        total_encounters: totalEncounters,
        flagged_amount: flaggedExposure,
        exposure_usd: flaggedExposure,
        avg_risk: avgRisk,
      };
    });
  }, [trends]);

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

  // Scheme Breakdown Data
  const schemeData = Object.entries(metrics.detected_schemes_breakdown || {}).map(([name, count]) => ({
    name: name.split(' (')[0],
    rule: name.includes('(') ? name.split('(')[1].replace(')', '') : '',
    count,
  }));

  // Risk Tier Donut Data
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

  const pipelineStagesInfo: Record<string, { step: string; title: string; desc: string; details: string }> = {
    ingestion: {
      step: '01',
      title: 'Claims Intake & Benchmark Ingestion',
      desc: 'Standardized EDI 837 / CMS-1500 Encounter Normalization',
      details: `Ingests and normalizes encounter records across specialties with CPT/HCPCS procedure codes, ICD-10 diagnosis codes, and billing NPIs. Currently analyzing ${metrics.total_claims_analyzed.toLocaleString()} synthetic claims with Zero PHI.`
    },
    detection: {
      step: '02',
      title: 'Multi-Modal FWA Detection Engine',
      desc: 'Deterministic CMS Rules + Unsupervised Isolation Forest ML',
      details: 'Dual-engine screening evaluates deterministic CMS NCCI statutory rules alongside an unsupervised 10-D Isolation Forest anomaly detector to isolate complex billing outliers.'
    },
    synthesis: {
      step: '03',
      title: 'Multi-Detector Risk Synthesis',
      desc: '0–100 Weighted Composite Consensus',
      details: 'Synthesizes multi-detector signals using verified weights (0.35 Rule + 0.25 ML + 0.25 Graph + 0.15 Velocity) into an explainable 0–100 composite risk score.'
    },
    network_temp: {
      step: '04',
      title: 'Healthcare Network & Temporal Intelligence',
      desc: 'Bipartite PageRank & 30-Day Epoch Velocity',
      details: 'Constructs bipartite graphs connecting Providers, Billing Facilities, and Beneficiaries to expose hidden collusion loops and calculates 30-day velocity trajectories.'
    },
    prioritization: {
      step: '05',
      title: 'SIU Workload Capacity Optimization',
      desc: 'Multi-Attribute Utility Prioritization (Capacity K=5..50)',
      details: 'Ranks cases by risk, potential financial exposure, velocity, and network centrality, dynamically optimizing caseloads for maximum financial recovery.'
    },
    evidence: {
      step: '06',
      title: 'Clinical Investigation Console & Briefs',
      desc: 'Dedicated Case Workspace & Evidence DAG',
      details: 'Special Investigators review hierarchical evidence DAGs, 10-D Fraud Genome radars, 30/60/90-day loss projections, and automated clinical briefs with 42 CFR § 455 citations.'
    },
    decision: {
      step: '07',
      title: 'Human-in-the-Loop Sign-Off & Merkle Audit Trail',
      desc: 'SHA-256 Merkle Ledger & Prepayment Dual-Authorization',
      details: 'Human findings and clinical review notes are hashed to an immutable SHA-256 Merkle chain, requiring secondary authorization for prepayment medical review holds.'
    }
  };

  return (
    <div className="space-y-10 font-sans pb-12">
      {/* ========================================================================= */}
      {/* 1. FIRST VIEWPORT — CLEAN LANDING & HERO PROGRAM INTRODUCTION              */}
      {/* ========================================================================= */}
      <section className="min-h-[calc(100vh-140px)] flex flex-col justify-between pt-2 pb-6 space-y-6">
        {/* Main Hero Header */}
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#E8F8EE] border border-[#ACF2E5] text-[#1B843C] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#209B47]" />
            <span>Healthcare Program Integrity &amp; Payment Integrity Platform</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#042126] tracking-tight leading-tight">
              Program Integrity Overview
            </h1>
            <p className="text-sm sm:text-base text-[#042126]/75 leading-relaxed">
              ClaimShield Nexus continuously monitors healthcare claim encounters, detects complex Fraud, Waste &amp; Abuse (FWA) patterns via deterministic rules and unsupervised ML, and prioritizes actionable cases for Special Investigation Units (SIU).
            </p>
          </div>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNavigateToQueue}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#209B47] hover:bg-[#1B843C] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer"
            >
              <span>Open SIU Priority Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={scrollToIntelligence}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#F2FCFF] text-[#005F68] border border-[#042126]/15 text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Compass className="w-4 h-4 text-[#005F68]" />
              <span>Explore Program Intelligence</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#005F68]/70" />
            </button>
          </div>
        </div>

        {/* First Viewport: High-Level Portfolio Health Status Strip (3 Restrained Indicators) */}
        <div className="health-panel p-5 sm:p-6 rounded-2xl border border-[#042126]/10 space-y-4 bg-white shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#042126]/10 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#209B47] animate-pulse"></span>
              <h2 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
                Current Portfolio Health &amp; Surveillance Status
              </h2>
            </div>
            <span className="text-[11px] font-mono text-[#005F68] bg-[#F2FCFF] px-2.5 py-0.5 rounded border border-[#005F68]/15 font-semibold self-start sm:self-auto">
              Real-Time Synthetic Benchmark
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Indicator 1: Portfolio Monitored */}
            <div className="space-y-1 p-3.5 rounded-xl bg-[#F2FCFF]/70 border border-[#042126]/5">
              <span className="text-[10px] font-bold text-[#042126]/60 uppercase tracking-wider">
                Portfolio Monitored
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold font-mono text-[#042126] tabular-nums">
                  {metrics.total_claims_analyzed.toLocaleString()}
                </span>
                <span className="text-xs text-[#042126]/70">Claims Encounters</span>
              </div>
              <p className="text-[11px] text-[#005F68] font-medium pt-0.5">
                Multi-specialty synthetic provider network
              </p>
            </div>

            {/* Indicator 2: Active Risk Signals */}
            <div className="space-y-1 p-3.5 rounded-xl bg-[#FEF3C7]/40 border border-[#FDE68A]/60">
              <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">
                Active Risk Signals
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold font-mono text-[#B45309] tabular-nums">
                  {totalFlaggedClaims.toLocaleString()}
                </span>
                <span className="text-xs text-[#B45309]/80">Dual-Engine Alerts</span>
              </div>
              <p className="text-[11px] text-[#B45309] font-medium pt-0.5">
                {formatCompactMoney(metrics.flagged_fwa_exposure_usd)} Flagged Financial Exposure
              </p>
            </div>

            {/* Indicator 3: SIU Priority Status */}
            <div className="space-y-1 p-3.5 rounded-xl bg-[#FEE2E2]/40 border border-[#FECACA]/60">
              <span className="text-[10px] font-bold text-[#B91C1C] uppercase tracking-wider">
                SIU Priority Triage
              </span>
              <div className="flex items-baseline space-x-2">
                <span className="text-xl font-bold font-mono text-[#B91C1C] tabular-nums">
                  {metrics.critical_risk_entities_count + metrics.high_risk_entities_count}
                </span>
                <span className="text-xs text-[#B91C1C]/80">High-Risk Cases</span>
              </div>
              <p className="text-[11px] text-[#B91C1C] font-medium pt-0.5">
                Requires investigator review (Score &ge; 50)
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Visual Scroll Cue */}
        <div className="flex justify-center pt-1 pb-2">
          <button
            onClick={scrollToIntelligence}
            className="flex items-center space-x-1.5 text-xs text-[#005F68] hover:text-[#042126] transition-colors cursor-pointer group font-medium py-1 px-3 rounded-full hover:bg-[#005F68]/5"
          >
            <span>Scroll for Detailed Program Intelligence &amp; Analytics</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#209B47] transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION: PORTFOLIO INTELLIGENCE METRICS (PROGRESSIVE SCROLL REVEAL)     */}
      {/* ========================================================================= */}
      <section id="portfolio-intelligence" className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#042126]/10 pb-2.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#042126] tracking-tight">
              Portfolio Intelligence &amp; Surveillance Metrics
            </h2>
            <p className="text-xs text-[#042126]/60 mt-0.5">
              Synthesized multi-modal indicators across billing volume, anomaly detections, and loss exposure.
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#005F68] font-semibold bg-[#F2FCFF] px-2 py-0.5 rounded border border-[#042126]/10 self-start sm:self-auto">
            100% Data Grounded
          </span>
        </div>

        {/* 5 Clean Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Metric 1: Claims Reviewed */}
          <div className="health-panel p-4 rounded-xl space-y-2 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-[#042126]/60">
              <span className="text-[11px] font-bold uppercase tracking-wider">Claims Reviewed</span>
              <FileText className="w-4 h-4 text-[#005F68]" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#042126] tabular-nums">
              {metrics.total_claims_analyzed.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#042126]/60 leading-tight">
              Multi-specialty synthetic network
            </p>
          </div>

          {/* Metric 2: Potential FWA Alerts */}
          <div className="health-panel p-4 rounded-xl space-y-2 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-[#B45309]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Potential FWA Alerts</span>
              <AlertOctagon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#B45309] tabular-nums">
              {totalFlaggedClaims.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#042126]/60 leading-tight">
              {metrics.fwa_exposure_percentage ? `${metrics.fwa_exposure_percentage.toFixed(1)}% Exposure` : 'Dual Engine'}
            </p>
          </div>

          {/* Metric 3: High-Risk Cases */}
          <div className="health-panel p-4 rounded-xl space-y-2 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-[#B91C1C]">
              <span className="text-[11px] font-bold uppercase tracking-wider">High-Risk Cases</span>
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#B91C1C] tabular-nums">
              {metrics.critical_risk_entities_count + metrics.high_risk_entities_count}
            </div>
            <p className="text-[11px] text-[#042126]/60 leading-tight">
              Composite score &ge; 50
            </p>
          </div>

          {/* Metric 4: Potential Financial Exposure */}
          <div className="health-panel p-4 rounded-xl space-y-2 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-[#005F68]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Potential Exposure</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#042126] tabular-nums">
              {formatCompactMoney(metrics.flagged_fwa_exposure_usd)}
            </div>
            <p className="text-[11px] text-[#042126]/60 leading-tight">
              Flagged billed amount
            </p>
          </div>

          {/* Metric 5: Priority Triage Targets */}
          <div className="health-panel p-4 rounded-xl space-y-2 col-span-2 sm:col-span-1 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between text-[#209B47]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Priority Triage</span>
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold font-mono text-[#209B47] tabular-nums">
              {topCases.length} Targets
            </div>
            <p className="text-[11px] text-[#042126]/60 leading-tight">
              Capacity-optimized triage
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION: RISK ANALYTICS & LONGITUDINAL SURVEILLANCE (2-COLUMN)         */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="border-b border-[#042126]/10 pb-2.5">
          <h2 className="text-base sm:text-lg font-bold text-[#042126] tracking-tight">
            Risk Surveillance &amp; Stratification Analytics
          </h2>
          <p className="text-xs text-[#042126]/60 mt-0.5">
            Temporal billing patterns, 30-day epoch loss velocity, and risk severity distributions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): 30-Day Longitudinal Risk Surveillance */}
          <div className="lg:col-span-7 health-panel p-5 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h3 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
                  Longitudinal Risk Surveillance (Day 0 – 90)
                </h3>
                <p className="text-[11px] text-[#042126]/60">Daily encounter volume vs flagged FWA financial exposure</p>
              </div>
              <div className="flex items-center space-x-3 text-[11px]">
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#209B47]" />
                  <span className="text-[#042126]/70">Encounters</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#B91C1C]" />
                  <span className="text-[#042126]/70">Flagged ({currencySymbol})</span>
                </div>
              </div>
            </div>

            <div className="h-[230px] w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 15, left: -10, bottom: 0 }}>
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
                    dataKey="epoch" 
                    stroke="#042126" 
                    tick={{ fill: 'rgba(4, 33, 38, 0.65)', fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="#209B47" 
                    tick={{ fill: 'rgba(4, 33, 38, 0.65)', fontSize: 10 }}
                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="#B91C1C" 
                    tick={{ fill: 'rgba(185, 28, 28, 0.75)', fontSize: 10 }}
                    tickFormatter={(v) => formatCompactMoney(v)}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: 'rgba(4, 33, 38, 0.15)', 
                      borderRadius: '8px', 
                      color: '#042126',
                      fontSize: '11px',
                      boxShadow: '0 4px 6px -1px rgba(4, 33, 38, 0.08)'
                    }}
                    formatter={(value: any, name: string) => [
                      name.startsWith('Flagged') ? formatMoney(Number(value)) : `${Number(value).toLocaleString()} encounters`,
                      name
                    ]}
                  />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="total_claims" 
                    name="Total Encounters"
                    stroke="#209B47" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#claimVolumeGradient)" 
                  />
                  <Area 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="flagged_amount" 
                    name={`Flagged (${currencySymbol})`}
                    stroke="#B91C1C" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#flaggedGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column (5 cols): Risk Stratification & Scheme Breakdown */}
          <div className="lg:col-span-5 health-panel p-5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
                  Risk Stratification &amp; Schemes
                </h3>
                <p className="text-[11px] text-[#042126]/60">Provider severity tiers and top billing anomaly patterns</p>
              </div>
              <PieIcon className="w-4 h-4 text-[#005F68]" />
            </div>

            <div className="grid grid-cols-2 gap-2 items-center pt-1">
              {/* Donut Chart */}
              <div className="h-[150px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
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
                        fontSize: '11px' 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Severity Breakdown Legend */}
              <div className="space-y-1.5 text-xs">
                {tierData.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                      <span className="text-[11px] font-medium text-[#042126]">{tier.name}</span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#042126] tabular-nums">{tier.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheme Pills */}
            <div className="pt-2 border-t border-[#042126]/10">
              <p className="text-[10px] font-bold text-[#042126]/60 uppercase tracking-wider mb-1.5">Active FWA Schemes</p>
              <div className="flex flex-wrap gap-1.5">
                {schemeData.map((s, idx) => (
                  <span key={idx} className="text-[10px] font-medium bg-[#F2FCFF] border border-[#042126]/10 px-2 py-0.5 rounded text-[#042126]">
                    {s.name}: <strong className="font-mono text-[#005F68]">{s.count}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: PRIORITY SIU INVESTIGATIONS PREVIEW                           */}
      {/* ========================================================================= */}
      <section className="space-y-3.5">
        <div className="health-panel p-5 rounded-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#042126] tracking-tight">
                Priority SIU Investigations
              </h2>
              <p className="text-xs text-[#042126]/60 mt-0.5">
                Top high-yield targets ranked by capacity-constrained multi-attribute utility optimization.
              </p>
            </div>

            <button
              onClick={onNavigateToQueue}
              className="text-xs font-semibold text-[#005F68] hover:text-[#042126] flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View Full SIU Queue ({metrics.critical_risk_entities_count + metrics.high_risk_entities_count} Cases)</span>
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
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#042126]/5">
                {topCases.map((c) => {
                  const isCrit = c.risk_tier === 'CRITICAL';
                  return (
                    <tr key={c.case_id} className="hover:bg-[#F2FCFF]/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#005F68]">{c.case_id}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-[#042126]">{c.target_entity_name}</div>
                        <div className="text-[10px] text-[#042126]/60 font-mono">NPI: {c.target_entity_id} • {c.specialty}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-[#042126]/5 text-[#042126] border border-[#042126]/10">
                          {c.primary_fwa_pattern}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          isCrit ? 'badge-critical' : 'badge-high'
                        }`}>
                          {c.composite_risk_score.toFixed(1)} / 100
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#042126] tabular-nums">
                        {formatMoney(c.potential_financial_exposure)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onSelectCase(c.case_id)}
                          className="px-2.5 py-1 rounded bg-[#209B47]/10 hover:bg-[#209B47]/20 text-[#005F68] border border-[#209B47]/30 text-xs font-semibold transition-colors cursor-pointer"
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
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: PROGRAM INTEGRITY PIPELINE ARCHITECTURE                       */}
      {/* ========================================================================= */}
      <section className="rounded-xl border border-[#042126]/10 bg-white overflow-hidden shadow-2xs">
        <button
          onClick={() => setShowPipeline(!showPipeline)}
          className="w-full p-4 bg-[#F2FCFF] hover:bg-[#E8F8EE]/60 flex items-center justify-between text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Layers className="w-4 h-4 text-[#005F68]" />
            <div>
              <span className="text-xs font-bold text-[#042126] uppercase tracking-wider block">
                ClaimShield Nexus Program Integrity Pipeline (7 Stages)
              </span>
              <span className="text-[11px] text-[#042126]/60 font-normal">
                End-to-end multi-modal architecture from intake to cryptographic human sign-off
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-[#005F68] font-semibold flex-shrink-0">
            <span>{showPipeline ? 'Collapse Pipeline' : 'Inspect Pipeline Architecture'}</span>
            {showPipeline ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showPipeline && (
          <div className="p-5 space-y-4 bg-white border-t border-[#042126]/10">
            <p className="text-xs text-[#042126]/70 leading-relaxed">
              ClaimShield Nexus operates an end-to-end multi-modal pipeline transforming raw claim encounters into explainable, evidence-backed SIU cases with cryptographic audit trails.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
              {[
                { id: 'ingestion', step: '01', title: 'Claims Intake' },
                { id: 'detection', step: '02', title: 'FWA Detection' },
                { id: 'synthesis', step: '03', title: 'Risk Synthesis' },
                { id: 'network_temp', step: '04', title: 'Network & Velocity' },
                { id: 'prioritization', step: '05', title: 'SIU Prioritization' },
                { id: 'evidence', step: '06', title: 'Evidence Review' },
                { id: 'decision', step: '07', title: 'Human Decision' }
              ].map((stage) => {
                const isSelected = selectedPipelineStage === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setSelectedPipelineStage(isSelected ? null : stage.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#209B47]/10 border-[#209B47] shadow-xs'
                        : 'bg-[#F2FCFF] border-[#042126]/10 hover:bg-[#042126]/5'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-[#005F68] font-mono">STAGE {stage.step}</div>
                    <div className="text-xs font-bold text-[#042126] mt-0.5">{stage.title}</div>
                  </button>
                );
              })}
            </div>

            {selectedPipelineStage && pipelineStagesInfo[selectedPipelineStage] && (
              <div className="p-3.5 rounded-lg bg-[#F2FCFF] border border-[#209B47]/30 text-xs space-y-1 mt-2">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-[#042126]">{pipelineStagesInfo[selectedPipelineStage].title}</span>
                  <span className="text-[#042126]/30">•</span>
                  <span className="text-[#005F68] font-semibold">{pipelineStagesInfo[selectedPipelineStage].desc}</span>
                </div>
                <p className="text-[#042126]/80 text-[11px] leading-relaxed">
                  {pipelineStagesInfo[selectedPipelineStage].details}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
