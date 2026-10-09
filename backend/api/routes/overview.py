"""
ClaimShield Nexus — Executive & Program Integrity Overview Routes
Aggregates high-level metrics and temporal trends directly from the database claims population.
"""

from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from collections import Counter
import datetime
from backend.data.database import db
from backend.security.auth import get_current_user, User

router = APIRouter(prefix="/overview", tags=["Executive Overview"])

@router.get("/metrics")
def get_executive_metrics(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    total_claims = len(db.claims)
    total_financial = sum(c.paid_amount for c in db.claims)
    
    cases = db.list_cases()
    flagged_exposure = sum(c.potential_financial_exposure for c in cases)
    
    # Tier breakdown
    tiers = Counter(c.risk_tier for c in cases)
    
    # Scheme breakdown
    schemes = Counter()
    for c in cases:
        for t in c.rule_triggers:
            schemes[t.rule_id] += 1
            
    return {
        "total_claims_analyzed": total_claims,
        "total_financial_volume_usd": round(total_financial, 2),
        "flagged_fwa_exposure_usd": round(flagged_exposure, 2),
        "fwa_exposure_percentage": round((flagged_exposure / total_financial * 100.0) if total_financial > 0 else 0, 2),
        "active_investigation_cases": len(cases),
        "critical_risk_entities_count": tiers.get("CRITICAL", 0),
        "high_risk_entities_count": tiers.get("HIGH", 0),
        "risk_tier_distribution": dict(tiers),
        "detected_schemes_breakdown": {
            "Level 5 E&M Upcoding (R102)": schemes.get("R102", 0),
            "Lab Panel Unbundling (R103)": schemes.get("R103", 0),
            "Duplicate Billing (R101)": schemes.get("R101", 0),
            "Phantom / Impossible Hours (R104)": schemes.get("R104", 0),
            "Utilization Velocity Surge (R105)": schemes.get("R105", 0),
            "Weekend Concentration (R106)": schemes.get("R106", 0)
        },
        "data_quality_index_overall": db.dqi_overall,
        "system_mode": "SYNTHETIC_RESEARCH_BENCHMARK",
        "data_classification": "SYNTHETIC_PUBLIC_ONLY"
    }

@router.get("/trends")
def get_temporal_trends(current_user: User = Depends(get_current_user)) -> List[Dict[str, Any]]:
    claims = db.claims
    if not claims:
        return []
        
    sorted_c = sorted(claims, key=lambda x: x.service_date)
    d_min = datetime.date.fromisoformat(sorted_c[0].service_date)
    
    epoch_defs = [
        ("Day 0", 0, 30),
        ("Day 30", 15, 45),
        ("Day 60", 35, 65),
        ("Day 90", 55, 95)
    ]
    
    trends = []
    cases = db.list_cases()
    avg_base_risk = sum(c.composite_risk_score for c in cases) / max(1, len(cases))
    
    for label, start_off, end_off in epoch_defs:
        epoch_claims = [
            c for c in sorted_c
            if start_off <= (datetime.date.fromisoformat(c.service_date) - d_min).days <= end_off
        ]
        
        normal_vol = sum(1 for c in epoch_claims if c.synthetic_scheme_tag is None)
        flagged_vol = sum(1 for c in epoch_claims if c.synthetic_scheme_tag is not None)
        total_vol = normal_vol + flagged_vol
        exposure_val = sum(c.paid_amount for c in epoch_claims if c.synthetic_scheme_tag is not None)
        
        # Risk progression based on flagged volume ratio in epoch
        flagged_ratio = (flagged_vol / max(1, len(epoch_claims)))
        epoch_risk = round(min(95.0, 30.0 + (flagged_ratio * 120.0)), 1)
        
        d_start = (d_min + datetime.timedelta(days=start_off)).isoformat()
        d_end = (d_min + datetime.timedelta(days=end_off)).isoformat()

        trends.append({
            "epoch": label,
            "date": label,
            "date_start": d_start,
            "date_end": d_end,
            "normal_volume": normal_vol,
            "flagged_volume": flagged_vol,
            "total_claims": total_vol,
            "total_encounters": total_vol,
            "exposure_usd": round(exposure_val, 2),
            "flagged_amount": round(exposure_val, 2),
            "avg_risk": epoch_risk
        })
        
    return trends
