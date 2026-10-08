import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
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

  return (
    <div className="min-h-screen bg-[#F2FCFF] text-[#042126] flex flex-col font-sans">
      {/* Top Healthcare Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          if (v !== 'case-detail') setSelectedCaseId(null);
        }}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'overview' && (
          <ExecutiveOverviewView
            onSelectCase={handleSelectCase}
            onNavigateToQueue={() => setActiveView('queue')}
          />
        )}

        {activeView === 'queue' && (
          <SIUQueueView onSelectCase={handleSelectCase} />
        )}

        {activeView === 'case-detail' && selectedCaseId && (
          <CaseInvestigationView
            caseId={selectedCaseId}
            currentUser={currentUser}
            onBackToQueue={() => setActiveView('queue')}
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
      <footer className="border-t border-[#042126]/10 bg-white py-4 text-center text-xs text-[#042126]/70">
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
  );
}

export default App;
