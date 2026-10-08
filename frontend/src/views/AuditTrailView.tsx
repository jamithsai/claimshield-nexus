import React, { useEffect, useState } from 'react';
import { History, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Key } from 'lucide-react';
import { AuditLogEntry } from '../types';
import { api } from '../services/api';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [integrity, setIntegrity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadAuditData();
  }, []);

  async function loadAuditData() {
    setIsLoading(true);
    try {
      const [l, v] = await Promise.all([api.getAuditLogs(50), api.verifyAuditIntegrity()]);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cockpit-panel p-5 rounded-xl border border-slate-800 bg-[#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">
              Cryptographic Audit Trail &amp; Evidence Provenance
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable SHA-256 Merkle chain recording every investigator action, review decision, and case status change.
            </p>
          </div>
        </div>

        {/* Verification Status Button */}
        <button
          onClick={handleManualVerify}
          disabled={isVerifying}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-all ${
            integrity?.is_tampered
              ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>
            {isVerifying
              ? 'Verifying Merkle Hashes...'
              : integrity?.status === 'VALID_MERKLE_CHAIN'
              ? '✓ Merkle Chain 100% Intact'
              : 'Verify Chain Integrity'}
          </span>
        </button>
      </div>

      {/* Audit Log Stream Table */}
      <div className="cockpit-panel rounded-xl border border-slate-800 overflow-hidden bg-[#0f172a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                <th className="p-3 w-28">Log ID</th>
                <th className="p-3 w-40">UTC Timestamp</th>
                <th className="p-3">Investigator / Actor</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono text-blue-400 font-bold">{log.log_id}</td>
                  <td className="p-3 text-slate-300 font-mono whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-200">{log.actor_username}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">[{log.actor_role}]</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[11px] text-amber-300">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-300">{log.target_resource}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-400 truncate max-w-xs">
                    {log.current_hash.substring(0, 16)}...{log.current_hash.substring(56)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
