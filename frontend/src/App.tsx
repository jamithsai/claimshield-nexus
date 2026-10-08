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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        setActiveView={(v) => {
          setActiveView(v);
          if (v !== 'case-detail') setSelectedCaseId(null);
        }}
        onRoleChange={handleRoleChange}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            onSelectCaseByNpi={(npi) => {
              // Route to case
              setActiveView('queue');
            }}
          />
        )}

        {activeView === 'performance' && (
          <DetectorPerformanceView />
        )}

        {activeView === 'audit' && (
          <AuditTrailView />
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>ClaimShield Nexus • Program Integrity Intelligence Platform</p>
          <p className="text-[11px] text-slate-600">
            Engineered for Acentra Health • Multi-Detector Ensemble &amp; SIU Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
