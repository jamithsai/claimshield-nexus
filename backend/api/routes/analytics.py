"""
ClaimShield Nexus — Analytics & Detector Performance Routes
"""

from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from backend.data.database import db
from backend.engine.analytics.performance import DetectorPerformanceCenter
from backend.engine.workflow.feedback import feedback_store
from backend.security.auth import get_current_user, User

router = APIRouter(prefix="/analytics", tags=["Analytics & Performance"])

@router.get("/detector-perf")
def get_detector_performance_metrics(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    cases = db.list_cases()
    return DetectorPerformanceCenter.calculate_performance_metrics(cases)

@router.get("/dqi-report")
def get_data_quality_report(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    return {
        "overall_dqi": db.dqi_overall,
        "report_details": db.dqi_report
    }

@router.get("/feedback-ledger")
def list_investigator_feedback(current_user: User = Depends(get_current_user)) -> List[Dict[str, Any]]:
    return feedback_store.list_feedbacks()
