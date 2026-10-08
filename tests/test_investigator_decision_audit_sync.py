"""
ClaimShield Nexus — Regression Test Suite for Investigator Decision -> Audit Trail Sync
Verifies end-to-end cryptographic provenance, ledger insertion, retrieval, and Merkle chain validity.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_investigator_decision_creates_audit_entry_and_preserves_merkle_chain(client):
    # 1. Login as investigator
    login_res = client.post("/api/v1/auth/login", json={"username": "investigator@acentra.com"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Fetch a case to investigate
    queue_res = client.get("/api/v1/siu/queue?capacity=5", headers=headers)
    assert queue_res.status_code == 200
    cases = queue_res.json()["cases"]
    assert len(cases) > 0
    case_id = cases[0]["case_id"]

    # 3. Check baseline audit log count
    audit_init_res = client.get("/api/v1/audit/logs?limit=100", headers=headers)
    assert audit_init_res.status_code == 200
    initial_logs = audit_init_res.json()
    initial_count = len(initial_logs)

    # 4. Submit real investigator decision (Prepayment Hold)
    decision_payload = {
        "decision": "ESCALATE_TO_FORMAL_AUDIT",
        "disposition": "CONFIRMED_SUSPICIOUS",
        "investigator_notes": "Clinical chart review confirms systematic upcoding to CPT 99215 without requisite diagnostic complexity under 42 CFR § 455.23.",
        "recommended_action": "ISSUE_PREPAYMENT_MEDICAL_REVIEW_HOLD",
        "feedback_category": "CORRECT_DETECTION"
    }
    dec_res = client.post(f"/api/v1/cases/{case_id}/decision", json=decision_payload, headers=headers)
    assert dec_res.status_code == 200
    dec_data = dec_res.json()
    assert dec_data["status"] == "SUCCESS"
    assert dec_data["case_id"] == case_id
    assert "audit_log_id" in dec_data
    assert "merkle_current_hash" in dec_data
    created_log_id = dec_data["audit_log_id"]

    # 5. Verify audit logs contains newly created decision record
    audit_after_res = client.get("/api/v1/audit/logs?limit=100", headers=headers)
    assert audit_after_res.status_code == 200
    updated_logs = audit_after_res.json()
    assert len(updated_logs) > initial_count

    # Find the specific created audit entry
    decision_log = next((l for l in updated_logs if l["log_id"] == created_log_id), None)
    assert decision_log is not None
    assert decision_log["action_type"] == "INVESTIGATOR_DECISION_RECORDED"
    assert decision_log["target_resource"] == case_id
    assert decision_log["actor_username"] == "investigator@acentra.com"
    assert decision_log["details"]["disposition"] == "CONFIRMED_SUSPICIOUS"
    assert decision_log["details"]["recommended_action"] == "ISSUE_PREPAYMENT_MEDICAL_REVIEW_HOLD"
    assert "42 CFR § 455.23" in decision_log["details"]["notes"]
    assert decision_log["current_hash"] == dec_data["merkle_current_hash"]

    # 6. Verify Merkle chain mathematical integrity
    verify_res = client.get("/api/v1/audit/verify", headers=headers)
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["status"] == "VALID_MERKLE_CHAIN"
    assert not verify_data["is_tampered"]
    assert verify_data["total_entries"] == len(updated_logs)

def test_multiple_decision_types_in_audit_ledger(client):
    # Test second case with different disposition (Referral to OIG / Law Enforcement)
    login_res = client.post("/api/v1/auth/login", json={"username": "senior@acentra.com"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    queue_res = client.get("/api/v1/siu/queue?capacity=5", headers=headers)
    cases = queue_res.json()["cases"]
    target_case_id = cases[1]["case_id"] if len(cases) > 1 else cases[0]["case_id"]

    oig_payload = {
        "decision": "REFER_TO_OIG_LEGAL",
        "disposition": "REFERRED_TO_OIG_LE",
        "investigator_notes": "Cross-facility kickback ring confirmed with Apex Labs. Evidence package assembled for DOJ referral.",
        "recommended_action": "REFERRAL_TO_OIG_DOJ",
        "feedback_category": "CORRECT_DETECTION"
    }
    res = client.post(f"/api/v1/cases/{target_case_id}/decision", json=oig_payload, headers=headers)
    assert res.status_code == 200
    log_id = res.json()["audit_log_id"]

    # Verify audit retrieval
    audit_res = client.get("/api/v1/audit/logs?limit=50", headers=headers)
    logs = audit_res.json()
    matching_log = next((l for l in logs if l["log_id"] == log_id), None)
    assert matching_log is not None
    assert matching_log["details"]["disposition"] == "REFERRED_TO_OIG_LE"
    assert matching_log["actor_username"] == "senior@acentra.com"

    # Verify Merkle integrity remains valid
    verify_res = client.get("/api/v1/audit/verify", headers=headers)
    assert verify_res.json()["status"] == "VALID_MERKLE_CHAIN"
    assert not verify_res.json()["is_tampered"]
