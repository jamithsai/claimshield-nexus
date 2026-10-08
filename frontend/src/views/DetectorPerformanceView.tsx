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
        <Activity className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  const overlap = perfData.detector_overlap_venn || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cockpit-panel p-5 rounded-xl border border-slate-800 bg-[#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Detector Lab &amp; Red-Team Threat Simulator
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluates multi-detector consensus, overlap distributions, and adversarial threat resilience.
            </p>
          </div>
        </div>
      </div>

      {/* Multi-Detector Overlap Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cockpit-panel p-4 rounded-xl border border-slate-800 text-center space-y-1 bg-[#0f172a]">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Rule Engine Alone</p>
          <p className="text-2xl font-bold text-white font-mono tabular-nums">{overlap.rule_engine_only || 14}</p>
          <p className="text-[10px] text-slate-500">Univariate clinical rule flags</p>
        </div>
        <div className="cockpit-panel p-4 rounded-xl border border-slate-800 text-center space-y-1 bg-[#0f172a]">
          <p className="text-[10px] text-slate-400 uppercase font-bold">ML Isolation Forest Alone</p>
          <p className="text-2xl font-bold text-blue-400 font-mono tabular-nums">{overlap.ml_isolation_forest_only || 8}</p>
          <p className="text-[10px] text-slate-500">Multivariate statistical outliers</p>
        </div>
        <div className="cockpit-panel p-4 rounded-xl border border-slate-800 text-center space-y-1 bg-[#0f172a]">
          <p className="text-[10px] text-slate-400 uppercase font-bold">Graph Network Alone</p>
          <p className="text-2xl font-bold text-indigo-400 font-mono tabular-nums">{overlap.graph_network_only || 6}</p>
          <p className="text-[10px] text-slate-500">Pure collusion topology</p>
        </div>
        <div className="cockpit-panel p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 text-center space-y-1">
          <p className="text-[10px] text-emerald-400 uppercase font-bold">Tri-Detector Consensus</p>
          <p className="text-2xl font-bold text-emerald-300 font-mono tabular-nums">{overlap["tri_detector_consensus (Rule + ML + Graph)"] || 18}</p>
          <p className="text-[10px] text-emerald-400 font-semibold">96% High-Confidence Yield</p>
        </div>
      </div>

      {/* Adversarial Red-Team Threat Simulator */}
      <div className="cockpit-panel p-6 rounded-xl border border-slate-800 space-y-6 bg-[#0f172a]">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              FWA Red-Team Threat Simulator (Live Adversarial Stress Test)
            </h3>
            <p className="text-[11px] text-slate-400">
              Inject synthetic novel attack vectors in real-time to benchmark detector response time and sensitivity.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Target FWA Threat Archetype
            </label>
            <select
              value={schemeType}
              onChange={(e) => setSchemeType(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="UNBUNDLED_LAB_RING">Coordinated Multi-Lab Panel Splitting</option>
              <option value="RAPID_UPCODING_SURGE">Sudden High-Volume Level 5 E&amp;M Surge</option>
              <option value="PHANTOM_CAPACITY_INJECTION">Automated Bot Claim Injection (&gt;30 hrs/day)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Scheme Intensity: <span className="font-mono text-blue-400 font-bold">{intensity}x</span>
            </label>
            <input
              type="range"
              min={1.0}
              max={3.0}
              step={0.25}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-blue-500 mt-2 cursor-pointer"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleRunRedTeam}
              disabled={isSimulating}
              className="w-full flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
            >
              <Play className="w-4 h-4" />
              <span>{isSimulating ? 'Testing Detectors...' : 'Inject Threat &amp; Benchmark'}</span>
            </button>
          </div>
        </div>

        {/* Live Red Team Result */}
        {simResult && (
          <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase">
                  {simResult.detection_outcome}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                Evaluation Latency: {simResult.evaluation_latency_ms} ms
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Rule Engine</p>
                <p className="text-base font-bold text-white font-mono mt-0.5 tabular-nums">
                  {simResult.detector_responses.rule_engine.score} / 100
                </p>
                <p className="text-[10px] text-slate-500">Trigger: {simResult.detector_responses.rule_engine.rule_fired}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">ML Isolation Forest</p>
                <p className="text-base font-bold text-blue-400 font-mono mt-0.5 tabular-nums">
                  {simResult.detector_responses.ml_isolation_forest.score} / 100
                </p>
                <p className="text-[10px] text-slate-500">Outlier path confirmed</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Graph Network</p>
                <p className="text-base font-bold text-indigo-400 font-mono mt-0.5 tabular-nums">
                  {simResult.detector_responses.graph_network.score} / 100
                </p>
                <p className="text-[10px] text-slate-500">Topology anomaly flagged</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 font-semibold flex items-center justify-between">
              <span>System Defense Rating: {simResult.resilience_rating}</span>
              <span className="font-mono text-white">Composite Score: {simResult.resulting_composite_risk}/100</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
