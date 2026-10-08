"""
Test suite for ML Anomaly Detection Engine
"""
import pytest
from backend.data.generator import SyntheticHealthcareDatasetGenerator
from backend.engine.ml.isolation_forest import MLAnomalyDetector

def test_isolation_forest_execution_and_attribution():
    gen = SyntheticHealthcareDatasetGenerator()
    members, providers, facilities, claims = gen.generate_all(num_members=500, num_providers=30, num_facilities=10)
    
    claims_by_npi = {}
    for c in claims:
        claims_by_npi.setdefault(c.billing_provider_npi, []).append(c)
        
    detector = MLAnomalyDetector(contamination=0.10, random_state=42)
    results = detector.fit_and_predict(providers, claims_by_npi)
    
    assert detector.is_fitted
    assert len(results) == len(providers)
    
    # Check score ranges
    for npi, res in results.items():
        assert 0.0 <= res["ml_anomaly_score"] <= 100.0
        assert "top_contributing_features" in res
        assert isinstance(res["top_contributing_features"], list)
        
    # Provider 0 (Dr. Marcus Sterling) should be flagged with high anomaly score
    p0_res = results.get(providers[0].npi)
    assert p0_res is not None
    assert p0_res["ml_anomaly_score"] > 60.0
    assert len(p0_res["top_contributing_features"]) > 0
