"""
Rule R104 — Phantom Services & Impossible Daily Billing Volume
Detects claims where cumulative daily service duration exceeds physically possible physician hours (>20 hours/day).
"""

from typing import List, Optional
from collections import defaultdict
from backend.data.models import Claim, Provider, RuleTriggerEvent
from backend.data.generator import CPT_REFERENCE

class PhantomServicesRule:
    RULE_ID = "R104"
    RULE_NAME = "Phantom Services & Impossible Daily Capacity"
    
    MAX_POSSIBLE_DAILY_MINUTES = 8 * 60 # 8 hours max clinical limit for high-density flags

    @classmethod
    def evaluate(cls, provider: Provider, claims: List[Claim]) -> Optional[RuleTriggerEvent]:
        if not claims:
            return None
            
        daily_time = defaultdict(float)
        daily_claims = defaultdict(list)
        
        for c in claims:
            time_cost = CPT_REFERENCE.get(c.procedure_code, {}).get("time_min", 20) * c.units
            daily_time[c.service_date] += time_cost
            daily_claims[c.service_date].append(c)
            
        impossible_days = {d: t for d, t in daily_time.items() if t > cls.MAX_POSSIBLE_DAILY_MINUTES}
        
        if len(impossible_days) > 0:
            total_flagged_claims = sum(len(daily_claims[d]) for d in impossible_days)
            excess_dollars = sum(sum(c.paid_amount for c in daily_claims[d]) for d in impossible_days)
            sample_ids = [c.claim_id for d in impossible_days for c in daily_claims[d][:3]]
            
            max_day = max(impossible_days.keys(), key=lambda d: impossible_days[d])
            max_hours = impossible_days[max_day] / 60.0
            
            return RuleTriggerEvent(
                rule_id=cls.RULE_ID,
                rule_name=cls.RULE_NAME,
                severity="CRITICAL",
                description=(
                    f"Physician billed impossible clinical volumes exceeding physical capacity. "
                    f"Peak day ({max_day}) contained {max_hours:.1f} billable hours across {len(daily_claims[max_day])} claims."
                ),
                confidence_contribution=0.96,
                affected_claims_count=total_flagged_claims,
                potential_excess_usd=round(excess_dollars, 2),
                evidence_sample_claim_ids=sample_ids
            )
        return None
