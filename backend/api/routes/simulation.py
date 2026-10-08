"""
ClaimShield Nexus — Simulation API Routes (Counterfactual & Red-Team)
"""

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, List
from backend.data.database import db
from backend.engine.simulation.counterfactual import CounterfactualSimulator
from backend.engine.simulation.redteam import RedTeamSimulator
from backend.security.auth import get_current_user, require_roles, User
from backend.security.audit import TamperEvidentAuditLedger

router = APIRouter(prefix="/simulate", tags=["Simulations & Red-Teaming"])

class CounterfactualRequest(BaseModel):
    case_id: str
    exclude_entity_ids: List[str]

class RedTeamRequest(BaseModel):
    scheme_type: str = "UNBUNDLED_LAB_RING"
    intensity_multiplier: float = 1.5
    claim_count: int = 40

@router.post("/counterfactual")
def run_counterfactual_simulation(
    req: CounterfactualRequest, 
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    case = db.get_case(req.case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {req.case_id} not found")
        
    result = CounterfactualSimulator.simulate_entity_removal(case, req.exclude_entity_ids)
    
    TamperEvidentAuditLedger.record_action(
        user=current_user,
        action_type="COUNTERFACTUAL_SIMULATION_EXECUTED",
        target_resource=req.case_id,
        details={"excluded_entities": req.exclude_entity_ids, "risk_reduction_pct": result["simulated_metrics"]["risk_reduction_percentage"]}
    )
    return result

@router.post("/redteam")
def run_redteam_threat_simulation(
    req: RedTeamRequest,
    current_user: User = Depends(require_roles(["PROGRAM_INTEGRITY_ANALYST", "ADMIN", "SENIOR_INVESTIGATOR"]))
) -> Dict[str, Any]:
    result = RedTeamSimulator.execute_simulation(
        scheme_type=req.scheme_type,
        intensity_multiplier=req.intensity_multiplier,
        claim_count=req.claim_count
    )
    
    TamperEvidentAuditLedger.record_action(
        user=current_user,
        action_type="REDTEAM_SIMULATION_EXECUTED",
        target_resource="THREAT_DETECTOR_MATRIX",
        details={"scheme": req.scheme_type, "outcome": result["detection_outcome"]}
    )
    return result
