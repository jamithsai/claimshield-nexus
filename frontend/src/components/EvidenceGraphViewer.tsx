import React, { useState } from 'react';
import { 
  GitCommit, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Layers, 
  Cpu, 
  Network, 
  DollarSign,
  ShieldAlert
} from 'lucide-react';
import { EvidenceGraphData, EvidenceNode } from '../types';

interface EvidenceGraphViewerProps {
  evidenceGraph: EvidenceGraphData;
}

export const EvidenceGraphViewer: React.FC<EvidenceGraphViewerProps> = ({ evidenceGraph }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'CAT-RULES': true,
    'CAT-ML': true,
    'CAT-GRAPH': true,
    'CAT-TEMP': true,
  });

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const rootNode = evidenceGraph.nodes.find((n) => n.category === 'ROOT_SCORE') || evidenceGraph.nodes[0];
  const categoryNodes = evidenceGraph.nodes.filter((n) => n.category === 'SIGNAL_CATEGORY');
  const ruleNodes = evidenceGraph.nodes.filter((n) => n.category === 'RULE_EVIDENCE');
  const claimNodes = evidenceGraph.nodes.filter((n) => n.category === 'CLAIM_LEAF');
  const graphNodes = evidenceGraph.nodes.filter((n) => n.category === 'GRAPH_EVIDENCE');

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Evidence Graph (Score Provenance Tree)
            </h3>
            <p className="text-xs text-slate-400">100% Transparent Causal Traceability: Composite Risk Score → Exact Claim IDs</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-1 rounded-full">
            {evidenceGraph.total_evidence_claims_cited} Claim Citations
          </span>
        </div>
      </div>

      {/* Hierarchical Provenance Explorer */}
      <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        {/* Root Node */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <div>
              <p className="text-xs font-bold text-white uppercase">{rootNode.label}</p>
              <p className="text-[11px] text-slate-400">Target Entity: {evidenceGraph.target_entity}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-black text-rose-400 px-2 py-0.5 rounded bg-rose-950 border border-rose-800">
            {rootNode.tier || 'HIGH'}
          </span>
        </div>

        {/* Categories */}
        <div className="pl-4 space-y-2 border-l-2 border-slate-800 ml-3">
          {categoryNodes.map((cat) => {
            const isExpanded = expandedCategories[cat.id];
            return (
              <div key={cat.id} className="space-y-2">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-left transition-all"
                >
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-sky-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-200">{cat.label}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-sky-400">Sub-score: {cat.val}</span>
                </button>

                {/* Children Details */}
                {isExpanded && (
                  <div className="pl-5 space-y-2 border-l-2 border-sky-900/50 ml-3">
                    {cat.id === 'CAT-RULES' &&
                      ruleNodes.map((rule) => (
                        <div key={rule.id} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300">{rule.label}</span>
                            {rule.excess_usd && (
                              <span className="text-xs font-mono font-bold text-rose-400">
                                Potential Excess: ${rule.excess_usd.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300">{rule.description}</p>

                          {/* Claim leaf list */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {claimNodes.slice(0, 4).map((claim) => (
                              <span
                                key={claim.id}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-emerald-300"
                              >
                                <FileText className="w-3 h-3 text-emerald-400" />
                                <span>{claim.claim_id || claim.label}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}

                    {cat.id === 'CAT-GRAPH' &&
                      graphNodes.map((gn) => (
                        <div key={gn.id} className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2">
                          <Network className="w-4 h-4 text-indigo-400" />
                          <span>{gn.label}</span>
                        </div>
                      ))}

                    {cat.id === 'CAT-ML' && (
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <div className="flex items-center space-x-1.5 text-sky-300 font-semibold">
                          <Cpu className="w-3.5 h-3.5" />
                          <span>Isolation Forest Ensemble Attribution</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Identified +4.82 sigma deviation in E&M level billing density and +3.4 sigma in unbundled component ratios.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
