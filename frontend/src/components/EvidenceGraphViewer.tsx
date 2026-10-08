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
  data: EvidenceGraphData;
}

export const EvidenceGraphViewer: React.FC<EvidenceGraphViewerProps> = ({ data }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'CAT-RULES': true,
    'CAT-ML': true,
    'CAT-GRAPH': true,
    'CAT-TEMP': true,
  });

  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const rootNode = data.nodes.find((n) => n.category === 'ROOT_SCORE') || data.nodes[0];
  const categoryNodes = data.nodes.filter((n) => n.category === 'SIGNAL_CATEGORY');
  const ruleNodes = data.nodes.filter((n) => n.category === 'RULE_EVIDENCE');
  const claimNodes = data.nodes.filter((n) => n.category === 'CLAIM_LEAF');
  const graphNodes = data.nodes.filter((n) => n.category === 'GRAPH_EVIDENCE');

  return (
    <div className="w-full space-y-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Score Provenance Tree
            </h3>
            <p className="text-[11px] text-slate-500">Transparent Causal Traceability: Composite Risk Score &rarr; Exact Synthetic Claim IDs</p>
          </div>
        </div>
        <div>
          <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            {data.total_evidence_claims_cited} Claim Citations Linked
          </span>
        </div>
      </div>

      {/* Hierarchical Provenance Explorer */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
        {/* Root Node */}
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <div>
              <p className="text-xs font-bold text-slate-900 uppercase">{rootNode?.label || 'Target Composite Risk'}</p>
              <p className="text-[11px] text-slate-500 font-mono">Target Entity: {data.target_entity}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded badge-critical">
            {rootNode?.tier || 'CRITICAL'}
          </span>
        </div>

        {/* Categories */}
        <div className="pl-4 space-y-2 border-l-2 border-slate-200 ml-3">
          {categoryNodes.map((cat) => {
            const isExpanded = expandedCategories[cat.id];
            return (
              <div key={cat.id} className="space-y-2">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-left transition-colors shadow-xs"
                >
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-sky-600" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                    <span className="text-xs font-bold text-slate-800">{cat.label}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-sky-700">Sub-score: {cat.val}</span>
                </button>

                {/* Children Details */}
                {isExpanded && (
                  <div className="pl-5 space-y-2 border-l-2 border-sky-200 ml-3">
                    {cat.id === 'CAT-RULES' &&
                      ruleNodes.map((rule) => (
                        <div key={rule.id} className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800">{rule.label}</span>
                            {rule.excess_usd && (
                              <span className="text-xs font-mono font-bold text-rose-700">
                                Potential Excess: ${rule.excess_usd.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600">{rule.description}</p>

                          {/* Claim leaf list */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {claimNodes.slice(0, 5).map((claim) => (
                              <button
                                key={claim.id}
                                onClick={() => setSelectedClaimId(claim.id)}
                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                                  selectedClaimId === claim.id
                                    ? 'bg-sky-100 text-sky-800 border-sky-300 font-bold'
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <FileText className="w-3 h-3 text-sky-600" />
                                <span>{claim.claim_id || claim.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                    {cat.id === 'CAT-GRAPH' &&
                      graphNodes.map((gn) => (
                        <div key={gn.id} className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-center space-x-2 shadow-xs">
                          <Network className="w-4 h-4 text-sky-600" />
                          <span>{gn.label}</span>
                        </div>
                      ))}

                    {cat.id === 'CAT-ML' && (
                      <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 space-y-1 shadow-xs">
                        <div className="flex items-center space-x-1.5 text-sky-800 font-semibold">
                          <Cpu className="w-3.5 h-3.5 text-sky-600" />
                          <span>Isolation Forest Ensemble Attribution</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Identified +4.82 sigma deviation in evaluation/management code complexity and +3.4 sigma billing acceleration.
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
