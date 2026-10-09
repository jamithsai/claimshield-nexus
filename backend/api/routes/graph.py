"""
ClaimShield Nexus — Graph & Network Intelligence API Routes
"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import Dict, Any, List
from backend.data.database import db
from backend.engine.graph.network_engine import graph_engine
from backend.engine.graph.cluster_detector import SuspiciousClusterDetector
from backend.security.auth import get_current_user, User

router = APIRouter(prefix="/graph", tags=["Network Intelligence"])

@router.get("/case/{case_id}")
def get_case_subgraph(case_id: str, depth: int = Query(2, ge=1, le=3), current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")
        
    sub = graph_engine.get_subgraph_for_entity(case.target_entity_id, depth=depth)
    return {
        "case_id": case_id,
        "target_entity_id": case.target_entity_id,
        "nodes": sub["nodes"],
        "edges": sub["edges"],
        "total_nodes": len(sub["nodes"]),
        "total_edges": len(sub["edges"])
    }

@router.get("/clusters")
def get_suspicious_clusters(current_user: User = Depends(get_current_user)) -> List[Dict[str, Any]]:
    providers = list(db.providers.values())
    facilities = list(db.facilities.values())
    return SuspiciousClusterDetector.detect_all_clusters(providers, facilities)

@router.get("/full")
def get_full_graph_overview(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    # Return top 60 highest centrality nodes for global network explorer view
    top_npis = sorted(graph_engine.provider_pagerank.keys(), key=lambda k: graph_engine.provider_pagerank[k], reverse=True)[:50]
    
    nodes = []
    for npi in top_npis:
        p = db.get_provider(npi)
        if p:
            nodes.append({
                "id": p.npi,
                "label": p.provider_name,
                "type": "PROVIDER",
                "specialty": p.specialty,
                "city": p.city,
                "pagerank": round(graph_engine.provider_pagerank.get(p.npi, 0.01), 4)
            })
            
    # Include primary facilities
    for f in list(db.facilities.values())[:15]:
        nodes.append({
            "id": f.facility_id,
            "label": f.name,
            "type": "FACILITY",
            "city": f.city,
            "pagerank": 0.05
        })
        
    node_id_set = {n["id"] for n in nodes}
    edges = []
    for u, v, d in graph_engine.G.edges(data=True):
        if u in node_id_set and v in node_id_set:
            edges.append({
                "source": u,
                "target": v,
                "relationship": d.get("relationship", "CONNECTED_TO"),
                "weight": d.get("weight", 1)
            })
            
    return {
        "total_network_nodes": len(graph_engine.G.nodes),
        "total_network_edges": len(graph_engine.G.edges),
        "sampled_nodes": nodes,
        "sampled_edges": edges,
        "nodes": nodes,
        "edges": edges
    }
