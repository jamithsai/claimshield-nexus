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
import { User } from '../types';
import { api } from '../services/api';

interface DecisionModalProps {
  caseId: string;
  currentUser: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const DecisionModal: React.FC<DecisionModalProps> = ({
  caseId,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [decision, setDecision] = useState('ESCALATE_TO_FORMAL_AUDIT');
  const [disposition, setDisposition] = useState('CONFIRMED_SUSPICIOUS');
  const [recommendedAction, setRecommendedAction] = useState('ISSUE_PREPAYMENT_MEDICAL_REVIEW_HOLD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      alert('Please enter clinical / investigative rationale notes.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.submitDecision(caseId, {
        decision,
        disposition,
        investigator_notes: notes,
        recommended_action: recommendedAction,
      });
      onSuccess();
    } catch (err: any) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#042126]/50 backdrop-blur-xs font-sans">
      <div className="bg-white border border-[#042126]/10 w-full max-w-2xl rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#042126]/10 flex items-center justify-between bg-[#F2FCFF]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#E8F8EE] text-[#1B843C] border border-[#209B47]/20">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#042126]">Record Human Investigator Decision</h3>
              <p className="text-xs text-[#042126]/60 font-mono">Case ID: <span className="font-semibold text-[#005F68]">{caseId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#042126]/50 hover:text-[#042126] hover:bg-[#042126]/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Policy Mandate Notice */}
          <div className="p-3.5 rounded-lg bg-[#FEF3C7] border border-[#D97706]/30 flex items-start space-x-2.5 text-xs text-[#92400E]">
            <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0 mt-0.5" />
            <p>
              <strong>Human-in-the-Loop Gatekeeper:</strong> This decision will be cryptographically signed and logged to the immutable SHA-256 Merkle audit trail under your investigator ID (<span className="font-mono font-bold text-[#92400E]">{currentUser?.username || 'investigator@acentra.com'}</span>).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Disposition */}
            <div>
              <label className="block text-xs font-bold text-[#042126] uppercase tracking-wider mb-1.5">
                Investigator Finding / Disposition
              </label>
              <select
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                className="w-full bg-white border border-[#042126]/20 text-[#042126] text-xs rounded-lg px-3 py-2.5 focus:border-[#209B47] focus:ring-1 focus:ring-[#209B47] focus:outline-none cursor-pointer"
              >
                <option value="CONFIRMED_SUSPICIOUS">Confirmed Suspicious Behavior</option>
                <option value="POTENTIAL_ABUSE_NEEDS_CHART_AUDIT">Needs Clinical Chart Audit</option>
                <option value="CLEARED_FALSE_POSITIVE">Cleared — False Positive (Specialty Nuance)</option>
                <option value="REFERRED_TO_OIG_LE">Referred to OIG / Law Enforcement</option>
              </select>
            </div>

            {/* Recommended Action */}
            <div>
              <label className="block text-xs font-bold text-[#042126] uppercase tracking-wider mb-1.5">
                Operational Action Recommendation
              </label>
              <select
                value={recommendedAction}
                onChange={(e) => setRecommendedAction(e.target.value)}
                className="w-full bg-white border border-[#042126]/20 text-[#042126] text-xs rounded-lg px-3 py-2.5 focus:border-[#209B47] focus:ring-1 focus:ring-[#209B47] focus:outline-none cursor-pointer"
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
            <label className="block text-xs font-bold text-[#042126] uppercase tracking-wider mb-1.5">
              Investigator Clinical &amp; Behavioral Rationale (Mandatory)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail your clinical chart review observations, peer baseline comparison, and justification for the selected disposition..."
              className="w-full bg-white border border-[#042126]/20 text-[#042126] text-xs rounded-lg p-3 focus:border-[#209B47] focus:ring-1 focus:ring-[#209B47] focus:outline-none placeholder:text-[#042126]/40 font-sans"
              required
            />
          </div>

          {/* Dual Authorization / High-Risk Warning */}
          {recommendedAction.includes('PREPAYMENT') && (
            <div className="p-3 rounded-lg bg-[#F2FCFF] border border-[#005F68]/20 flex items-center space-x-2 text-xs text-[#005F68]">
              <Lock className="w-4 h-4 text-[#005F68] flex-shrink-0" />
              <span>Prepayment holds require secondary review from Senior Investigator before claim withholding activates.</span>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#042126]/10 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#042126]/70 hover:text-[#042126] hover:bg-[#042126]/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#209B47] hover:bg-[#1B843C] text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing to Merkle Chain...' : 'Record Finding & Sign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
