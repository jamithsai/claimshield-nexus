"""
ClaimShield Nexus — 30 / 60 / 90-Day Risk & Financial Exposure Projection Engine
Forecasts future risk trajectories and exposure bounds with explicit disclaimers.
"""

from typing import List
from backend.data.models import RiskProjection, SchemeEvolutionSnapshot

class RiskProjectionEngine:
    @staticmethod
    def generate_projections(
        current_risk: float, 
        current_exposure: float, 
        velocity: float, 
        classification: str
    ) -> List[RiskProjection]:
        projections = []
        horizons = [30, 60, 90]
        
        growth_rates = {
            "ACCELERATING_ESCALATION": (0.35, 0.85, 1.45),
            "MODERATE_GROWTH": (0.15, 0.35, 0.60),
            "STATIC": (0.05, 0.10, 0.15),
            "DECELERATING": (0.01, 0.02, 0.03)
        }
        
        rate_30, rate_60, rate_90 = growth_rates.get(classification, (0.05, 0.10, 0.15))
        rates = [rate_30, rate_60, rate_90]
        
        for h, r in zip(horizons, rates):
            proj_exposure = current_exposure * (1.0 + r)
            additional_exp = max(0.0, proj_exposure - current_exposure)
            
            # Risk score projection (asymptotically bounded between 0.0 and 99.8)
            proj_risk = max(0.0, min(99.8, round(current_risk + (velocity * (h / 90.0) * 0.25), 1)))
            
            ci_low = max(0.0, round(additional_exp * 0.80, 2))
            ci_high = max(0.0, round(additional_exp * 1.25, 2))
            
            projections.append(RiskProjection(
                horizon_days=h,
                projected_risk_score=proj_risk,
                projected_additional_exposure_usd=round(additional_exp, 2),
                projected_claim_count=int(additional_exp / 185.0),
                projected_member_impact=int((additional_exp / 185.0) * 0.4),
                ci_low_usd=ci_low,
                ci_high_usd=ci_high,
                trajectory_classification=classification, # type: ignore
                disclaimer="Statistical projection for prioritization only; not a factual certainty."
            ))
            
        return projections
