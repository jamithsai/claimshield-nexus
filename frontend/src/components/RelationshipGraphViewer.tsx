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
  graphData?: {
    nodes?: GraphNode[];
    edges?: GraphEdge[];
    sampled_nodes?: GraphNode[];
    sampled_edges?: GraphEdge[];
  };
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  highlightLoops?: boolean;
}

export const RelationshipGraphViewer: React.FC<RelationshipGraphViewerProps> = ({
  graphData,
  nodes: directNodes,
  edges: directEdges,
  highlightLoops = true
}) => {
  const effectiveNodes = directNodes || graphData?.nodes || graphData?.sampled_nodes || [];
  const effectiveEdges = directEdges || graphData?.edges || graphData?.sampled_edges || [];

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(effectiveNodes[0] || null);

  // Position nodes in a clean radial layout
  const width = 650;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;

  const nodePositions: Record<string, { x: number; y: number }> = {};
  
  // Place target node at center, others around in concentric circles
  const targetNode = effectiveNodes.find((n) => n.is_target) || effectiveNodes[0];
  if (targetNode) {
    nodePositions[targetNode.id] = { x: centerX, y: centerY };
  }

  const otherNodes = effectiveNodes.filter((n) => n.id !== targetNode?.id);
  otherNodes.forEach((node, i) => {
    const angle = (i / Math.max(1, otherNodes.length)) * 2 * Math.PI;
    const radius = node.type === 'FACILITY' ? 120 : (node.type === 'PROVIDER' ? 140 : 110);
    nodePositions[node.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });

  return (
    <div className="w-full space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200">
            <Network className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Connected Healthcare Network Topology
            </h3>
            <p className="text-[11px] text-slate-500">Providers, Facilities, Shared Members &amp; Referral Routes</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px] text-slate-600">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="font-medium">Target NPI</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span>Provider</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
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
        <div className="lg:col-span-3 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center relative min-h-[360px]">
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
              </marker>
              <marker
                id="arrow-loop"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
              </marker>
            </defs>

            {/* Render Edges */}
            {effectiveEdges.map((edge, idx) => {
              const src = nodePositions[edge.source];
              const tgt = nodePositions[edge.target];
              if (!src || !tgt) return null;

              const isLoop = edge.relationship?.toLowerCase().includes('referral') || edge.relationship?.toLowerCase().includes('collusion');

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={isLoop ? '#ef4444' : '#cbd5e1'}
                    strokeWidth={isLoop ? 2 : 1.2}
                    strokeDasharray={isLoop ? '4 2' : undefined}
                    markerEnd={isLoop ? 'url(#arrow-loop)' : 'url(#arrow-default)'}
                  />
                </g>
              );
            })}

            {/* Render Nodes */}
            {effectiveNodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const isTarget = node.is_target || node.id === targetNode?.id;

              let nodeFill = '#0284c7';
              if (isTarget) nodeFill = '#dc2626';
              else if (node.type === 'FACILITY') nodeFill = '#0d9488';
              else if (node.type === 'MEMBER') nodeFill = '#64748b';

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    r={isTarget ? 18 : 13}
                    fill={nodeFill}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all hover:opacity-90 shadow-sm"
                  />
                  {isSelected && (
                    <circle
                      r={isTarget ? 24 : 19}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                    />
                  )}
                  <text
                    y={isTarget ? 28 : 22}
                    textAnchor="middle"
                    fill="#1e293b"
                    fontSize={10}
                    fontWeight={isTarget ? 'bold' : 'normal'}
                    className="select-none"
                  >
                    {node.label.length > 14 ? `${node.label.substring(0, 12)}...` : node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Panel */}
        <div className="lg:col-span-1 p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase">Entity Detail</h4>
          </div>

          {selectedNode ? (
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Entity Name</p>
                <p className="font-bold text-slate-900">{selectedNode.label}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Identifier (NPI / ID)</p>
                <p className="font-mono text-sky-700 font-semibold">{selectedNode.id}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Entity Type</p>
                <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 mt-0.5">
                  {selectedNode.type}
                </span>
              </div>
              {selectedNode.specialty && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Specialty</p>
                  <p className="text-slate-700 font-medium">{selectedNode.specialty}</p>
                </div>
              )}
              {selectedNode.pagerank !== undefined && (
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">PageRank Centrality</p>
                  <p className="font-mono font-bold text-slate-900">{selectedNode.pagerank.toFixed(4)}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Click any node on the graph to inspect entity attributes.</p>
          )}
        </div>
      </div>
    </div>
  );
};
