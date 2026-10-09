import React, { useState } from 'react';
import { CollusionGalaxy3D } from './CollusionGalaxy3D';
import { RiskTopography3D } from './RiskTopography3D';
import { TemporalBurstSpiral3D } from './TemporalBurstSpiral3D';
import { RelationshipGraphViewer } from '../RelationshipGraphViewer';
import { 
  Network, 
  BarChart3, 
  Clock, 
  Layers, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Cpu, 
  ShieldAlert,
  HelpCircle,
  Activity
} from 'lucide-react';

import { ThreeDErrorBoundary } from './ThreeDErrorBoundary';

export type Studio3DMode = 'GALAXY' | 'TOPOGRAPHY' | 'SPIRAL' | '2D_PLANAR';

interface IntelligenceStudio3DProps {
  nodes?: any[];
  edges?: any[];
  history?: any[];
  onSelectCaseByNpi?: (npi: string) => void;
  defaultMode?: Studio3DMode;
  className?: string;
  allow2DFallback?: boolean;
}

export const IntelligenceStudio3D: React.FC<IntelligenceStudio3DProps> = ({
  nodes,
  edges,
  history,
  onSelectCaseByNpi,
  defaultMode = 'GALAXY',
  className = '',
  allow2DFallback = true,
}) => {
  const [activeMode, setActiveMode] = useState<Studio3DMode>(defaultMode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`space-y-4 font-sans ${isFullscreen ? 'fixed inset-0 z-50 bg-[#050811] p-6 overflow-y-auto flex flex-col justify-between' : ''} ${className}`}>
      {/* Top Cyber Command Mode Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#050811]/90 p-3 rounded-2xl border border-[#3186FF]/30 backdrop-blur-xl shadow-xl">
        {/* Left: Mode Title & Live WebGL Engine Status */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-[#3186FF]/20 text-[#38BDF8] border border-[#3186FF]/40">
            <Cpu className="w-5 h-5 text-[#38BDF8]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                ClaimShield 3D Intelligence Studio
              </h2>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#209B47]/20 border border-[#209B47]/40 text-[#ACF2E5] text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#209B47] animate-pulse" />
                <span>WebGL 60 FPS</span>
              </span>
            </div>
            <p className="text-[11px] text-white/60 mt-0.5">
              Interactive 3D WebGL visualizations replacing flat diagrams with volumetric spatial intelligence.
            </p>
          </div>
        </div>

        {/* Right: Mode Switcher Tabs */}
        <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveMode('GALAXY')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeMode === 'GALAXY'
                ? 'bg-[#3186FF] text-white shadow-md font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>3D Collusion Galaxy</span>
          </button>

          <button
            onClick={() => setActiveMode('TOPOGRAPHY')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeMode === 'TOPOGRAPHY'
                ? 'bg-[#3186FF] text-white shadow-md font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>3D Risk Topography</span>
          </button>

          <button
            onClick={() => setActiveMode('SPIRAL')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeMode === 'SPIRAL'
                ? 'bg-[#3186FF] text-white shadow-md font-bold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>3D Temporal Spiral</span>
          </button>

          {allow2DFallback && (
            <button
              onClick={() => setActiveMode('2D_PLANAR')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeMode === '2D_PLANAR'
                  ? 'bg-white/20 text-white shadow-md font-bold'
                  : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Diagram</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#ACF2E5]" /> : <Maximize2 className="w-4 h-4 text-[#ACF2E5]" />}
          </button>
        </div>
      </div>

      {/* Main Active 3D / 2D Canvas Workspace with Localized Error Boundary */}
      <div className="w-full">
        <ThreeDErrorBoundary key={activeMode} fallbackTitle={`${activeMode} 3D View Unavailable`}>
          {activeMode === 'GALAXY' && (
            <CollusionGalaxy3D 
              nodes={nodes} 
              edges={edges} 
              onSelectCaseByNpi={onSelectCaseByNpi} 
            />
          )}

          {activeMode === 'TOPOGRAPHY' && (
            <RiskTopography3D />
          )}

          {activeMode === 'SPIRAL' && (
            <TemporalBurstSpiral3D 
              history={history} 
            />
          )}

          {activeMode === '2D_PLANAR' && (
            <div className="health-panel p-5 rounded-2xl bg-white border border-[#042126]/10">
              <RelationshipGraphViewer 
                nodes={nodes} 
                edges={edges} 
                onSelectCaseByNpi={onSelectCaseByNpi} 
              />
            </div>
          )}
        </ThreeDErrorBoundary>
      </div>

      {/* Interactive Guidance Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-[#050811]/75 border border-white/10 text-xs text-white/70 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#38BDF8]" />
          <span>
            {activeMode === 'GALAXY' && 'Left-click + Drag to Orbit • Right-click to Pan • Scroll to Zoom • Click any Doctor/Clinic to focus & ignite kickback rings.'}
            {activeMode === 'TOPOGRAPHY' && 'Hover over any 3D pillar to inspect volume, average risk, and elevation level contour beacons.'}
            {activeMode === 'SPIRAL' && 'Step through time epochs or press Play to watch Day 90 risk burst shockwaves erupt in 3D space.'}
            {activeMode === '2D_PLANAR' && 'Standard 2D planar graph projection mode.'}
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#ACF2E5] font-semibold flex-shrink-0">
          Three.js Accelerated
        </span>
      </div>
    </div>
  );
};
