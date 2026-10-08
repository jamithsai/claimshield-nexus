"""
ClaimShield Nexus — Investigator Feedback Loop & Calibration Engine
Records human investigator labels (Confirmed Suspicious / False Positive / Needs Info) for model retraining.
"""

from typing import Dict, Any, List
import datetime

class FeedbackStore:
    def __init__(self):
        self.feedbacks: List[Dict[str, Any]] = []

    def record_feedback(
        self, 
        case_id: str, 
        user_id: str, 
        disposition: str, 
        notes: str, 
        recommended_action: str
    ) -> Dict[str, Any]:
        entry = {
            "feedback_id": f"FBK-{len(self.feedbacks) + 1001}",
            "case_id": case_id,
            "user_id": user_id,
            "disposition": disposition,
            "notes": notes,
            "recommended_action": recommended_action,
            "recorded_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "applied_to_retraining_buffer": True
        }
        self.feedbacks.append(entry)
        return entry

    def list_feedbacks(self) -> List[Dict[str, Any]]:
        return self.feedbacks

# Global feedback store
feedback_store = FeedbackStore()
