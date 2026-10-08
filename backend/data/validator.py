"""
ClaimShield Nexus — Data Quality & Integrity Validation Engine
Evaluates dataset completeness, temporal validity, and calculates Data Quality Index (DQI).
"""

from typing import List, Dict, Tuple, Any
from .models import Claim, Provider, Facility, Member

class DataQualityEngine:
    @staticmethod
    def evaluate_claims(claims: List[Claim]) -> Tuple[float, Dict[str, Any]]:
        total_claims = len(claims)
        if total_claims == 0:
            return 0.0, {"error": "Empty claims dataset"}
            
        missing_diags = 0
        invalid_dates = 0
        zero_or_neg_amounts = 0
        
        for c in claims:
            if not c.primary_diagnosis:
                missing_diags += 1
            if c.service_date > c.paid_date:
                invalid_dates += 1
            if c.billed_amount <= 0 or c.paid_amount < 0:
                zero_or_neg_amounts += 1
                
        diag_score = 1.0 - (missing_diags / total_claims)
        date_score = 1.0 - (invalid_dates / total_claims)
        amt_score = 1.0 - (zero_or_neg_amounts / total_claims)
        
        # Weighted overall Data Quality Index
        overall_dqi = round(0.4 * diag_score + 0.3 * date_score + 0.3 * amt_score, 4)
        
        report = {
            "total_records_evaluated": total_claims,
            "overall_dqi": overall_dqi,
            "completeness_score": diag_score,
            "temporal_consistency_score": date_score,
            "financial_integrity_score": amt_score,
            "flagged_issues": {
                "missing_diagnosis_count": missing_diags,
                "invalid_temporal_sequence_count": invalid_dates,
                "non_positive_amounts_count": zero_or_neg_amounts
            },
            "confidence_impact": "LOW_PENALTY" if overall_dqi > 0.90 else "MODERATE_PENALTY"
        }
        return overall_dqi, report

    @staticmethod
    def calculate_provider_dqi(provider: Provider, claims: List[Claim]) -> float:
        if not claims:
            return 0.85
        total = len(claims)
        valid_records = sum(1 for c in claims if c.data_quality_score >= 0.90)
        return round(valid_records / total, 3)
