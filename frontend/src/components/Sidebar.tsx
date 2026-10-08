import React from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Layers, 
  Network, 
  Cpu, 
  History, 
  FileSearch,
  PanelLeftClose, 
  PanelLeftOpen, 
  Database, 
  UserCheck, 
  ChevronRight,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  selectedCaseId: string | null;
  currentUser: User | null;
  onRoleChange: (role: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  selectedCaseId,
  currentUser,
  onRoleChange,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const handleNavClick = (viewId: string) => {
    setActiveView(viewId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const navGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'overview', label: 'Program Integrity Overview', shortLabel: 'Overview', icon: LayoutDashboard },
      ],
    },
    {
      title: 'INVESTIGATION',
      items: [
        { id: 'queue', label: 'SIU Priority Queue', shortLabel: 'SIU Queue', icon: Layers },
        { 
          id: 'case-detail', 
          label: selectedCaseId ? `Case: ${selectedCaseId}` : 'Case Investigation', 
          shortLabel: selectedCaseId ? selectedCaseId : 'Case Review', 
          icon: FileSearch,
          disabled: !selectedCaseId
        },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'network', label: 'Network Explorer', shortLabel: 'Network', icon: Network },
        { id: 'performance', label: 'Detector Lab & Efficacy', shortLabel: 'Detector Lab', icon: Cpu },
      ],
    },
    {
      title: 'GOVERNANCE',
      items: [
        { id: 'audit', label: 'Audit & Governance', shortLabel: 'Audit Trail', icon: History },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#042126] text-white flex flex-col justify-between transition-all duration-250 ease-in-out border-r border-[#005F68]/30 select-none ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-[72px]' : 'md:w-64'}`}
      >
        {/* Top Branding Section */}
        <div className="p-3.5 border-b border-[#005F68]/40">
          <div className="flex items-center justify-between">
            <div 
              onClick={() => handleNavClick('overview')}
              className="flex items-center space-x-2.5 cursor-pointer overflow-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-[#209B47] flex-shrink-0 flex items-center justify-center border border-[#1B843C] shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col justify-center select-none overflow-hidden">
                  <span 
                    className="font-semibold text-sm leading-tight tracking-[-0.02em] text-[#28C840]" 
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    ClaimShield
                  </span>
                  <span 
                    className="font-semibold text-[9px] leading-tight tracking-[0.38em] text-[#FFFFFF] uppercase text-center mt-0.5" 
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    NEXUS
                  </span>
                </div>
              )}
            </div>

            {/* Expand / Collapse Button on Desktop */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden md:flex p-1.5 rounded-md text-[#ACF2E5]/70 hover:text-white hover:bg-[#005F68]/40 transition-colors cursor-pointer"
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Close Button on Mobile */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden p-1.5 rounded-md text-[#ACF2E5]/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!isCollapsed ? (
                <p className="px-2.5 text-[9.5px] font-bold tracking-wider text-[#ACF2E5]/50 uppercase">
                  {group.title}
                </p>
              ) : (
                <div className="h-2" />
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const isDisabled = item.disabled;

                if (isDisabled && isCollapsed) return null;

                return (
                  <button
                    key={item.id}
                    onClick={() => !isDisabled && handleNavClick(item.id)}
                    disabled={isDisabled}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isCollapsed ? 'justify-center p-2.5' : 'space-x-2.5 px-3 py-2'
                    } ${
                      isActive
                        ? 'bg-[#209B47] text-white font-semibold shadow-xs'
                        : isDisabled
                        ? 'text-white/30 cursor-not-allowed'
                        : 'text-white/80 hover:text-white hover:bg-[#005F68]/35'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : isDisabled ? 'text-white/30' : 'text-[#ACF2E5]/80'}`} />
                    {!isCollapsed && (
                      <span className="truncate text-left flex-1">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section: Data Environment & User Profile */}
        <div className="p-3 border-t border-[#005F68]/40 space-y-3 bg-[#03191d]">
          {/* Synthetic Data Environment Chip */}
          {!isCollapsed ? (
            <div className="p-2 rounded-lg bg-[#005F68]/20 border border-[#005F68]/40 text-[10px] space-y-0.5">
              <div className="flex items-center space-x-1.5 text-[#ACF2E5] font-bold">
                <Database className="w-3 h-3" />
                <span className="tracking-wide uppercase">Synthetic Benchmark</span>
              </div>
              <p className="text-white/50 text-[9px] pl-4.5">Zero PHI Ingestion • Isolated</p>
            </div>
          ) : (
            <div 
              title="Synthetic Benchmark • Zero PHI"
              className="flex justify-center p-1.5 text-[#ACF2E5]/70"
            >
              <Database className="w-4 h-4" />
            </div>
          )}

          {/* User Profile & Role Switcher */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2.5'}`}>
            <div className="w-7 h-7 rounded-full bg-[#209B47]/20 border border-[#209B47]/50 flex items-center justify-center text-[#ACF2E5] text-[11px] font-bold flex-shrink-0">
              {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'S'}
            </div>

            {!isCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate leading-tight">
                  {currentUser?.full_name || 'Sarah Jenkins, CFE'}
                </p>
                <div className="flex items-center space-x-1 mt-0.5">
                  <select
                    value={currentUser?.username || 'investigator@acentra.com'}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="w-full bg-[#042126] text-[10px] text-[#ACF2E5] font-medium border border-[#005F68]/50 rounded px-1.5 py-0.5 focus:outline-none focus:border-[#209B47] cursor-pointer truncate"
                  >
                    <option value="investigator@acentra.com">Investigator (SIU)</option>
                    <option value="senior@acentra.com">Senior Investigator</option>
                    <option value="analyst@acentra.com">Integrity Analyst</option>
                    <option value="admin@acentra.com">System Admin</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
