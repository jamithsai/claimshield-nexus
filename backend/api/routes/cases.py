"""
ClaimShield Nexus — Case Investigation Deep-Dive Routes
"""

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import datetime
from backend.data.models import SIUCase, Claim
from backend.data.database import db
from backend.engine.risk.evidence_graph import EvidenceGraphSynthesizer
from backend.engine.similarity.matcher import SchemeSimilarityMatcher
from backend.engine.ai.brief_generator import AIEvidenceBriefGenerator
from backend.engine.workflow.feedback import feedback_store
from backend.security.auth import get_current_user, User
from backend.security.audit import TamperEvidentAuditLedger

router = APIRouter(prefix="/cases", tags=["Case Investigation"])

class InvestigatorDecisionRequest(BaseModel):
    decision: str
    disposition: str
    investigator_notes: str
    recommended_action: str
    feedback_category: str = "CORRECT_DETECTION"

@router.get("/{case_id}")
def get_case_details(case_id: str, current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")
        
    provider = db.get_provider(case.target_entity_id)
    claims = db.get_claims_for_provider(case.target_entity_id)
    similarity = SchemeSimilarityMatcher.match_genome(case.fraud_genome)
    
    TamperEvidentAuditLedger.record_action(
        user=current_user,
        action_type="CASE_INSPECTED",
        target_resource=case_id,
        details={"risk_score": case.composite_risk_score, "provider": case.target_entity_name}
    )
    
    return {
        "case": case,
        "provider_details": provider,
        "scheme_similarity": similarity,
        "total_claims_count": len(claims),
        "data_quality_status": "VALIDATED" if case.data_quality_index >= 0.90 else "DEGRADED"
    }

@router.get("/{case_id}/evidence-graph")
def get_case_evidence_graph(case_id: str, current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")
    return EvidenceGraphSynthesizer.build_evidence_graph_for_case(case)

@router.get("/{case_id}/brief")
def get_case_brief(case_id: str, current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")
    claims = db.get_claims_for_provider(case.target_entity_id)
    return AIEvidenceBriefGenerator.generate_brief(case, claims)

@router.get("/{case_id}/claims")
def get_case_claims(
    case_id: str, 
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")
    claims = db.get_claims_for_provider(case.target_entity_id)
    paginated = claims[offset:offset+limit]
    return {
        "total_claims": len(claims),
        "limit": limit,
        "offset": offset,
        "claims": paginated
    }

@router.post("/{case_id}/decision")
def record_investigator_decision(
    case_id: str,
    req: InvestigatorDecisionRequest,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    case = db.get_case(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Case {case_id} not found")
        
    case.status = "UNDER_INVESTIGATION" if "AUDIT" in req.decision else "ESCALATED"
    case.investigator_notes = req.investigator_notes
    case.feedback_disposition = req.disposition
    case.updated_at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    
    # Record to feedback store
    fb_entry = feedback_store.record_feedback(
        case_id=case_id,
        user_id=current_user.user_id,
        disposition=req.disposition,
        notes=req.investigator_notes,
        recommended_action=req.recommended_action
    )
    
    # Tamper-evident audit log
    audit_entry = TamperEvidentAuditLedger.record_action(
        user=current_user,
        action_type="INVESTIGATOR_DECISION_RECORDED",
        target_resource=case_id,
        details={
            "decision": req.decision,
            "disposition": req.disposition,
            "recommended_action": req.recommended_action,
            "notes": req.investigator_notes
        }
    )
    
    return {
        "status": "SUCCESS",
        "case_id": case_id,
        "updated_case_status": case.status,
        "audit_log_id": audit_entry.log_id,
        "merkle_current_hash": audit_entry.current_hash,
        "message": "Human investigator decision safely recorded with full cryptographic provenance."
    }
