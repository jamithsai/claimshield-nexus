import React, { useEffect, useState } from 'react';
import { Network, ShieldAlert, Users, Building, Activity, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { RelationshipGraphViewer } from '../components/RelationshipGraphViewer';

interface NetworkExplorerViewProps {
  onSelectCaseByNpi: (npi: string) => void;
}

export const NetworkExplorerView: React.FC<NetworkExplorerViewProps> = ({ onSelectCaseByNpi }) => {
  const [graphData, setGraphData] = useState<any>(null);
  const [clusters, setClusters] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNetworkData() {
      setIsLoading(true);
      try {
        const [g, c] = await Promise.all([api.getFullGraph(), api.getSuspiciousClusters()]);
        setGraphData(g);
        setClusters(c);
      } catch (err) {
        console.error('Failed to load network intelligence', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNetworkData();
  }, []);

  if (isLoading || !graphData) {
    return (
      <div className="flex items-center justify-center min-h-[450px]">
        <div className="flex flex-col items-center space-y-3">
          <Activity className="w-8 h-8 text-[#209B47] animate-spin" />
          <p className="text-xs font-semibold text-[#042126]/70">Constructing Heterogeneous Network Graph...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="health-panel p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 rounded-lg bg-[#209B47]/10 text-[#005F68] border border-[#209B47]/30">
            <Network className="w-5 h-5 text-[#209B47]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#042126] tracking-tight">Healthcare Network Explorer</h1>
            <p className="text-xs text-[#042126]/70 mt-0.5">
              Population topology mapping <span className="font-mono text-[#042126] font-bold">{graphData.total_network_nodes}</span> entities and <span className="font-mono text-[#042126] font-bold">{graphData.total_network_edges}</span> referral/billing connections
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-[#1B843C] bg-[#E8F8EE] px-2.5 py-1 rounded-md border border-[#ACF2E5] font-semibold">
            PageRank &amp; Centrality Online
          </span>
        </div>
      </div>

      {/* Suspicious Collusion Clusters Banner */}
      {clusters.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#B91C1C] uppercase tracking-wider flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-[#B91C1C]" />
            <span>Detected Suspicious Collusion Rings &amp; Referral Loops ({clusters.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clusters.map((cl, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-[#FECACA] bg-[#FEE2E2]/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#B91C1C] bg-[#FEE2E2] px-2 py-0.5 rounded border border-[#FECACA]">
                    {cl.cluster_id}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-[#B91C1C]">
                    {cl.cluster_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-xs text-[#042126]/80 leading-relaxed">{cl.description}</p>
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-[#042126]/60 uppercase tracking-wider">Colluding Entities:</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {cl.entity_names.map((name: string, i: number) => (
                      <span key={i} className="text-[10px] font-medium text-[#042126] bg-white px-2 py-0.5 rounded border border-[#042126]/10 shadow-2xs">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Global Subgraph Visualization */}
      <div className="health-panel p-5 rounded-xl">
        <RelationshipGraphViewer nodes={graphData.sampled_nodes} edges={graphData.sampled_edges} />
      </div>
    </div>
  );
};
