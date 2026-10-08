export interface User {
  user_id: string;
  username: string;
  full_name: string;
  role: 'INVESTIGATOR' | 'SENIOR_INVESTIGATOR' | 'PROGRAM_INTEGRITY_ANALYST' | 'ADMIN';
  assigned_capacity: number;
}

export interface FraudGenome {
  billing_intensity: number;
  procedure_deviation: number;
  temporal_irregularity: number;
  referral_concentration: number;
  facility_concentration: number;
  member_concentration: number;
  geographic_anomaly: number;
  network_density: number;
  financial_exposure: number;
  utilization_deviation: number;
}

export interface SchemeEvolutionSnapshot {
  epoch_label: string;
  epoch_index: number;
  date_start: string;
  date_end: string;
  active_providers_count: number;
  active_facilities_count: number;
  active_members_count: number;
  claim_volume: number;
  financial_exposure: number;
  risk_score: number;
  dominant_schemes: string[];
}

export interface RiskProjection {
  horizon_days: number;
  projected_risk_score: number;
  projected_additional_exposure_usd: number;
  projected_claim_count: number;
  projected_member_impact: number;
  ci_low_usd: number;
  ci_high_usd: number;
  trajectory_classification: 'STATIC' | 'MODERATE_GROWTH' | 'ACCELERATING_ESCALATION';
  disclaimer: string;
}

export interface RuleTriggerEvent {
  rule_id: string;
  rule_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  confidence_contribution: number;
  affected_claims_count: number;
  potential_excess_usd: number;
  evidence_sample_claim_ids: string[];
}

export interface SIUCase {
  case_id: string;
  target_entity_type: 'PROVIDER' | 'FACILITY' | 'NETWORK_RING' | 'MEMBER_COLLUSION';
  target_entity_id: string;
  target_entity_name: string;
  specialty?: string;
  location?: string;
  composite_risk_score: number;
  risk_tier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_velocity: number;
  potential_financial_exposure: number;
  member_impact_count: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidence_strength: 'LOW' | 'MODERATE' | 'STRONG' | 'CONVINCING';
  status: 'NEW_OPPORTUNITY' | 'ASSIGNED' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'CLEARED_FALSE_POSITIVE' | 'REFERRED_LE';
  assigned_investigator_id?: string;
  assigned_investigator_name?: string;
  primary_fwa_pattern: string;
  fraud_genome: FraudGenome;
  data_quality_index: number;
  created_at: string;
  updated_at: string;
  rule_triggers: RuleTriggerEvent[];
  risk_breakdown: Record<string, number>;
  evolution_history: SchemeEvolutionSnapshot[];
  projections: RiskProjection[];
  investigator_notes?: string;
  feedback_disposition?: string;
}

export interface ExecutiveMetrics {
  total_claims_analyzed: number;
  total_financial_volume_usd: number;
  flagged_fwa_exposure_usd: number;
  fwa_exposure_percentage: number;
  active_investigation_cases: number;
  critical_risk_entities_count: number;
  high_risk_entities_count: number;
  risk_tier_distribution: Record<string, number>;
  detected_schemes_breakdown: Record<string, number>;
  data_quality_index_overall: number;
  system_mode: string;
}

export interface EvidenceNode {
  id: string;
  label: string;
  category: string;
  tier?: string;
  val?: number;
  description?: string;
  excess_usd?: number;
  claim_id?: string;
}

export interface EvidenceEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface EvidenceGraphData {
  case_id: string;
  target_entity: string;
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  total_evidence_claims_cited: number;
}

export interface AIBrief {
  brief_id: string;
  case_id: string;
  target_entity: string;
  specialty?: string;
  generated_at: string;
  composite_risk_score: number;
  risk_tier: string;
  risk_velocity: number;
  potential_financial_exposure_usd: number;
  member_impact_count: number;
  data_quality_index: number;
  executive_summary: string;
  key_behavioral_findings: string[];
  mitigating_factors: string;
  recommended_investigative_actions: string[];
  evidence_citations: Array<{
    claim_id: string;
    service_date: string;
    procedure_code: string;
    billed_usd: number;
    paid_usd: number;
    associated_scheme_tag: string;
  }>;
  mandatory_disclaimer: string;
}

export interface AuditLogEntry {
  log_id: string;
  timestamp: string;
  actor_user_id: string;
  actor_username: string;
  actor_role: string;
  action_type: string;
  target_resource: string;
  details: Record<string, any>;
  client_ip: string;
  prev_hash: string;
  current_hash: string;
}
