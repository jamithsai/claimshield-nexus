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
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="health-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Cryptographic Audit Trail &amp; Evidence Provenance
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
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
              ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
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
      <div className="health-panel rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-28">Log ID</th>
                <th className="p-3 w-40">UTC Timestamp</th>
                <th className="p-3">Investigator / Actor</th>
                <th className="p-3">Action Type</th>
                <th className="p-3">Target Resource</th>
                <th className="p-3">SHA-256 Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.log_id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-sky-700 font-bold">{log.log_id}</td>
                  <td className="p-3 text-slate-600 font-mono whitespace-nowrap">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                  <td className="p-3">
                    <span className="font-semibold text-slate-800">{log.actor_username}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">[{log.actor_role}]</span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] text-amber-800 font-semibold">
                      {log.action_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-slate-700">{log.target_resource}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500 truncate max-w-xs">
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
