"""
Test suite for Unified Risk Engine, Fraud Genome, SIU Prioritizer, and AI Brief Generator
"""
import pytest
from backend.engine.coordinator import PipelineCoordinator
from backend.data.database import db
from backend.engine.risk.risk_engine import UnifiedRiskEngine
from backend.engine.risk.evidence_graph import EvidenceGraphSynthesizer
from backend.engine.similarity.matcher import SchemeSimilarityMatcher
from backend.engine.siu.prioritizer import SIUPrioritizer
from backend.engine.ai.brief_generator import AIEvidenceBriefGenerator
from backend.security.auth import create_access_token, User
from backend.security.audit import TamperEvidentAuditLedger

@pytest.fixture(scope="module", autouse=True)
def init_pipeline():
    PipelineCoordinator.run_full_pipeline(num_members=400, num_providers=25, num_facilities=8)

def test_unified_risk_score_calculation():
    score, tier, breakdown = UnifiedRiskEngine.calculate_composite_risk(
        rule_score=85.0,
        ml_anomaly_score=90.0,
        graph_risk_score=80.0,
        velocity=35.0,
        financial_exposure_usd=250000.0,
        member_impact_count=120
    )
    assert 80.0 <= score <= 100.0
    assert tier == "CRITICAL"
    assert "rule_signals_score" in breakdown
    assert "ml_anomaly_score" in breakdown

def test_fraud_genome_and_similarity():
    case = db.get_case("CASE-2026-8000")
    assert case is not None
    genome = case.fraud_genome
    
    # Assert 10 dimensions are in range [0, 1]
    assert 0.0 <= genome.billing_intensity <= 1.0
    assert 0.0 <= genome.procedure_deviation <= 1.0
    assert 0.0 <= genome.temporal_irregularity <= 1.0
    assert 0.0 <= genome.referral_concentration <= 1.0
    assert 0.0 <= genome.facility_concentration <= 1.0
    assert 0.0 <= genome.member_concentration <= 1.0
    assert 0.0 <= genome.geographic_anomaly <= 1.0
    assert 0.0 <= genome.network_density <= 1.0
    assert 0.0 <= genome.financial_exposure <= 1.0
    assert 0.0 <= genome.utilization_deviation <= 1.0
    
    # Similarity match
    sim_res = SchemeSimilarityMatcher.match_genome(genome)
    assert "best_matched_scheme" in sim_res
    assert sim_res["best_matched_scheme"]["similarity_score_pct"] > 60.0

def test_evidence_graph_generation():
    case = db.get_case("CASE-2026-8000")
    assert case is not None
    eg = EvidenceGraphSynthesizer.build_evidence_graph_for_case(case)
    
    assert len(eg["nodes"]) > 0
    assert len(eg["edges"]) > 0
    assert any(n["category"] == "ROOT_SCORE" for n in eg["nodes"])
    assert any(n["category"] == "SIGNAL_CATEGORY" for n in eg["nodes"])

def test_siu_prioritizer_and_capacity():
    cases = db.list_cases()
    assert len(cases) > 0
    
    res = SIUPrioritizer.rank_and_allocate_queue(cases, capacity=10, sort_by="priority")
    assert res["allocated_count"] == min(10, len(cases))
    assert res["capacity_limit"] == 10
    assert len(res["cases"]) <= 10
    
    # Priority sorting order check
    allocated = res["cases"]
    if len(allocated) >= 2:
        s1 = SIUPrioritizer.calculate_case_priority_score(allocated[0])
        s2 = SIUPrioritizer.calculate_case_priority_score(allocated[1])
        assert s1 >= s2

def test_guardrailed_ai_brief_generation():
    case = db.get_case("CASE-2026-8000")
    assert case is not None
    claims = db.get_claims_for_provider(case.target_entity_id)
    
    brief = AIEvidenceBriefGenerator.generate_brief(case, claims)
    assert brief["case_id"] == case.case_id
    assert "executive_summary" in brief
    assert "key_behavioral_findings" in brief
    assert "mitigating_factors" in brief
    assert "recommended_investigative_actions" in brief
    assert "mandatory_disclaimer" in brief
    assert len(brief["evidence_citations"]) > 0

def test_tamper_evident_audit_ledger_integrity():
    integrity = TamperEvidentAuditLedger.verify_chain_integrity()
    assert not integrity["is_tampered"]
    assert integrity["status"] == "VALID_MERKLE_CHAIN"
    assert integrity["total_entries"] > 0
