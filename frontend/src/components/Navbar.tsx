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
  Lock
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
    { id: 'overview', label: 'Command Center', icon: Activity },
    { id: 'queue', label: 'SIU Priority Queue', icon: Layers },
    { id: 'network', label: 'Network Explorer', icon: Network },
    { id: 'performance', label: 'Detector Lab & Red-Team', icon: Cpu },
    { id: 'audit', label: 'Audit & Governance', icon: History },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-slate-800 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Platform Identifier */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setActiveView('overview')}
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center border border-blue-500 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  ClaimShield <span className="text-blue-400 font-extrabold">Nexus</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  v1.2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                Healthcare Program Integrity Platform
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
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls: Synthetic Badge & RBAC Switcher */}
          <div className="flex items-center space-x-3">
            {/* Non-Negotiable Synthetic Governance Chip */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-950/60 border border-purple-800/60 text-[10px] font-bold text-purple-300">
              <Database className="w-3 h-3 text-purple-400" />
              <span className="tracking-wide">SYNTHETIC BENCHMARK • ZERO PHI</span>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-200">{currentUser?.full_name || 'Sarah Jenkins, CFE'}</p>
                <div className="flex items-center justify-end space-x-1">
                  <UserCheck className="w-3 h-3 text-blue-400" />
                  <select
                    value={currentUser?.username || 'investigator@acentra.com'}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="bg-transparent text-[11px] text-blue-400 font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="investigator@acentra.com" className="bg-slate-900 text-slate-200">Investigator (SIU)</option>
                    <option value="senior@acentra.com" className="bg-slate-900 text-slate-200">Senior Investigator</option>
                    <option value="analyst@acentra.com" className="bg-slate-900 text-slate-200">Integrity Analyst</option>
                    <option value="admin@acentra.com" className="bg-slate-900 text-slate-200">System Admin</option>
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
