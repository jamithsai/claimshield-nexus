"""
ClaimShield Nexus — SIU Investigator Prioritization Engine
Ranks investigation opportunities using multi-criteria optimization considering capacity limits.
"""

from typing import List, Dict, Any, Optional
from backend.data.models import SIUCase

class SIUPrioritizer:
    @staticmethod
    def calculate_case_priority_score(case: SIUCase) -> float:
        # Multi-factor objective function:
        # Base: Composite Risk Score (0 - 100)
        # Financial Exposure factor (scaled 1.0 to 2.5)
        fin_mult = 1.0 + min(1.5, case.potential_financial_exposure / 300000.0)
        
        # Member Impact factor (scaled 1.0 to 1.8)
        mbr_mult = 1.0 + min(0.8, case.member_impact_count / 100.0)
        
        # Risk Velocity boost (if accelerating +30%, if moderate +10%)
        vel_mult = 1.30 if case.risk_velocity > 30.0 else (1.10 if case.risk_velocity > 15.0 else 1.0)
        
        # Evidence strength weight
        ev_weights = {"LOW": 0.75, "MODERATE": 1.0, "STRONG": 1.25, "CONVINCING": 1.50}
        ev_mult = ev_weights.get(case.evidence_strength, 1.0)
        
        raw_priority = case.composite_risk_score * fin_mult * mbr_mult * vel_mult * ev_mult
        return round(raw_priority, 2)

    @classmethod
    def rank_and_allocate_queue(
        cls, 
        cases: List[SIUCase], 
        capacity: int = 20, 
        sort_by: str = "priority",
        tier_filter: Optional[str] = None,
        scheme_filter: Optional[str] = None
    ) -> Dict[str, Any]:
        filtered = list(cases)
        
        if tier_filter:
            filtered = [c for c in filtered if c.risk_tier == tier_filter]
        if scheme_filter:
            filtered = [c for c in filtered if scheme_filter.lower() in c.primary_fwa_pattern.lower()]
            
        # Scoring
        case_scores = []
        for c in filtered:
            p_score = cls.calculate_case_priority_score(c)
            case_scores.append((c, p_score))
            
        if sort_by == "priority":
            case_scores.sort(key=lambda x: x[1], reverse=True)
        elif sort_by == "risk_score":
            case_scores.sort(key=lambda x: x[0].composite_risk_score, reverse=True)
        elif sort_by == "exposure":
            case_scores.sort(key=lambda x: x[0].potential_financial_exposure, reverse=True)
        elif sort_by == "velocity":
            case_scores.sort(key=lambda x: x[0].risk_velocity, reverse=True)
        elif sort_by == "member_impact":
            case_scores.sort(key=lambda x: x[0].member_impact_count, reverse=True)
            
        allocated_cases = [item[0] for item in case_scores[:capacity]]
        
        return {
            "total_available_cases": len(cases),
            "filtered_matching_count": len(filtered),
            "capacity_limit": capacity,
            "allocated_count": len(allocated_cases),
            "cases": allocated_cases
        }
