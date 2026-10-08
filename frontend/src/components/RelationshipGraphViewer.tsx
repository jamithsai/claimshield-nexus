import React, { useState } from 'react';
import { Network, UserCheck, Building2, User, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: string;
  specialty?: string;
  city?: string;
  pagerank?: number;
  is_target?: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight?: number;
}

interface RelationshipGraphViewerProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightLoops?: boolean;
}

export const RelationshipGraphViewer: React.FC<RelationshipGraphViewerProps> = ({
  nodes,
  edges,
  highlightLoops = true
}) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[0] || null);

  // Position nodes in a clean radial / orbital layout
  const width = 650;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  // Place target node at center, others around in concentric circles
  const targetNode = nodes.find((n) => n.is_target) || nodes[0];
  if (targetNode) {
    nodePositions[targetNode.id] = { x: centerX, y: centerY };
  }

  const otherNodes = nodes.filter((n) => n.id !== targetNode?.id);
  otherNodes.forEach((node, i) => {
    const angle = (i / Math.max(1, otherNodes.length)) * 2 * Math.PI;
    const radius = node.type === 'FACILITY' ? 120 : (node.type === 'PROVIDER' ? 140 : 110);
    nodePositions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Heterogeneous Network
            </h3>
            <p className="text-xs text-slate-400">Providers, Facilities, Members & Circular Referral Routes</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-300">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
            <span>Target NPI</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span>
            <span>Provider</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            <span>Facility</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-0.5 bg-rose-400 inline-block"></span>
            <span>Referral Loop</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
        {/* SVG Graph Canvas */}
        <div className="lg:col-span-3 bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center relative min-h-[360px]">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="18"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
              </marker>
              <marker
                id="arrow-loop"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Edges */}
            {edges.map((edge, i) => {
              const srcPos = nodePositions[edge.source];
              const tgtPos = nodePositions[edge.target];
              if (!srcPos || !tgtPos) return null;

              const isLoopEdge = edge.relationship === 'REFERRED_TO';
              return (
                <g key={i}>
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={isLoopEdge ? '#f43f5e' : '#334155'}
                    strokeWidth={isLoopEdge ? 2.5 : 1.2}
                    strokeDasharray={isLoopEdge ? 'none' : '4 4'}
                    markerEnd={isLoopEdge ? 'url(#arrow-loop)' : 'url(#arrow-default)'}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const pos = nodePositions[node.id] || { x: centerX, y: centerY };
              const isSelected = selectedNode?.id === node.id;
              const isTarget = node.is_target;
              
              let fill = '#0284c7'; // Provider
              if (isTarget) fill = '#ef4444';
              else if (node.type === 'FACILITY') fill = '#10b981';
              else if (node.type === 'MEMBER') fill = '#a855f7';

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isTarget ? 20 : (isSelected ? 16 : 13)}
                    fill={fill}
                    stroke={isSelected ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? 3 : 2}
                    className={`transition-all duration-200 ${isTarget ? 'animate-pulse' : ''}`}
                  />
                  <text
                    y={isTarget ? 30 : 25}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize={isTarget ? 11 : 9.5}
                    fontWeight={isTarget ? 'bold' : '500'}
                    className="pointer-events-none drop-shadow-md"
                  >
                    {node.label.length > 18 ? `${node.label.substring(0, 16)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Card */}
        <div className="lg:col-span-1 bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-3">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Node Inspector</p>
          {selectedNode ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {selectedNode.type === 'FACILITY' ? (
                  <Building2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <UserCheck className="w-5 h-5 text-sky-400" />
                )}
                <div>
                  <p className="text-xs font-bold text-white">{selectedNode.label}</p>
                  <p className="text-[10px] font-mono text-slate-400">{selectedNode.id}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
                {selectedNode.specialty && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">Specialty:</span> {selectedNode.specialty}
                  </p>
                )}
                {selectedNode.city && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">Location:</span> {selectedNode.city}
                  </p>
                )}
                {selectedNode.pagerank !== undefined && (
                  <p className="text-slate-300">
                    <span className="text-slate-500">Centrality (PR):</span> {selectedNode.pagerank}
                  </p>
                )}
                <div className="mt-2 pt-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedNode.is_target ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {selectedNode.is_target ? 'PRIMARY TARGET ENTITY' : selectedNode.type}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Click a node in the graph to inspect details.</p>
          )}
        </div>
      </div>
    </div>
  );
};
