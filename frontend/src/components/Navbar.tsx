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
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Platform Identifier */}
          <div 
            className="flex items-center space-x-3 cursor-pointer select-none" 
            onClick={() => setActiveView('overview')}
          >
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center border border-sky-700 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-slate-900">
                  ClaimShield <span className="text-sky-600 font-extrabold">Nexus</span>
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  v1.2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
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
                      ? 'bg-sky-50 text-sky-700 border border-sky-200 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls: Synthetic Badge & RBAC Switcher */}
          <div className="flex items-center space-x-3">
            {/* Non-Negotiable Synthetic Governance Chip */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200 text-[10px] font-bold text-indigo-700">
              <Database className="w-3 h-3 text-indigo-600" />
              <span className="tracking-wide">SYNTHETIC BENCHMARK • ZERO PHI</span>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center space-x-2 pl-3 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{currentUser?.full_name || 'Sarah Jenkins, CFE'}</p>
                <div className="flex items-center justify-end space-x-1 mt-0.5">
                  <UserCheck className="w-3 h-3 text-sky-600" />
                  <select
                    value={currentUser?.username || 'investigator@acentra.com'}
                    onChange={(e) => onRoleChange(e.target.value)}
                    className="bg-slate-50 text-[11px] text-sky-700 font-semibold border border-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
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
