import React from 'react';
import { 
  Menu, 
  Database, 
  UserCheck, 
  ArrowRight, 
  ArrowLeft,
  ChevronRight,
  ShieldAlert
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
  const getBreadcrumb = () => {
    switch (activeView) {
      case 'overview':
        return {
          workspace: 'OVERVIEW',
          sub: 'Program Integrity',
        };
      case 'queue':
        return {
          workspace: 'INVESTIGATION',
          sub: 'SIU Priority Queue',
        };
      case 'case-detail':
        return {
          workspace: 'INVESTIGATION',
          sub: selectedCaseId ? `Case ${selectedCaseId}` : 'Case File',
        };
      case 'network':
        return {
          workspace: 'INTELLIGENCE',
          sub: 'Network Explorer',
        };
      case 'performance':
        return {
          workspace: 'INTELLIGENCE',
          sub: 'Detector Lab',
        };
      case 'audit':
        return {
          workspace: 'GOVERNANCE',
          sub: 'Audit & Governance',
        };
      default:
        return {
          workspace: 'CLAIMSHIELD',
          sub: 'Nexus Platform',
        };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-[#042126]/10 px-4 sm:px-6 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4 h-9">
        {/* Left Side: Mobile Menu Trigger + Clean Context Breadcrumb */}
        <div className="flex items-center space-x-2.5 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 rounded-md bg-[#F2FCFF] border border-[#042126]/10 text-[#042126] hover:bg-[#042126]/5 cursor-pointer"
            aria-label="Open Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Contextual Breadcrumb (Where am I?) */}
          <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs">
            <span className="text-[10px] font-bold tracking-wider text-[#005F68] uppercase font-mono">
              {breadcrumb.workspace}
            </span>
            <ChevronRight className="w-3 h-3 text-[#042126]/30 flex-shrink-0" />
            <span className="font-semibold text-[#042126] text-xs truncate">
              {breadcrumb.sub}
            </span>
          </nav>
        </div>

        {/* Right Side: Synthetic Status Chip, User Persona Pill, Contextual Actions */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Synthetic Data Environment Status */}
          <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#F2FCFF] border border-[#005F68]/15 text-[11px] font-semibold text-[#005F68]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#209B47]"></span>
            <span>Synthetic Benchmark</span>
            <span className="text-[#042126]/20">•</span>
            <span className="text-[#042126]/60 text-[10px]">Zero PHI</span>
          </div>

          {/* User Persona Pill */}
          <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-[#F2FCFF] border border-[#042126]/10 text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[#209B47]" />
            <span className="font-semibold text-[#042126] text-xs">{currentUser?.full_name || 'Sarah Jenkins, CFE'}</span>
            <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#042126]/5 text-[#005F68] uppercase font-bold">
              {currentUser?.role?.replace(/_/g, ' ') || 'SIU'}
            </span>
          </div>

          {/* Contextual Action Button (Only where useful) */}
          {activeView === 'overview' && (
            <button
              onClick={onNavigateToQueue}
              className="flex items-center space-x-1 px-3 py-1 rounded-md bg-[#209B47] hover:bg-[#1B843C] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <span>SIU Queue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {activeView === 'case-detail' && (
            <button
              onClick={onNavigateToQueue}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-[#F2FCFF] hover:bg-[#042126]/5 text-[#042126] border border-[#042126]/15 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3 h-3 text-[#005F68]" />
              <span>Back to Queue</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
