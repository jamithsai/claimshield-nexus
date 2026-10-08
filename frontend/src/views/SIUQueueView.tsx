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
    <div className="space-y-6 font-sans">
      {/* Top Header & Capacity Controller Strip */}
      <div className="health-panel p-5 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-lg bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30">
              <Layers className="w-5 h-5 text-[#209B47]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#042126] tracking-tight">SIU Priority Investigation Queue</h1>
              <p className="text-xs text-[#042126]/70 mt-0.5">
                Capacity-constrained multi-attribute utility ranking: <span className="font-mono text-[#005F68] font-semibold">U = 0.35(Risk) + 0.25(Exposure) + 0.15(Members) + 0.15(Velocity) + 0.10(Evidence)</span>
              </p>
            </div>
          </div>

          {/* Quick Capacity Limit Buttons */}
          <div className="flex items-center space-x-2 bg-[#F2FCFF] px-3 py-1.5 rounded-lg border border-[#042126]/10">
            <span className="text-[11px] font-semibold text-[#042126]/70 uppercase">Capacity Limit (K):</span>
            {[5, 10, 20, 50].map((k) => (
              <button
                key={k}
                onClick={() => setCapacity(k)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  capacity === k
                    ? 'bg-[#209B47] text-white shadow-xs'
                    : 'text-[#042126]/70 hover:text-[#042126] hover:bg-[#042126]/10'
                }`}
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Capacity Meter Bar */}
        <div className="flex items-center justify-between text-xs text-[#042126]/60 pt-2 border-t border-[#042126]/10">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#209B47] animate-pulse"></span>
            <span>Allocated Top <span className="text-[#042126] font-mono font-bold">{cases.length}</span> of {totalAvailable} Flagged Population Cases</span>
          </div>
          <span className="font-mono text-[11px] text-[#042126]/50">100% Empirical Calculations • 0 Mock Overrides</span>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[#042126]/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter by Provider, NPI, Case ID, Scheme, or Specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#042126]/15 rounded-lg pl-9 pr-3 py-2 text-xs text-[#042126] placeholder-[#042126]/40 focus:outline-none focus:ring-1 focus:ring-[#209B47] shadow-xs"
          />
        </div>

        {/* Severity Filter */}
        <div className="md:col-span-3">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="w-full bg-white border border-[#042126]/15 rounded-lg px-3 py-2 text-xs text-[#042126] font-medium focus:outline-none focus:ring-1 focus:ring-[#209B47] shadow-xs cursor-pointer"
          >
            <option value="">All Severity Tiers</option>
            <option value="CRITICAL">CRITICAL (&ge; 75)</option>
            <option value="HIGH">HIGH (50 – 74)</option>
            <option value="MEDIUM">MEDIUM (25 – 49)</option>
          </select>
        </div>

        {/* Scheme Filter */}
        <div className="md:col-span-2">
          <select
            value={schemeFilter}
            onChange={(e) => setSchemeFilter(e.target.value)}
            className="w-full bg-white border border-[#042126]/15 rounded-lg px-3 py-2 text-xs text-[#042126] font-medium focus:outline-none focus:ring-1 focus:ring-[#209B47] shadow-xs cursor-pointer"
          >
            <option value="">All Schemes</option>
            <option value="Upcoding">Upcoding</option>
            <option value="Unbundling">Unbundling</option>
            <option value="Duplicate">Duplicate Billing</option>
            <option value="Phantom">Phantom Services</option>
            <option value="Utilization">Excessive Utilization</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="md:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border border-[#042126]/15 rounded-lg px-3 py-2 text-xs text-[#042126] font-medium focus:outline-none focus:ring-1 focus:ring-[#209B47] shadow-xs cursor-pointer"
          >
            <option value="priority">Sort: Utility Rank</option>
            <option value="risk_score">Sort: Risk Score</option>
            <option value="exposure">Sort: Financial Exposure</option>
            <option value="velocity">Sort: Risk Velocity</option>
            <option value="member_impact">Sort: Impacted Beneficiaries</option>
          </select>
        </div>
      </div>

      {/* Main High-Density Tabular Investigation Grid */}
      <div className="health-panel rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-[#042126]/60">
            <Activity className="w-6 h-6 text-[#209B47] animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold">Recalculating SIU queue optimization...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-[#042126]/60">
            <ShieldAlert className="w-8 h-8 text-[#042126]/40 mx-auto mb-2" />
            <p className="text-xs font-semibold text-[#042126]">No cases matched the current search/filter criteria.</p>
            <p className="text-[11px] text-[#042126]/50 mt-1">Try resetting the severity or scheme filter dropdowns.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2FCFF] text-[#042126] font-semibold border-b border-[#042126]/10">
                <tr>
                  <th className="py-3 px-3 text-center w-12">#</th>
                  <th className="py-3 px-3">Case ID</th>
                  <th className="py-3 px-4">Target Provider / Entity</th>
                  <th className="py-3 px-3">Primary Signal</th>
                  <th className="py-3 px-3 text-right">Composite Risk</th>
                  <th className="py-3 px-3 text-right">Potential Exposure</th>
                  <th className="py-3 px-3 text-right">Members</th>
                  <th className="py-3 px-3 text-center">Velocity</th>
                  <th className="py-3 px-3 text-center">Evidence</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#042126]/5">
                {filteredCases.map((c, idx) => {
                  const isCritical = c.risk_tier === 'CRITICAL';
                  const isHigh = c.risk_tier === 'HIGH';
                  const isMedium = c.risk_tier === 'MEDIUM';

                  return (
                    <tr 
                      key={c.case_id}
                      className="hover:bg-[#F2FCFF]/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectCase(c.case_id)}
                    >
                      {/* Rank Index */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-[#042126]/40 group-hover:text-[#005F68]">
                        {idx + 1}
                      </td>

                      {/* Case ID */}
                      <td className="py-3.5 px-3 font-mono font-semibold text-[#005F68] whitespace-nowrap">
                        {c.case_id}
                      </td>

                      {/* Provider Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#042126] group-hover:text-[#005F68] transition-colors">
                          {c.target_entity_name}
                        </div>
                        <div className="text-[11px] text-[#042126]/60 font-mono mt-0.5">
                          NPI: {c.target_entity_id} • <span className="text-[#042126]/80">{c.specialty}</span>
                        </div>
                      </td>

                      {/* Primary Signal */}
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-[#042126]/5 text-[#042126] border border-[#042126]/10">
                          {c.primary_fwa_pattern}
                        </span>
                      </td>

                      {/* Composite Risk Score Badge */}
                      <td className="py-3.5 px-3 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono ${
                          isCritical ? 'badge-critical' : isHigh ? 'badge-high' : 'badge-medium'
                        }`}>
                          {c.composite_risk_score.toFixed(1)}
                        </span>
                      </td>

                      {/* Potential Financial Exposure */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-[#042126] tabular-nums">
                        ${c.potential_financial_exposure.toLocaleString()}
                      </td>

                      {/* Impacted Members */}
                      <td className="py-3.5 px-3 text-right font-mono text-[#042126]/80 tabular-nums">
                        {c.member_impact_count}
                      </td>

                      {/* Risk Velocity Spark */}
                      <td className="py-3.5 px-3 text-center">
                        <RiskVelocitySpark velocity={c.risk_velocity} showText={true} />
                      </td>

                      {/* Evidence Strength */}
                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-xs font-semibold text-[#042126]">
                          {c.evidence_strength}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          c.status === 'UNDER_INVESTIGATION'
                            ? 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]'
                            : c.status === 'ESCALATED'
                            ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'
                            : 'bg-[#042126]/5 text-[#042126] border border-[#042126]/10'
                        }`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectCase(c.case_id)}
                          className="px-3 py-1 rounded bg-[#209B47] hover:bg-[#1B843C] text-white text-xs font-semibold shadow-xs transition-colors"
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
        )}
      </div>
    </div>
  );
};
