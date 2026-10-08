"""
Test suite for Graph & Network Intelligence Engine
"""
import pytest
from backend.data.generator import SyntheticHealthcareDatasetGenerator
from backend.engine.graph.network_engine import HealthcareNetworkEngine
from backend.engine.graph.cluster_detector import SuspiciousClusterDetector

def test_graph_construction_and_centrality():
    gen = SyntheticHealthcareDatasetGenerator()
    members, providers, facilities, claims = gen.generate_all(num_members=500, num_providers=30, num_facilities=10)
    
    engine = HealthcareNetworkEngine()
    engine.build_network(providers, members, facilities, claims)
    
    assert len(engine.G.nodes) > len(providers)
    assert len(engine.G.edges) > 0
    assert len(engine.provider_pagerank) == len(providers)
    assert len(engine.provider_centrality) == len(providers)
    
    # Check subgraph extraction
    sub = engine.get_subgraph_for_entity(providers[0].npi, depth=2)
    assert len(sub["nodes"]) > 0
    assert any(n["is_target"] for n in sub["nodes"])
    
def test_suspicious_cluster_detection():
    gen = SyntheticHealthcareDatasetGenerator()
    members, providers, facilities, claims = gen.generate_all(num_members=500, num_providers=30, num_facilities=10)
    
    engine = HealthcareNetworkEngine()
    engine.build_network(providers, members, facilities, claims)
    
    clusters = SuspiciousClusterDetector.detect_all_clusters(providers, facilities)
    assert isinstance(clusters, list)
