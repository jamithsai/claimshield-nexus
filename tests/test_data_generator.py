"""
Test suite for Synthetic Healthcare Data Generator & Validator
"""
import pytest
from backend.data.generator import SyntheticHealthcareDatasetGenerator
from backend.data.validator import DataQualityEngine
from backend.data.database import InMemoryDatabase

def test_dataset_generation():
    generator = SyntheticHealthcareDatasetGenerator()
    members, providers, facilities, claims = generator.generate_all(
        num_members=300, 
        num_providers=20, 
        num_facilities=8
    )
    
    assert len(members) == 300
    assert len(providers) == 20
    assert len(facilities) == 8
    assert len(claims) > 3000

def test_data_quality_evaluation():
    generator = SyntheticHealthcareDatasetGenerator()
    _, _, _, claims = generator.generate_all(num_members=200, num_providers=15, num_facilities=5)
    
    dqi, report = DataQualityEngine.evaluate_claims(claims)
    assert dqi >= 0.90
    assert "completeness_score" in report
    assert "temporal_consistency_score" in report
    assert report["total_records_evaluated"] == len(claims)

def test_injected_schemes_present():
    generator = SyntheticHealthcareDatasetGenerator()
    _, _, _, claims = generator.generate_all(num_members=500, num_providers=25, num_facilities=10)
    
    tags = {c.synthetic_scheme_tag for c in claims if c.synthetic_scheme_tag is not None}
    assert "UPCODING_LEVEL_5" in tags
    assert "UNBUNDLED_LAB_PANEL" in tags
    assert "DUPLICATE_BILLING_ORIGINAL" in tags
    assert "IMPOSSIBLE_TIMING_PHANTOM" in tags
    assert "VELOCITY_SURGE_UTILIZATION" in tags
    assert "COORDINATED_COLLUSION_RING" in tags

def test_in_memory_database_indexing():
    test_db = InMemoryDatabase()
    test_db.initialize_data(num_members=200, num_providers=15, num_facilities=5)
    
    assert test_db.is_initialized
    assert len(test_db.providers) == 15
    assert len(test_db.facilities) == 5
    
    # Check index
    p_npi = list(test_db.providers.keys())[0]
    claims = test_db.get_claims_for_provider(p_npi)
    assert isinstance(claims, list)
    assert len(claims) > 0
