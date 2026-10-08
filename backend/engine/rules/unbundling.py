"""
Rule R103 — Component Lab Panel Unbundling Detection
Detects unbundling of multi-test panels (e.g., 80048, 80053, 80061) into fragmented single-test claims.
"""

from typing import List, Optional
from collections import defaultdict
from backend.data.models import Claim, Provider, RuleTriggerEvent

class UnbundlingRule:
    RULE_ID = "R103"
    RULE_NAME = "Constituent Lab Panel Unbundling"
    
    UNBUNDLED_CODES = {"80048", "82565", "84520", "80307"}

    @classmethod
    def evaluate(cls, provider: Provider, claims: List[Claim]) -> Optional[RuleTriggerEvent]:
        if not claims:
            return None
            
        # Group by (member_id, service_date)
        encounters = defaultdict(list)
        for c in claims:
            if c.procedure_code in cls.UNBUNDLED_CODES:
                encounters[(c.member_id, c.service_date)].append(c)
                
        unbundled_encounters = [c_list for c_list in encounters.values() if len(c_list) >= 3]
        
        if len(unbundled_encounters) >= 4:
            total_unbundled_claims = sum(len(clist) for clist in unbundled_encounters)
            total_paid = sum(sum(c.paid_amount for c in clist) for clist in unbundled_encounters)
            # Estimated excess over single bundled fee ($72)
            estimated_excess = total_paid - (len(unbundled_encounters) * 72.0 * 0.8)
            sample_ids = [c.claim_id for clist in unbundled_encounters[:2] for c in clist[:3]]
            
            return RuleTriggerEvent(
                rule_id=cls.RULE_ID,
                rule_name=cls.RULE_NAME,
                severity="HIGH",
                description=(
                    f"Identified {len(unbundled_encounters)} distinct member encounters where constituent "
                    f"chemistry and toxicology tests were billed separately rather than using bundled panel codes."
                ),
                confidence_contribution=0.88,
                affected_claims_count=total_unbundled_claims,
                potential_excess_usd=round(max(0.0, estimated_excess), 2),
                evidence_sample_claim_ids=sample_ids
            )
        return None
