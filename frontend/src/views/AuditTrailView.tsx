import React, { useEffect, useState } from 'react';
import { 
  History, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  Search, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  UserCheck, 
  Lock, 
  Copy, 
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { AuditLogEntry } from '../types';
import { api } from '../services/api';

interface AuditTrailViewProps {
  onSelectCase?: (caseId: string) => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ onSelectCase }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [integrity, setIntegrity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'DECISIONS' | 'INSPECTIONS' | 'SYSTEM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  useEffect(() => {
    loadAuditData();
  }, []);

  async function loadAuditData() {
    setIsLoading(true);
    try {
      const [l, v] = await Promise.all([api.getAuditLogs(100), api.verifyAuditIntegrity()]);
      setLogs(l);
      setIntegrity(v);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleManualVerify = async () => {
    setIsVerifying(true);
    try {
      const v = await api.verifyAuditIntegrity();
      setIntegrity(v);
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Filter logs based on category and search query
  const filteredLogs = logs.filter((log) => {
    // 1. Category filter
    if (categoryFilter === 'DECISIONS') {
      if (!log.action_type.includes('DECISION') && !log.action_type.includes('DISPOSITION')) {
        return false;
      }
    } else if (categoryFilter === 'INSPECTIONS') {
      if (!log.action_type.includes('INSPECT')) {
        return false;
      }
    } else if (categoryFilter === 'SYSTEM') {
      if (log.action_type.includes('DECISION') || log.action_type.includes('INSPECT')) {
        return false;
      }
    }

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const notes = log.details?.notes ? String(log.details.notes).toLowerCase() : '';
      const disposition = log.details?.disposition ? String(log.details.disposition).toLowerCase() : '';
      const decision = log.details?.decision ? String(log.details.decision).toLowerCase() : '';
      const matches = (
        log.log_id.toLowerCase().includes(q) ||
        log.action_type.toLowerCase().includes(q) ||
        log.target_resource.toLowerCase().includes(q) ||
        log.actor_username.toLowerCase().includes(q) ||
        log.current_hash.toLowerCase().includes(q) ||
        notes.includes(q) ||
        disposition.includes(q) ||
        decision.includes(q)
      );
      if (!matches) return false;
    }

    return true;
  });

  const decisionCount = logs.filter(l => l.action_type.includes('DECISION') || l.action_type.includes('DISPOSITION')).length;
  const inspectionCount = logs.filter(l => l.action_type.includes('INSPECT')).length;
  const systemCount = logs.length - decisionCount - inspectionCount;

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Header */}
      <div className="health-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#E8F8EE] text-[#1B843C] border border-[#ACF2E5]">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#042126] tracking-tight">
              Cryptographic Audit Trail &amp; Evidence Provenance
            </h1>
            <p className="text-xs text-[#042126]/70 mt-0.5">
              Immutable SHA-256 Merkle chain recording every investigator action, review decision, and case status change.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Reload Button */}
          <button
            onClick={loadAuditData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-white border border-[#042126]/15 hover:bg-[#F2FCFF] text-[#005F68] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
            title="Reload latest audit ledger events from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#005F68] ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Reloading...' : 'Reload Logs'}</span>
          </button>

          {/* Verification Status Button */}
          <button
            onClick={handleManualVerify}
            disabled={isVerifying}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
              integrity?.is_tampered
                ? 'bg-[#FEE2E2] text-[#B91C1C] border-[#FECACA] animate-pulse'
                : 'bg-[#E8F8EE] text-[#1B843C] border-[#ACF2E5] hover:bg-[#E8F8EE]/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#1B843C]" />
            <span>
              {isVerifying
                ? 'Verifying Merkle Hashes...'
                : integrity?.status === 'VALID_MERKLE_CHAIN'
                ? '✓ Merkle Chain 100% Intact'
                : 'Verify Chain Integrity'}
            </span>
          </button>
        </div>
      </div>

      {/* Overview Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="health-panel p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-[#042126]/60 uppercase tracking-wider">Total Ledger Blocks</span>
          <div className="text-xl font-bold font-mono text-[#042126] tabular-nums">{logs.length} Blocks</div>
          <p className="text-[10px] text-[#005F68]">Cryptographically chained</p>
        </div>

        <div className="health-panel p-4 rounded-xl space-y-1 bg-[#E8F8EE]/40 border-[#ACF2E5]">
          <span className="text-[11px] font-bold text-[#1B843C] uppercase tracking-wider">Investigator Decisions</span>
          <div className="text-xl font-bold font-mono text-[#1B843C] tabular-nums">{decisionCount} Actions</div>
          <p className="text-[10px] text-[#1B843C]">Human-in-the-loop sign-offs</p>
        </div>

        <div className="health-panel p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-[#005F68] uppercase tracking-wider">Case Inspections</span>
          <div className="text-xl font-bold font-mono text-[#005F68] tabular-nums">{inspectionCount} Events</div>
          <p className="text-[10px] text-[#042126]/60">Clinical reviews &amp; queries</p>
        </div>

        <div className="health-panel p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-bold text-[#042126]/60 uppercase tracking-wider">Chain Head Hash</span>
          <div className="text-xs font-mono font-bold text-[#042126] truncate pt-1">
            {logs[0]?.current_hash ? `${logs[0].current_hash.substring(0, 16)}...` : '0000000000000000...'}
          </div>
          <p className="text-[10px] text-[#209B47]">SHA-256 Provenance</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="health-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              categoryFilter === 'ALL'
                ? 'bg-[#209B47] text-white shadow-xs'
                : 'bg-white text-[#042126]/70 border border-[#042126]/10 hover:bg-[#F2FCFF]'
            }`}
          >
            All Logs ({logs.length})
          </button>

          <button
            onClick={() => setCategoryFilter('DECISIONS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              categoryFilter === 'DECISIONS'
                ? 'bg-[#209B47] text-white shadow-xs'
                : 'bg-white text-[#1B843C] border border-[#209B47]/30 hover:bg-[#E8F8EE]/60'
            }`}
          >
            🛡️ Investigator Decisions ({decisionCount})
          </button>

          <button
            onClick={() => setCategoryFilter('INSPECTIONS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              categoryFilter === 'INSPECTIONS'
                ? 'bg-[#209B47] text-white shadow-xs'
                : 'bg-white text-[#005F68] border border-[#005F68]/20 hover:bg-[#F2FCFF]'
            }`}
          >
            🔍 Case Inspections ({inspectionCount})
          </button>

          <button
            onClick={() => setCategoryFilter('SYSTEM')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              categoryFilter === 'SYSTEM'
                ? 'bg-[#209B47] text-white shadow-xs'
                : 'bg-white text-[#042126]/70 border border-[#042126]/10 hover:bg-[#F2FCFF]'
            }`}
          >
            ⚙️ System &amp; Auth ({systemCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#042126]/40" />
          <input
            type="text"
            placeholder="Search by Case, Actor, Notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#042126]/15 rounded-lg text-xs text-[#042126] placeholder:text-[#042126]/40 focus:outline-none focus:border-[#209B47]"
          />
        </div>
      </div>

      {/* Audit Log Stream Table */}
      <div className="health-panel rounded-xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <History className="w-8 h-8 text-[#042126]/30 mx-auto" />
            <p className="text-xs font-semibold text-[#042126]/60">No audit log entries matched your filter.</p>
            {categoryFilter !== 'ALL' && (
              <button
                onClick={() => { setCategoryFilter('ALL'); setSearchQuery(''); }}
                className="text-xs text-[#005F68] font-bold hover:underline"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F2FCFF] text-[#042126] font-semibold border-b border-[#042126]/10">
                <tr>
                  <th className="p-3 w-28">Log ID</th>
                  <th className="p-3 w-40">UTC Timestamp</th>
                  <th className="p-3">Investigator / Actor</th>
                  <th className="p-3">Action Type</th>
                  <th className="p-3">Target Resource</th>
                  <th className="p-3">SHA-256 Hash</th>
                  <th className="p-3 text-center w-24">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#042126]/5">
                {filteredLogs.map((log) => {
                  const isDecision = log.action_type.includes('DECISION') || log.action_type.includes('DISPOSITION');
                  const isInspection = log.action_type.includes('INSPECT');
                  const isExpanded = expandedLogId === log.log_id;
                  const hasCaseTarget = log.target_resource.startsWith('CASE-');

                  return (
                    <React.Fragment key={log.log_id}>
                      <tr 
                        className={`transition-colors ${
                          isDecision 
                            ? 'bg-[#E8F8EE]/30 hover:bg-[#E8F8EE]/60' 
                            : isExpanded 
                            ? 'bg-[#F2FCFF]' 
                            : 'hover:bg-[#F2FCFF]/80'
                        }`}
                      >
                        <td className="p-3 font-mono text-[#005F68] font-bold whitespace-nowrap">
                          {log.log_id}
                        </td>
                        <td className="p-3 text-[#042126]/70 font-mono whitespace-nowrap">
                          {log.timestamp.replace('T', ' ').substring(0, 19)}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-[#042126]">{log.actor_username}</div>
                          <div className="text-[10px] text-[#042126]/60 font-mono">[{log.actor_role}]</div>
                        </td>
                        <td className="p-3">
                          {isDecision ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#E8F8EE] border border-[#ACF2E5] font-mono text-[11px] text-[#1B843C] font-bold shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-[#209B47]" />
                              <span>{log.action_type}</span>
                            </span>
                          ) : isInspection ? (
                            <span className="inline-block px-2 py-0.5 rounded bg-[#F2FCFF] border border-[#005F68]/20 font-mono text-[11px] text-[#005F68] font-semibold">
                              {log.action_type}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded bg-[#042126]/5 border border-[#042126]/10 font-mono text-[11px] text-[#042126]/80 font-semibold">
                              {log.action_type}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-semibold text-[#042126]">
                          {hasCaseTarget && onSelectCase ? (
                            <button
                              onClick={() => onSelectCase(log.target_resource)}
                              className="text-[#005F68] hover:text-[#042126] hover:underline flex items-center space-x-1 cursor-pointer"
                              title="Open Case Investigation"
                            >
                              <span>{log.target_resource}</span>
                              <ExternalLink className="w-3 h-3 text-[#005F68]" />
                            </button>
                          ) : (
                            <span>{log.target_resource}</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-[#042126]/60">
                          <div className="flex items-center space-x-1.5">
                            <span className="truncate max-w-[140px]">{log.current_hash.substring(0, 16)}...</span>
                            <button
                              onClick={() => handleCopy(log.current_hash, log.log_id)}
                              className="p-1 rounded hover:bg-[#042126]/10 text-[#042126]/50 hover:text-[#042126] transition-colors cursor-pointer"
                              title="Copy Full SHA-256 Hash"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            {copiedHash === log.log_id && (
                              <span className="text-[10px] text-[#209B47] font-sans font-bold">Copied!</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.log_id)}
                            className="p-1 rounded hover:bg-[#042126]/10 text-[#005F68] font-semibold transition-colors cursor-pointer inline-flex items-center space-x-0.5 text-xs"
                          >
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable Details Drawer */}
                      {isExpanded && (
                        <tr className="bg-[#F2FCFF]/90 border-b border-[#042126]/10">
                          <td colSpan={7} className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Left Column: Human Rationale & Action Details */}
                              <div className="space-y-2 bg-white p-3.5 rounded-lg border border-[#042126]/10 text-xs">
                                <div className="flex items-center justify-between border-b border-[#042126]/10 pb-2">
                                  <span className="font-bold text-[#042126] uppercase tracking-wider text-[11px]">
                                    Action Payload &amp; Investigator Rationale
                                  </span>
                                  {isDecision && (
                                    <span className="text-[10px] font-bold text-[#1B843C] bg-[#E8F8EE] px-2 py-0.5 rounded border border-[#ACF2E5]">
                                      Enforcement Action Recorded
                                    </span>
                                  )}
                                </div>

                                {log.details?.disposition && (
                                  <div>
                                    <span className="text-[10px] font-bold text-[#042126]/60 uppercase block">Finding / Disposition</span>
                                    <span className="font-semibold text-[#042126]">{String(log.details.disposition)}</span>
                                  </div>
                                )}

                                {log.details?.decision && (
                                  <div>
                                    <span className="text-[10px] font-bold text-[#042126]/60 uppercase block">Decision Directive</span>
                                    <span className="font-semibold text-[#005F68] font-mono">{String(log.details.decision)}</span>
                                  </div>
                                )}

                                {log.details?.recommended_action && (
                                  <div>
                                    <span className="text-[10px] font-bold text-[#042126]/60 uppercase block">Operational Action</span>
                                    <span className="font-semibold text-[#B45309]">{String(log.details.recommended_action)}</span>
                                  </div>
                                )}

                                {log.details?.notes && (
                                  <div className="pt-1">
                                    <span className="text-[10px] font-bold text-[#042126]/60 uppercase block mb-0.5">Clinical / Investigative Rationale</span>
                                    <div className="p-2.5 rounded bg-[#F2FCFF] border-l-3 border-[#209B47] text-[#042126] text-xs leading-relaxed italic">
                                      "{String(log.details.notes)}"
                                    </div>
                                  </div>
                                )}

                                {!log.details?.notes && !log.details?.disposition && (
                                  <pre className="p-2 bg-[#F2FCFF] rounded text-[11px] font-mono text-[#042126]/80 overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                )}
                              </div>

                              {/* Right Column: Cryptographic Merkle Provenance */}
                              <div className="space-y-2 bg-white p-3.5 rounded-lg border border-[#042126]/10 text-xs">
                                <div className="flex items-center justify-between border-b border-[#042126]/10 pb-2">
                                  <span className="font-bold text-[#042126] uppercase tracking-wider text-[11px]">
                                    Cryptographic Merkle Linkage
                                  </span>
                                  <span className="text-[10px] font-bold text-[#005F68] font-mono">
                                    SHA-256
                                  </span>
                                </div>

                                <div className="space-y-1.5 font-mono text-[11px]">
                                  <div>
                                    <span className="text-[10px] font-bold text-[#042126]/60 uppercase block font-sans">Current Block Hash</span>
                                    <div className="p-1.5 rounded bg-[#F2FCFF] text-[#005F68] break-all border border-[#042126]/10">
                                      {log.current_hash}
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-[10px] font-bold text-[#042126]/60 uppercase block font-sans">Parent Block Hash (prev_hash)</span>
                                    <div className="p-1.5 rounded bg-[#F2FCFF] text-[#042126]/70 break-all border border-[#042126]/10">
                                      {log.prev_hash}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-[#042126]/60 pt-1 font-sans">
                                    <span>Client IP: <strong className="font-mono">{log.client_ip}</strong></span>
                                    <span className="text-[#209B47] font-bold">✓ Merkle Proof Verified</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
