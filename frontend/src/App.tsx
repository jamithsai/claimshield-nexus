import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { ExecutiveOverviewView } from './views/ExecutiveOverviewView';
import { SIUQueueView } from './views/SIUQueueView';
import { CaseInvestigationView } from './views/CaseInvestigationView';
import { NetworkExplorerView } from './views/NetworkExplorerView';
import { DetectorPerformanceView } from './views/DetectorPerformanceView';
import { AuditTrailView } from './views/AuditTrailView';
import { User } from './types';
import { api } from './services/api';

export function App() {
  const [activeView, setActiveView] = useState<string>('overview');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('cs_sidebar_collapsed') === 'true';
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    // Initial login as default investigator
    async function initUser() {
      try {
        const res = await api.login('investigator@acentra.com');
        setCurrentUser(res.user);
      } catch (err) {
        console.error('Failed to init user', err);
      }
    }
    initUser();
  }, []);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  const handleToggleCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    localStorage.setItem('cs_sidebar_collapsed', String(collapsed));
  };

  const handleRoleChange = async (username: string) => {
    try {
      const res = await api.login(username);
      setCurrentUser(res.user);
    } catch (err) {
      console.error('Role change error', err);
    }
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveView('case-detail');
  };

  const handleSelectCaseByNpi = async (npi: string) => {
    try {
      const q = await api.getQueue(100, 'priority');
      const matched = q.cases.find(c => c.target_entity_id === npi);
      if (matched) {
        handleSelectCase(matched.case_id);
      } else {
        setActiveView('queue');
      }
    } catch {
      setActiveView('queue');
    }
  };

  const handleNavigateView = (view: string) => {
    setActiveView(view);
    if (view !== 'case-detail') {
      setSelectedCaseId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2FCFF] text-[#042126] flex font-sans">
      {/* 1. Persistent Left Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        setActiveView={handleNavigateView}
        selectedCaseId={selectedCaseId}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleToggleCollapse}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. Main Content Wrapper */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-250 ease-in-out ${
          isSidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-64'
        }`}
      >
        {/* Simplified Top Header */}
        <TopHeader
          activeView={activeView}
          selectedCaseId={selectedCaseId}
          currentUser={currentUser}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateToQueue={() => handleNavigateView('queue')}
          onBackToOverview={() => handleNavigateView('overview')}
        />

        {/* Dynamic Workspace Content */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeView === 'overview' && (
            <ExecutiveOverviewView
              onSelectCase={handleSelectCase}
              onNavigateToQueue={() => handleNavigateView('queue')}
            />
          )}

          {activeView === 'queue' && (
            <SIUQueueView onSelectCase={handleSelectCase} />
          )}

          {activeView === 'case-detail' && selectedCaseId && (
            <CaseInvestigationView
              caseId={selectedCaseId}
              currentUser={currentUser}
              onBackToQueue={() => handleNavigateView('queue')}
              onSelectCaseByNpi={handleSelectCaseByNpi}
            />
          )}

          {activeView === 'network' && (
            <NetworkExplorerView
              onSelectCaseByNpi={handleSelectCaseByNpi}
            />
          )}

          {activeView === 'performance' && (
            <DetectorPerformanceView />
          )}

          {activeView === 'audit' && (
            <AuditTrailView />
          )}
        </main>

        {/* Institutional Healthcare Enterprise Footer */}
        <footer className="border-t border-[#042126]/10 bg-white py-4 text-center text-xs text-[#042126]/70 mt-auto">
          <div className="max-w-[1600px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#042126]">ClaimShield Nexus</span>
              <span className="text-[#042126]/20">•</span>
              <span>Healthcare Program Integrity &amp; Payment Integrity Intelligence</span>
            </div>
            <p className="text-[11px] text-[#042126]/50 font-mono">
              Synthetic Benchmark Evaluation • Zero PHI Ingestion • Acentra Health PS3
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
