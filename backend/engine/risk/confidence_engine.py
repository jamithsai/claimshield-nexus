"""
ClaimShield Nexus — Confidence & Limitations Engine
Quantifies epistemic uncertainty, data quality penalties, and synthesizes explicit investigative limitations.
"""

from typing import Dict, Any, List
from backend.data.models import SIUCase

class ConfidenceAndLimitationsEngine:
    @staticmethod
    def assess_case_confidence(case: SIUCase, dqi: float) -> Dict[str, Any]:
        # Base confidence driven by evidence strength & DQI
        strength_map = {"LOW": 0.60, "MODERATE": 0.75, "STRONG": 0.88, "CONVINCING": 0.95}
        base_conf = strength_map.get(case.evidence_strength, 0.75)
        
        # Penalize if Data Quality Index is degraded
        calibrated_conf = round(base_conf * dqi, 2)
        
        limitations = [
            "Analysis conducted on synthetic CMS encounter benchmarks; clinical chart review is required to verify medical necessity.",
            "Statistical anomaly scores reflect deviation from specialty peer baselines and do not constitute direct proof of unlawful intent.",
            "Provider specialty coding nuances and unique patient acuity demographics may contribute to elevated procedure indices."
        ]
        
        if dqi < 0.92:
            limitations.append(f"Data Quality Index is degraded ({dqi:.2f}); confidence score penalized by {(1.0-dqi)*100:.1f}%.")
            
        return {
            "confidence_score": calibrated_conf,
            "confidence_rating": "HIGH_CONFIDENCE" if calibrated_conf >= 0.85 else ("MODERATE_CONFIDENCE" if calibrated_conf >= 0.70 else "LOW_CONFIDENCE"),
            "data_quality_index": dqi,
            "epistemic_uncertainty": round(1.0 - calibrated_conf, 2),
            "limitations": limitations,
            "mandatory_disclaimer": "This system identifies indicators associated with potential FWA. It does not establish fraud. Human investigation is required."
        }
