"""
ClaimShield Nexus — Evidence Graph Synthesizer
Constructs a hierarchical, traceable causal graph linking composite risk scores down to exact claim IDs and entities.
"""

from typing import Dict, Any, List
from backend.data.models import SIUCase

class EvidenceGraphSynthesizer:
    @staticmethod
    def build_evidence_graph_for_case(case: SIUCase) -> Dict[str, Any]:
        nodes = []
        edges = []
        
        # 1. Root Node (Composite Risk)
        root_id = f"ROOT-{case.case_id}"
        nodes.append({
            "id": root_id,
            "label": f"Composite Risk Score ({case.composite_risk_score})",
            "category": "ROOT_SCORE",
            "tier": case.risk_tier,
            "val": case.composite_risk_score
        })
        
        # 2. Category Level Nodes
        cats = [
            ("CAT-RULES", "Deterministic FWA Rule Triggers", case.risk_breakdown.get("rule_signals_score", 0)),
            ("CAT-ML", "Unsupervised ML Isolation Forest", case.risk_breakdown.get("ml_anomaly_score", 0)),
            ("CAT-GRAPH", "Network Graph & Referral Collusion", case.risk_breakdown.get("graph_network_score", 0)),
            ("CAT-TEMP", "Temporal Trajectory & Velocity", case.risk_breakdown.get("risk_velocity_score", 0))
        ]
        
        for cat_id, cat_label, cat_val in cats:
            nodes.append({
                "id": cat_id,
                "label": f"{cat_label} ({cat_val})",
                "category": "SIGNAL_CATEGORY",
                "val": cat_val
            })
            edges.append({
                "source": root_id,
                "target": cat_id,
                "relationship": "AGGREGATES"
            })
            
        # 3. Rule Trigger Children
        total_claims_cited = 0
        for i, rule in enumerate(case.rule_triggers):
            r_node_id = f"RULE-{rule.rule_id}"
            nodes.append({
                "id": r_node_id,
                "label": f"{rule.rule_name} [{rule.severity}]",
                "category": "RULE_EVIDENCE",
                "description": rule.description,
                "excess_usd": rule.potential_excess_usd,
                "val": 80
            })
            edges.append({
                "source": "CAT-RULES",
                "target": r_node_id,
                "relationship": "TRIGGERED"
            })
            
            # 4. Attach Claim ID Evidence Leaves
            for cid in rule.evidence_sample_claim_ids[:3]:
                c_node_id = f"CLAIM-{cid}"
                total_claims_cited += 1
                nodes.append({
                    "id": c_node_id,
                    "label": f"Claim: {cid}",
                    "category": "CLAIM_LEAF",
                    "claim_id": cid,
                    "val": 40
                })
                edges.append({
                    "source": r_node_id,
                    "target": c_node_id,
                    "relationship": "PROVEN_BY"
                })
                
        # 5. Graph Children
        net_node_id = "NET-COLLUSION-RING"
        nodes.append({
            "id": net_node_id,
            "label": f"Collusion Cluster: {case.primary_fwa_pattern}",
            "category": "GRAPH_EVIDENCE",
            "val": 75
        })
        edges.append({
            "source": "CAT-GRAPH",
            "target": net_node_id,
            "relationship": "IDENTIFIED"
        })
        
        return {
            "case_id": case.case_id,
            "target_entity": case.target_entity_name,
            "nodes": nodes,
            "edges": edges,
            "total_evidence_claims_cited": total_claims_cited
        }
