import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Database, 
  UserCheck, 
  Layers, 
  Network, 
  Cpu, 
  History,
  FileCheck
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeView: string;
  setActiveView: (view: string) => void;
  onRoleChange: (role: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeView,
  setActiveView,
  onRoleChange
}) => {
  const navItems = [
    { id: 'overview', label: 'Program Integrity Overview', icon: Activity },
    { id: 'queue', label: 'SIU Priority Queue', icon: Layers },
    { id: 'network', label: 'Network Explorer', icon: Network },
    { id: 'performance', label: 'Detector Lab & Efficacy', icon: Cpu },
    { id: 'audit', label: 'Audit & Governance', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#042126]/10 shadow-[0_1px_3px_0_rgba(4,33,38,0.04)]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Platform Identifier */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setActiveView('overview')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#209B47] flex items-center justify-center border border-[#1B843C] shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-[#042126]">
                  ClaimShield <span className="text-[#209B47] font-extrabold">Nexus</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-[#F2FCFF] text-[#005F68] border border-[#042126]/10">
                  v1.2.4
                </span>
              </div>
              <p className="text-[10px] text-[#042126]/60 font-medium leading-none mt-0.5">
                Healthcare Program Integrity &amp; Payment Integrity Platform
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30 shadow-xs'
                      : 'text-[#042126]/75 hover:text-[#042126] hover:bg-[#F2FCFF] border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#209B47]' : 'text-[#042126]/50'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls: Synthetic Badge & RBAC Switcher */}
          <div className="flex items-center space-x-3">
            {/* Non-Negotiable Synthetic Governance Chip */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#ACF2E5]/30 border border-[#ACF2E5] text-[10px] font-bold text-[#005F68]">
              <Database className="w-3 h-3 text-[#005F68]" />
              <span className="tracking-wide">SYNTHETIC BENCHMARK • ZERO PHI</span>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center space-x-2 pl-3 border-l border-[#042126]/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-[#042126]">{currentUser?.full_name || 'Sarah Jenkins, CFE'}</p>
                <div className="flex items-center justify-end space-x-1 mt-0.5">
                  <UserCheck className="w-3 h-3 text-[#209B47]" />
                  <select
                    value={currentUser?.username || 'investigator@acentra.com'}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="bg-[#F2FCFF] text-[11px] text-[#005F68] font-semibold border border-[#042126]/15 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#209B47] cursor-pointer"
                  >
                    <option value="investigator@acentra.com">Investigator (SIU)</option>
                    <option value="senior@acentra.com">Senior Investigator</option>
                    <option value="analyst@acentra.com">Integrity Analyst</option>
                    <option value="admin@acentra.com">System Admin</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
