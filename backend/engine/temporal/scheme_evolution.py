"""
ClaimShield Nexus — Scheme Evolution Radar
Tracks the multi-epoch historical evolution of suspicious schemes across Day 0, Day 30, Day 60, and Day 90.
Computes genuine empirical metrics directly from the temporal claim cohorts.
"""

from typing import List, Dict, Any, Set
import datetime
from backend.data.models import Provider, Claim, SchemeEvolutionSnapshot
from backend.engine.rules.engine import FWARuleEngine
from backend.engine.feature_pipeline import ProviderFeaturePipeline

class SchemeEvolutionEngine:
    @staticmethod
    def compute_evolution_history(provider: Provider, claims: List[Claim]) -> List[SchemeEvolutionSnapshot]:
        if not claims:
            return []
            
        sorted_c = sorted(claims, key=lambda x: x.service_date)
        d_min = datetime.date.fromisoformat(sorted_c[0].service_date)
        
        epochs = [
            ("Day 0 (Baseline)", 0, 0, 30),
            ("Day 30", 1, 15, 45),
            ("Day 60", 2, 35, 65),
            ("Day 90 (Current)", 3, 55, 95)
        ]
        
        snapshots = []
        for label, idx, start_offset, end_offset in epochs:
            epoch_claims = [
                c for c in sorted_c 
                if start_offset <= (datetime.date.fromisoformat(c.service_date) - d_min).days <= end_offset
            ]
            
            d_start_str = (d_min + datetime.timedelta(days=start_offset)).isoformat()
            d_end_str = (d_min + datetime.timedelta(days=end_offset)).isoformat()
            
            # Dynamic entity counts extracted directly from claims
            providers_set: Set[str] = {provider.npi}
            facilities_set: Set[str] = set()
            members_set: Set[str] = set()
            
            exposure = 0.0
            for c in epoch_claims:
                members_set.add(c.member_id)
                facilities_set.add(c.facility_id)
                if c.referring_provider_npi:
                    providers_set.add(c.referring_provider_npi)
                if c.rendering_provider_npi:
                    providers_set.add(c.rendering_provider_npi)
                exposure += c.paid_amount
                
            vol = len(epoch_claims)
            
            # Dynamic rule evaluation on epoch claims
            epoch_rules = FWARuleEngine.evaluate_provider(provider, epoch_claims)
            epoch_rule_score = FWARuleEngine.calculate_rule_score(epoch_rules)
            
            # Dynamic feature extraction
            feats = ProviderFeaturePipeline.extract_features_for_provider(provider, epoch_claims)
            
            # Calculate dynamic risk score based on empirical evidence in epoch
            unbundled_score = feats.get("unbundled_panel_frequency", 0.0) * 80.0
            em5_score = feats.get("level_5_em_ratio", 0.0) * 70.0
            vol_score = min(30.0, vol / 5.0)
            
            raw_risk = max(15.0, epoch_rule_score * 0.5 + unbundled_score * 0.2 + em5_score * 0.2 + vol_score * 0.1)
            cur_risk = round(min(98.5, raw_risk), 1)
            
            schemes_detected = []
            for c in epoch_claims:
                if c.synthetic_scheme_tag and c.synthetic_scheme_tag not in schemes_detected:
                    schemes_detected.append(c.synthetic_scheme_tag)
                    
            snapshots.append(SchemeEvolutionSnapshot(
                epoch_label=label,
                epoch_index=idx,
                date_start=d_start_str,
                date_end=d_end_str,
                active_providers_count=max(1, len(providers_set)),
                active_facilities_count=max(1, len(facilities_set)),
                active_members_count=len(members_set),
                claim_volume=vol,
                financial_exposure=round(exposure, 2),
                risk_score=cur_risk,
                dominant_schemes=schemes_detected
            ))
            
        return snapshots
