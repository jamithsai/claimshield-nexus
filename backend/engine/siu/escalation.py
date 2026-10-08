"""
ClaimShield Nexus — Proactive Escalation Intelligence Engine
Monitors dynamic changes across cases and flags accelerating schemes requiring urgent SIU intervention.
"""

from typing import List, Dict, Any
from backend.data.models import SIUCase

class EscalationIntelligenceEngine:
    @staticmethod
    def identify_escalating_cases(cases: List[SIUCase]) -> List[Dict[str, Any]]:
        escalations = []
        for c in cases:
            is_escalating = (c.risk_velocity > 30.0 and c.composite_risk_score > 75.0) or (c.potential_financial_exposure > 300000.0 and c.risk_velocity > 20.0)
            if is_escalating:
                escalations.append({
                    "case_id": c.case_id,
                    "target_entity": c.target_entity_name,
                    "risk_score": c.composite_risk_score,
                    "risk_velocity": c.risk_velocity,
                    "financial_exposure": c.potential_financial_exposure,
                    "member_impact": c.member_impact_count,
                    "escalation_reason": (
                        f"Accelerating Risk (+{c.risk_velocity:.1f} pts) paired with high financial exposure "
                        f"(${c.potential_financial_exposure:,.2f}). Scheme is expanding rapidly."
                    ),
                    "urgency": "IMMEDIATE_TRIAGE" if c.composite_risk_score >= 88.0 else "ELEVATED_WATCH"
                })
        return escalations
