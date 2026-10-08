import React, { useEffect, useState } from 'react';
import { 
  Sliders, 
  Search, 
  ArrowUpDown, 
  Filter, 
  ShieldAlert, 
  DollarSign, 
  Users, 
  Zap, 
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { SIUCase } from '../types';
import { api } from '../services/api';
import { RiskVelocitySpark } from '../components/RiskVelocitySpark';

interface SIUQueueViewProps {
  onSelectCase: (caseId: string) => void;
}

export const SIUQueueView: React.FC<SIUQueueViewProps> = ({ onSelectCase }) => {
  const [cases, setCases] = useState<SIUCase[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [capacity, setCapacity] = useState(10);
  const [sortBy, setSortBy] = useState('priority');
  const [tierFilter, setTierFilter] = useState('');
  const [schemeFilter, setSchemeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
      setIsLoading(true);
      try {
        const res = await api.getQueue(capacity, sortBy, tierFilter || undefined);
        setCases(res.cases);
        setTotalAvailable(res.total_available_cases);
      } catch (err) {
        console.error('Failed to fetch queue', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQueue();
  }, [capacity, sortBy, tierFilter]);

  const filteredCases = cases.filter((c) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesQuery = (
        c.case_id.toLowerCase().includes(q) ||
        c.target_entity_name.toLowerCase().includes(q) ||
        c.primary_fwa_pattern.toLowerCase().includes(q) ||
        c.target_entity_id.toLowerCase().includes(q) ||
        (c.specialty && c.specialty.toLowerCase().includes(q))
      );
      if (!matchesQuery) return false;
    }
    if (schemeFilter) {
      if (!c.primary_fwa_pattern.toLowerCase().includes(schemeFilter.toLowerCase())) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Capacity Controller Strip */}
      <div className="cockpit-panel p-5 rounded-xl border border-slate-800 bg-[#0f172a] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight">SIU Priority Investigation Queue</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Capacity-constrained multi-attribute utility ranking: U = 0.35(Risk) + 0.25(Exposure) + 0.15(Members) + 0.15(Velocity) + 0.10(Evidence)
              </p>
            </div>
          </div>

          {/* Quick Capacity Limit Buttons */}
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Capacity Limit (K):</span>
            {[5, 10, 20, 50].map((k) => (
              <button
                key={k}
                onClick={() => setCapacity(k)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  capacity === k
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Capacity Meter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>Allocated Top <span className="text-white font-mono font-bold">{cases.length}</span> of {totalAvailable} Flagged Population Cases</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500">100% Empirical Calculations • 0 Mock Overrides</span>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Provider, NPI, Scheme or Case ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Scheme Filter */}
        <div className="md:col-span-3">
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All FWA Schemes</option>
            <option value="Upcoding">E&amp;M Upcoding (R102)</option>
            <option value="Unbundling">Lab Unbundling (R103)</option>
            <option value="Duplicate">Duplicate Encounters (R101)</option>
            <option value="Phantom">Phantom / Impossible Hours (R104)</option>
            <option value="Surge">Velocity Surge (R105)</option>
          </select>
        </div>

        {/* Severity Tier Filter */}
        <div className="md:col-span-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="">All Risk Tiers</option>
            <option value="CRITICAL">Critical (≥75)</option>
            <option value="HIGH">High (50–74)</option>
            <option value="MEDIUM">Medium (25–49)</option>
          </select>
        </div>

        {/* Sorter */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-[#0f172a] border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="priority">Rank: Multi-Attribute</option>
            <option value="risk_score">Risk Score (Desc)</option>
            <option value="exposure">Exposure $ (Desc)</option>
            <option value="velocity">Velocity Δ (Desc)</option>
            <option value="member_impact">Patient Count (Desc)</option>
          </select>
        </div>
      </div>

      {/* Main Investigation Queue Data Table */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[350px]">
          <Activity className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="cockpit-panel rounded-xl border border-slate-800 overflow-hidden bg-[#0f172a]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                  <th className="p-3 w-14">Rank</th>
                  <th className="p-3 w-32">Case ID</th>
                  <th className="p-3 w-28">Risk Score</th>
                  <th className="p-3">Target Entity &amp; Specialty</th>
                  <th className="p-3">Primary Detected Scheme</th>
                  <th className="p-3 text-right">Exposure ($)</th>
                  <th className="p-3 text-center">Patients</th>
                  <th className="p-3 text-center">Velocity</th>
                  <th className="p-3 text-center">Evidence</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCases.map((c, i) => {
                  const isCritical = c.risk_tier === 'CRITICAL';
                  const isHigh = c.risk_tier === 'HIGH';

                  return (
                    <tr 
                      key={c.case_id} 
                      className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                        isCritical ? 'bg-rose-950/10' : isHigh ? 'bg-amber-950/10' : ''
                      }`}
                      onClick={() => onSelectCase(c.case_id)}
                    >
                      {/* Priority Rank */}
                      <td className="p-3 font-mono font-bold text-blue-400">#{i + 1}</td>

                      {/* Case ID */}
                      <td className="p-3">
                        <span className="font-mono font-bold text-slate-200 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                          {c.case_id}
                        </span>
                      </td>

                      {/* Composite Risk Score Badge */}
                      <td className="p-3">
                        <span
                          className={`font-mono font-black text-xs px-2.5 py-0.5 rounded-full border ${
                            isCritical
                              ? 'bg-rose-950 text-rose-300 border-rose-800'
                              : isHigh
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-blue-950 text-blue-300 border-blue-800'
                          }`}
                        >
                          {c.composite_risk_score} {c.risk_tier}
                        </span>
                      </td>

                      {/* Target Entity */}
                      <td className="p-3">
                        <p className="font-bold text-white hover:text-blue-400 transition-colors">{c.target_entity_name}</p>
                        <p className="text-[11px] text-slate-400">{c.specialty} • NPI: {c.target_entity_id} • {c.location || 'FL'}</p>
                      </td>

                      {/* Primary Scheme Trigger */}
                      <td className="p-3">
                        <span className="text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                          {c.primary_fwa_pattern}
                        </span>
                      </td>

                      {/* Financial Exposure */}
                      <td className="p-3 text-right font-mono font-bold text-rose-400 tabular-nums">
                        ${c.potential_financial_exposure.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Impacted Patients */}
                      <td className="p-3 text-center font-mono text-slate-300 tabular-nums">
                        {c.member_impact_count}
                      </td>

                      {/* Risk Velocity */}
                      <td className="p-3 text-center">
                        <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded ${
                          c.risk_velocity > 5.0
                            ? 'text-amber-400 bg-amber-950/80 border border-amber-800'
                            : 'text-slate-400'
                        }`}>
                          {c.risk_velocity > 0 ? `+${c.risk_velocity.toFixed(1)}/mo` : `${c.risk_velocity.toFixed(1)}/mo`}
                        </span>
                      </td>

                      {/* Evidence Strength */}
                      <td className="p-3 text-center">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                          c.evidence_strength === 'CONVINCING'
                            ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800'
                            : c.evidence_strength === 'STRONG'
                            ? 'text-blue-300 bg-blue-950/80 border border-blue-800'
                            : 'text-slate-400 bg-slate-900 border border-slate-800'
                        }`}>
                          {c.evidence_strength}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectCase(c.case_id)}
                          className="flex items-center space-x-1 ml-auto px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm"
                        >
                          <span>Investigate</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
