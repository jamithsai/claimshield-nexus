import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Lock, 
  FileCheck,
  Send
} from 'lucide-react';
import { SIUCase, User } from '../types';

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: SIUCase;
  currentUser: User | null;
  onSubmitDecision: (payload: {
    decision: string;
    disposition: string;
    investigator_notes: string;
    recommended_action: string;
  }) => Promise<void>;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  currentUser,
  onSubmitDecision,
}) => {
  const [decision, setDecision] = useState('ESCALATE_TO_FORMAL_AUDIT');
  const [disposition, setDisposition] = useState('CONFIRMED_SUSPICIOUS');
  const [recommendedAction, setRecommendedAction] = useState('ISSUE_PREPAYMENT_MEDICAL_REVIEW_HOLD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Please enter clinical / investigative rationale notes.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmitDecision({
        decision,
        disposition,
        investigator_notes: notes,
        recommended_action: recommendedAction,
      });
      onClose();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b132b]/80 backdrop-blur-sm">
      <div className="bg-[#1e293b] border border-slate-700 w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between bg-[#0f172a]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Human Investigator Decision</h3>
              <p className="text-xs text-slate-400 font-mono">Case ID: {caseItem.case_id} • {caseItem.target_entity_name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Policy Mandate Notice */}
          <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200">
              <span className="font-bold">Human-in-the-Loop Gatekeeper:</span> This decision will be cryptographically logged to the immutable SHA-256 Merkle audit trail under your investigator ID (<span className="font-mono text-amber-300">{currentUser?.username}</span>).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Disposition */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Investigator Finding / Disposition
              </label>
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="CONFIRMED_SUSPICIOUS">Confirmed Suspicious Behavior</option>
                <option value="POTENTIAL_ABUSE_NEEDS_CHART_AUDIT">Needs Clinical Chart Audit</option>
                <option value="CLEARED_FALSE_POSITIVE">Cleared — False Positive (Peer Specialty Nuance)</option>
                <option value="REFERRED_TO_OIG_LE">Referred to OIG / Law Enforcement</option>
              </select>
            </div>

            {/* Recommended Action */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Operational Action Recommendation
              </label>
              <select
                value={recommendedAction}
                onChange={(e) => setRecommendedAction(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-700 text-slate-100 text-xs rounded-lg px-3 py-2.5 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="ISSUE_PREPAYMENT_MEDICAL_REVIEW_HOLD">Issue Prepayment Medical Review Hold</option>
                <option value="INITIATE_ON_SITE_AUDIT">Initiate On-Site Facility Audit</option>
                <option value="SUBPOENA_EHR_RECORDS">Subpoena Complete Electronic Health Records</option>
                <option value="PROVIDER_EDUCATION_LETTER">Send Formal Education &amp; Warning Letter</option>
                <option value="NO_OPERATIONAL_ACTION">No Operational Action Required</option>
              </select>
            </div>
          </div>

          {/* Clinical & FWA Rationale Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Investigator Clinical &amp; Behavioral Rationale (Mandatory)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail your clinical chart review observations, peer baseline comparison, and justification for the selected disposition..."
              className="w-full bg-[#0f172a] border border-slate-700 text-slate-100 text-xs rounded-lg p-3 focus:border-blue-500 focus:outline-none placeholder:text-slate-500 font-sans"
              required
            />
          </div>

          {/* Dual Authorization / High-Risk Warning */}
          {recommendedAction.includes('PREPAYMENT') && (
            <div className="p-3 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center space-x-2 text-xs text-blue-300">
              <Lock className="w-4 h-4 text-blue-400" />
              <span>Prepayment holds require secondary review from Senior Investigator before claim withholding activates.</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-700 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing to Audit Chain...' : 'Record Finding &amp; Cryptographically Sign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
