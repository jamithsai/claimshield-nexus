"""
ClaimShield Nexus — SIU Prioritization Queue & Escalation Routes
"""

from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, Optional, List
from backend.data.database import db
from backend.engine.siu.prioritizer import SIUPrioritizer
from backend.engine.siu.escalation import EscalationIntelligenceEngine
from backend.security.auth import get_current_user, User

router = APIRouter(prefix="/siu", tags=["SIU Queue & Prioritization"])

@router.get("/queue")
def get_prioritized_queue(
    capacity: int = Query(20, ge=1, le=100),
    sort_by: str = Query("priority", pattern="^(priority|risk|risk_score|exposure|velocity|member_impact)$"),
    tier: Optional[str] = Query(None),
    fwa_pattern: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    cases = db.list_cases()
    normalized_sort = "risk_score" if sort_by == "risk" else sort_by
    result = SIUPrioritizer.rank_and_allocate_queue(
        cases=cases,
        capacity=capacity,
        sort_by=normalized_sort,
        tier_filter=tier,
        scheme_filter=fwa_pattern
    )
    return result

@router.get("/escalations")
def get_escalation_watchlist(current_user: User = Depends(get_current_user)) -> List[Dict[str, Any]]:
    cases = db.list_cases()
    return EscalationIntelligenceEngine.identify_escalating_cases(cases)
