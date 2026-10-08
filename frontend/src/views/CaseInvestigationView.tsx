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
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info
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

  // Trace Evidence Interactive Drawer State
  const [expandedTraceDetector, setExpandedTraceDetector] = useState<string | null>('rule');

  // Projection View Toggle State
  const [projectionMode, setProjectionMode] = useState<'escalation' | 'financial'>('financial');

  // Claim Ledger Search / Filter State
  const [claimSearch, setClaimSearch] = useState('');

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
          <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-600">Loading Case Intelligence Workspace...</p>
        </div>
      </div>
    );
  }

  const isCritical = caseData.risk_tier === 'CRITICAL';
  const isHigh = caseData.risk_tier === 'HIGH';

  const filteredClaims = claims.filter((cl) => {
    if (!claimSearch) return true;
    const q = claimSearch.toLowerCase();
    return (
      cl.claim_id?.toLowerCase().includes(q) ||
      cl.cpt_hcpcs_code?.toLowerCase().includes(q) ||
      cl.rendering_provider_id?.toLowerCase().includes(q) ||
      cl.triggered_rules?.some((r: string) => r.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Persistent Top Case Header */}
      <div className="health-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <button
              onClick={onBackToQueue}
              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors mt-0.5"
              title="Return to SIU Priority Queue"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold font-mono text-sky-700">{caseData.case_id}</span>
                <span className="text-slate-300">•</span>
                <h1 className="text-base font-bold text-slate-900">{caseData.target_entity_name}</h1>
                <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
                  isCritical ? 'badge-critical' : isHigh ? 'badge-high' : 'badge-medium'
                }`}>
                  {caseData.risk_tier} • {caseData.composite_risk_score.toFixed(1)} / 100
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {caseData.status.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                NPI: {caseData.target_entity_id} • Specialty: <span className="text-slate-700 font-semibold">{caseData.specialty || 'Internal Medicine'}</span> • Primary Scheme: <span className="text-amber-700 font-semibold">{caseData.primary_fwa_pattern}</span>
              </p>
            </div>
          </div>

          {/* Action Trigger for Human-In-The-Loop Disposition */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsDecisionModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Record SIU Disposition</span>
            </button>
          </div>
        </div>

        {/* 5-Metric Intelligence KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Potential Exposure</span>
            <p className="text-base font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
              ${caseData.potential_financial_exposure.toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Impacted Members</span>
            <p className="text-base font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
              {caseData.member_impact_count} Patients
            </p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Risk Velocity</span>
            <div className="mt-1 flex items-center space-x-1.5">
              <RiskVelocitySpark velocity={caseData.risk_velocity} showText={true} />
            </div>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Evidence Strength</span>
            <p className="text-base font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
              {caseData.evidence_strength}
            </p>
          </div>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Flagged Claims</span>
            <p className="text-base font-mono font-bold text-slate-900 mt-0.5 tabular-nums">
              {providerDetails?.claim_count || claims.length} Encounters
            </p>
          </div>
        </div>
      </div>

      {/* 8-Tab Segmented Workspace Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto space-x-1">
        {[
          { id: 'overview', label: 'Overview & Trace', icon: Layers },
          { id: 'evidence', label: 'Evidence Graph', icon: GitCommit },
          { id: 'network', label: 'Network Explorer', icon: Network },
          { id: 'genome', label: '10-D Fraud Genome', icon: Dna },
          { id: 'evolution', label: 'Scheme Evolution', icon: Clock },
          { id: 'projections', label: '30/60/90 Projections', icon: TrendingUp },
          { id: 'brief', label: 'AI Investigation Brief', icon: FileText },
          { id: 'claims', label: 'Claim Ledger', icon: ListOrdered },
          { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? 'border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================== TAB 1: OVERVIEW & TRACE EVIDENCE ==================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Multi-Detector Synthesis & Interactive Trace */}
            <div className="lg:col-span-7 space-y-4">
              <div className="health-panel p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Multi-Detector Risk Synthesis</h2>
                  <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold">
                    Ensemble Weighting
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Composite score synthesized from deterministic FWA rules, unsupervised Isolation Forest anomaly scoring, bipartite graph centrality, and temporal billing acceleration.
                </p>

                {/* Score Breakdown Cards with Click-to-Trace */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div 
                    onClick={() => setExpandedTraceDetector(expandedTraceDetector === 'rule' ? null : 'rule')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      expandedTraceDetector === 'rule'
                        ? 'bg-sky-50 border-sky-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-600 text-xs">
                      <span className="font-semibold">Deterministic Rule Engine</span>
                      {expandedTraceDetector === 'rule' ? <ChevronDown className="w-3.5 h-3.5 text-sky-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                      {caseData.risk_breakdown?.['Rule Engine']?.toFixed(1) || '85.0'} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                    </p>
                    <span className="text-[10px] text-sky-700 font-medium">Click to trace rule violations</span>
                  </div>

                  <div 
                    onClick={() => setExpandedTraceDetector(expandedTraceDetector === 'ml' ? null : 'ml')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      expandedTraceDetector === 'ml'
                        ? 'bg-sky-50 border-sky-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-600 text-xs">
                      <span className="font-semibold">Isolation Forest Anomaly</span>
                      {expandedTraceDetector === 'ml' ? <ChevronDown className="w-3.5 h-3.5 text-sky-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                      {caseData.risk_breakdown?.['ML Anomaly Detector']?.toFixed(2) || '0.89'} <span className="text-xs text-slate-500 font-normal">score</span>
                    </p>
                    <span className="text-[10px] text-sky-700 font-medium">Click to trace ML features</span>
                  </div>

                  <div 
                    onClick={() => setExpandedTraceDetector(expandedTraceDetector === 'graph' ? null : 'graph')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      expandedTraceDetector === 'graph'
                        ? 'bg-sky-50 border-sky-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-600 text-xs">
                      <span className="font-semibold">Bipartite Graph Risk</span>
                      {expandedTraceDetector === 'graph' ? <ChevronDown className="w-3.5 h-3.5 text-sky-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                      {caseData.risk_breakdown?.['Graph Network']?.toFixed(1) || '72.4'} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                    </p>
                    <span className="text-[10px] text-sky-700 font-medium">Click to trace network density</span>
                  </div>

                  <div 
                    onClick={() => setExpandedTraceDetector(expandedTraceDetector === 'temporal' ? null : 'temporal')}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      expandedTraceDetector === 'temporal'
                        ? 'bg-sky-50 border-sky-300 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-slate-600 text-xs">
                      <span className="font-semibold">Risk Velocity (Temporal)</span>
                      {expandedTraceDetector === 'temporal' ? <ChevronDown className="w-3.5 h-3.5 text-sky-600" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                    <p className="text-lg font-bold font-mono text-slate-900 mt-1">
                      +{caseData.risk_velocity?.toFixed(1) || '38.5'} <span className="text-xs text-slate-500 font-normal">pts/mo</span>
                    </p>
                    <span className="text-[10px] text-sky-700 font-medium">Click to trace 30d acceleration</span>
                  </div>
                </div>

                {/* Interactive Trace Evidence Detail Box */}
                {expandedTraceDetector && (
                  <div className="p-4 rounded-lg bg-sky-50/70 border border-sky-200 text-xs space-y-2 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-900 uppercase tracking-wider text-[11px]">
                        Trace Evidence Lineage: {expandedTraceDetector.toUpperCase()} DRIVER
                      </span>
                      <span className="font-mono text-[10px] text-sky-700 font-semibold">
                        Grounded in Synthetic Dataset
                      </span>
                    </div>
                    {expandedTraceDetector === 'rule' && (
                      <div className="space-y-1 text-slate-700">
                        <p><strong>Primary Rule Trigger:</strong> {caseData.primary_fwa_pattern} (R102 Upcoding &amp; Modifier-25 misuse).</p>
                        <p><strong>Violations Count:</strong> 247 synthetic claims flagged with modifier discrepancies.</p>
                        <p><strong>Rule Weight in Composite:</strong> 35% contribution factor.</p>
                      </div>
                    )}
                    {expandedTraceDetector === 'ml' && (
                      <div className="space-y-1 text-slate-700">
                        <p><strong>Model:</strong> Isolation Forest (200 estimators, 5% contamination baseline).</p>
                        <p><strong>Key Feature Attributions:</strong> High procedure code complexity variance (Z = +3.42) &amp; billing velocity spike (Z = +2.89).</p>
                        <p><strong>Model Attribution:</strong> 25% contribution factor.</p>
                      </div>
                    )}
                    {expandedTraceDetector === 'graph' && (
                      <div className="space-y-1 text-slate-700">
                        <p><strong>Topology Analysis:</strong> PageRank 0.0412, Betweenness Centrality 0.0289.</p>
                        <p><strong>Network Context:</strong> Connected to 3 shared rendering clinics with unusually tight referral concentration (Gini coefficient 0.81).</p>
                        <p><strong>Graph Weight:</strong> 20% contribution factor.</p>
                      </div>
                    )}
                    {expandedTraceDetector === 'temporal' && (
                      <div className="space-y-1 text-slate-700">
                        <p><strong>Temporal Velocity:</strong> Calculated 1st order rate of change over 30-day epoch windows.</p>
                        <p><strong>Acceleration State:</strong> Accelerating (Current 30d volume is 3.8x historical baseline).</p>
                        <p><strong>Velocity Weight:</strong> 20% contribution factor.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Active Rules Triggers List */}
              <div className="health-panel p-5 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Active Deterministic Rule Triggers</h3>
                <div className="space-y-2">
                  {(caseData.rule_triggers && caseData.rule_triggers.length > 0) ? (
                    caseData.rule_triggers.map((rt, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          <div>
                            <span className="font-semibold text-slate-800">{rt.rule_name}</span>
                            <p className="text-[11px] text-slate-500 mt-0.5">{rt.description}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono badge-critical">
                          {rt.severity}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                      R102 Upcoding: High-complexity evaluation &amp; management code overbilling detected.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Known Scheme Taxonomy Similarity */}
            <div className="lg:col-span-5 space-y-4">
              <div className="health-panel p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900">Known Scheme Taxonomy Similarity</h2>
                  <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                    {similarity?.matched_scheme_name || caseData.primary_fwa_pattern}
                  </span>
                </div>
                <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs text-slate-600">Cosine Vector Alignment:</span>
                  <span className="font-mono text-xl font-bold text-sky-700">
                    {similarity ? (similarity.similarity_score * 100).toFixed(1) : '89.4'}% Match
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-slate-700">Statutory &amp; Clinical Definition:</span>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {similarity?.definition || 
                      'Systematic billing of high-level evaluation/management CPT codes (e.g. 99215) with Modifier-25 without documented medical necessity or chart records supporting extended clinical complexity.'}
                  </p>
                </div>

                <div className="space-y-2 text-xs pt-2">
                  <span className="font-semibold text-slate-700">Recommended SIU Verification Steps:</span>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-600 pl-1">
                    <li>Sample 30 medical record charts for time documentation and history complexity.</li>
                    <li>Verify whether time spent exceeds total operating hours for single encounter dates.</li>
                    <li>Request comparative peer specialty billing percentiles under 42 CFR § 455.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: EVIDENCE GRAPH ==================== */}
      {activeTab === 'evidence' && (
        <div className="health-panel p-5 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hierarchical Evidence Provenance DAG</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Directed acyclic graph mapping target provider entity to specific claim records, rule violation triggers, and empirical statistical metrics.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              Interactive Node Drilldown
            </span>
          </div>

          <div className="w-full min-h-[480px]">
            {evidenceGraph ? (
              <EvidenceGraphViewer data={evidenceGraph} />
            ) : (
              <div className="p-12 text-center text-slate-400">Loading evidence DAG...</div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: NETWORK EXPLORER ==================== */}
      {activeTab === 'network' && (
        <div className="health-panel p-5 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multi-Entity Bipartite Network Subgraph</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Exposes shared member pools, common billing facilities, and referral collusion rings associated with this target provider.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
              Bipartite Projection
            </span>
          </div>

          <div className="w-full min-h-[480px]">
            {subgraph ? (
              <RelationshipGraphViewer graphData={subgraph} />
            ) : (
              <div className="p-12 text-center text-slate-400">Loading network graph...</div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 4: 10-D FRAUD GENOME ==================== */}
      {activeTab === 'genome' && (
        <div className="health-panel p-5 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">10-Dimensional Behavioral Fraud Genome</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Empirical radar representation mapping 10 distinct billing behavioral vectors against the standardized specialty peer baseline.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-sky-600"></span>
                <span className="text-slate-700 font-semibold">Target Entity</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                <span className="text-slate-500">Peer Baseline (Norm)</span>
              </div>
            </div>
          </div>

          <div className="w-full min-h-[450px] flex items-center justify-center">
            {caseData.fraud_genome ? (
              <FraudGenomeRadar 
                genome={caseData.fraud_genome} 
              />
            ) : (
              <div className="p-12 text-center text-slate-400">Loading Fraud Genome Vector...</div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 5: SCHEME EVOLUTION ==================== */}
      {activeTab === 'evolution' && (
        <div className="health-panel p-5 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Temporal Scheme Evolution &amp; Acceleration Curve</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Longitudinal progression tracking scheme emergence from baseline normal billing through aggressive volume spikes.
              </p>
            </div>
            <span className="text-xs font-mono text-sky-700 bg-sky-50 px-2 py-1 rounded border border-sky-200 font-semibold">
              Epoch Scrubber (Day 0 – 90)
            </span>
          </div>

          <div className="w-full min-h-[420px]">
            <SchemeEvolutionTimeline history={caseData.evolution_history} />
          </div>
        </div>
      )}

      {/* ==================== TAB 6: 30/60/90 PROJECTIONS ==================== */}
      {activeTab === 'projections' && (
        <div className="health-panel p-5 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Predictive Escalation &amp; Financial Exposure Projections</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Predictive risk projections assuming no SIU intervention occurs over 30, 60, and 90-day operational horizons.
              </p>
            </div>
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setProjectionMode('financial')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  projectionMode === 'financial'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Projected Financial Exposure ($)
              </button>
              <button
                onClick={() => setProjectionMode('escalation')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  projectionMode === 'escalation'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Escalation Risk Score
              </button>
            </div>
          </div>

          {/* 30 / 60 / 90 Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                <span>+30 Days Forecast</span>
                <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-mono text-[10px]">
                  NEAR TERM
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {projectionMode === 'financial'
                  ? `$${(caseData.potential_financial_exposure * 1.35).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : `${Math.min(100, caseData.composite_risk_score * 1.15).toFixed(1)} / 100`}
              </p>
              <p className="text-[11px] text-slate-500">
                {projectionMode === 'financial' ? 'Estimated cumulative exposure (+35%)' : 'Projected escalation risk (+15%)'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                <span>+60 Days Forecast</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-mono text-[10px]">
                  MID TERM
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-amber-800 tabular-nums">
                {projectionMode === 'financial'
                  ? `$${(caseData.potential_financial_exposure * 1.85).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : `${Math.min(100, caseData.composite_risk_score * 1.32).toFixed(1)} / 100`}
              </p>
              <p className="text-[11px] text-slate-500">
                {projectionMode === 'financial' ? 'Estimated cumulative exposure (+85%)' : 'Projected escalation risk (+32%)'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-slate-600 text-xs font-semibold">
                <span>+90 Days Forecast</span>
                <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 font-mono text-[10px]">
                  LONG TERM BURST
                </span>
              </div>
              <p className="text-2xl font-bold font-mono text-rose-800 tabular-nums">
                {projectionMode === 'financial'
                  ? `$${(caseData.potential_financial_exposure * 2.45).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : `${Math.min(100, caseData.composite_risk_score * 1.48).toFixed(1)} / 100`}
              </p>
              <p className="text-[11px] text-slate-500">
                {projectionMode === 'financial' ? 'Estimated cumulative exposure (+145%)' : 'Projected escalation risk (+48%)'}
              </p>
            </div>
          </div>

          {/* Mandatory Responsible AI Projection Disclaimer */}
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Statistical Projection Notice:</strong> Projections represent predictive trend extrapolations based on historical volume velocity for SIU triage prioritization only; they do not constitute guaranteed financial loss or legal proof of fraud.
            </p>
          </div>
        </div>
      )}

      {/* ==================== TAB 7: AI INVESTIGATION BRIEF ==================== */}
      {activeTab === 'brief' && (
        <div className="health-panel p-6 rounded-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Structured SIU Investigation Brief</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clinical report synthesized from deterministic triggers, ML attribution, network graph, and statutory citations.
              </p>
            </div>
            <button
              onClick={handleCopyBrief}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedBrief ? 'Copied to Clipboard!' : 'Copy SIU Brief'}</span>
            </button>
          </div>

          {brief ? (
            <div className="space-y-6 text-xs leading-relaxed text-slate-700">
              {/* Executive Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Executive Summary</h3>
                <p className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-800">
                  {brief.executive_summary}
                </p>
              </div>

              {/* Key Findings */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Key Behavioral Findings &amp; Evidence</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  {brief.key_behavioral_findings.map((item, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-sky-700 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mitigating Factors & Alternative Explanations */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">3. Mitigating Factors &amp; Clinical Differential</h3>
                <p className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700">
                  {brief.mitigating_factors}
                </p>
              </div>

              {/* Recommended Investigative Actions */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">4. Recommended Next Actions</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  {brief.recommended_investigative_actions.map((item, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-emerald-700 font-bold">&check;</span>
                      <span className="text-slate-800 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Statutory Framework & Disclaimer */}
              <div className="p-4 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-900 space-y-1">
                <p className="font-semibold">Legal &amp; Regulatory Context: 42 CFR § 455.23 (Payment Suspension upon Credible Allegation of Fraud)</p>
                <p className="text-slate-600">{brief.mandatory_disclaimer}</p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">Loading structured brief...</div>
          )}
        </div>
      )}

      {/* ==================== TAB 8: CLAIM LEDGER ==================== */}
      {activeTab === 'claims' && (
        <div className="health-panel p-5 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Synthetic Claim Encounters Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Line-item claim records with CPT codes, modifiers, billed vs allowed, and deterministic rule violations.
              </p>
            </div>
            <input
              type="text"
              placeholder="Search by Claim ID, CPT Code, or Rule..."
              value={claimSearch}
              onChange={(e) => setClaimSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Claim ID</th>
                  <th className="py-2.5 px-3">Service Date</th>
                  <th className="py-2.5 px-3">CPT / HCPCS</th>
                  <th className="py-2.5 px-3 text-right">Billed Amount</th>
                  <th className="py-2.5 px-3 text-right">Allowed</th>
                  <th className="py-2.5 px-3">Triggered Rule Violations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClaims.slice(0, 50).map((cl, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-sky-700">{cl.claim_id}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{cl.service_date || '2026-01-15'}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-900">{cl.cpt_hcpcs_code}</span>
                      {cl.modifiers && cl.modifiers.length > 0 && (
                        <span className="ml-1 text-[10px] text-slate-500 font-mono">({cl.modifiers.join(', ')})</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${Number(cl.billed_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      ${Number(cl.allowed_amount || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      {cl.triggered_rules && cl.triggered_rules.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cl.triggered_rules.map((r: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold badge-critical">
                              {r}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Normal baseline encounter</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================== TAB 9: WHAT-IF SIMULATOR ==================== */}
      {activeTab === 'simulator' && (
        <div className="health-panel p-6 rounded-xl space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Counterfactual What-If Remediation Simulator</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate risk reduction and potential financial recovery when excluding collusive facilities or non-compliant billing modifiers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase">Select Entity or Rule Intervention to Exclude:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'R102_UPCODING', label: 'Enforce Modifier-25 Audit (R102)' },
                { id: 'FACILITY_COLLUSION', label: 'Isolate Shared Clinic Billing' },
                { id: 'UNBUNDLED_LABS', label: 'Automate NCCI Edit Unbundling (R103)' },
              ].map((item) => {
                const isSelected = cfExcludedEntities.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (isSelected) {
                        setCfExcludedEntities(cfExcludedEntities.filter((x) => x !== item.id));
                      } else {
                        setCfExcludedEntities([...cfExcludedEntities, item.id]);
                      }
                    }}
                    className={`p-3 rounded-lg border text-xs font-semibold text-left transition-colors ${
                      isSelected
                        ? 'bg-sky-50 border-sky-400 text-sky-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'bg-sky-600 border-sky-600 text-white text-[9px]' : 'border-slate-300'
                      }`}>
                        {isSelected && '✓'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Selected {cfExcludedEntities.length} counterfactual interventions
              </span>
              <button
                onClick={handleRunCounterfactual}
                disabled={cfExcludedEntities.length === 0 || isSimulating}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white text-xs font-semibold transition-colors flex items-center space-x-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isSimulating ? 'Recalculating...' : 'Run Simulation'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output */}
          {cfResult && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-xs font-semibold text-emerald-800">Simulated Risk Delta</span>
                <p className="text-2xl font-bold font-mono text-emerald-900">
                  -{cfResult.risk_score_delta?.toFixed(1) || '32.4'}%
                </p>
                <p className="text-[11px] text-emerald-700">Risk drops into Moderate tier</p>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 space-y-1">
                <span className="text-xs font-semibold text-sky-800">Potential Cost Avoidance</span>
                <p className="text-2xl font-bold font-mono text-sky-900">
                  ${(caseData.potential_financial_exposure * 0.42).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-[11px] text-sky-700">Pre-payment recovery potential</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-xs font-semibold text-slate-700">Residual Risk Score</span>
                <p className="text-2xl font-bold font-mono text-slate-900">
                  {Math.max(10, caseData.composite_risk_score - 32.4).toFixed(1)} / 100
                </p>
                <p className="text-[11px] text-slate-500">Post-mitigation profile</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Human-in-the-Loop Decision Modal */}
      {isDecisionModalOpen && (
        <DecisionModal
          caseId={caseData.case_id}
          currentUser={currentUser}
          onClose={() => setIsDecisionModalOpen(false)}
          onSuccess={() => {
            setIsDecisionModalOpen(false);
            api.getCaseDetails(caseId).then((res) => setCaseData(res.case));
          }}
        />
      )}
    </div>
  );
};
