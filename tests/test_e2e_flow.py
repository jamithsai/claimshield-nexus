"""
Comprehensive End-to-End Flow Verification Test for ClaimShield Nexus
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_complete_investigator_e2e_journey(client):
    # Step 1: Health Check & System Status
    health = client.get("/api/v1/health").json()
    assert health["status"] == "HEALTHY"
    assert health["mode"] == "SYNTHETIC_RESEARCH_BENCHMARK"

    # Step 2: Investigator Login & Token Acquisition
    login_res = client.post("/api/v1/auth/login", json={"username": "investigator@acentra.com"})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Executive Program Integrity Overview
    overview = client.get("/api/v1/overview/metrics", headers=headers).json()
    assert overview["total_claims_analyzed"] > 10000
    assert overview["flagged_fwa_exposure_usd"] > 100000.0
    assert overview["critical_risk_entities_count"] > 0

    # Step 4: SIU Priority Queue Query (Capacity-Constrained)
    queue = client.get("/api/v1/siu/queue?capacity=10&sort_by=priority", headers=headers).json()
    assert queue["allocated_count"] == 10
    top_case = queue["cases"][0]
    case_id = top_case["case_id"]
    assert top_case["composite_risk_score"] > 70.0
    assert top_case["risk_velocity"] > 0

    # Step 5: Deep Case Workspace Inspection
    case_detail = client.get(f"/api/v1/cases/{case_id}", headers=headers).json()
    assert case_detail["case"]["case_id"] == case_id
    assert "fraud_genome" in case_detail["case"]
    assert "scheme_similarity" in case_detail

    # Step 6: Evidence Graph Provenance
    evidence = client.get(f"/api/v1/cases/{case_id}/evidence-graph", headers=headers).json()
    assert len(evidence["nodes"]) > 0
    assert len(evidence["edges"]) > 0

    # Step 7: Guardrailed AI Brief
    brief = client.get(f"/api/v1/cases/{case_id}/brief", headers=headers).json()
    assert "executive_summary" in brief
    assert "mandatory_disclaimer" in brief
    assert len(brief["evidence_citations"]) > 0

    # Step 8: Counterfactual What-If Simulation
    cf = client.post(
        "/api/v1/simulate/counterfactual",
        headers=headers,
        json={"case_id": case_id, "exclude_entity_ids": ["FAC-70000"]}
    ).json()
    assert cf["simulated_metrics"]["risk_reduction_percentage"] > 0

    # Step 9: Red-Team Threat Injection (with Analyst Token)
    analyst_token = client.post("/api/v1/auth/login", json={"username": "analyst@acentra.com"}).json()["access_token"]
    redteam = client.post(
        "/api/v1/simulate/redteam",
        headers={"Authorization": f"Bearer {analyst_token}"},
        json={"scheme_type": "UNBUNDLED_LAB_RING", "intensity_multiplier": 1.5, "claim_count": 40}
    ).json()
    assert redteam["detection_outcome"] == "THREAT_NEUTRALIZED_AND_FLAGGED"

    # Step 10: Human Investigator Decision & Cryptographic Signing
    decision_res = client.post(
        f"/api/v1/cases/{case_id}/decision",
        headers=headers,
        json={
            "decision": "ESCALATE_TO_FORMAL_AUDIT",
            "disposition": "CONFIRMED_SUSPICIOUS",
            "investigator_notes": "Blatant E&M Level 5 upcoding and unbundled lab panel fragmentation confirmed across 50 claim samples.",
            "recommended_action": "ISSUE_PREPAYMENT_MEDICAL_REVIEW_HOLD"
        }
    ).json()
    assert decision_res["status"] == "SUCCESS"
    assert "audit_log_id" in decision_res

    # Step 11: Tamper-Evident Audit Ledger & Merkle Chain Integrity Verification
    integrity = client.get("/api/v1/audit/verify", headers=headers).json()
    assert integrity["status"] == "VALID_MERKLE_CHAIN"
    assert not integrity["is_tampered"]
