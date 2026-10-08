"""
Rule R102 — E&M Level 5 Upcoding Detection
Detects providers billing CPT 99215 at rates significantly exceeding specialty peer baselines.
"""

from typing import List, Optional
from backend.data.models import Claim, Provider, RuleTriggerEvent

class UpcodingRule:
    RULE_ID = "R102"
    RULE_NAME = "Severe E&M Level 5 Upcoding"
    
    # Specialty baseline expectation for Level 5 E&M is typically 10-18%
    PEER_BASELINE_LEVEL5_RATIO = 0.15 
    THRESHOLD_RATIO = 0.60 # >60% triggers investigation

    @classmethod
    def evaluate(cls, provider: Provider, claims: List[Claim]) -> Optional[RuleTriggerEvent]:
        if not claims:
            return None
            
        em_claims = [c for c in claims if c.procedure_code in ["99211", "99212", "99213", "99214", "99215"]]
        if len(em_claims) < 15:
            return None
            
        level5_claims = [c for c in em_claims if c.procedure_code == "99215"]
        level5_ratio = len(level5_claims) / len(em_claims)
        
        if level5_ratio >= cls.THRESHOLD_RATIO:
            excess_claims_count = int(len(level5_claims) - (len(em_claims) * cls.PEER_BASELINE_LEVEL5_RATIO))
            excess_dollars = sum(c.paid_amount for c in level5_claims[:excess_claims_count])
            
            sample_ids = [c.claim_id for c in level5_claims[:5]]
            
            return RuleTriggerEvent(
                rule_id=cls.RULE_ID,
                rule_name=cls.RULE_NAME,
                severity="CRITICAL" if level5_ratio > 0.80 else "HIGH",
                description=(
                    f"Provider billed CPT 99215 in {level5_ratio*100:.1f}% of office encounters "
                    f"(specialty peer baseline: {cls.PEER_BASELINE_LEVEL5_RATIO*100:.1f}%). "
                    f"{len(level5_claims)} high-complexity claims identified."
                ),
                confidence_contribution=0.92,
                affected_claims_count=len(level5_claims),
                potential_excess_usd=round(excess_dollars, 2),
                evidence_sample_claim_ids=sample_ids
            )
        return None
