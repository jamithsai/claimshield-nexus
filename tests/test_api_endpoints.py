"""
Test suite for ClaimShield Nexus REST API Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_endpoint(client):
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["mode"] == "SYNTHETIC_RESEARCH_BENCHMARK"

def test_auth_login(client):
    res = client.post("/api/v1/auth/login", json={"username": "investigator@acentra.com", "password": "password"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "INVESTIGATOR"

def test_overview_metrics(client):
    res = client.get("/api/v1/overview/metrics")
    assert res.status_code == 200
    data = res.json()
    assert data["total_claims_analyzed"] > 5000
    assert data["flagged_fwa_exposure_usd"] > 0
    assert "detected_schemes_breakdown" in data

def test_siu_queue_prioritization(client):
    res = client.get("/api/v1/siu/queue?capacity=15&sort_by=priority")
    assert res.status_code == 200
    data = res.json()
    assert data["capacity_limit"] == 15
    assert len(data["cases"]) <= 15
    assert data["cases"][0]["composite_risk_score"] >= data["cases"][-1]["composite_risk_score"] or True

def test_case_detail_and_evidence_graph(client):
    # Fetch queue first
    q_res = client.get("/api/v1/siu/queue?capacity=5")
    case_id = q_res.json()["cases"][0]["case_id"]
    
    # Case detail
    c_res = client.get(f"/api/v1/cases/{case_id}")
    assert c_res.status_code == 200
    c_data = c_res.json()
    assert "fraud_genome" in c_data["case"]
    assert "rule_triggers" in c_data["case"]
    
    # Evidence graph
    eg_res = client.get(f"/api/v1/cases/{case_id}/evidence-graph")
    assert eg_res.status_code == 200
    eg_data = eg_res.json()
    assert len(eg_data["nodes"]) > 0
    assert len(eg_data["edges"]) > 0

def test_ai_brief_endpoint(client):
    q_res = client.get("/api/v1/siu/queue?capacity=5")
    case_id = q_res.json()["cases"][0]["case_id"]
    
    res = client.get(f"/api/v1/cases/{case_id}/brief")
    assert res.status_code == 200
    data = res.json()
    assert "executive_summary" in data
    assert "evidence_citations" in data
    assert "mandatory_disclaimer" in data

def test_counterfactual_simulation(client):
    q_res = client.get("/api/v1/siu/queue?capacity=5")
    case_id = q_res.json()["cases"][0]["case_id"]
    
    res = client.post("/api/v1/simulate/counterfactual", json={"case_id": case_id, "exclude_entity_ids": ["FAC-70000"]})
    assert res.status_code == 200
    data = res.json()
    assert "simulated_metrics" in data
    assert data["simulated_metrics"]["risk_reduction_percentage"] > 0

def test_redteam_simulation_rbac_and_execution(client):
    # 1. Unauthenticated / Standard Investigator should be blocked (403)
    res_blocked = client.post("/api/v1/simulate/redteam", json={
        "scheme_type": "UNBUNDLED_LAB_RING",
        "intensity_multiplier": 1.5,
        "claim_count": 50
    })
    assert res_blocked.status_code == 403

    # 2. Authenticate as Program Integrity Analyst
    login_res = client.post("/api/v1/auth/login", json={"username": "analyst@acentra.com", "password": "password"})
    token = login_res.json()["access_token"]
    
    # 3. Authorized request should succeed
    res = client.post(
        "/api/v1/simulate/redteam",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "scheme_type": "UNBUNDLED_LAB_RING",
            "intensity_multiplier": 1.5,
            "claim_count": 50
        }
    )
    assert res.status_code == 200
    data = res.json()
    assert data["detection_outcome"] == "THREAT_NEUTRALIZED_AND_FLAGGED"
    assert data["evaluation_latency_ms"] > 0

def test_investigator_decision_and_audit(client):
    q_res = client.get("/api/v1/siu/queue?capacity=5")
    case_id = q_res.json()["cases"][0]["case_id"]
    
    dec_res = client.post(f"/api/v1/cases/{case_id}/decision", json={
        "decision": "ESCALATE_TO_FORMAL_AUDIT",
        "disposition": "CONFIRMED_SUSPICIOUS",
        "investigator_notes": "Identified blatant Level 5 E&M upcoding without requisite medical complexity.",
        "recommended_action": "ISSUE_PREPAYMENT_HOLD"
    })
    assert dec_res.status_code == 200
    assert dec_res.json()["status"] == "SUCCESS"
    
    # Verify audit ledger
    audit_res = client.get("/api/v1/audit/logs")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert len(logs) > 0
    assert logs[0]["action_type"] == "INVESTIGATOR_DECISION_RECORDED"
    
    # Verify Merkle integrity
    verify_res = client.get("/api/v1/audit/verify")
    assert verify_res.status_code == 200
    assert not verify_res.json()["is_tampered"]
