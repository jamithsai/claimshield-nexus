"""
ClaimShield Nexus — Graph & Network Intelligence Engine
Builds heterogeneous graph of Providers, Members, Facilities, and Referrals.
Calculates centrality metrics, patient-sharing concentration, and circular referral loops.
"""

import networkx as nx
from typing import List, Dict, Any, Tuple, Set, Optional
from backend.data.models import Provider, Member, Facility, Claim

class HealthcareNetworkEngine:
    def __init__(self):
        self.G = nx.DiGraph()
        self.undirected_G = nx.Graph()
        self.provider_centrality: Dict[str, float] = {}
        self.provider_pagerank: Dict[str, float] = {}
        self.referral_cycles: List[List[str]] = []
        self.bipartite_density: Dict[str, float] = {}

    def build_network(self, providers: List[Provider], members: List[Member], facilities: List[Facility], claims: List[Claim]):
        self.G.clear()
        self.undirected_G.clear()
        
        # 1. Add Facility Nodes
        for f in facilities:
            self.G.add_node(f.facility_id, label=f.name, node_type="FACILITY", type="FACILITY", city=f.city, state=f.state)
            self.undirected_G.add_node(f.facility_id, label=f.name, node_type="FACILITY", type="FACILITY")
            
        # 2. Add Provider Nodes
        for p in providers:
            self.G.add_node(p.npi, label=p.provider_name, node_type="PROVIDER", type="PROVIDER", specialty=p.specialty, city=p.city, state=p.state)
            self.undirected_G.add_node(p.npi, label=p.provider_name, node_type="PROVIDER", type="PROVIDER", specialty=p.specialty)
            # Edge to primary facility
            self.G.add_edge(p.npi, p.primary_facility_id, relationship="OPERATES_AT", weight=10)
            self.undirected_G.add_edge(p.npi, p.primary_facility_id, relationship="OPERATES_AT", weight=10)

        # 3. Add Member Nodes (sample top active to maintain graph responsiveness)
        member_lookup = {m.member_id: m for m in members}
        
        # 4. Add Claim / Encounter Edges & Referrals
        provider_patients = {p.npi: set() for p in providers}
        referral_edges = {}
        
        for c in claims:
            # Provider -> Member
            p_npi = c.billing_provider_npi
            mbr_id = c.member_id
            if p_npi in provider_patients:
                provider_patients[p_npi].add(mbr_id)
                
            # Referral edges
            if c.referring_provider_npi and c.referring_provider_npi in self.G:
                ref_src = c.referring_provider_npi
                ref_dst = p_npi
                if ref_src != ref_dst:
                    edge_key = (ref_src, ref_dst)
                    referral_edges[edge_key] = referral_edges.get(edge_key, 0) + 1

        # Add top referral edges to Graph
        for (src, dst), weight in referral_edges.items():
            self.G.add_edge(src, dst, relationship="REFERRED_TO", weight=weight)
            self.undirected_G.add_edge(src, dst, relationship="REFERRED_TO", weight=weight)

        # 5. Compute Centralities
        try:
            full_pr = nx.pagerank(self.G, weight="weight")
            self.provider_pagerank = {p.npi: full_pr.get(p.npi, 0.01) for p in providers}
        except Exception:
            self.provider_pagerank = {p.npi: 0.01 for p in providers}

        try:
            deg = nx.degree_centrality(self.G)
            self.provider_centrality = {p.npi: round(deg.get(p.npi, 0.0), 4) for p in providers}
        except Exception:
            self.provider_centrality = {p.npi: 0.01 for p in providers}

        # 6. Detect Circular Referral Loops (Cycles)
        self.referral_cycles = []
        try:
            cycles = list(nx.simple_cycles(self.G))
            for cycle in cycles:
                if 2 <= len(cycle) <= 5:
                    self.referral_cycles.append(cycle)
        except Exception:
            pass

        # 7. Compute Bipartite Shared Patient Concentration
        for p in providers:
            p_npi = p.npi
            my_patients = provider_patients.get(p_npi, set())
            if not my_patients:
                self.bipartite_density[p_npi] = 0.0
                continue
                
            overlap_scores = []
            for other_p in providers:
                if other_p.npi == p_npi:
                    continue
                other_patients = provider_patients.get(other_p.npi, set())
                intersection = len(my_patients.intersection(other_patients))
                if intersection > 0:
                    jaccard = intersection / len(my_patients.union(other_patients))
                    overlap_scores.append(jaccard)
                    
            avg_overlap = sum(overlap_scores) / len(overlap_scores) if overlap_scores else 0.0
            self.bipartite_density[p_npi] = round(min(1.0, avg_overlap * 4.0), 3)

    def get_subgraph_for_entity(self, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        if entity_id not in self.G:
            return {"nodes": [], "edges": []}
            
        nodes_to_include = {entity_id}
        current_layer = {entity_id}
        
        for _ in range(depth):
            next_layer = set()
            for n in current_layer:
                successors = set(self.G.successors(n))
                predecessors = set(self.G.predecessors(n))
                neighbors = successors.union(predecessors)
                next_layer.update(neighbors)
            nodes_to_include.update(next_layer)
            current_layer = next_layer
            
        sub_G = self.G.subgraph(nodes_to_include)
        
        nodes_out = []
        for n in sub_G.nodes():
            n_data = sub_G.nodes[n]
            nodes_out.append({
                "id": n,
                "label": n_data.get("label", n),
                "type": n_data.get("node_type", "ENTITY"),
                "specialty": n_data.get("specialty", ""),
                "city": n_data.get("city", ""),
                "pagerank": round(self.provider_pagerank.get(n, 0.01), 4),
                "is_target": bool(n == entity_id)
            })
            
        edges_out = []
        for u, v, d in sub_G.edges(data=True):
            edges_out.append({
                "source": u,
                "target": v,
                "relationship": d.get("relationship", "CONNECTED_TO"),
                "weight": d.get("weight", 1)
            })
            
        return {"nodes": nodes_out, "edges": edges_out}

    def get_network_risk_score(self, npi: str) -> float:
        # Combines Normalized Centrality, PageRank, Referral Cycles, and Bipartite Density
        max_pr = max(self.provider_pagerank.values()) if self.provider_pagerank else 1.0
        max_deg = max(self.provider_centrality.values()) if self.provider_centrality else 1.0
        
        norm_pr = (self.provider_pagerank.get(npi, 0.0) / max(1e-6, max_pr)) * 100.0
        norm_deg = (self.provider_centrality.get(npi, 0.0) / max(1e-6, max_deg)) * 100.0
        density = self.bipartite_density.get(npi, 0.0) * 100.0
        
        in_cycle = any(npi in cycle for cycle in self.referral_cycles)
        cycle_score = 100.0 if in_cycle else 0.0
        
        composite_graph_risk = (0.30 * norm_pr) + (0.30 * norm_deg) + (0.20 * density) + (0.20 * cycle_score)
        return min(100.0, max(0.0, round(composite_graph_risk, 1)))

# Global Graph Engine instance
graph_engine = HealthcareNetworkEngine()
