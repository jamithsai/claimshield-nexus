"""
Rule R105 — Excessive Utilization & Rapid Volume Surge
Detects sudden, dramatic acceleration in billing volume and intensity (>300% of baseline).
"""

from typing import List, Optional
from collections import defaultdict
import datetime
from backend.data.models import Claim, Provider, RuleTriggerEvent

class ExcessiveUtilizationRule:
    RULE_ID = "R105"
    RULE_NAME = "Excessive Utilization & Velocity Surge"

    @classmethod
    def evaluate(cls, provider: Provider, claims: List[Claim]) -> Optional[RuleTriggerEvent]:
        if len(claims) < 40:
            return None
            
        # Segment claims into 30-day cohorts: Month 1, Month 2, Month 3
        sorted_c = sorted(claims, key=lambda x: x.service_date)
        d_min = datetime.date.fromisoformat(sorted_c[0].service_date)
        
        m1_count = 0
        m3_count = 0
        
        for c in sorted_c:
            d = datetime.date.fromisoformat(c.service_date)
            offset = (d - d_min).days
            if offset < 30:
                m1_count += 1
            elif offset >= 60:
                m3_count += 1
                
        if m1_count > 0 and (m3_count / m1_count) >= 3.5 and m3_count >= 100:
            growth_pct = ((m3_count - m1_count) / m1_count) * 100
            m3_claims = [c for c in sorted_c if (datetime.date.fromisoformat(c.service_date) - d_min).days >= 60]
            excess_dollars = sum(c.paid_amount for c in m3_claims) * 0.6
            sample_ids = [c.claim_id for c in m3_claims[:5]]
            
            return RuleTriggerEvent(
                rule_id=cls.RULE_ID,
                rule_name=cls.RULE_NAME,
                severity="HIGH",
                description=(
                    f"Extreme billing velocity acceleration: 30-day claim volume surged by +{growth_pct:.0f}% "
                    f"from baseline ({m1_count} claims in M1 to {m3_count} claims in M3)."
                ),
                confidence_contribution=0.89,
                affected_claims_count=m3_count,
                potential_excess_usd=round(excess_dollars, 2),
                evidence_sample_claim_ids=sample_ids
            )
        return None
