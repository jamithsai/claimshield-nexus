"""
ClaimShield Nexus — Cryptographic Audit Trail API Routes
"""

from fastapi import APIRouter, Depends, Query
from typing import Dict, Any, List
from backend.data.models import AuditLogEntry
from backend.data.database import db
from backend.security.audit import TamperEvidentAuditLedger
from backend.security.auth import get_current_user, User

router = APIRouter(prefix="/audit", tags=["Audit Trail"])

@router.get("/logs", response_model=List[AuditLogEntry])
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user)
):
    # Returns most recent logs first
    return db.audit_logs[-limit:][::-1]

@router.get("/verify")
def verify_audit_ledger_integrity(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    return TamperEvidentAuditLedger.verify_chain_integrity()
