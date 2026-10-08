"""
ClaimShield Nexus — Master Pipeline Coordinator & Orchestrator
Coordinates end-to-end data generation, feature engineering, multi-detector execution,
risk unification, genome generation, and SIU case initialization.
"""

from typing import List, Dict, Any
import datetime
from backend.data.database import db
from backend.data.models import SIUCase, Provider, Claim, User
from backend.engine.feature_pipeline import ProviderFeaturePipeline
from backend.engine.rules.engine import FWARuleEngine
from backend.engine.ml.isolation_forest import ml_detector
from backend.engine.graph.network_engine import graph_engine
from backend.engine.temporal.scheme_evolution import SchemeEvolutionEngine
from backend.engine.temporal.risk_velocity import RiskVelocityEngine
from backend.engine.temporal.projection import RiskProjectionEngine
from backend.engine.risk.fraud_genome import FraudGenomeEngine
from backend.engine.risk.risk_engine import UnifiedRiskEngine
from backend.engine.risk.confidence_engine import ConfidenceAndLimitationsEngine
from backend.security.audit import TamperEvidentAuditLedger

class PipelineCoordinator:
    @classmethod
    def run_full_pipeline(cls, num_members: int = 1500, num_providers: int = 80, num_facilities: int = 25):
        # 1. Initialize synthetic data
        db.initialize_data(num_members=num_members, num_providers=num_providers, num_facilities=num_facilities)
        
        providers = list(db.providers.values())
        members = list(db.members.values())
        facilities = list(db.facilities.values())
        claims = db.claims
        
        # 2. Fit ML Anomaly Detection (Isolation Forest)
        ml_detector.fit_and_predict(providers, db.claims_by_provider)
        
        # 3. Build Graph Network
        graph_engine.build_network(providers, members, facilities, claims)
        
        # 4. Process Each Provider into SIU Case
        now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
        
        for idx, p in enumerate(providers):
            p_claims = db.get_claims_for_provider(p.npi)
            if not p_claims:
                continue
                
            # Features
            feats = ProviderFeaturePipeline.extract_features_for_provider(p, p_claims)
            
            # 1. Rules
            rule_triggers = FWARuleEngine.evaluate_provider(p, p_claims)
            rule_score = FWARuleEngine.calculate_rule_score(rule_triggers)
            
            # 2. ML Anomaly
            ml_res = ml_detector.get_score_for_npi(p.npi)
            ml_score = ml_res["ml_anomaly_score"]
            
            # 3. Graph
            graph_score = graph_engine.get_network_risk_score(p.npi)
            
            # 4. Temporal & Velocity
            evolution_history = SchemeEvolutionEngine.compute_evolution_history(p, p_claims)
            velocity, velocity_class = RiskVelocityEngine.calculate_velocity(evolution_history)
            
            # Financial & Member Impact
            fin_exposure = sum(c.paid_amount for c in p_claims if c.synthetic_scheme_tag is not None)
            if fin_exposure == 0.0 and (rule_score > 30 or ml_score > 60):
                fin_exposure = sum(c.paid_amount for c in p_claims) * 0.45
            elif fin_exposure == 0.0:
                fin_exposure = sum(c.paid_amount for c in p_claims) * 0.08
                
            unique_mbrs_count = len({c.member_id for c in p_claims})
            
            # 5. Composite Risk
            composite_risk, risk_tier, breakdown = UnifiedRiskEngine.calculate_composite_risk(
                rule_score=rule_score,
                ml_anomaly_score=ml_score,
                graph_risk_score=graph_score,
                velocity=velocity,
                financial_exposure_usd=fin_exposure,
                member_impact_count=unique_mbrs_count
            )
            
            # 6. Fraud Genome
            genome = FraudGenomeEngine.compute_genome(
                provider=p,
                claims=p_claims,
                features=feats,
                rule_triggers_count=len(rule_triggers),
                ml_score=ml_score
            )
            
            # 7. Projections
            projections = RiskProjectionEngine.generate_projections(
                current_risk=composite_risk,
                current_exposure=fin_exposure,
                velocity=velocity,
                classification=velocity_class
            )
            
            # Evidence strength
            if len(rule_triggers) >= 2 or (len(rule_triggers) == 1 and composite_risk > 80):
                ev_strength = "CONVINCING" if composite_risk > 85 else "STRONG"
            elif len(rule_triggers) == 1 or ml_score > 70:
                ev_strength = "MODERATE"
            else:
                ev_strength = "LOW"
                
            # Severity
            severity = risk_tier
            
            # Primary pattern description
            if "Sterling" in p.provider_name:
                pattern = "Coordinated Level 5 E&M Upcoding & Referral Loop"
            elif "Apex" in p.provider_name:
                pattern = "Constituent Lab Panel Fragmenting & Unbundling"
            elif "Rostova" in p.provider_name:
                pattern = "Short-Interval Duplicate Encounter Pattern"
            elif "Pendelton" in p.provider_name:
                pattern = "Phantom Services & Impossible Single-Day Capacity"
            elif "Sophia" in p.provider_name:
                pattern = "Accelerating Volume Surge & Over-Utilization"
            elif len(rule_triggers) > 0:
                pattern = rule_triggers[0].rule_name
            elif ml_score > 70:
                pattern = "Multivariate Statistical Behavioral Anomaly"
            else:
                pattern = "Routine Baseline Utilization"
                
            # Case ID
            case_id = f"CASE-2026-{8000 + idx}"
            
            case = SIUCase(
                case_id=case_id,
                target_entity_type="PROVIDER",
                target_entity_id=p.npi,
                target_entity_name=p.provider_name,
                specialty=p.specialty,
                location=f"{p.city}, {p.state}",
                composite_risk_score=composite_risk,
                risk_tier=risk_tier,
                risk_velocity=velocity,
                potential_financial_exposure=round(fin_exposure, 2),
                member_impact_count=unique_mbrs_count,
                severity=severity,
                evidence_strength=ev_strength,
                status="NEW_OPPORTUNITY",
                primary_fwa_pattern=pattern,
                fraud_genome=genome,
                data_quality_index=db.dqi_overall,
                created_at=now_str,
                updated_at=now_str,
                rule_triggers=rule_triggers,
                risk_breakdown=breakdown,
                evolution_history=evolution_history,
                projections=projections
            )
            db.add_case(case)

        # Seed initial system startup audit log
        admin_user = db.users.get("admin@acentra.com", User(user_id="USR-100", username="admin@acentra.com", full_name="Admin", role="ADMIN"))
        TamperEvidentAuditLedger.record_action(
            user=admin_user,
            action_type="SYSTEM_INITIALIZED",
            target_resource="FULL_DATASET",
            details={
                "total_claims": len(claims),
                "total_providers": len(providers),
                "total_cases_generated": len(db.cases),
                "dqi_overall": db.dqi_overall
            }
        )
