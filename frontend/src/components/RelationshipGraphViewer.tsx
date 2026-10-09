import React, { useState, useMemo } from 'react';
import { 
  Network, 
  UserCheck, 
  Building2, 
  User, 
  RefreshCw, 
  ZoomIn, 
  ZoomOut, 
  Search, 
  ArrowRight, 
  Copy, 
  Check, 
  ShieldAlert, 
  Info,
  ExternalLink,
  Layers,
  Filter
} from 'lucide-react';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  specialty?: string;
  city?: string;
  pagerank?: number;
  is_target?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  weight?: number;
}

export interface RelationshipGraphViewerProps {
  graphData?: {
    nodes?: GraphNode[];
    edges?: GraphEdge[];
    sampled_nodes?: GraphNode[];
    sampled_edges?: GraphEdge[];
    total_nodes?: number;
    total_edges?: number;
  };
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  highlightLoops?: boolean;
  onSelectCase?: (caseId: string) => void;
  onSelectCaseByNpi?: (npi: string) => void;
}

export const RelationshipGraphViewer: React.FC<RelationshipGraphViewerProps> = ({
  graphData,
  nodes: directNodes,
  edges: directEdges,
  highlightLoops = true,
  onSelectCase,
  onSelectCaseByNpi
}) => {
  const effectiveNodes: GraphNode[] = useMemo(() => {
    const raw = (directNodes && directNodes.length > 0)
      ? directNodes
      : (graphData?.nodes && graphData.nodes.length > 0)
      ? graphData.nodes
      : (graphData?.sampled_nodes && graphData.sampled_nodes.length > 0)
      ? graphData.sampled_nodes
      : null;

    if (raw && raw.length > 0) return raw;

    // Rich fallback topology dataset
    return [
      { id: 'NPI-1049281', label: 'Dr. Robert Vance, MD', type: 'PROVIDER', specialty: 'Pain Medicine', city: 'Dallas, TX', pagerank: 0.082, is_target: true },
      { id: 'NPI-1082741', label: 'Dr. Sarah Jenkins, DO', type: 'PROVIDER', specialty: 'Physical Therapy', city: 'Fort Worth, TX', pagerank: 0.064 },
      { id: 'NPI-1928472', label: 'Dr. Marcus Sterling, MD', type: 'PROVIDER', specialty: 'Neurology', city: 'Plano, TX', pagerank: 0.048 },
      { id: 'NPI-1572938', label: 'Dr. Elena Rostova, MD', type: 'PROVIDER', specialty: 'Orthopedics', city: 'Arlington, TX', pagerank: 0.035 },
      { id: 'FAC-001', label: 'Apex Wellness Center LLC', type: 'FACILITY', city: 'Dallas, TX', pagerank: 0.095 },
      { id: 'FAC-002', label: 'Metroplex Pain Institute', type: 'FACILITY', city: 'Fort Worth, TX', pagerank: 0.075 },
      { id: 'FAC-003', label: 'Trinity Diagnostic Imaging', type: 'FACILITY', city: 'Plano, TX', pagerank: 0.042 },
      { id: 'MBR-101', label: 'Patient P-1842', type: 'MEMBER', pagerank: 0.012 },
      { id: 'MBR-102', label: 'Patient P-2910', type: 'MEMBER', pagerank: 0.015 },
      { id: 'MBR-103', label: 'Patient P-3419', type: 'MEMBER', pagerank: 0.018 },
      { id: 'MBR-104', label: 'Patient P-4812', type: 'MEMBER', pagerank: 0.009 },
      { id: 'MBR-105', label: 'Patient P-5921', type: 'MEMBER', pagerank: 0.021 },
      { id: 'MBR-106', label: 'Patient P-6734', type: 'MEMBER', pagerank: 0.014 },
      { id: 'MBR-107', label: 'Patient P-7819', type: 'MEMBER', pagerank: 0.016 },
    ];
  }, [directNodes, graphData]);

  const effectiveEdges: GraphEdge[] = useMemo(() => {
    const raw = (directEdges && directEdges.length > 0)
      ? directEdges
      : (graphData?.edges && graphData.edges.length > 0)
      ? graphData.edges
      : (graphData?.sampled_edges && graphData.sampled_edges.length > 0)
      ? graphData.sampled_edges
      : null;

    if (raw && raw.length > 0) return raw;

    // Fallback relationship edges
    return [
      { source: 'NPI-1049281', target: 'FAC-001', relationship: 'OPERATES_AT' },
      { source: 'NPI-1082741', target: 'FAC-001', relationship: 'OPERATES_AT' },
      { source: 'NPI-1928472', target: 'FAC-002', relationship: 'ATTENDING_AT' },
      { source: 'NPI-1572938', target: 'FAC-003', relationship: 'ATTENDING_AT' },
      { source: 'NPI-1049281', target: 'NPI-1082741', relationship: 'CROSS_REFERRAL_LOOP' },
      { source: 'NPI-1082741', target: 'NPI-1928472', relationship: 'REFERRAL_COLLUSION' },
      { source: 'MBR-101', target: 'NPI-1049281', relationship: 'TREATED_BY' },
      { source: 'MBR-101', target: 'FAC-001', relationship: 'ADMITTED_TO' },
      { source: 'MBR-102', target: 'NPI-1049281', relationship: 'TREATED_BY' },
      { source: 'MBR-102', target: 'NPI-1082741', relationship: 'TREATED_BY' },
      { source: 'MBR-103', target: 'NPI-1082741', relationship: 'TREATED_BY' },
      { source: 'MBR-103', target: 'FAC-002', relationship: 'ADMITTED_TO' },
      { source: 'MBR-104', target: 'NPI-1928472', relationship: 'TREATED_BY' },
      { source: 'MBR-105', target: 'NPI-1049281', relationship: 'TREATED_BY' },
      { source: 'MBR-105', target: 'NPI-1572938', relationship: 'TREATED_BY' },
      { source: 'MBR-106', target: 'NPI-1572938', relationship: 'TREATED_BY' },
      { source: 'MBR-106', target: 'FAC-003', relationship: 'ADMITTED_TO' },
      { source: 'MBR-107', target: 'NPI-1082741', relationship: 'TREATED_BY' },
    ];
  }, [directEdges, graphData]);

  // Initial selection: target node if present, or first node
  const initialTarget = useMemo(() => {
    return effectiveNodes.find((n) => n.is_target) || effectiveNodes[0] || null;
  }, [effectiveNodes]);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(() => initialTarget);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PROVIDER' | 'FACILITY' | 'MEMBER'>('ALL');
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync selectedNode when effectiveNodes changes if selectedNode is null or not found
  React.useEffect(() => {
    if (!selectedNode && initialTarget) {
      setSelectedNode(initialTarget);
    }
  }, [initialTarget, selectedNode]);

  // SVG dimensions
  const width = 760;
  const height = 480;
  const centerX = width / 2;
  const centerY = height / 2;

  // Node position map
  const nodePositions = useMemo(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    if (effectiveNodes.length === 0) return pos;

    const targetNode = effectiveNodes.find((n) => n.is_target) || effectiveNodes[0];
    if (targetNode) {
      pos[targetNode.id] = { x: centerX, y: centerY };
    }

    const otherNodes = effectiveNodes.filter((n) => n.id !== targetNode?.id);
    const n = otherNodes.length;

    // Arrange in 2 concentric rings depending on type or count
    otherNodes.forEach((node, i) => {
      const isFacility = node.type === 'FACILITY';
      const isMember = node.type === 'MEMBER';
      
      let baseRadius = isFacility ? 145 : isMember ? 190 : 160;
      if (n > 20) {
        // Multi-ring distribution for larger graph samples
        const ring = i % 3;
        baseRadius = 110 + ring * 55;
      }

      const angle = (i / Math.max(1, n)) * 2 * Math.PI - Math.PI / 2;
      pos[node.id] = {
        x: centerX + baseRadius * Math.cos(angle),
        y: centerY + baseRadius * Math.sin(angle),
      };
    });

    return pos;
  }, [effectiveNodes, centerX, centerY]);

  // Compute 1-hop connected neighborhood
  const { neighborNodeIds, incidentEdges } = useMemo(() => {
    if (!selectedNode) {
      return { neighborNodeIds: new Set<string>(), incidentEdges: [] };
    }

    const set = new Set<string>([selectedNode.id]);
    const incident: GraphEdge[] = [];

    effectiveEdges.forEach((edge) => {
      if (edge.source === selectedNode.id) {
        set.add(edge.target);
        incident.push(edge);
      } else if (edge.target === selectedNode.id) {
        set.add(edge.source);
        incident.push(edge);
      }
    });

    return { neighborNodeIds: set, incidentEdges: incident };
  }, [selectedNode, effectiveEdges]);

  // Filtered nodes for search & type filter
  const filteredNodes = useMemo(() => {
    return effectiveNodes.filter((n) => {
      const matchType = filterType === 'ALL' || n.type === filterType;
      const matchSearch = searchQuery.trim() === '' || 
        n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.specialty && n.specialty.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [effectiveNodes, filterType, searchQuery]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleInvestigate = (npi: string) => {
    if (onSelectCaseByNpi) {
      onSelectCaseByNpi(npi);
    } else if (onSelectCase) {
      onSelectCase(npi);
    }
  };

  return (
    <div className="w-full space-y-4 font-sans">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#042126]/10">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30">
            <Network className="w-4 h-4 text-[#209B47]" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
              Healthcare Relationship Network Topology
            </h3>
            <p className="text-[11px] text-[#042126]/60">
              Interactive 1-hop neighborhood exploration &amp; bipartite provider-facility-member mapping
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#042126]/70">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B91C1C] inline-block"></span>
            <span className="font-semibold text-[#042126]">Target Entity</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#209B47] inline-block"></span>
            <span>Provider</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005F68] inline-block"></span>
            <span>Facility</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-0.5 bg-[#B91C1C] inline-block"></span>
            <span className="font-semibold text-[#B91C1C]">Referral Loop / Collusion</span>
          </span>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#F2FCFF] p-2.5 rounded-lg border border-[#042126]/10 text-xs">
        <div className="flex items-center space-x-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#042126]/40" />
            <input
              type="text"
              placeholder="Search by entity name, NPI, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-white border border-[#042126]/15 rounded-md text-xs text-[#042126] placeholder-[#042126]/40 focus:outline-none focus:border-[#209B47]"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-white p-0.5 rounded-md border border-[#042126]/10">
            {(['ALL', 'PROVIDER', 'FACILITY'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                  filterType === type 
                    ? 'bg-[#005F68] text-white' 
                    : 'text-[#042126]/60 hover:text-[#042126] hover:bg-[#F2FCFF]'
                }`}
              >
                {type === 'ALL' ? 'All' : type.toLowerCase() + 's'}
              </button>
            ))}
          </div>

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 bg-white p-0.5 rounded-md border border-[#042126]/10">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
              title="Zoom Out"
              className="p-1 hover:bg-[#F2FCFF] rounded text-[#042126]/70"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono px-1 text-[#042126]/70">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.15))}
              title="Zoom In"
              className="p-1 hover:bg-[#F2FCFF] rounded text-[#042126]/70"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              title="Reset Zoom"
              className="p-1 hover:bg-[#F2FCFF] rounded text-[#042126]/70"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="px-2 py-1 bg-white border border-[#042126]/15 hover:bg-[#F2FCFF] rounded-md text-[11px] font-semibold text-[#005F68] transition-colors"
            >
              Show Entire Network
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas & Detail Sidebar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-3 bg-[#F2FCFF]/80 rounded-xl border border-[#042126]/10 overflow-hidden relative min-h-[480px] flex items-center justify-center shadow-inner">
          {selectedNode && (
            <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-[#209B47]/30 px-2.5 py-1.5 rounded-lg shadow-xs flex items-center space-x-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#209B47] animate-pulse"></span>
              <span className="text-[#042126] font-semibold">
                1-Hop Isolated Neighborhood: <span className="font-bold text-[#005F68]">{selectedNode.label}</span>
              </span>
              <span className="text-[#042126]/50">({neighborNodeIds.size - 1} neighbors)</span>
            </div>
          )}

          <svg 
            width="100%" 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
            className="cursor-default select-none"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
          >
            <defs>
              <marker
                id="arrow-default"
                viewBox="0 0 10 10"
                refX="18"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(4, 33, 38, 0.4)" />
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
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#B91C1C" />
              </marker>
              <marker
                id="arrow-highlighted"
                viewBox="0 0 10 10"
                refX="20"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#209B47" />
              </marker>
            </defs>

            {/* Render Edges */}
            {effectiveEdges.map((edge, idx) => {
              const src = nodePositions[edge.source];
              const tgt = nodePositions[edge.target];
              if (!src || !tgt) return null;

              const isLoop = edge.relationship?.toLowerCase().includes('referral') || 
                             edge.relationship?.toLowerCase().includes('loop') ||
                             edge.relationship?.toLowerCase().includes('collusion');

              const isIncidentToSelected = selectedNode ? 
                (edge.source === selectedNode.id || edge.target === selectedNode.id) : 
                true;

              const edgeOpacity = selectedNode 
                ? (isIncidentToSelected ? 1 : 0.08) 
                : (isLoop ? 0.9 : 0.35);

              const strokeColor = isLoop 
                ? '#B91C1C' 
                : isIncidentToSelected && selectedNode 
                ? '#209B47' 
                : 'rgba(4, 33, 38, 0.3)';

              const strokeWidth = isIncidentToSelected && selectedNode 
                ? (isLoop ? 2.5 : 2) 
                : (isLoop ? 1.8 : 1.2);

              const marker = isLoop 
                ? 'url(#arrow-loop)' 
                : (isIncidentToSelected && selectedNode ? 'url(#arrow-highlighted)' : 'url(#arrow-default)');

              return (
                <g key={`edge-${idx}`} style={{ transition: 'opacity 0.2s ease-out' }}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={edgeOpacity}
                    strokeDasharray={isLoop ? '5 3' : undefined}
                    markerEnd={marker}
                  />
                  {/* If selected and incident, render relationship pill label */}
                  {selectedNode && isIncidentToSelected && (
                    <g transform={`translate(${(src.x + tgt.x) / 2}, ${(src.y + tgt.y) / 2})`}>
                      <rect
                        x="-30"
                        y="-8"
                        width="60"
                        height="16"
                        rx="3"
                        fill="#ffffff"
                        stroke={isLoop ? '#B91C1C' : '#042126'}
                        strokeOpacity="0.2"
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        fontSize={8}
                        fontWeight="bold"
                        fill={isLoop ? '#B91C1C' : '#042126'}
                        className="select-none font-mono"
                      >
                        {edge.relationship.replace(/_/g, ' ').substring(0, 10)}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {effectiveNodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNode?.id === node.id;
              const isTarget = node.is_target || node.id === initialTarget?.id;
              const isConnectedNeighbor = selectedNode ? neighborNodeIds.has(node.id) : true;

              const nodeOpacity = selectedNode 
                ? (isConnectedNeighbor ? 1 : 0.18) 
                : 1;

              let nodeFill = '#209B47';
              if (isTarget) nodeFill = '#B91C1C';
              else if (node.type === 'FACILITY') nodeFill = '#005F68';
              else if (node.type === 'MEMBER') nodeFill = '#15497E';

              const radius = isTarget ? 18 : (isSelected ? 16 : 13);

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                  style={{ opacity: nodeOpacity, transition: 'opacity 0.2s ease-out, transform 0.2s ease-out' }}
                >
                  {/* Outer active ring for selected node */}
                  {isSelected && (
                    <circle
                      r={radius + 7}
                      fill="none"
                      stroke="#209B47"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      className="animate-spin-slow"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    r={radius}
                    fill={nodeFill}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-all hover:scale-110 shadow-md"
                  />

                  {/* Inner Target Badge */}
                  {isTarget && (
                    <circle
                      r={6}
                      fill="#ffffff"
                    />
                  )}

                  {/* Node Label Text */}
                  <text
                    y={radius + 12}
                    textAnchor="middle"
                    fill="#042126"
                    fontSize={isSelected ? 11 : 9.5}
                    fontWeight={isSelected || isTarget ? 'bold' : '500'}
                    className="select-none pointer-events-none"
                    style={{ textShadow: '0 1px 2px rgba(255,255,255,0.9)' }}
                  >
                    {node.label.length > 15 ? `${node.label.substring(0, 13)}...` : node.label}
                  </text>

                  {/* Subtitle (Specialty or City) */}
                  {(node.specialty || node.city) && (
                    <text
                      y={radius + 22}
                      textAnchor="middle"
                      fill="#042126"
                      fillOpacity={0.6}
                      fontSize={8}
                      className="select-none pointer-events-none"
                    >
                      {node.specialty || node.city}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Entity Detail Drawer */}
        <div className="lg:col-span-1 p-4 rounded-xl bg-white border border-[#042126]/10 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#042126]/10">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-[#209B47]" />
              <h4 className="text-xs font-bold text-[#042126] uppercase tracking-wider">Entity Intelligence</h4>
            </div>
            {selectedNode && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                selectedNode.is_target || selectedNode.id === initialTarget?.id
                  ? 'bg-[#FEE2E2] text-[#B91C1C] border border-[#FECACA]'
                  : selectedNode.type === 'FACILITY'
                  ? 'bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]'
                  : 'bg-[#E8F8EE] text-[#1B843C] border border-[#ACF2E5]'
              }`}>
                {selectedNode.type}
              </span>
            )}
          </div>

          {selectedNode ? (
            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">Entity Name</p>
                <p className="font-bold text-[#042126] text-sm leading-tight mt-0.5">{selectedNode.label}</p>
              </div>

              <div>
                <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">Identifier (NPI / ID)</p>
                <div className="flex items-center justify-between bg-[#F2FCFF] px-2.5 py-1.5 rounded-md border border-[#042126]/10 mt-0.5">
                  <span className="font-mono text-[#005F68] font-bold">{selectedNode.id}</span>
                  <button
                    onClick={() => handleCopyId(selectedNode.id)}
                    title="Copy ID"
                    className="text-[#042126]/50 hover:text-[#042126] transition-colors"
                  >
                    {copiedId === selectedNode.id ? (
                      <Check className="w-3.5 h-3.5 text-[#209B47]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {selectedNode.specialty && (
                <div>
                  <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">Medical Specialty</p>
                  <p className="text-[#042126] font-medium mt-0.5">{selectedNode.specialty}</p>
                </div>
              )}

              {selectedNode.city && (
                <div>
                  <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">Location / Jurisdiction</p>
                  <p className="text-[#042126] font-medium mt-0.5">{selectedNode.city}</p>
                </div>
              )}

              {selectedNode.pagerank !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-[10px] text-[#042126]/60 uppercase font-semibold">
                    <span>PageRank Centrality</span>
                    <span className="font-mono font-bold text-[#005F68]">{(selectedNode.pagerank * 100).toFixed(2)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#042126]/10 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-[#005F68] rounded-full" 
                      style={{ width: `${Math.min(100, selectedNode.pagerank * 400)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Incident Neighborhood Breakdown */}
              <div className="pt-2 border-t border-[#042126]/10">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-[#042126]/60 uppercase font-semibold">
                    Connected Entities ({incidentEdges.length})
                  </p>
                  <span className="text-[10px] text-[#005F68] font-mono font-bold">1-Hop Degree</span>
                </div>
                
                {incidentEdges.length > 0 ? (
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {incidentEdges.map((e, idx) => {
                      const otherId = e.source === selectedNode.id ? e.target : e.source;
                      const otherNode = effectiveNodes.find(n => n.id === otherId);
                      const isLoop = e.relationship?.toLowerCase().includes('referral') || e.relationship?.toLowerCase().includes('collusion');

                      return (
                        <div 
                          key={idx}
                          onClick={() => otherNode && setSelectedNode(otherNode)}
                          className="p-1.5 rounded bg-[#F2FCFF] hover:bg-[#E8F8EE] border border-[#042126]/10 flex items-center justify-between cursor-pointer text-[11px] transition-colors"
                        >
                          <div className="truncate pr-2">
                            <p className="font-medium text-[#042126] truncate">{otherNode?.label || otherId}</p>
                            <p className={`text-[9px] font-mono ${isLoop ? 'text-[#B91C1C] font-bold' : 'text-[#042126]/60'}`}>
                              {e.relationship.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <ArrowRight className="w-3 h-3 text-[#005F68]/40 flex-shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#042126]/50 italic mt-1">No direct incident edges in current sample.</p>
                )}
              </div>

              {/* Action Button: Investigate Case */}
              {(onSelectCaseByNpi || onSelectCase) && (selectedNode.type === 'PROVIDER' || selectedNode.is_target) && (
                <div className="pt-2">
                  <button
                    onClick={() => handleInvestigate(selectedNode.id)}
                    className="w-full py-2 px-3 rounded-lg bg-[#209B47] hover:bg-[#1B843C] text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Investigate Associated Case</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-center text-[#042126]/50 mt-1">
                    Opens case file and full behavioral evidence profile
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-[#042126]/50 space-y-2">
              <Network className="w-8 h-8 mx-auto text-[#042126]/20" />
              <p className="text-xs">Click any node on the graph canvas to inspect entity attributes and isolate 1-hop connections.</p>
            </div>
          )}
        </div>
      </div>

      {/* Investigator Instructional Guidance */}
      <div className="p-3.5 rounded-xl bg-[#F2FCFF] border border-[#005F68]/20 text-xs text-[#042126] flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-[#005F68] flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-[#005F68]">Investigative Graph Guidance:</span>
          <p className="text-[#042126]/80 text-[11px] leading-relaxed">
            Clicking an entity isolates its immediate 1-hop neighborhood while dimming unrelated network topology. Red dashed lines denote high-risk referral loops, patient-sharing syndicates, or collusion clusters detected across the population graph.
          </p>
        </div>
      </div>
    </div>
  );
};
