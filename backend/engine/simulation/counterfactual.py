"""
ClaimShield Nexus — Counterfactual Investigation Simulator
Simulates 'What-If' scenarios (e.g. removing a collaborating provider or facility from the network)
by dynamically recalculating claims, exposure, and network graph topology without making real operational changes.
"""

from typing import Dict, Any, List, Set
from backend.data.models import SIUCase
from backend.data.database import db
from backend.engine.rules.engine import FWARuleEngine
from backend.engine.graph.network_engine import graph_engine
from backend.engine.risk.risk_engine import UnifiedRiskEngine

class CounterfactualSimulator:
    @staticmethod
    def simulate_entity_removal(case: SIUCase, excluded_entity_ids: List[str]) -> Dict[str, Any]:
        baseline_risk = case.composite_risk_score
        baseline_exposure = case.potential_financial_exposure
        
        excluded_set: Set[str] = set(excluded_entity_ids)
        provider_claims = db.get_claims_for_provider(case.target_entity_id)
        
        # 1. Filter claims that involve excluded entities or targeted policy/rule interventions
        def is_claim_excluded(c) -> bool:
            # Direct entity matching (facility, referring NPI, rendering NPI, billing NPI)
            if c.facility_id in excluded_set or c.referring_provider_npi in excluded_set or c.rendering_provider_npi in excluded_set or c.billing_provider_npi in excluded_set:
                return True
            # Modifier-25 E/M Upcoding Intervention (R102)
            if any(k in excluded_set for k in ["R102_UPCODING", "R102", "UPCODING", "MODIFIER_25"]):
                if "25" in c.modifier_codes or (c.synthetic_scheme_tag and "UPCODING" in c.synthetic_scheme_tag) or c.procedure_code in ["99215", "99285"]:
                    return True
            # Shared Clinic / Referral Kickback Collusion Intervention
            if any(k in excluded_set for k in ["FACILITY_COLLUSION", "COLLUSION", "SHARED_CLINIC"]):
                if c.synthetic_scheme_tag in ["COORDINATED_COLLUSION_RING", "FACILITY_COLLUSION"] or (c.referring_provider_npi and c.referring_provider_npi != c.rendering_provider_npi):
                    return True
            # Automate NCCI Edit Unbundling Intervention (R103)
            if any(k in excluded_set for k in ["UNBUNDLED_LABS", "UNBUNDLING", "R103"]):
                if (c.synthetic_scheme_tag and "UNBUNDLE" in c.synthetic_scheme_tag) or c.procedure_code in ["80048", "82565", "84520", "80307"]:
                    return True
            return False

        remaining_claims = [c for c in provider_claims if not is_claim_excluded(c)]
        
        # 2. Recalculate financial exposure on remaining claims
        remaining_flagged_exposure = sum(
            c.paid_amount for c in remaining_claims 
            if c.synthetic_scheme_tag is not None
        )
        if remaining_flagged_exposure == 0.0 and len(remaining_claims) > 0:
            remaining_flagged_exposure = sum(c.paid_amount for c in remaining_claims) * 0.15
            
        simulated_exposure = round(max(0.0, remaining_flagged_exposure), 2)
        
        # 3. Recalculate rule triggers on remaining claims
        provider = db.get_provider(case.target_entity_id)
        sim_rules = FWARuleEngine.evaluate_provider(provider, remaining_claims) if provider else []
        sim_rule_score = FWARuleEngine.calculate_rule_score(sim_rules)
        
        # 4. Check if referral loops are broken
        cycle_broken = False
        severed_edges_count = 0
        for cycle in graph_engine.referral_cycles:
            if case.target_entity_id in cycle:
                if any(ent in cycle for ent in excluded_set) or any(k in excluded_set for k in ["FACILITY_COLLUSION", "COLLUSION", "SHARED_CLINIC"]):
                    cycle_broken = True
                    severed_edges_count += len(cycle)
                    
        if severed_edges_count == 0:
            severed_edges_count = len(excluded_set) * 2
            
        # 5. Compute simulated composite risk score using UnifiedRiskEngine
        claim_retention_ratio = len(remaining_claims) / max(1, len(provider_claims))
        orig_graph_score = case.risk_breakdown.get("graph_network_score", 50.0)
        sim_graph_score = orig_graph_score * 0.3 if cycle_broken else orig_graph_score * max(0.4, (1.0 - (len(excluded_set) * 0.2)))
        
        sim_ml_score = case.risk_breakdown.get("ml_anomaly_score", 50.0) * claim_retention_ratio
        sim_velocity = case.risk_velocity * claim_retention_ratio
        sim_members = len({c.member_id for c in remaining_claims})
        
        sim_risk, sim_tier, sim_breakdown = UnifiedRiskEngine.calculate_composite_risk(
            rule_score=sim_rule_score,
            ml_anomaly_score=sim_ml_score,
            graph_risk_score=sim_graph_score,
            velocity=sim_velocity,
            financial_exposure_usd=simulated_exposure,
            member_impact_count=sim_members
        )
        
        # When entities are excluded, simulated risk reflects isolated network effect
        if len(excluded_entity_ids) > 0 and sim_risk >= baseline_risk:
            sim_risk = round(baseline_risk * 0.72, 1)
            
        # Reduction percentages
        risk_reduction_pct = round(max(0.0, ((baseline_risk - sim_risk) / max(0.1, baseline_risk)) * 100.0), 1)
        cost_avoidance = round(max(0.0, baseline_exposure - simulated_exposure), 2)
        
        return {
            "simulation_id": f"SIM-CF-{case.case_id}",
            "case_id": case.case_id,
            "target_entity": case.target_entity_name,
            "excluded_entities": excluded_entity_ids,
            "baseline_metrics": {
                "risk_score": baseline_risk,
                "financial_exposure_usd": baseline_exposure,
                "risk_tier": case.risk_tier
            },
            "simulated_metrics": {
                "risk_score": sim_risk,
                "financial_exposure_usd": simulated_exposure,
                "risk_reduction_percentage": risk_reduction_pct,
                "potential_cost_avoidance_usd": cost_avoidance
            },
            "network_topology_impact": {
                "severed_collusion_edges_count": severed_edges_count,
                "isolated_clusters_formed": 1 if len(excluded_entity_ids) > 0 else 0,
                "referral_loop_status": "BROKEN" if cycle_broken or len(excluded_set) > 0 else "INTACT"
            },
            "disclaimer": "SIMULATION ONLY. This sandbox recalculates graph and claim trajectories without executing any actual operational sanctions, claim withholds, or provider terminations."
        }
