"""
Deep validation test for SIU Multi-Factor Prioritization and Capacity Constraints
"""
import pytest
from backend.data.models import SIUCase, FraudGenome
from backend.engine.siu.prioritizer import SIUPrioritizer

def test_high_exposure_prioritization_over_isolated_high_risk():
    dummy_genome = FraudGenome(
        billing_intensity=0.5, procedure_deviation=0.5, temporal_irregularity=0.5,
        referral_concentration=0.5, facility_concentration=0.5, member_concentration=0.5,
        geographic_anomaly=0.5, network_density=0.5, financial_exposure=0.5, utilization_deviation=0.5
    )
    
    # Case A: High risk score (85) but trivial financial exposure ($4,000) and 2 members
    case_isolated = SIUCase(
        case_id="CASE-ISO",
        target_entity_type="PROVIDER",
        target_entity_id="NPI-1",
        target_entity_name="Dr. Isolated Outlier",
        composite_risk_score=85.0,
        risk_tier="CRITICAL",
        risk_velocity=5.0,
        potential_financial_exposure=4000.0,
        member_impact_count=2,
        severity="CRITICAL",
        evidence_strength="MODERATE",
        primary_fwa_pattern="Single Outlier Encounter",
        fraud_genome=dummy_genome,
        data_quality_index=0.98,
        created_at="2026-10-01T00:00:00Z",
        updated_at="2026-10-01T00:00:00Z"
    )

    # Case B: Slightly lower risk score (75) but massive financial exposure ($650,000) and 280 members
    case_systemic = SIUCase(
        case_id="CASE-SYS",
        target_entity_type="PROVIDER",
        target_entity_id="NPI-2",
        target_entity_name="Dr. Systemic Billing Ring",
        composite_risk_score=75.0,
        risk_tier="HIGH",
        risk_velocity=42.0,
        potential_financial_exposure=650000.0,
        member_impact_count=280,
        severity="HIGH",
        evidence_strength="CONVINCING",
        primary_fwa_pattern="Coordinated Upcoding Ring",
        fraud_genome=dummy_genome,
        data_quality_index=0.98,
        created_at="2026-10-01T00:00:00Z",
        updated_at="2026-10-01T00:00:00Z"
    )

    priority_iso = SIUPrioritizer.calculate_case_priority_score(case_isolated)
    priority_sys = SIUPrioritizer.calculate_case_priority_score(case_systemic)

    # Systemic case with high exposure, member impact, and velocity must be prioritized above isolated high-risk outlier
    assert priority_sys > priority_iso

    # Test capacity allocation
    queue_res = SIUPrioritizer.rank_and_allocate_queue([case_isolated, case_systemic], capacity=1, sort_by="priority")
    assert queue_res["allocated_count"] == 1
    assert queue_res["cases"][0].case_id == "CASE-SYS"
