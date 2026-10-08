"""
Rule R101 — Duplicate Billing Pattern Detection
Detects identical or near-identical procedure codes billed for the same member within a 72-hour window.
"""

from typing import List, Optional
from collections import defaultdict
import datetime
from backend.data.models import Claim, Provider, RuleTriggerEvent

class DuplicateBillingRule:
    RULE_ID = "R101"
    RULE_NAME = "Suspicious Duplicate Billing"

    @classmethod
    def evaluate(cls, provider: Provider, claims: List[Claim]) -> Optional[RuleTriggerEvent]:
        if not claims:
            return None
            
        # Group by (member_id, procedure_code)
        history = defaultdict(list)
        for c in claims:
            history[(c.member_id, c.procedure_code)].append(c)
            
        duplicate_pairs = []
        for (mbr, cpt), clist in history.items():
            if len(clist) < 2:
                continue
            # Sort by date
            sorted_c = sorted(clist, key=lambda x: x.service_date)
            for i in range(len(sorted_c) - 1):
                d1 = datetime.date.fromisoformat(sorted_c[i].service_date)
                d2 = datetime.date.fromisoformat(sorted_c[i+1].service_date)
                delta_days = (d2 - d1).days
                if 0 <= delta_days <= 3:
                    duplicate_pairs.append((sorted_c[i], sorted_c[i+1]))
                    
        if len(duplicate_pairs) >= 5:
            excess_dollars = sum(pair[1].paid_amount for pair in duplicate_pairs)
            sample_ids = [pair[1].claim_id for pair in duplicate_pairs[:6]]
            
            return RuleTriggerEvent(
                rule_id=cls.RULE_ID,
                rule_name=cls.RULE_NAME,
                severity="HIGH",
                description=(
                    f"Detected {len(duplicate_pairs)} duplicate claim pairs submitted for identical members "
                    f"and CPT codes within 72 hours of initial encounter."
                ),
                confidence_contribution=0.91,
                affected_claims_count=len(duplicate_pairs) * 2,
                potential_excess_usd=round(excess_dollars, 2),
                evidence_sample_claim_ids=sample_ids
            )
        return None
