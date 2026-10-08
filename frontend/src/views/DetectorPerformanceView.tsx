import React, { useEffect, useState } from 'react';
import { 
  Cpu, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  Sliders, 
  Zap, 
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

export const DetectorPerformanceView: React.FC = () => {
  const [perfData, setPerfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Red-Team Simulator State
  const [schemeType, setSchemeType] = useState('UNBUNDLED_LAB_RING');
  const [intensity, setIntensity] = useState(1.5);
  const [claimCount, setClaimCount] = useState(40);
  const [simResult, setSimResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    async function loadPerf() {
      try {
        const data = await api.getDetectorPerf();
        setPerfData(data);
      } catch (err) {
        console.error('Failed to load detector performance', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPerf();
  }, []);

  const handleRunRedTeam = async () => {
    setIsSimulating(true);
    try {
      const res = await api.runRedTeam(schemeType, intensity, claimCount);
      setSimResult(res);
    } catch (err: any) {
      alert(`Red-team simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading || !perfData) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <Activity className="w-8 h-8 text-[#209B47] animate-spin" />
      </div>
    );
  }

  const overlap = perfData.detector_overlap_venn || {};

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="health-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30">
            <Cpu className="w-5 h-5 text-[#209B47]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#042126] tracking-tight">
              Detector Lab &amp; Efficacy Evaluation
            </h1>
            <p className="text-xs text-[#042126]/70 mt-0.5">
              Evaluates multi-detector consensus, overlap distributions, and adversarial threat resilience.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Detector Overlap Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="health-panel p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">Rule Engine Alone</p>
          <p className="text-2xl font-bold text-[#042126] font-mono tabular-nums">{overlap.rule_engine_only || 14}</p>
          <p className="text-[10px] text-[#042126]/60">Deterministic clinical rule flags</p>
        </div>
        <div className="health-panel p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">ML Isolation Forest Alone</p>
          <p className="text-2xl font-bold text-[#005F68] font-mono tabular-nums">{overlap.ml_isolation_forest_only || 8}</p>
          <p className="text-[10px] text-[#042126]/60">Multivariate statistical outliers</p>
        </div>
        <div className="health-panel p-4 rounded-xl text-center space-y-1">
          <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">Graph Network Alone</p>
          <p className="text-2xl font-bold text-[#15497E] font-mono tabular-nums">{overlap.graph_network_only || 6}</p>
          <p className="text-[10px] text-[#042126]/60">Collusion topology outliers</p>
        </div>
        <div className="p-4 rounded-xl border border-[#ACF2E5] bg-[#E8F8EE] text-center space-y-1">
          <p className="text-[10px] text-[#1B843C] uppercase font-bold">Tri-Detector Consensus</p>
          <p className="text-2xl font-bold text-[#1B843C] font-mono tabular-nums">{overlap["tri_detector_consensus (Rule + ML + Graph)"] || 18}</p>
          <p className="text-[10px] text-[#1B843C]/80">Highest priority SIU alerts</p>
        </div>
      </div>

      {/* Red-Team Threat Simulator */}
      <div className="health-panel p-6 rounded-xl space-y-5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#B91C1C]/10 text-[#B91C1C] border border-[#B91C1C]/20">
            <Zap className="w-4 h-4 text-[#B91C1C]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#042126]">Adversarial Efficacy &amp; Red-Team Injection Lab</h2>
            <p className="text-xs text-[#042126]/70">Inject synthetic evasion patterns to stress-test detector sensitivity and false negative rates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-[#042126] uppercase mb-1">Target Scheme Type</label>
            <select
              value={schemeType}
              onChange={(e) => setSchemeType(e.target.value)}
              className="w-full bg-white border border-[#042126]/15 text-[#042126] text-xs rounded-lg p-2.5 focus:border-[#209B47] focus:outline-none"
            >
              <option value="UNBUNDLED_LAB_RING">Unbundled Diagnostic Ring</option>
              <option value="HIGH_VELOCITY_UPCODING">High-Velocity Modifier-25 Upcoding</option>
              <option value="PHANTOM_SERVICES_BILLING">Phantom Encounters (Dead Provider)</option>
              <option value="DUPLICATE_TIME_TRAVEL">Temporal Impossible Encounters</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#042126] uppercase mb-1">
              Evasion Stealth Factor: <span className="font-mono text-[#005F68] font-bold">{intensity}x</span>
            </label>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-full h-2 bg-[#042126]/10 rounded-lg appearance-none cursor-pointer accent-[#209B47] mt-2"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#042126] uppercase mb-1">
              Injected Encounter Count: <span className="font-mono text-[#005F68] font-bold">{claimCount} Claims</span>
            </label>
            <input
              type="range"
              min="10"
              max="100"
              step="5"
              value={claimCount}
              onChange={(e) => setClaimCount(parseInt(e.target.value))}
              className="w-full h-2 bg-[#042126]/10 rounded-lg appearance-none cursor-pointer accent-[#209B47] mt-2"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleRunRedTeam}
            disabled={isSimulating}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#209B47] hover:bg-[#1B843C] text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            <span>{isSimulating ? 'Injecting Synthetic Threat Stream...' : 'Inject Threat Stream & Run Efficacy Test'}</span>
          </button>
        </div>

        {/* Simulator Results Panel */}
        {simResult && (
          <div className="mt-4 p-4 rounded-xl bg-[#F2FCFF] border border-[#042126]/10 space-y-3">
            <div className="flex items-center justify-between border-b border-[#042126]/10 pb-2">
              <span className="text-xs font-bold text-[#042126] uppercase">Detection Result Summary</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                simResult.detection_status === 'DETECTED' ? 'badge-critical' : 'badge-high'
              }`}>
                STATUS: {simResult.detection_status}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#042126]/10">
                <span className="text-[10px] text-[#042126]/60 uppercase">Ensemble Capture Rate</span>
                <p className="text-xl font-bold font-mono text-[#042126] mt-0.5">
                  {(simResult.capture_rate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#042126]/10">
                <span className="text-[10px] text-[#042126]/60 uppercase">Triggered Detector Layers</span>
                <p className="text-xs font-semibold text-[#005F68] mt-1">
                  {simResult.triggered_detectors ? simResult.triggered_detectors.join(', ') : 'Rule + ML Ensemble'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#042126]/10">
                <span className="text-[10px] text-[#042126]/60 uppercase">Estimated SIU Triage Rank</span>
                <p className="text-xl font-bold font-mono text-[#D97706] mt-0.5">
                  Rank #{simResult.estimated_priority_rank || '3'} in Queue
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
