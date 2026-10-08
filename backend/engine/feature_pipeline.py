"""
ClaimShield Nexus — Feature Engineering & Provider Profile Pipeline
Extracts multi-dimensional behavioral feature vectors for statistical baselines and ML anomaly detection.
"""

import numpy as np
from typing import List, Dict, Any, Tuple
from collections import defaultdict
from backend.data.models import Claim, Provider, Facility

class ProviderFeaturePipeline:
    @staticmethod
    def extract_features_for_provider(provider: Provider, claims: List[Claim]) -> Dict[str, float]:
        if not claims:
            return {
                "daily_claim_density": 0.0,
                "high_level_em_ratio": 0.0,
                "unbundled_panel_frequency": 0.0,
                "duplicate_rate": 0.0,
                "weekend_billing_ratio": 0.0,
                "avg_billed_to_allowed_ratio": 1.0,
                "unique_members_ratio": 0.0,
                "max_claims_single_day": 0.0,
                "referral_out_rate": 0.0
            }
            
        total_claims = len(claims)
        dates = defaultdict(int)
        em_levels = {"99211": 0, "99212": 0, "99213": 0, "99214": 0, "99215": 0}
        total_em = 0
        unbundled_count = 0
        weekend_count = 0
        billed_sum = 0.0
        allowed_sum = 0.0
        unique_members = set()
        referred_claims = 0
        
        # Check duplicates
        seen_keys = set()
        duplicate_count = 0
        
        for c in claims:
            dates[c.service_date] += 1
            unique_members.add(c.member_id)
            billed_sum += c.billed_amount
            allowed_sum += max(1.0, c.allowed_amount)
            
            if c.procedure_code in em_levels:
                em_levels[c.procedure_code] += 1
                total_em += 1
                
            if c.procedure_code in ["80048", "82565", "84520", "80307"]:
                unbundled_count += 1
                
            if c.referring_provider_npi is not None:
                referred_claims += 1
                
            # Check weekend (ISO weekday 6 or 7)
            try:
                import datetime
                d = datetime.date.fromisoformat(c.service_date)
                if d.weekday() in [5, 6]:
                    weekend_count += 1
            except Exception:
                pass
                
            # Duplicate detection key
            dup_key = (c.member_id, c.procedure_code, c.service_date)
            if dup_key in seen_keys:
                duplicate_count += 1
            else:
                seen_keys.add(dup_key)

        active_days = max(1, len(dates))
        daily_density = total_claims / active_days
        max_single_day = max(dates.values()) if dates else 0
        
        high_level_em = (em_levels["99214"] + em_levels["99215"]) / total_em if total_em > 0 else 0.0
        level_5_em_ratio = em_levels["99215"] / total_em if total_em > 0 else 0.0
        
        unbundled_freq = unbundled_count / total_claims
        dup_rate = duplicate_count / total_claims
        weekend_ratio = weekend_count / total_claims
        billed_allowed_ratio = billed_sum / allowed_sum if allowed_sum > 0 else 1.0
        unique_mbr_ratio = len(unique_members) / total_claims
        referral_rate = referred_claims / total_claims
        
        return {
            "daily_claim_density": round(float(daily_density), 3),
            "high_level_em_ratio": round(float(high_level_em), 3),
            "level_5_em_ratio": round(float(level_5_em_ratio), 3),
            "unbundled_panel_frequency": round(float(unbundled_freq), 3),
            "duplicate_rate": round(float(dup_rate), 3),
            "weekend_billing_ratio": round(float(weekend_ratio), 3),
            "avg_billed_to_allowed_ratio": round(float(billed_allowed_ratio), 3),
            "unique_members_ratio": round(float(unique_mbr_ratio), 3),
            "max_claims_single_day": float(max_single_day),
            "referral_out_rate": round(float(referral_rate), 3),
            "total_claims": float(total_claims),
            "total_billed_usd": round(billed_sum, 2)
        }

    @staticmethod
    def extract_feature_matrix(providers: List[Provider], claims_by_provider: Dict[str, List[Claim]]) -> Tuple[List[str], np.ndarray, List[str]]:
        feature_names = [
            "daily_claim_density",
            "high_level_em_ratio",
            "level_5_em_ratio",
            "unbundled_panel_frequency",
            "duplicate_rate",
            "weekend_billing_ratio",
            "avg_billed_to_allowed_ratio",
            "unique_members_ratio",
            "max_claims_single_day",
            "referral_out_rate"
        ]
        
        npis = []
        rows = []
        for p in providers:
            claims = claims_by_provider.get(p.npi, [])
            feats = ProviderFeaturePipeline.extract_features_for_provider(p, claims)
            row = [feats[fn] for fn in feature_names]
            npis.append(p.npi)
            rows.append(row)
            
        return npis, np.array(rows, dtype=np.float32), feature_names
