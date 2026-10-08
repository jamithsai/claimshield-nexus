"""
ClaimShield Nexus — Data Models and Domain Schemas
Pydantic v2 schemas for synthetic claims, entities, rules, cases, and audit logs.
"""

from typing import List, Dict, Optional, Any, Literal
from pydantic import BaseModel, Field
from datetime import date, datetime

class Member(BaseModel):
    member_id: str
    first_name: str
    last_name: str
    date_of_birth: str
    gender: Literal["M", "F", "OTHER", "UNKNOWN"]
    plan_type: Literal["MEDICARE_ADVANTAGE", "MEDICAID", "COMMERCIAL_PPO", "COMMERCIAL_HMO"]
    state: str
    zip_code: str
    enrollment_start: str
    enrollment_end: Optional[str] = None
    risk_adjustment_factor: float = 1.0

class Provider(BaseModel):
    npi: str
    provider_name: str
    specialty: str
    taxonomy_code: str
    primary_facility_id: str
    city: str
    state: str
    zip_code: str
    latitude: float
    longitude: float
    enrollment_date: str
    sanction_history: bool = False
    peer_group_id: str

class Facility(BaseModel):
    facility_id: str
    name: str
    facility_type: Literal["INPATIENT_HOSPITAL", "OUTPATIENT_CLINIC", "AMBULATORY_SURGICAL_CENTER", "INDEPENDENT_LAB", "SKILLED_NURSING"]
    address: str
    city: str
    state: str
    zip_code: str
    capacity_beds: int = 50
    accreditation_status: Literal["FULL", "PROBATIONARY", "UNACCREDITED"] = "FULL"

class Claim(BaseModel):
    claim_id: str
    member_id: str
    billing_provider_npi: str
    rendering_provider_npi: str
    referring_provider_npi: Optional[str] = None
    facility_id: str
    service_date: str
    service_end_date: Optional[str] = None
    paid_date: str
    place_of_service: str = "11"
    primary_diagnosis: str
    secondary_diagnosis: Optional[str] = None
    procedure_code: str
    modifier_codes: List[str] = Field(default_factory=list)
    units: int = 1
    billed_amount: float
    allowed_amount: float
    paid_amount: float
    claim_status: Literal["PAID", "DENIED", "PENDING_REVIEW", "ADJUSTED"] = "PAID"
    data_quality_score: float = 1.0
    synthetic_scheme_tag: Optional[str] = None

class FraudGenome(BaseModel):
    billing_intensity: float = Field(ge=0.0, le=1.0)
    procedure_deviation: float = Field(ge=0.0, le=1.0)
    temporal_irregularity: float = Field(ge=0.0, le=1.0)
    referral_concentration: float = Field(ge=0.0, le=1.0)
    facility_concentration: float = Field(ge=0.0, le=1.0)
    member_concentration: float = Field(ge=0.0, le=1.0)
    geographic_anomaly: float = Field(ge=0.0, le=1.0)
    network_density: float = Field(ge=0.0, le=1.0)
    financial_exposure: float = Field(ge=0.0, le=1.0)
    utilization_deviation: float = Field(ge=0.0, le=1.0)

class SchemeEvolutionSnapshot(BaseModel):
    epoch_label: str
    epoch_index: int
    date_start: str
    date_end: str
    active_providers_count: int
    active_facilities_count: int
    active_members_count: int
    claim_volume: int
    financial_exposure: float
    risk_score: float
    dominant_schemes: List[str]

class RiskProjection(BaseModel):
    horizon_days: int
    projected_risk_score: float
    projected_additional_exposure_usd: float
    projected_claim_count: int
    projected_member_impact: int
    ci_low_usd: float
    ci_high_usd: float
    trajectory_classification: Literal["STATIC", "MODERATE_GROWTH", "ACCELERATING_ESCALATION"]
    disclaimer: str = "Statistical projection for prioritization only; not a factual certainty."

class RuleTriggerEvent(BaseModel):
    rule_id: str
    rule_name: str
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    description: str
    confidence_contribution: float
    affected_claims_count: int
    potential_excess_usd: float
    evidence_sample_claim_ids: List[str] = Field(default_factory=list)

class SIUCase(BaseModel):
    case_id: str
    target_entity_type: Literal["PROVIDER", "FACILITY", "NETWORK_RING", "MEMBER_COLLUSION"]
    target_entity_id: str
    target_entity_name: str
    specialty: Optional[str] = None
    location: Optional[str] = None
    composite_risk_score: float
    risk_tier: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    risk_velocity: float
    potential_financial_exposure: float
    member_impact_count: int
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    evidence_strength: Literal["LOW", "MODERATE", "STRONG", "CONVINCING"]
    status: Literal["NEW_OPPORTUNITY", "ASSIGNED", "UNDER_INVESTIGATION", "ESCALATED", "CLEARED_FALSE_POSITIVE", "REFERRED_LE"] = "NEW_OPPORTUNITY"
    assigned_investigator_id: Optional[str] = None
    assigned_investigator_name: Optional[str] = None
    primary_fwa_pattern: str
    fraud_genome: FraudGenome
    data_quality_index: float
    created_at: str
    updated_at: str
    rule_triggers: List[RuleTriggerEvent] = Field(default_factory=list)
    risk_breakdown: Dict[str, float] = Field(default_factory=dict)
    evolution_history: List[SchemeEvolutionSnapshot] = Field(default_factory=list)
    projections: List[RiskProjection] = Field(default_factory=list)
    investigator_notes: Optional[str] = None
    feedback_disposition: Optional[str] = None

class User(BaseModel):
    user_id: str
    username: str
    full_name: str
    role: Literal["INVESTIGATOR", "SENIOR_INVESTIGATOR", "PROGRAM_INTEGRITY_ANALYST", "ADMIN"]
    assigned_capacity: int = 20
    is_active: bool = True

class AuditLogEntry(BaseModel):
    log_id: str
    timestamp: str
    actor_user_id: str
    actor_username: str
    actor_role: str
    action_type: str
    target_resource: str
    details: Dict[str, Any]
    client_ip: str = "127.0.0.1"
    prev_hash: str
    current_hash: str
