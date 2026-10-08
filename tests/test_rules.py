"""
Test suite for FWA Rule Engine
"""
import pytest
from backend.data.generator import SyntheticHealthcareDatasetGenerator
from backend.engine.rules.engine import FWARuleEngine
from backend.engine.rules.upcoding import UpcodingRule
from backend.engine.rules.unbundling import UnbundlingRule
from backend.engine.rules.duplicate_billing import DuplicateBillingRule
from backend.engine.rules.phantom_services import PhantomServicesRule
from backend.engine.rules.excessive_utilization import ExcessiveUtilizationRule
from backend.engine.rules.improbable_timing import ImprobableTimingRule

@pytest.fixture
def dataset():
    gen = SyntheticHealthcareDatasetGenerator()
    members, providers, facilities, claims = gen.generate_all(num_members=500, num_providers=30, num_facilities=10)
    claims_by_npi = {}
    for c in claims:
        claims_by_npi.setdefault(c.billing_provider_npi, []).append(c)
    return providers, claims_by_npi

def test_upcoding_rule_detection(dataset):
    providers, claims_by_npi = dataset
    # Provider 0 is Dr. Marcus Sterling (injected upcoding)
    p0 = providers[0]
    claims = claims_by_npi.get(p0.npi, [])
    
    event = UpcodingRule.evaluate(p0, claims)
    assert event is not None
    assert event.rule_id == "R102"
    assert event.severity == "CRITICAL"
    assert len(event.evidence_sample_claim_ids) > 0
    assert event.affected_claims_count > 50

def test_unbundling_rule_detection(dataset):
    providers, claims_by_npi = dataset
    # Provider 2 is Apex Diagnostic Labs (injected unbundling)
    p2 = providers[2]
    claims = claims_by_npi.get(p2.npi, [])
    
    event = UnbundlingRule.evaluate(p2, claims)
    assert event is not None
    assert event.rule_id == "R103"
    assert event.affected_claims_count > 0

def test_duplicate_billing_detection(dataset):
    providers, claims_by_npi = dataset
    # Provider 3 is Dr. Elena Rostova (injected duplicates)
    p3 = providers[3]
    claims = claims_by_npi.get(p3.npi, [])
    
    event = DuplicateBillingRule.evaluate(p3, claims)
    assert event is not None
    assert event.rule_id == "R101"
    assert len(event.evidence_sample_claim_ids) > 0

def test_phantom_services_detection(dataset):
    providers, claims_by_npi = dataset
    # Provider 4 is Dr. Arthur Pendelton (injected impossible single-day volume)
    p4 = providers[4]
    claims = claims_by_npi.get(p4.npi, [])
    
    event = PhantomServicesRule.evaluate(p4, claims)
    assert event is not None
    assert event.rule_id == "R104"
    assert event.severity == "CRITICAL"

def test_excessive_utilization_detection(dataset):
    providers, claims_by_npi = dataset
    # Provider 6 is Dr. Sophia Lin (injected velocity surge)
    p6 = providers[6]
    claims = claims_by_npi.get(p6.npi, [])
    
    event = ExcessiveUtilizationRule.evaluate(p6, claims)
    assert event is not None
    assert event.rule_id == "R105"

def test_fwa_rule_engine_unification(dataset):
    providers, claims_by_npi = dataset
    p0 = providers[0]
    claims = claims_by_npi.get(p0.npi, [])
    
    triggers = FWARuleEngine.evaluate_provider(p0, claims)
    assert len(triggers) > 0
    score = FWARuleEngine.calculate_rule_score(triggers)
    assert 50.0 <= score <= 100.0
