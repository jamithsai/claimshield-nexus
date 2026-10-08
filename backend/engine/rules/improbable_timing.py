"""
Rule R106 — Improbable Timing & Weekend Billing Concentration
Detects high proportion of non-emergency, routine outpatient services billed on weekends.
"""

from typing import List, Optional
import datetime
from backend.data.models import Claim, Provider, RuleTriggerEvent

class ImprobableTimingRule:
    RULE_ID = "R106"
    RULE_NAME = "Suspicious Weekend / Non-Business Hour Billing"
    
    WEEKEND_THRESHOLD = 0.35 # Routine outpatient baseline is <5%

    @classmethod
    def evaluate(cls, provider: Provider, claims: List[Claim]) -> Optional[RuleTriggerEvent]:
        if len(claims) < 30:
            return None
            
        weekend_claims = []
        for c in claims:
            try:
                d = datetime.date.fromisoformat(c.service_date)
                if d.weekday() in [5, 6]:
                    weekend_claims.append(c)
            except Exception:
                pass
                
        weekend_ratio = len(weekend_claims) / len(claims)
        
        if weekend_ratio >= cls.WEEKEND_THRESHOLD:
            excess_dollars = sum(c.paid_amount for c in weekend_claims)
            sample_ids = [c.claim_id for c in weekend_claims[:5]]
            
            return RuleTriggerEvent(
                rule_id=cls.RULE_ID,
                rule_name=cls.RULE_NAME,
                severity="MEDIUM",
                description=(
                    f"Atypical scheduling concentration: {weekend_ratio*100:.1f}% of outpatient services "
                    f"were billed for Saturday/Sunday dates of service."
                ),
                confidence_contribution=0.82,
                affected_claims_count=len(weekend_claims),
                potential_excess_usd=round(excess_dollars, 2),
                evidence_sample_claim_ids=sample_ids
            )
        return None
