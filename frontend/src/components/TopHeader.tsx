import React from 'react';
import { 
  Menu, 
  Database, 
  UserCheck, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { User } from '../types';

interface TopHeaderProps {
  activeView: string;
  selectedCaseId: string | null;
  currentUser: User | null;
  onToggleMobileSidebar: () => void;
  onNavigateToQueue: () => void;
  onBackToOverview?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeView,
  selectedCaseId,
  currentUser,
  onToggleMobileSidebar,
  onNavigateToQueue,
  onBackToOverview,
}) => {
  const getHeaderMeta = () => {
    switch (activeView) {
      case 'overview':
        return {
          title: 'Program Integrity Overview',
          desc: 'Portfolio-level surveillance of synthetic claims, dual-engine FWA alerts, and SIU caseload.',
        };
      case 'queue':
        return {
          title: 'SIU Priority Queue',
          desc: 'Operational case triage and capacity-constrained investigator workload ranking.',
        };
      case 'case-detail':
        return {
          title: selectedCaseId ? `Case File: ${selectedCaseId}` : 'Case Investigation Console',
          desc: 'Comprehensive multi-modal evidence review, 10-D behavioral fingerprint, and human disposition.',
        };
      case 'network':
        return {
          title: 'Healthcare Network Explorer',
          desc: 'Population relationship topology, provider-facility-member graph, and collusion cluster detection.',
        };
      case 'performance':
        return {
          title: 'Detector Lab & Efficacy',
          desc: 'Multi-modal detector benchmarks, feature attributions, and counterfactual red-team simulation.',
        };
      case 'audit':
        return {
          title: 'Cryptographic Audit Trail & Governance',
          desc: 'Immutable SHA-256 Merkle chain recording every investigator action, disposition, and status change.',
        };
      default:
        return {
          title: 'ClaimShield Nexus',
          desc: 'Healthcare Program Integrity & Payment Integrity Intelligence Platform',
        };
    }
  };

  const meta = getHeaderMeta();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#042126]/10 px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Mobile Menu Button + Page Title & Subtitle */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-[#F2FCFF] border border-[#042126]/10 text-[#042126] hover:bg-[#042126]/5 cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-[#042126] tracking-tight truncate leading-tight">
              {meta.title}
            </h1>
            <p className="text-xs text-[#042126]/60 truncate hidden sm:block mt-0.5">
              {meta.desc}
            </p>
          </div>
        </div>

        {/* Right Side: Environment Status, Role Badge, Contextual Actions */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Synthetic Chip */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F2FCFF] border border-[#005F68]/20 text-[11px] font-semibold text-[#005F68]">
            <span className="w-2 h-2 rounded-full bg-[#209B47]"></span>
            <span>Synthetic Benchmark</span>
            <span className="text-[#042126]/30">•</span>
            <span className="text-[#042126]/60">Zero PHI</span>
          </div>

          {/* User Persona Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#F2FCFF] border border-[#042126]/10 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#209B47]" />
            <span className="font-semibold text-[#042126]">{currentUser?.full_name || 'Sarah Jenkins, CFE'}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#042126]/5 text-[#005F68] uppercase font-bold">
              {currentUser?.role?.replace(/_/g, ' ') || 'SIU'}
            </span>
          </div>

          {/* Contextual Action Button */}
          {activeView === 'overview' && (
            <button
              onClick={onNavigateToQueue}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#209B47] hover:bg-[#1B843C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>SIU Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {activeView === 'case-detail' && (
            <button
              onClick={onNavigateToQueue}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#F2FCFF] hover:bg-[#042126]/5 text-[#042126] border border-[#042126]/15 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#005F68]" />
              <span>Back to Queue</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
