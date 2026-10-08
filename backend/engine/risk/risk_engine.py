"""
ClaimShield Nexus — Unified Risk Engine
Synthesizes multi-detector signals into an inspectable, normalized 0-100 composite risk score.
"""

from typing import Dict, Any, Tuple, Literal
from backend.data.models import FraudGenome

class UnifiedRiskEngine:
    DEFAULT_WEIGHTS = {
        "rule_signals": 0.25,
        "ml_anomaly": 0.20,
        "graph_network": 0.20,
        "risk_velocity": 0.15,
        "financial_exposure": 0.10,
        "member_impact": 0.10
    }

    @classmethod
    def calculate_composite_risk(
        cls,
        rule_score: float,
        ml_anomaly_score: float,
        graph_risk_score: float,
        velocity: float,
        financial_exposure_usd: float,
        member_impact_count: int,
        weights: Dict[str, float] = None
    ) -> Tuple[float, Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"], Dict[str, float]]:
        w = weights or cls.DEFAULT_WEIGHTS
        
        # Sub-scores normalized 0-100
        s_rule = min(100.0, max(0.0, rule_score))
        s_ml = min(100.0, max(0.0, ml_anomaly_score))
        s_graph = min(100.0, max(0.0, graph_risk_score))
        s_vel = min(100.0, max(0.0, (velocity / 50.0) * 100.0))
        s_fin = min(100.0, max(0.0, (financial_exposure_usd / 200000.0) * 100.0))
        s_mbr = min(100.0, max(0.0, (member_impact_count / 100.0) * 100.0))
        
        composite = (
            w["rule_signals"] * s_rule +
            w["ml_anomaly"] * s_ml +
            w["graph_network"] * s_graph +
            w["risk_velocity"] * s_vel +
            w["financial_exposure"] * s_fin +
            w["member_impact"] * s_mbr
        )
        
        composite_score = round(min(100.0, max(0.0, composite)), 1)
        
        if composite_score >= 75.0:
            tier = "CRITICAL"
        elif composite_score >= 50.0:
            tier = "HIGH"
        elif composite_score >= 25.0:
            tier = "MEDIUM"
        else:
            tier = "LOW"
            
        breakdown = {
            "rule_signals_score": round(s_rule, 1),
            "ml_anomaly_score": round(s_ml, 1),
            "graph_network_score": round(s_graph, 1),
            "risk_velocity_score": round(s_vel, 1),
            "financial_exposure_score": round(s_fin, 1),
            "member_impact_score": round(s_mbr, 1)
        }
        
        return composite_score, tier, breakdown
