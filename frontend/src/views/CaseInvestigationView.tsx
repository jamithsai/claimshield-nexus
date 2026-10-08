import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Dna, 
  Clock, 
  Network, 
  GitCommit, 
  TrendingUp, 
  FileText, 
  Sliders, 
  ListOrdered, 
  CheckCircle2, 
  ShieldAlert, 
  Building2, 
  DollarSign, 
  Users, 
  Zap, 
  Download,
  AlertTriangle,
  Play,
  Copy,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { SIUCase, User, AIBrief, EvidenceGraphData } from '../types';
import { api } from '../services/api';
import { FraudGenomeRadar } from '../components/FraudGenomeRadar';
import { SchemeEvolutionTimeline } from '../components/SchemeEvolutionTimeline';
import { RiskVelocitySpark } from '../components/RiskVelocitySpark';
import { EvidenceGraphViewer } from '../components/EvidenceGraphViewer';
import { RelationshipGraphViewer } from '../components/RelationshipGraphViewer';
import { DecisionModal } from '../components/DecisionModal';

interface CaseInvestigationViewProps {
  caseId: string;
  currentUser: User | null;
  onBackToQueue: () => void;
}

export const CaseInvestigationView: React.FC<CaseInvestigationViewProps> = ({
  caseId,
  currentUser,
  onBackToQueue,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'genome' | 'evolution' | 'network' | 'evidence' | 'projections' | 'brief' | 'simulator' | 'claims'>('overview');
  const [caseData, setCaseData] = useState<SIUCase | null>(null);
  const [providerDetails, setProviderDetails] = useState<any>(null);
  const [similarity, setSimilarity] = useState<any>(null);
  const [evidenceGraph, setEvidenceGraph] = useState<EvidenceGraphData | null>(null);
  const [subgraph, setSubgraph] = useState<any>(null);
  const [brief, setBrief] = useState<AIBrief | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [copiedBrief, setCopiedBrief] = useState(false);

  // Counterfactual Simulator State
  const [cfExcludedEntities, setCfExcludedEntities] = useState<string[]>([]);
  const [cfResult, setCfResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function loadCaseData() {
      setIsLoading(true);
      try {
        const [detailRes, egRes, subRes, briefRes, claimsRes] = await Promise.all([
          api.getCaseDetails(caseId),
          api.getEvidenceGraph(caseId),
          api.getCaseSubgraph(caseId),
          api.getAIBrief(caseId),
          api.getCaseClaims(caseId, 50, 0),
        ]);

        setCaseData(detailRes.case);
        setProviderDetails(detailRes.provider_details);
        setSimilarity(detailRes.scheme_similarity);
        setEvidenceGraph(egRes);
        setSubgraph(subRes);
        setBrief(briefRes);
        setClaims(claimsRes.claims || []);
      } catch (err) {
        console.error('Failed to load full case payload', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCaseData();
  }, [caseId]);

  const handleRunCounterfactual = async () => {
    if (!caseData || cfExcludedEntities.length === 0) return;
    setIsSimulating(true);
    try {
      const res = await api.runCounterfactual(caseData.case_id, cfExcludedEntities);
      setCfResult(res);
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCopyBrief = () => {
    if (!brief) return;
    const text = `CLAIMSHIELD NEXUS SIU INVESTIGATION BRIEF\nCase: ${caseData?.case_id} (${caseData?.target_entity_name})\nRisk Score: ${caseData?.composite_risk_score}/100 (${caseData?.risk_tier})\nExposure: $${caseData?.potential_financial_exposure.toLocaleString()}\n\nEXECUTIVE SUMMARY:\n${brief.executive_summary}\n\nKEY FINDINGS:\n${brief.key_behavioral_findings.join('\n')}\n\nMITIGATING FACTORS:\n${brief.mitigating_factors}\n\nRECOMMENDED ACTIONS:\n${brief.recommended_investigative_actions.join('\n')}\n\nDISCLAIMER:\n${brief.mandatory_disclaimer}`;
    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  if (isLoading || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading Case Intelligence Workspace...</p>
        </div>
      </div>
    );
  }

  const isCritical = caseData.risk_tier === 'CRITICAL';
  const isHigh = caseData.risk_tier === 'HIGH';

  return (
    <div className="space-y-6 font-sans">
      {/* Persistent Top Case Header */}
      <div className="cockpit-panel p-5 rounded-xl border border-slate-800 bg-[#0f172a] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <button
              onClick={onBackToQueue}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mt-0.5"
              title="Return to SIU Priority Queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                  {caseData.case_id}
                </span>
                <span
                  className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                    isCritical
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : isHigh
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-blue-950 text-blue-300 border-blue-800'
                  }`}
                >
                  {caseData.risk_tier} RISK TIER
                </span>
                <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  STATUS: {caseData.status}
                </span>
                <RiskVelocitySpark velocity={caseData.risk_velocity} compact />
              </div>
              <h1 className="text-lg font-bold text-white mt-1.5">{caseData.target_entity_name}</h1>
              <p className="text-xs text-slate-400">
                {caseData.specialty} • NPI: <span className="font-mono text-slate-300">{caseData.target_entity_id}</span> • Location: {caseData.location || 'Miami, FL'}
              </p>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record Human Decision</span>
            </button>
          </div>
        </div>

        {/* 6 Key Intelligence Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-3 border-t border-slate-800">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Composite Risk</p>
            <p className="text-lg font-bold text-white font-mono mt-0.5 tabular-nums">{caseData.composite_risk_score} <span className="text-xs text-slate-500">/100</span></p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <p className="text-[10px] text-rose-400 uppercase font-semibold">Potential Exposure</p>
            <p className="text-lg font-bold text-rose-400 font-mono mt-0.5 tabular-nums">
              ${(caseData.potential_financial_exposure / 1000).toFixed(1)}k
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Impacted Members</p>
            <p className="text-lg font-bold text-blue-400 font-mono mt-0.5 tabular-nums">{caseData.member_impact_count}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Risk Velocity</p>
            <p className="text-lg font-bold text-amber-400 font-mono mt-0.5 tabular-nums">
              {caseData.risk_velocity > 0 ? `+${caseData.risk_velocity.toFixed(1)}` : caseData.risk_velocity.toFixed(1)}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Evidence Strength</p>
            <p className="text-xs font-bold text-emerald-400 font-mono mt-1.5">{caseData.evidence_strength}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">Data Quality (DQI)</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">{(caseData.data_quality_index * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* 8-Tab Investigation Navigation */}
      <div className="flex flex-wrap gap-1 bg-[#0f172a] p-1.5 rounded-lg border border-slate-800">
        {[
          { id: 'overview', label: '360° Case Overview', icon: Layers },
          { id: 'evidence', label: 'Evidence Graph Tree', icon: GitCommit },
          { id: 'network', label: 'Network & Collusion Graph', icon: Network },
          { id: 'genome', label: '10-D Fraud Genome™', icon: Dna },
          { id: 'evolution', label: 'Scheme Evolution (Day 0–90)', icon: Clock },
          { id: 'projections', label: '30/60/90 Forecasts', icon: TrendingUp },
          { id: 'brief', label: 'AI Investigation Brief', icon: FileText },
          { id: 'simulator', label: 'Counterfactual Simulator', icon: Sliders },
          { id: 'claims', label: 'Claim Records Ledger', icon: ListOrdered },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT PANELS */}

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Multi-Detector Breakdown Card */}
          <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4 bg-[#0f172a]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Detector Risk Synthesis</h3>
              <span className="text-[10px] font-mono text-blue-400 font-bold">Fused 0–100</span>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Deterministic Rule Signals (25%)', val: caseData.risk_breakdown.rule_signals_score, max: 100, color: 'bg-rose-500' },
                { label: 'Isolation Forest ML Outlier (20%)', val: caseData.risk_breakdown.ml_anomaly_score, max: 100, color: 'bg-blue-500' },
                { label: 'Graph & Centrality Risk (20%)', val: caseData.risk_breakdown.graph_network_score, max: 100, color: 'bg-indigo-500' },
                { label: 'Risk Velocity / Acceleration (15%)', val: caseData.risk_breakdown.risk_velocity_score, max: 100, color: 'bg-amber-500' },
                { label: 'Financial Exposure Ratio (10%)', val: caseData.risk_breakdown.financial_exposure_score, max: 100, color: 'bg-emerald-500' },
                { label: 'Member Impact Multiplier (10%)', val: caseData.risk_breakdown.member_impact_score, max: 100, color: 'bg-purple-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="font-mono font-bold text-white tabular-nums">{item.val}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${Math.min(100, item.val)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-blue-400 font-bold">Why Prioritized:</span> {caseData.target_entity_name} exhibits severe multivariate deviations in Level 5 E&amp;M codes, high patient sharing density, and rapid risk acceleration (+{caseData.risk_velocity.toFixed(1)}/mo).
            </div>
          </div>

          {/* Active Clinical Rule Triggers */}
          <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4 bg-[#0f172a]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Active Rule Triggers ({caseData.rule_triggers.length})
              </h3>
              <span className="text-[10px] font-mono text-amber-400">Deterministic</span>
            </div>

            <div className="space-y-2.5">
              {caseData.rule_triggers.map((t, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">[{t.rule_id}] {t.rule_name}</span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {t.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scheme Archetype Similarity Match */}
          <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4 bg-[#0f172a]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Fingerprint Similarity Match</h3>
              {similarity?.best_matched_scheme && (
                <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                  {similarity.best_matched_scheme.similarity_score_pct}% Match
                </span>
              )}
            </div>

            {similarity?.best_matched_scheme ? (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">{similarity.best_matched_scheme.scheme_name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{similarity.best_matched_scheme.description}</p>
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Matching Behavioral Traits:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {similarity.best_matched_scheme.matching_traits.map((trait: string, i: number) => (
                      <span key={i} className="text-[10px] font-semibold text-blue-300 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded">
                        ✓ {trait}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No historical scheme match above 70% threshold.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. Evidence Graph Tab */}
      {activeTab === 'evidence' && evidenceGraph && (
        <EvidenceGraphViewer evidenceGraph={evidenceGraph} />
      )}

      {/* 3. Network Explorer Tab */}
      {activeTab === 'network' && subgraph && (
        <RelationshipGraphViewer nodes={subgraph.nodes} edges={subgraph.edges} />
      )}

      {/* 4. Fraud Genome Tab */}
      {activeTab === 'genome' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FraudGenomeRadar genome={caseData.fraud_genome} entityName={caseData.target_entity_name} />
            
            {/* 10-D Detailed Breakdown Table */}
            <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-3 bg-[#0f172a]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">10-Dimensional Vector Breakdown</h3>
                <span className="text-[10px] font-mono text-slate-400">Normalized [0, 1]</span>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'Billing Intensity', val: caseData.fraud_genome.billing_intensity, desc: 'Total monthly paid dollar volume relative to specialty median' },
                  { name: 'Procedure Deviation', val: caseData.fraud_genome.procedure_deviation, desc: 'Ratio of high-tier E&M level 5 procedure codes' },
                  { name: 'Temporal Irregularity', val: caseData.fraud_genome.temporal_irregularity, desc: 'Weekend billing concentration & impossible same-day hours' },
                  { name: 'Referral Concentration', val: caseData.fraud_genome.referral_concentration, desc: 'Gini inequality index across outgoing referral routes' },
                  { name: 'Facility Concentration', val: caseData.fraud_genome.facility_concentration, desc: 'Herfindahl-Hirschman Index (HHI) of facility billing distribution' },
                  { name: 'Member Concentration', val: caseData.fraud_genome.member_concentration, desc: 'Unique beneficiary repeat billing overlap' },
                  { name: 'Geographic Anomaly', val: caseData.fraud_genome.geographic_anomaly, desc: 'Multi-location and cross-county service sprawl' },
                  { name: 'Network Density', val: caseData.fraud_genome.network_density, desc: 'Bipartite patient sharing density & cycle loop participation' },
                  { name: 'Financial Exposure', val: caseData.fraud_genome.financial_exposure, desc: 'Total dollar volume at risk across flagged encounters' },
                  { name: 'Utilization Deviation', val: caseData.fraud_genome.utilization_deviation, desc: 'Trailing 30-day claim velocity acceleration surge' },
                ].map((dim, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/80 border border-slate-800 text-xs">
                    <div>
                      <span className="font-bold text-white">{dim.name}</span>
                      <p className="text-[10px] text-slate-400">{dim.desc}</p>
                    </div>
                    <span className={`font-mono font-bold text-xs tabular-nums px-2 py-0.5 rounded ${
                      dim.val >= 0.75 ? 'text-rose-300 bg-rose-950 border border-rose-800' : (dim.val >= 0.50 ? 'text-amber-300 bg-amber-950 border border-amber-800' : 'text-slate-300')
                    }`}>
                      {dim.val.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Scheme Evolution Tab */}
      {activeTab === 'evolution' && (
        <SchemeEvolutionTimeline history={caseData.evolution_history} />
      )}

      {/* 6. Projections Tab */}
      {activeTab === 'projections' && (
        <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4 bg-[#0f172a]">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                30 / 60 / 90-Day Predictive Trajectory Projections
              </h3>
              <p className="text-[11px] text-slate-400">Statistical forecasting assuming continuation of current billing acceleration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            {caseData.projections.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 font-mono">+{proj.horizon_days} DAYS HORIZON</span>
                  <span className="text-[10px] uppercase font-bold text-rose-300 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    {proj.trajectory_classification.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Projected Additional Spend</p>
                  <p className="text-xl font-bold text-rose-400 font-mono mt-0.5 tabular-nums">
                    +${proj.projected_additional_exposure_usd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                    80% CI: ${proj.ci_low_usd.toLocaleString()} – ${proj.ci_high_usd.toLocaleString()}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span>Projected Risk Score:</span>
                  <span className="font-bold font-mono text-white tabular-nums">{proj.projected_risk_score} / 100</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-400 italic">
            * Note: {caseData.projections[0]?.disclaimer}
          </div>
        </div>
      )}

      {/* 7. AI Investigation Brief Tab */}
      {activeTab === 'brief' && brief && (
        <div className="cockpit-panel p-6 rounded-xl border border-slate-800 space-y-6 bg-[#0f172a]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 font-bold">
                  Brief ID: {brief.brief_id}
                </span>
                <span className="text-[10px] text-slate-400">Generated for SIU Division</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">Special Investigation Unit (SIU) Intelligence Brief</h3>
              <p className="text-xs text-slate-400">Target Entity: {brief.target_entity} • Automated Decision Support</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyBrief}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold transition-colors border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedBrief ? 'Copied!' : 'Copy Text'}</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-bold transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Executive Summary</h4>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/90 p-4 rounded-lg border border-slate-800">
              {brief.executive_summary}
            </p>
          </div>

          {/* Key Behavioral Findings */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Key Behavioral Findings</h4>
            <ul className="space-y-2">
              {brief.key_behavioral_findings.map((f, i) => (
                <li key={i} className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <span className="text-amber-400 font-bold mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Mitigating Factors */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mitigating Factors &amp; Counter-Evidence</h4>
            <p className="text-xs text-slate-300 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 leading-relaxed">
              {brief.mitigating_factors}
            </p>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Recommended Investigative Actions</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {brief.recommended_investigative_actions.map((act, i) => (
                <div key={i} className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-200 font-medium">
                  {act}
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Citations Table */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Claim Evidence Citations ({brief.evidence_citations.length})</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="p-2.5 font-semibold">Claim ID</th>
                    <th className="p-2.5 font-semibold">Service Date</th>
                    <th className="p-2.5 font-semibold">CPT Code</th>
                    <th className="p-2.5 font-semibold text-right">Billed ($)</th>
                    <th className="p-2.5 font-semibold text-right">Paid ($)</th>
                    <th className="p-2.5 font-semibold">Scheme Attribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {brief.evidence_citations.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-mono text-blue-400 font-bold">{c.claim_id}</td>
                      <td className="p-2.5 text-slate-300">{c.service_date}</td>
                      <td className="p-2.5 font-mono text-slate-200">{c.procedure_code}</td>
                      <td className="p-2.5 text-right font-mono text-slate-300">${c.billed_usd.toFixed(2)}</td>
                      <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">${c.paid_usd.toFixed(2)}</td>
                      <td className="p-2.5 text-slate-400 text-[11px]">{c.associated_scheme_tag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mandatory Responsible AI Banner */}
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              {brief.mandatory_disclaimer}
            </p>
          </div>
        </div>
      )}

      {/* 8. Counterfactual Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="cockpit-panel p-6 rounded-xl border border-slate-800 space-y-6 bg-[#0f172a]">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-blue-400" />
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Counterfactual Investigation Sandbox ("What-If" Topology Isolation)
              </h3>
              <p className="text-[11px] text-slate-400">
                Simulate potential risk reduction and dollar cost avoidance by hypothetically severing collaborating network nodes.
              </p>
            </div>
          </div>

          {/* Entity Removal Selector */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <p className="text-xs font-bold text-slate-300 uppercase">Select Entity to Hypothetically Exclude from Network:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'FAC-70000', label: 'Biscayne Surgical Suites (Facility FAC-70000)' },
                { id: 'NPI-1000000002', label: 'Apex Diagnostics Lab (Provider NPI-1000000002)' },
                { id: 'NPI-1000000005', label: 'Dr. Gregory Vance (Referring NPI-1000000005)' },
              ].map((ent) => {
                const isSelected = cfExcludedEntities.includes(ent.id);
                return (
                  <button
                    key={ent.id}
                    onClick={() => {
                      if (isSelected) {
                        setCfExcludedEntities(cfExcludedEntities.filter((x) => x !== ent.id));
                      } else {
                        setCfExcludedEntities([...cfExcludedEntities, ent.id]);
                      }
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSelected ? '✕ Excluded: ' : '+ Exclude: '} {ent.label}
                  </button>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={handleRunCounterfactual}
                disabled={cfExcludedEntities.length === 0 || isSimulating}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm disabled:opacity-40 transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Recalculating Topologies...' : 'Execute What-If Recalculation'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output Results */}
          {cfResult && (
            <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 font-mono">SIMULATION COMPLETED</span>
                <span className="text-xs font-mono text-slate-400">{cfResult.simulation_id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Simulated Risk Reduction</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5 tabular-nums">
                    -{cfResult.simulated_metrics.risk_reduction_percentage}%
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {cfResult.baseline_metrics.risk_score} → {cfResult.simulated_metrics.risk_score} Score
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Potential Cost Avoidance</p>
                  <p className="text-xl font-bold text-blue-400 font-mono mt-0.5 tabular-nums">
                    ${cfResult.simulated_metrics.potential_cost_avoidance_usd.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Potential hold / audit value</p>
                </div>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase">Referral Loop Status</p>
                  <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">
                    {cfResult.network_topology_impact.referral_loop_status}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {cfResult.network_topology_impact.severed_collusion_edges_count} collusion edges severed
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded border border-slate-800">
                {cfResult.disclaimer}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 9. Raw Claims Ledger Tab */}
      {activeTab === 'claims' && (
        <div className="cockpit-panel p-5 rounded-xl border border-slate-800 space-y-4 bg-[#0f172a]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Encounter Claim Records ({claims.length} sampled)
            </h3>
            <span className="text-xs text-slate-400">Claims billed under NPI {caseData.target_entity_id}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5 font-semibold">Claim ID</th>
                  <th className="p-2.5 font-semibold">Beneficiary ID</th>
                  <th className="p-2.5 font-semibold">Service Date</th>
                  <th className="p-2.5 font-semibold">ICD-10 Diag</th>
                  <th className="p-2.5 font-semibold">CPT Code</th>
                  <th className="p-2.5 font-semibold text-right">Billed ($)</th>
                  <th className="p-2.5 font-semibold text-right">Paid ($)</th>
                  <th className="p-2.5 font-semibold">Scheme Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {claims.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-800/40">
                    <td className="p-2.5 font-mono text-blue-400 font-bold">{c.claim_id}</td>
                    <td className="p-2.5 font-mono text-slate-300">{c.member_id}</td>
                    <td className="p-2.5 text-slate-300">{c.service_date}</td>
                    <td className="p-2.5 font-mono text-slate-200">{c.primary_diagnosis}</td>
                    <td className="p-2.5 font-mono text-slate-200 font-bold">{c.procedure_code}</td>
                    <td className="p-2.5 text-right font-mono text-slate-300 tabular-nums">${c.billed_amount.toFixed(2)}</td>
                    <td className="p-2.5 text-right font-mono text-emerald-400 font-bold tabular-nums">${c.paid_amount.toFixed(2)}</td>
                    <td className="p-2.5">
                      {c.synthetic_scheme_tag ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-800">
                          {c.synthetic_scheme_tag}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Normal Baseline</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Human Investigator Decision Modal */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        caseItem={caseData}
        currentUser={currentUser}
        onSubmitDecision={async (payload) => {
          await api.submitDecision(caseData.case_id, payload);
          alert('Investigator decision cryptographically signed to Merkle audit ledger!');
        }}
      />
    </div>
  );
};
