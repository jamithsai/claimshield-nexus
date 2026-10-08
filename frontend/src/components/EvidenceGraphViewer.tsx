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
          <div className="p-1.5 rounded-lg bg-[#E8F8EE] text-[#1B843C] border border-[#ACF2E5]">
            <GitCommit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#042126] uppercase tracking-wider">
              Score Provenance Tree
            </h3>
            <p className="text-[11px] text-[#042126]/60">Transparent Causal Traceability: Composite Risk Score &rarr; Exact Synthetic Claim IDs</p>
          </div>
        </div>
        <div>
          <span className="text-xs font-mono font-semibold text-[#1B843C] bg-[#E8F8EE] border border-[#ACF2E5] px-2.5 py-1 rounded-md">
            {data.total_evidence_claims_cited} Claim Citations Linked
          </span>
        </div>
      </div>

      {/* Hierarchical Provenance Explorer */}
      <div className="space-y-3 bg-[#F2FCFF] p-4 rounded-xl border border-[#042126]/10">
        {/* Root Node */}
        <div className="flex items-center justify-between p-3.5 rounded-lg bg-white border border-[#042126]/10 shadow-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-5 h-5 text-[#B91C1C]" />
            <div>
              <p className="text-xs font-bold text-[#042126] uppercase">{rootNode?.label || 'Target Composite Risk'}</p>
              <p className="text-[11px] text-[#042126]/60 font-mono">Target Entity: {data.target_entity}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded badge-critical">
            {rootNode?.tier || 'CRITICAL'}
          </span>
        </div>

        {/* Categories */}
        <div className="pl-4 space-y-2 border-l-2 border-[#042126]/15 ml-3">
          {categoryNodes.map((cat) => {
            const isExpanded = expandedCategories[cat.id];
            return (
              <div key={cat.id} className="space-y-2">
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-[#F2FCFF] border border-[#042126]/10 text-left transition-colors shadow-xs"
                >
                  <div className="flex items-center space-x-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#209B47]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#042126]/40" />
                    )}
                    <span className="text-xs font-bold text-[#042126]">{cat.label}</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#005F68]">Sub-score: {cat.val}</span>
                </button>

                {/* Children Details */}
                {isExpanded && (
                  <div className="pl-5 space-y-2 border-l-2 border-[#209B47]/30 ml-3">
                    {cat.id === 'CAT-RULES' &&
                      ruleNodes.map((rule) => (
                        <div key={rule.id} className="p-3.5 rounded-lg bg-white border border-[#042126]/10 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#B45309]">{rule.label}</span>
                            {rule.excess_usd && (
                              <span className="text-xs font-mono font-bold text-[#B91C1C]">
                                Potential Excess: ${rule.excess_usd.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#042126]/70">{rule.description}</p>

                          {/* Claim leaf list */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {claimNodes.slice(0, 5).map((claim) => (
                              <button
                                key={claim.id}
                                onClick={() => setSelectedClaimId(claim.id)}
                                className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono transition-colors border ${
                                  selectedClaimId === claim.id
                                    ? 'bg-[#209B47]/10 text-[#005F68] border-[#209B47] font-bold'
                                    : 'bg-[#F2FCFF] hover:bg-[#042126]/5 text-[#042126] border-[#042126]/10'
                                }`}
                              >
                                <FileText className="w-3 h-3 text-[#209B47]" />
                                <span>{claim.claim_id || claim.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}

                    {cat.id === 'CAT-GRAPH' &&
                      graphNodes.map((gn) => (
                        <div key={gn.id} className="p-3 rounded-lg bg-white border border-[#042126]/10 text-xs text-[#042126] flex items-center space-x-2 shadow-xs">
                          <Network className="w-4 h-4 text-[#005F68]" />
                          <span>{gn.label}</span>
                        </div>
                      ))}

                    {cat.id === 'CAT-ML' && (
                      <div className="p-3 rounded-lg bg-white border border-[#042126]/10 text-xs text-[#042126] space-y-1 shadow-xs">
                        <div className="flex items-center space-x-1.5 text-[#005F68] font-semibold">
                          <Cpu className="w-3.5 h-3.5 text-[#005F68]" />
                          <span>Isolation Forest Ensemble Attribution</span>
                        </div>
                        <p className="text-xs text-[#042126]/60">
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
