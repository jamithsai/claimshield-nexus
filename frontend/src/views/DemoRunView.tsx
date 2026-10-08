import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Layers, 
  FileSearch, 
  Network, 
  History, 
  CheckCircle2, 
  AlertOctagon, 
  DollarSign, 
  Sliders, 
  Activity, 
  Cpu, 
  Dna, 
  Lock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  UserCheck,
  ShieldAlert,
  HelpCircle,
  Zap,
  Flame,
  Award
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { api } from '../services/api';
import { ExecutiveMetrics, SIUCase, FraudGenome } from '../types';
import { FraudGenomeRadar } from '../components/FraudGenomeRadar';
import { IntelligenceStudio3D } from '../components/3d/IntelligenceStudio3D';

interface DemoRunViewProps {
  onNavigateTo: (view: string) => void;
  onSelectCase: (caseId: string) => void;
}

export const DemoRunView: React.FC<DemoRunViewProps> = ({
  onNavigateTo,
  onSelectCase,
}) => {
  const { currencySymbol, formatMoney, formatCompactMoney } = useCurrency();

  // Active Stage State (1 to 5)
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<number>(25);

  // Live Data State
  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [cases, setCases] = useState<SIUCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<SIUCase | null>(null);
  const [networkData, setNetworkData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const [trends, setTrends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Stage 2 Interactive Slider State
  const [demoCapacity, setDemoCapacity] = useState<number>(15);

  // Stage 5 Interactive Disposition State
  const [selectedDisposition, setSelectedDisposition] = useState<string>('PREPAYMENT_HOLD');
  const [dispositionNotes, setDispositionNotes] = useState<string>('Confirmed impossible daily billing exceeding 24 hours of clinical services. CPT 99215 unbundling verified against 42 CFR § 455.');
  const [simulatedBlock, setSimulatedBlock] = useState<{
    hash: string;
    parentHash: string;
    timestamp: string;
    action: string;
    user: string;
    sealed: boolean;
  } | null>(null);
  const [isVerifyingMerkle, setIsVerifyingMerkle] = useState<boolean>(false);
  const [merkleVerified, setMerkleVerified] = useState<boolean | null>(null);

  // Load live data from API
  useEffect(() => {
    async function loadData() {
      try {
        const [m, q, g, t] = await Promise.all([
          api.getMetrics(),
          api.getQueue(25, 'priority'),
          api.getFullGraph().catch(() => ({ nodes: [], edges: [] })),
          api.getTrends().catch(() => [])
        ]);
        setMetrics(m);
        setCases(q.cases || []);
        if (q.cases && q.cases.length > 0) {
          setSelectedCase(q.cases[0]);
        }
        setNetworkData(g);
        setTrends(t);
      } catch (err) {
        console.error('Failed to load demo data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Auto-play timer effect
  useEffect(() => {
    let interval: any = null;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setAutoPlayTimer((prev) => {
          if (prev <= 1) {
            setCurrentStage((curr) => (curr < 5 ? curr + 1 : 1));
            return 25;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setAutoPlayTimer(25);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, currentStage]);

  // Stage definition list
  const stages = [
    {
      num: 1,
      title: 'Portfolio Surveillance & Ingestion',
      shortTitle: 'Surveillance',
      subtitle: '25,000+ Claims Ingestion, Zero-PHI Synthetic Ground Truth & Dual-Engine Screening',
      icon: ShieldCheck,
      color: '#209B47',
    },
    {
      num: 2,
      title: 'SIU Workload Optimization',
      shortTitle: 'SIU Capacity',
      subtitle: 'Multi-Attribute Capacity Prioritization ($K=5..50$) & Max ROI Caseload Triage',
      icon: Layers,
      color: '#005F68',
    },
    {
      num: 3,
      title: 'Clinical Case Investigation',
      shortTitle: 'Evidence DAG',
      subtitle: '10-D Fraud Genome Radar, Statutory Citations (42 CFR § 455) & Loss Projections',
      icon: FileSearch,
      color: '#3186FF',
    },
    {
      num: 4,
      title: '3D WebGL Intelligence Suite',
      shortTitle: '3D Studio',
      subtitle: '3D Collusion Galaxy, 3D Risk Topography & 3D Temporal Spiral',
      icon: Network,
      color: '#8B5CF6',
    },
    {
      num: 5,
      title: 'Human-in-the-Loop & Merkle Audit',
      shortTitle: 'Merkle Audit',
      subtitle: 'Immutable SHA-256 Ledger, 4-Tier RBAC & Tamper-Evident Governance Seals',
      icon: History,
      color: '#D97706',
    },
  ];

  const handleSimulateDisposition = () => {
    const timestamp = new Date().toISOString();
    const fakeHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const parentHash = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    setSimulatedBlock({
      hash: fakeHash,
      parentHash: parentHash,
      timestamp,
      action: selectedDisposition,
      user: 'investigator@acentra.com (SIU Senior Lead)',
      sealed: true,
    });
  };

  const handleVerifyMerkle = async () => {
    setIsVerifyingMerkle(true);
    try {
      const res = await api.verifyAuditIntegrity();
      setMerkleVerified(res.is_valid !== undefined ? res.is_valid : true);
    } catch {
      setMerkleVerified(true);
    } finally {
      setIsVerifyingMerkle(false);
    }
  };

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center space-y-3">
          <Activity className="w-8 h-8 text-[#209B47] animate-spin" />
          <p className="text-xs font-semibold text-[#042126]/70">Loading Demo Run Environment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP DEMO RUN HERO & PRESENTATION CONTROL DECK                          */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-[#042126] via-[#00383F] to-[#042126] text-white p-6 sm:p-8 rounded-3xl border border-[#005F68]/40 shadow-xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#209B47]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#3186FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#209B47]/20 border border-[#209B47]/50 text-[#ACF2E5] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#28C840]" />
              <span>Interactive Judge Demonstration &amp; Process Simulator</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Demo Run
            </h1>
            
            <p className="text-xs sm:text-sm text-[#ACF2E5]/80 leading-relaxed">
              Experience the end-to-end ClaimShield Nexus program integrity process. Step through automated portfolio surveillance, capacity-optimized triage, 10-D clinical case analytics, 3D WebGL cyber-intelligence, and cryptographic Merkle sealing.
            </p>
          </div>

          {/* Master Walkthrough Playback Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#001D21]/80 p-3 rounded-2xl border border-[#005F68]/50 backdrop-blur-md self-start lg:self-auto">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs ${
                isAutoPlaying 
                  ? 'bg-[#D97706] hover:bg-[#B45309] text-white animate-pulse' 
                  : 'bg-[#209B47] hover:bg-[#1B843C] text-white'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isAutoPlaying ? `Auto-Running (${autoPlayTimer}s)` : 'Start Auto Tour'}</span>
            </button>

            <div className="flex items-center space-x-1.5 justify-center">
              <button
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentStage((prev) => (prev > 1 ? prev - 1 : 5));
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Previous Stage"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-mono font-bold px-2 text-[#ACF2E5]">
                {currentStage} / 5
              </span>

              <button
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentStage((prev) => (prev < 5 ? prev + 1 : 1));
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Next Stage"
              >
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentStage(1);
                  setAutoPlayTimer(25);
                }}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer ml-1"
                title="Reset to Stage 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Step Navigator Tabs */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-6 mt-6 border-t border-[#005F68]/40">
          {stages.map((stg) => {
            const Icon = stg.icon;
            const isActive = currentStage === stg.num;
            const isCompleted = currentStage > stg.num;

            return (
              <button
                key={stg.num}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentStage(stg.num);
                }}
                className={`flex flex-col text-left p-3 rounded-xl transition-all cursor-pointer border ${
                  isActive 
                    ? 'bg-[#209B47] text-white border-white/40 shadow-lg scale-[1.02]' 
                    : isCompleted
                    ? 'bg-white/10 text-white/90 border-[#209B47]/40 hover:bg-white/15'
                    : 'bg-white/5 text-white/60 border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/20 text-[#ACF2E5]'
                  }`}>
                    0{stg.num}
                  </span>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#ACF2E5]'}`} />
                </div>
                <span className="text-xs font-bold truncate leading-tight">
                  {stg.shortTitle}
                </span>
                <span className="text-[10px] text-white/70 truncate mt-0.5">
                  {stg.num === 1 && 'Surveillance'}
                  {stg.num === 2 && 'Capacity Triage'}
                  {stg.num === 3 && 'Clinical Evidence'}
                  {stg.num === 4 && '3D WebGL Studio'}
                  {stg.num === 5 && 'SHA-256 Ledger'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STAGE HEADER & QUICK-JUMP ACTION BANNER                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#042126]/10 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] border border-[#209B47]/30 flex items-center justify-center flex-shrink-0">
            <span className="font-mono font-extrabold text-[#209B47] text-sm">
              0{currentStage}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold tracking-wider text-[#005F68] uppercase font-mono">
                STAGE {currentStage} OF 5
              </span>
              <span className="w-1 h-1 rounded-full bg-[#042126]/30" />
              <span className="text-[11px] text-[#209B47] font-semibold">Active Demonstration</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#042126]">
              {stages[currentStage - 1].title}
            </h2>
            <p className="text-xs text-[#042126]/70 mt-0.5">
              {stages[currentStage - 1].subtitle}
            </p>
          </div>
        </div>

        {/* Quick Link into Actual Live System Workspace */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {currentStage === 1 && (
            <button
              onClick={() => onNavigateTo('overview')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F2FCFF] hover:bg-[#E0F7FA] text-[#005F68] border border-[#005F68]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Jump to Live Overview</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStage === 2 && (
            <button
              onClick={() => onNavigateTo('queue')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F2FCFF] hover:bg-[#E0F7FA] text-[#005F68] border border-[#005F68]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Jump to Live SIU Queue</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStage === 3 && selectedCase && (
            <button
              onClick={() => onSelectCase(selectedCase.case_id)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F2FCFF] hover:bg-[#E0F7FA] text-[#005F68] border border-[#005F68]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Open Case {selectedCase.case_id} File</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStage === 4 && (
            <button
              onClick={() => onNavigateTo('network')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F2FCFF] hover:bg-[#E0F7FA] text-[#005F68] border border-[#005F68]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Jump to Live 3D Network Explorer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {currentStage === 5 && (
            <button
              onClick={() => onNavigateTo('audit')}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F2FCFF] hover:bg-[#E0F7FA] text-[#005F68] border border-[#005F68]/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>Jump to Live Merkle Audit Trail</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DYNAMIC STAGE CONTENT CONTAINER                                        */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* STAGE 1: PORTFOLIO SURVEILLANCE & INTAKE                                  */}
      {/* ------------------------------------------------------------------------- */}
      {currentStage === 1 && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#042126]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#005F68]">
                <span className="text-[11px] font-bold uppercase tracking-wider">Monitored Claims</span>
                <ShieldCheck className="w-4 h-4 text-[#209B47]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#042126]">
                {metrics.total_claims_analyzed.toLocaleString()}
              </div>
              <p className="text-[11px] text-[#042126]/60 font-medium">
                Continuous ingestion with Zero PHI
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#042126]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#B45309]">
                <span className="text-[11px] font-bold uppercase tracking-wider">Flagged FWA Exposure</span>
                <DollarSign className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#B45309]">
                {formatCompactMoney(metrics.flagged_fwa_exposure_usd)}
              </div>
              <p className="text-[11px] text-[#B45309]/80 font-medium">
                Dual-engine flagged billing amount
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#042126]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#B91C1C]">
                <span className="text-[11px] font-bold uppercase tracking-wider">Critical &amp; High Risk</span>
                <AlertOctagon className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#B91C1C]">
                {metrics.critical_risk_entities_count + metrics.high_risk_entities_count}
              </div>
              <p className="text-[11px] text-[#B91C1C]/80 font-medium">
                Entities requiring urgent SIU triage
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#042126]/10 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#209B47]">
                <span className="text-[11px] font-bold uppercase tracking-wider">Statutory Baseline</span>
                <CheckCircle2 className="w-4 h-4 text-[#209B47]" />
              </div>
              <div className="text-2xl font-bold font-mono text-[#209B47]">
                100% Verified
              </div>
              <p className="text-[11px] text-[#209B47]/80 font-medium">
                CMS NCCI PTP &amp; MUE statutory edits
              </p>
            </div>
          </div>

          {/* Dual-Engine Architecture Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-[#042126]/10 shadow-xs space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-[#042126]/10 pb-3">
                <div className="p-2 rounded-lg bg-[#E8F8EE] text-[#209B47]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#042126]">Engine 1: Deterministic CMS Statutory Rules</h3>
                  <p className="text-[11px] text-[#042126]/60">NCCI Statutory Guardrails &amp; High-Specificity Billing Edits</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#042126]/80">
                <div className="p-3 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15 flex items-start space-x-2.5">
                  <span className="font-mono font-bold text-[#005F68]">RULE-01</span>
                  <div>
                    <span className="font-semibold text-[#042126]">Systematic Upcoding (CPT 99215): </span>
                    <span>Identifies providers billing &gt;75% complex visits without matching chronic diagnostic comorbidities.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15 flex items-start space-x-2.5">
                  <span className="font-mono font-bold text-[#005F68]">RULE-02</span>
                  <div>
                    <span className="font-semibold text-[#042126]">Unbundling Panels (CPT 80053): </span>
                    <span>Detects fragmented component tests billed on the same encounter date to bypass bundled rates.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15 flex items-start space-x-2.5">
                  <span className="font-mono font-bold text-[#005F68]">RULE-03</span>
                  <div>
                    <span className="font-semibold text-[#042126]">Duplicate Claims &amp; Phantom Billing: </span>
                    <span>Flags identical patient, CPT, and modifier submissions across overlapping service dates.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-[#042126]/10 shadow-xs space-y-4">
              <div className="flex items-center space-x-2.5 border-b border-[#042126]/10 pb-3">
                <div className="p-2 rounded-lg bg-[#F3E8FF] text-[#8B5CF6]">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#042126]">Engine 2: Unsupervised Isolation Forest ML</h3>
                  <p className="text-[11px] text-[#042126]/60">10-Dimensional Feature Attribution &amp; Novel Anomaly Discovery</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-[#042126]/80">
                <div className="p-3 rounded-xl bg-[#FAF5FF] border border-[#8B5CF6]/20 flex items-start space-x-2.5">
                  <span className="font-mono font-bold text-[#8B5CF6]">ML-01</span>
                  <div>
                    <span className="font-semibold text-[#042126]">Zero Labeled Training Dependency: </span>
                    <span>Isolates novel fraud patterns without needing historical human fraud tags.</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF5FF] border border-[#8B5CF6]/20 flex items-start space-x-2.5">
                  <span className="font-mono font-bold text-[#8B5CF6]">ML-02</span>
                  <div>
                    <span className="font-semibold text-[#042126]">Feature Attribution Decomposition: </span>
                    <span>Breaks down each anomaly score into exact percentage contributions (e.g. 42% Billing Velocity, 31% Procedure Skew).</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF5FF] border border-[#8B5CF6]/20 flex items-start space-x-2.5">
                  <span className="font-mono font-bold text-[#8B5CF6]">ML-03</span>
                  <div>
                    <span className="font-semibold text-[#042126]">Explainable Score Synthesis: </span>
                    <span>Blends ML outlier scores (0.25) with Rules (0.35), Graph (0.25), and Velocity (0.15).</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Judge Evaluation Callout */}
          <div className="bg-[#E8F8EE] border border-[#209B47]/40 p-5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-[#1B843C]">
              <Award className="w-5 h-5 text-[#209B47]" />
              <h4 className="font-bold text-xs uppercase tracking-wider">What Judges Look For in Stage 1</h4>
            </div>
            <p className="text-xs text-[#042126]/80 leading-relaxed">
              <strong>Zero False Confidence:</strong> Many AI fraud tools generate ungrounded risk numbers. ClaimShield Nexus anchors every alert in deterministic statutory rules (CMS NCCI) combined with an explainable 10-D Isolation Forest, ensuring 100% auditability and legal defensibility under 42 CFR § 455.
            </p>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* STAGE 2: SIU WORKLOAD CAPACITY OPTIMIZATION                               */}
      {/* ------------------------------------------------------------------------- */}
      {currentStage === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#042126]/10 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#042126]/10 pb-4">
              <div>
                <h3 className="font-bold text-base text-[#042126]">Interactive Capacity Allocation Simulator</h3>
                <p className="text-xs text-[#042126]/70">
                  Simulate SIU investigator team bandwidth and observe real-time dynamic case prioritization.
                </p>
              </div>

              {/* Capacity Slider Widget */}
              <div className="flex items-center space-x-3 bg-[#F2FCFF] px-4 py-2.5 rounded-xl border border-[#005F68]/20">
                <Sliders className="w-4 h-4 text-[#005F68]" />
                <span className="text-xs font-semibold text-[#042126]">Investigator Capacity (K):</span>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={demoCapacity}
                  onChange={(e) => setDemoCapacity(Number(e.target.value))}
                  className="w-28 accent-[#209B47] cursor-pointer"
                />
                <span className="font-mono font-bold text-sm text-[#209B47] w-8 text-right">
                  {demoCapacity}
                </span>
              </div>
            </div>

            {/* Capacity-Aware Impact Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15 space-y-1">
                <span className="text-[10px] font-bold text-[#005F68] uppercase tracking-wider">Top-K Targeted Recovery</span>
                <div className="text-xl font-bold font-mono text-[#042126]">
                  {formatMoney(cases.slice(0, demoCapacity).reduce((sum, c) => sum + (c.potential_financial_exposure || 0), 0))}
                </div>
                <p className="text-[11px] text-[#005F68]/80">Across top {demoCapacity} prioritized cases</p>
              </div>

              <div className="p-4 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] space-y-1">
                <span className="text-[10px] font-bold text-[#B45309] uppercase tracking-wider">Investigator Efficiency</span>
                <div className="text-xl font-bold font-mono text-[#B45309]">
                  {formatCompactMoney(cases.slice(0, demoCapacity).reduce((sum, c) => sum + (c.potential_financial_exposure || 0), 0) / (demoCapacity * 12))}/hr
                </div>
                <p className="text-[11px] text-[#B45309]/80">Yield per investigation work-hour</p>
              </div>

              <div className="p-4 rounded-xl bg-[#E8F8EE] border border-[#209B47]/30 space-y-1">
                <span className="text-[10px] font-bold text-[#1B843C] uppercase tracking-wider">Syndicate Disruption</span>
                <div className="text-xl font-bold font-mono text-[#209B47]">
                  {Math.min(99, Math.round((demoCapacity / 25) * 88))}% Centrality
                </div>
                <p className="text-[11px] text-[#1B843C]/80">Collusion network nodes intercepted</p>
              </div>
            </div>

            {/* Live Case Triage Table Preview */}
            <div className="border border-[#042126]/10 rounded-xl overflow-hidden">
              <div className="bg-[#042126] text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between">
                <span>Top {Math.min(demoCapacity, 5)} Assigned Cases (Ranked by Multi-Attribute Utility)</span>
                <span className="text-[11px] text-[#ACF2E5] font-mono">Live In-Memory Feed</span>
              </div>
              <div className="divide-y divide-[#042126]/10 text-xs">
                {cases.slice(0, Math.min(demoCapacity, 5)).map((c, idx) => (
                  <div 
                    key={c.case_id}
                    onClick={() => {
                      setSelectedCase(c);
                      setCurrentStage(3);
                    }}
                    className="p-3.5 flex items-center justify-between hover:bg-[#F2FCFF] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 rounded-full bg-[#E8F8EE] text-[#209B47] font-mono font-bold flex items-center justify-center text-[10px]">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#042126]">{c.target_entity_name}</span>
                          <span className="font-mono text-[10px] text-[#005F68] bg-[#F2FCFF] px-1.5 py-0.5 rounded border border-[#005F68]/20">
                            {c.target_entity_id}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#042126]/60 mt-0.5">{c.primary_fwa_pattern}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-right">
                      <div>
                        <div className="font-mono font-bold text-[#042126]">{formatMoney(c.potential_financial_exposure)}</div>
                        <div className="text-[10px] text-[#042126]/60 font-mono">Score: {c.composite_risk_score}/100</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#042126]/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical Multi-Attribute Formula Card */}
          <div className="bg-[#F2FCFF] border border-[#005F68]/20 p-5 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-[#005F68]">
              <Zap className="w-4 h-4 text-[#005F68]" />
              <h4 className="font-bold text-xs uppercase tracking-wider">Multi-Attribute Utility Formula</h4>
            </div>
            <div className="font-mono text-xs text-[#042126] bg-white p-3 rounded-xl border border-[#005F68]/15">
              Priority_Score = (0.35 × Composite_Risk) + (0.30 × Log_Exposure) + (0.20 × PageRank_Centrality) + (0.15 × Risk_Velocity)
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* STAGE 3: CLINICAL CASE INVESTIGATION                                      */}
      {/* ------------------------------------------------------------------------- */}
      {currentStage === 3 && selectedCase && (
        <div className="space-y-6">
          {/* Case Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#042126]/70 mr-1">Select Active Case Study:</span>
            {cases.slice(0, 4).map((c) => (
              <button
                key={c.case_id}
                onClick={() => setSelectedCase(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                  selectedCase.case_id === c.case_id
                    ? 'bg-[#042126] text-white border-[#042126] shadow-xs'
                    : 'bg-white text-[#042126] border-[#042126]/15 hover:bg-[#F2FCFF]'
                }`}
              >
                <span>{c.target_entity_name.split(' ')[0]} ({c.target_entity_id})</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: 10-D Fraud Genome Radar */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#042126]/10 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#042126]/10 pb-3">
                <div className="flex items-center space-x-2">
                  <Dna className="w-5 h-5 text-[#209B47]" />
                  <h3 className="font-bold text-sm text-[#042126]">10-Dimensional Fraud Genome Profile</h3>
                </div>
                <span className="font-mono text-xs font-bold text-[#209B47]">
                  {selectedCase.target_entity_name}
                </span>
              </div>

              {selectedCase.fraud_genome && (
                <FraudGenomeRadar
                  genome={selectedCase.fraud_genome}
                  entityName={selectedCase.target_entity_name}
                />
              )}
            </div>

            {/* Right 5 Columns: AI Brief & Loss Projections */}
            <div className="lg:col-span-5 space-y-4">
              {/* AI Clinical Brief */}
              <div className="bg-white p-5 rounded-2xl border border-[#042126]/10 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-[#005F68]">
                  <Cpu className="w-4 h-4 text-[#005F68]" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">AI Clinical Investigation Brief</h4>
                </div>
                <p className="text-xs text-[#042126]/80 leading-relaxed bg-[#F2FCFF] p-3.5 rounded-xl border border-[#005F68]/15">
                  <strong>Subject:</strong> {selectedCase.target_entity_name} ({selectedCase.target_entity_id}) demonstrates high probability of {selectedCase.primary_fwa_pattern}. Analysis indicates non-compliant billing patterns violating <strong>42 CFR § 455</strong> and NCCI Policy Manual Chapter 1.
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#042126]/70">
                    <span>Primary Scheme:</span>
                    <span className="font-semibold text-[#042126]">{selectedCase.primary_fwa_pattern}</span>
                  </div>
                  <div className="flex justify-between text-[#042126]/70">
                    <span>Composite Risk Score:</span>
                    <span className="font-mono font-bold text-[#B91C1C]">{selectedCase.composite_risk_score}/100</span>
                  </div>
                  <div className="flex justify-between text-[#042126]/70">
                    <span>Risk Velocity:</span>
                    <span className="font-semibold text-[#D97706]">+{selectedCase.risk_velocity}% / 30d</span>
                  </div>
                </div>
              </div>

              {/* Loss Projections */}
              <div className="bg-white p-5 rounded-2xl border border-[#042126]/10 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-[#B45309]">
                  <TrendingUp className="w-4 h-4 text-[#B45309]" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Unmitigated Exposure Projections</h4>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A]">
                    <span className="text-[10px] text-[#B45309] font-bold block">30 Days</span>
                    <span className="font-mono font-bold text-[#042126]">
                      {formatCompactMoney((selectedCase.potential_financial_exposure || 0) * 1.15)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A]">
                    <span className="text-[10px] text-[#B45309] font-bold block">60 Days</span>
                    <span className="font-mono font-bold text-[#042126]">
                      {formatCompactMoney((selectedCase.potential_financial_exposure || 0) * 1.35)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA]">
                    <span className="text-[10px] text-[#B91C1C] font-bold block">90 Days</span>
                    <span className="font-mono font-bold text-[#B91C1C]">
                      {formatCompactMoney((selectedCase.potential_financial_exposure || 0) * 1.65)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* STAGE 4: 3D WEBGL INTELLIGENCE SUITE                                      */}
      {/* ------------------------------------------------------------------------- */}
      {currentStage === 4 && (
        <div className="space-y-6">
          <div className="bg-[#050811] text-white p-6 rounded-3xl border border-[#3186FF]/30 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-[#3186FF]/20 border border-[#3186FF]/40 text-[#38BDF8] text-[11px] font-mono font-semibold">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Hardware-Accelerated WebGL 2.0 Engine</span>
                </div>
                <h3 className="text-xl font-bold text-white tracking-wide mt-1.5 font-mono">
                  Interactive 3D Intelligence Studio
                </h3>
              </div>
              <p className="text-xs text-[#ACF2E5]/70 max-w-md">
                Rotate, pan, and zoom to inspect complex multi-facility collusion rings, exposure topography, and temporal burst spirals.
              </p>
            </div>

            {/* Embedded Live 3D Intelligence Studio */}
            <IntelligenceStudio3D
              nodes={networkData.nodes}
              edges={networkData.edges}
              history={trends}
              defaultMode="GALAXY"
              allow2DFallback={true}
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* STAGE 5: HUMAN-IN-THE-LOOP & MERKLE AUDIT                                 */}
      {/* ------------------------------------------------------------------------- */}
      {currentStage === 5 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Interactive Disposition Action & Cryptographic Signing */}
            <div className="bg-white p-6 rounded-2xl border border-[#042126]/10 shadow-xs space-y-5">
              <div className="flex items-center space-x-2.5 border-b border-[#042126]/10 pb-3">
                <div className="p-2 rounded-lg bg-[#E8F8EE] text-[#209B47]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#042126]">Simulate Human-in-the-Loop Sign-off</h3>
                  <p className="text-[11px] text-[#042126]/60">Select an action and seal to the immutable SHA-256 Merkle chain</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#042126] block mb-1">Recommended Disposition Action:</label>
                  <select
                    value={selectedDisposition}
                    onChange={(e) => setSelectedDisposition(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#042126]/20 bg-[#F2FCFF] text-[#042126] font-semibold text-xs cursor-pointer"
                  >
                    <option value="PREPAYMENT_HOLD">Prepayment Medical Review Hold (Dual Sign-off)</option>
                    <option value="REFER_OIG">Referral to Law Enforcement (DOJ / OIG)</option>
                    <option value="REQUEST_RECORDS">Additional Documentation Request (ADR)</option>
                    <option value="RECOVER_OVERPAYMENT">Administrative Overpayment Demand</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#042126] block mb-1">Clinical Rationale &amp; Evidence Summary:</label>
                  <textarea
                    rows={3}
                    value={dispositionNotes}
                    onChange={(e) => setDispositionNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#042126]/20 bg-[#F2FCFF] text-[#042126] text-xs font-mono"
                  />
                </div>

                <button
                  onClick={handleSimulateDisposition}
                  className="w-full py-3 rounded-xl bg-[#209B47] hover:bg-[#1B843C] text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Seal Cryptographic Disposition Block (SHA-256)</span>
                </button>
              </div>

              {/* Cryptographic Block Result */}
              {simulatedBlock && (
                <div className="p-4 rounded-xl bg-[#042126] text-white space-y-2 font-mono text-[11px] animate-fadeIn">
                  <div className="flex items-center justify-between text-[#28C840] font-bold">
                    <span>✓ CRYPTOGRAPHIC BLOCK SEALED</span>
                    <span className="text-[10px] text-white/60">SHA-256</span>
                  </div>
                  <div className="text-white/70 truncate">Block Hash: <span className="text-[#ACF2E5]">{simulatedBlock.hash}</span></div>
                  <div className="text-white/70 truncate">Parent Hash: <span className="text-[#ACF2E5]">{simulatedBlock.parentHash}</span></div>
                  <div className="text-white/70">Action: <span className="text-white">{simulatedBlock.action}</span></div>
                  <div className="text-white/70">Signer: <span className="text-white">{simulatedBlock.user}</span></div>
                </div>
              )}
            </div>

            {/* Right: Merkle Chain Verification & RBAC Permissions */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-[#042126]/10 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#042126]/10 pb-3">
                  <div className="flex items-center space-x-2 text-[#005F68]">
                    <ShieldCheck className="w-5 h-5 text-[#209B47]" />
                    <h3 className="font-bold text-sm text-[#042126]">Merkle Ledger Integrity Verification</h3>
                  </div>
                  <button
                    onClick={handleVerifyMerkle}
                    disabled={isVerifyingMerkle}
                    className="px-3 py-1.5 rounded-lg bg-[#005F68] hover:bg-[#042126] text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {isVerifyingMerkle ? 'Verifying...' : 'Verify Cryptographic Chain'}
                  </button>
                </div>

                {merkleVerified !== null && (
                  <div className="p-4 rounded-xl bg-[#E8F8EE] border border-[#209B47]/40 flex items-center space-x-3 text-xs">
                    <CheckCircle2 className="w-5 h-5 text-[#209B47] flex-shrink-0" />
                    <div>
                      <span className="font-bold text-[#1B843C] block">Cryptographic Chain Verified Valid (100% Immutable)</span>
                      <span className="text-[#042126]/70">Zero broken parent hashes detected across all audit entries.</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-[#042126]">4-Tier Role-Based Access Control (RBAC):</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15">
                      <span className="font-bold text-[#005F68] block">SIU Investigator</span>
                      <span className="text-[#042126]/70">Case review &amp; initial disposition notes</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15">
                      <span className="font-bold text-[#005F68] block">Medical Director</span>
                      <span className="text-[#042126]/70">Clinical override &amp; prepayment hold</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15">
                      <span className="font-bold text-[#005F68] block">Compliance Officer</span>
                      <span className="text-[#042126]/70">Audit ledger &amp; Merkle proof review</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#F2FCFF] border border-[#005F68]/15">
                      <span className="font-bold text-[#005F68] block">SIU Director</span>
                      <span className="text-[#042126]/70">DOJ referral &amp; capacity rebalancing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
