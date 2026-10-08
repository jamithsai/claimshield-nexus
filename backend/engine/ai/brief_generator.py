"""
ClaimShield Nexus — Guardrailed AI Evidence Brief Generator
Synthesizes structured multi-detector signals into comprehensive, evidence-backed investigation briefs.
Strictly adheres to Responsible AI standards: zero hallucination, evidence citations, and mandatory disclaimers.
"""

from typing import Dict, Any, List
import datetime
from backend.data.models import SIUCase, Claim

class AIEvidenceBriefGenerator:
    @staticmethod
    def generate_brief(case: SIUCase, sample_claims: List[Claim]) -> Dict[str, Any]:
        brief_id = f"BRF-{case.case_id.replace('CASE-', '')}"
        
        # Format dynamic velocity descriptor
        if case.risk_velocity > 15.0:
            vel_desc = f"an accelerating velocity of +{case.risk_velocity:.1f} points"
        elif case.risk_velocity < -10.0:
            vel_desc = f"a decelerating velocity of {case.risk_velocity:.1f} points"
        else:
            vel_desc = f"a stable velocity of {case.risk_velocity:+.1f} points"

        # 1. Executive Summary Construction
        summary = (
            f"Anomalous billing and network behavioral patterns were detected for {case.target_entity_name} "
            f"({case.specialty or 'Healthcare Provider'}, located in {case.location or 'FL'}). "
            f"The entity exhibits a composite risk score of {case.composite_risk_score}/100 ({case.risk_tier} Tier) "
            f"with {vel_desc} over the 90-day observation window. "
            f"Total potential financial exposure is estimated at ${case.potential_financial_exposure:,.2f} "
            f"across {case.member_impact_count} impacted program beneficiaries."
        )
        
        # 2. Key Behavioral Findings
        findings = []
        for trigger in case.rule_triggers:
            findings.append(f"[{trigger.rule_id} - {trigger.rule_name}]: {trigger.description}")
            
        if case.fraud_genome.referral_concentration > 0.80:
            findings.append(
                f"[Network Collusion Alert]: Extreme referral concentration ({case.fraud_genome.referral_concentration:.2f}) "
                f"and participation in suspected circular routing ring."
            )
        if case.fraud_genome.procedure_deviation > 0.80:
            findings.append(
                f"[Procedure Skew Alert]: Disproportionate concentration in high-reimbursement procedural codes "
                f"exceeding specialty peer group distribution."
            )
            
        # 3. Mitigating Factors & Counter-Evidence
        mitigating = (
            f"Provider operates in a high-demand clinical specialty ({case.specialty or 'Specialist'}). "
            f"A proportion of high-complexity billing may reflect specialized patient referral intake; "
            f"however, the magnitude of statistical divergence and temporal density cannot be explained solely by clinical case-mix."
        )
        
        # 4. Recommended Investigative Actions
        actions = [
            f"1. Issue formal Prepayment Medical Review hold on CPT codes identified in rule triggers.",
            f"2. Subpoena certified electronic health records (EHR) for the top 25 high-dollar patient encounters.",
            f"3. Cross-interview referring physicians identified in the connected network subgraph.",
            f"4. Request facility credentialing verification and physical location site audit."
        ]
        
        # 5. Exact Evidence Citations
        citations = []
        for c in sample_claims[:8]:
            citations.append({
                "claim_id": c.claim_id,
                "service_date": c.service_date,
                "procedure_code": c.procedure_code,
                "billed_usd": c.billed_amount,
                "paid_usd": c.paid_amount,
                "associated_scheme_tag": c.synthetic_scheme_tag or "STATISTICAL_OUTLIER"
            })
            
        return {
            "brief_id": brief_id,
            "case_id": case.case_id,
            "target_entity": case.target_entity_name,
            "specialty": case.specialty,
            "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "composite_risk_score": case.composite_risk_score,
            "risk_tier": case.risk_tier,
            "risk_velocity": case.risk_velocity,
            "potential_financial_exposure_usd": case.potential_financial_exposure,
            "member_impact_count": case.member_impact_count,
            "data_quality_index": case.data_quality_index,
            "executive_summary": summary,
            "key_behavioral_findings": findings,
            "mitigating_factors": mitigating,
            "recommended_investigative_actions": actions,
            "evidence_citations": citations,
            "confidence_assessment": {
                "evidence_strength": case.evidence_strength,
                "data_quality_status": "VALIDATED" if case.data_quality_index >= 0.90 else "DEGRADED",
                "human_in_the_loop_required": True
            },
            "mandatory_disclaimer": (
                "This intelligence brief identifies statistical and behavioral indicators associated with potential "
                "Fraud, Waste, and Abuse (FWA). It does not establish legal fraud. Human investigation, clinical chart "
                "audit, and legal due process are required prior to any operational sanctions or recovery actions."
            )
        }
