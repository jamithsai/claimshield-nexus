"""
ClaimShield Nexus — Risk Velocity Engine
Measures the rate of change and acceleration of suspicious behavior over time.
"""

from typing import List, Tuple
from backend.data.models import SchemeEvolutionSnapshot

class RiskVelocityEngine:
    @staticmethod
    def calculate_velocity(snapshots: List[SchemeEvolutionSnapshot]) -> Tuple[float, str]:
        if len(snapshots) < 2:
            return 0.0, "STATIC"
            
        r_first = snapshots[0].risk_score
        r_last = snapshots[-1].risk_score
        delta_risk = r_last - r_first
        
        # Determine acceleration category
        if delta_risk > 35.0:
            classification = "ACCELERATING_ESCALATION"
        elif delta_risk > 15.0:
            classification = "MODERATE_GROWTH"
        else:
            classification = "STATIC"
            
        return round(delta_risk, 1), classification
