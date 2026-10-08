"""
ClaimShield Nexus — Suspicious Collusion Ring & Cluster Detector
Detects closed referral loops, kickback rings, and dense bipartite provider-patient cliques.
"""

from typing import List, Dict, Any
from backend.data.models import Provider, Facility
from .network_engine import graph_engine

class SuspiciousClusterDetector:
    @staticmethod
    def detect_all_clusters(providers: List[Provider], facilities: List[Facility]) -> List[Dict[str, Any]]:
        clusters = []
        cluster_id_counter = 1
        
        # 1. Inspect directed referral cycles
        for cycle in graph_engine.referral_cycles:
            # Look up names
            member_names = []
            for node_id in cycle:
                label = graph_engine.G.nodes.get(node_id, {}).get("label", node_id)
                member_names.append(label)
                
            clusters.append({
                "cluster_id": f"CLUST-RING-{cluster_id_counter}",
                "cluster_type": "CIRCULAR_REFERRAL_RING",
                "risk_tier": "CRITICAL",
                "member_count": len(cycle),
                "entity_ids": cycle,
                "entity_names": member_names,
                "description": f"Closed circular referral loop involving {len(cycle)} collaborating entities funneling shared patient volume.",
                "confidence_score": 0.94
            })
            cluster_id_counter += 1
            
        # 2. Inspect high bipartite density clusters
        high_density_npis = [npi for npi, density in graph_engine.bipartite_density.items() if density > 0.60]
        if high_density_npis:
            clusters.append({
                "cluster_id": f"CLUST-DENSE-{cluster_id_counter}",
                "cluster_type": "PATIENT_SHARING_CLIQUE",
                "risk_tier": "HIGH",
                "member_count": len(high_density_npis),
                "entity_ids": high_density_npis,
                "entity_names": [graph_engine.G.nodes.get(n, {}).get("label", n) for n in high_density_npis],
                "description": f"High-density bipartite collusion group with abnormal patient cross-sharing concentration.",
                "confidence_score": 0.88
            })
            
        return clusters
