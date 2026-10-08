"""
ClaimShield Nexus — Phase 2B Hardening & Bug Hunt Regression Test Suite
Validates all bug fixes, edge-case protections, negative trajectory projections, and disposition mappings.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.data.database import db
from backend.data.models import (
    Provider, 
    Claim, 
    SchemeEvolutionSnapshot, 
    RiskProjection, 
    SIUCase, 
    User,
    FraudGenome
)
from backend.engine.temporal.risk_velocity import RiskVelocityEngine
from backend.engine.temporal.projection import RiskProjectionEngine
from backend.engine.ai.brief_generator import AIEvidenceBriefGenerator
from backend.engine.analytics.performance import DetectorPerformanceCenter
from backend.engine.rules.upcoding import UpcodingRule
from backend.engine.rules.excessive_utilization import ExcessiveUtilizationRule
from backend.engine.rules.duplicate_billing import DuplicateBillingRule
from backend.engine.rules.unbundling import UnbundlingRule
from backend.engine.rules.phantom_services import PhantomServicesRule
from backend.engine.rules.improbable_timing import ImprobableTimingRule
from backend.security.audit import TamperEvidentAuditLedger, GENESIS_HASH

client = TestClient(app)

def test_siu_queue_sort_by_risk_and_risk_score_and_member_impact():
    """Verify SIU queue endpoint accepts sort_by='risk', 'risk_score', 'member_impact' without 422 error."""
    # Test sort_by='risk'
    res1 = client.get("/api/v1/siu/queue?capacity=5&sort_by=risk")
    assert res1.status_code == 200
    data1 = res1.json()
    assert "cases" in data1
    assert len(data1["cases"]) <= 5
    
    # Test sort_by='risk_score'
    res2 = client.get("/api/v1/siu/queue?capacity=5&sort_by=risk_score")
    assert res2.status_code == 200
    
    # Test sort_by='member_impact'
    res3 = client.get("/api/v1/siu/queue?capacity=5&sort_by=member_impact")
    assert res3.status_code == 200

def test_human_disposition_status_mapping():
    """Verify that human disposition actions correctly set case status without defaulting everything to ESCALATED."""
    cases = db.list_cases()
    assert len(cases) > 0
    target_case = cases[0]
    case_id = target_case.case_id

    # 1. Clear as False Positive
    res_clear = client.post(
        f"/api/v1/cases/{case_id}/decision",
        json={
            "decision": "RECORD_FINDING",
            "disposition": "CLEARED_FALSE_POSITIVE",
            "investigator_notes": "Clinical review confirms specialized oncology referral nuance.",
            "recommended_action": "NO_OPERATIONAL_ACTION"
        }
    )
    assert res_clear.status_code == 200
    assert res_clear.json()["updated_case_status"] == "CLEARED_FALSE_POSITIVE"

    # 2. Refer to Law Enforcement
    res_le = client.post(
        f"/api/v1/cases/{case_id}/decision",
        json={
            "decision": "REFER_LEGAL",
            "disposition": "REFERRED_TO_OIG_LE",
            "investigator_notes": "Identified intentional systemic kickback loop across 3 clinics.",
            "recommended_action": "SUBPOENA_EHR_RECORDS"
        }
    )
    assert res_le.status_code == 200
    assert res_le.json()["updated_case_status"] == "REFERRED_LE"

    # 3. Escalate
    res_esc = client.post(
        f"/api/v1/cases/{case_id}/decision",
        json={
            "decision": "ESCALATE_TO_FORMAL_AUDIT",
            "disposition": "CONFIRMED_SUSPICIOUS",
            "investigator_notes": "Severe billing surge exceeding clinical capacity.",
            "recommended_action": "ISSUE_PREPAYMENT_MEDICAL_REVIEW_HOLD"
        }
    )
    assert res_esc.status_code == 200
    assert res_esc.json()["updated_case_status"] in ["UNDER_INVESTIGATION", "ESCALATED"]

def test_risk_velocity_decelerating_and_projections():
    """Verify negative delta risk produces DECELERATING trajectory classification and projections handle it."""
    snap1 = SchemeEvolutionSnapshot(
        epoch_label="Day 0", epoch_index=0, date_start="2026-07-01", date_end="2026-07-31",
        active_providers_count=1, active_facilities_count=1, active_members_count=50,
        claim_volume=100, financial_exposure=20000.0, risk_score=75.0, dominant_schemes=[]
    )
    snap2 = SchemeEvolutionSnapshot(
        epoch_label="Day 90", epoch_index=3, date_start="2026-08-25", date_end="2026-10-04",
        active_providers_count=1, active_facilities_count=1, active_members_count=20,
        claim_volume=20, financial_exposure=4000.0, risk_score=35.0, dominant_schemes=[]
    )
    
    delta, classification = RiskVelocityEngine.calculate_velocity([snap1, snap2])
    assert delta == -40.0
    assert classification == "DECELERATING"
    
    projections = RiskProjectionEngine.generate_projections(
        current_risk=35.0,
        current_exposure=4000.0,
        velocity=delta,
        classification=classification
    )
    assert len(projections) == 3
    for p in projections:
        assert p.trajectory_classification == "DECELERATING"
        assert p.projected_risk_score >= 0.0
        assert p.ci_low_usd >= 0.0

def test_ai_brief_velocity_text_dynamic():
    """Verify AI brief generator formats dynamic velocity descriptor properly for negative and positive velocity."""
    genome = FraudGenome(
        billing_intensity=0.5, procedure_deviation=0.5, temporal_irregularity=0.5,
        referral_concentration=0.5, facility_concentration=0.5, member_concentration=0.5,
        geographic_anomaly=0.5, network_density=0.5, financial_exposure=0.5, utilization_deviation=0.5
    )
    
    case_pos = SIUCase(
        case_id="CASE-POS-1", target_entity_type="PROVIDER", target_entity_id="NPI-1",
        target_entity_name="Dr. Test Positive", composite_risk_score=70.0, risk_tier="HIGH",
        risk_velocity=25.0, potential_financial_exposure=50000.0, member_impact_count=100,
        severity="HIGH", evidence_strength="STRONG", primary_fwa_pattern="Upcoding",
        fraud_genome=genome, data_quality_index=1.0, created_at="2026-10-08T00:00:00Z",
        updated_at="2026-10-08T00:00:00Z"
    )
    brief_pos = AIEvidenceBriefGenerator.generate_brief(case_pos, [])
    assert "accelerating velocity" in brief_pos["executive_summary"]
    
    case_neg = SIUCase(
        case_id="CASE-NEG-1", target_entity_type="PROVIDER", target_entity_id="NPI-2",
        target_entity_name="Dr. Test Negative", composite_risk_score=40.0, risk_tier="MEDIUM",
        risk_velocity=-20.0, potential_financial_exposure=10000.0, member_impact_count=30,
        severity="MEDIUM", evidence_strength="MODERATE", primary_fwa_pattern="Duplicate",
        fraud_genome=genome, data_quality_index=1.0, created_at="2026-10-08T00:00:00Z",
        updated_at="2026-10-08T00:00:00Z"
    )
    brief_neg = AIEvidenceBriefGenerator.generate_brief(case_neg, [])
    assert "decelerating velocity" in brief_neg["executive_summary"]

def test_detector_performance_empty_cases_safe():
    """Verify calculate_performance_metrics handles empty case lists without crashing."""
    res = DetectorPerformanceCenter.calculate_performance_metrics([])
    assert "detector_overlap_venn" in res
    assert res["total_flagged_cases_evaluated"] == 0
    assert res["detector_overlap_venn"]["rule_engine_only"] == 0

def test_fwa_rules_negative_and_zero_division_guardrails():
    """Verify all FWA rules handle empty or small claims lists safely without ZeroDivisionError."""
    dummy_provider = Provider(
        npi="NPI-TEST-001", provider_name="Dr. Guardrail", specialty="Internal Medicine",
        taxonomy_code="207R00000X", primary_facility_id="FAC-001", city="Tampa",
        state="FL", zip_code="33601", latitude=27.95, longitude=-82.45,
        enrollment_date="2020-01-01", peer_group_id="PG-IM"
    )
    
    assert UpcodingRule.evaluate(dummy_provider, []) is None
    assert ExcessiveUtilizationRule.evaluate(dummy_provider, []) is None
    assert DuplicateBillingRule.evaluate(dummy_provider, []) is None
    assert UnbundlingRule.evaluate(dummy_provider, []) is None
    assert PhantomServicesRule.evaluate(dummy_provider, []) is None
    assert ImprobableTimingRule.evaluate(dummy_provider, []) is None

def test_api_case_404_not_found():
    """Verify non-existent case IDs return clean 404 responses instead of 500 crashes."""
    res = client.get("/api/v1/cases/CASE-DOES-NOT-EXIST-99999")
    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()

def test_api_case_evidence_graph_404():
    """Verify evidence graph returns 404 for non-existent case."""
    res = client.get("/api/v1/cases/CASE-INVALID-XYZ/evidence-graph")
    assert res.status_code == 404
