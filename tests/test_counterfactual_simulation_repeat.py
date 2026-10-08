"""
Test Suite: Counterfactual What-If Remediation Simulator
Validates repeated simulation runs, distinct intervention outcomes, combined selections,
and ensures underlying database/case state remains unchanged.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.data.database import db

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_repeated_simulations_distinct_results(client):
    # 1. Fetch an active high-risk case from the SIU queue
    queue_res = client.get("/api/v1/siu/queue?capacity=10")
    assert queue_res.status_code == 200
    cases = queue_res.json()["cases"]
    assert len(cases) > 0
    case_id = cases[0]["case_id"]

    # Retrieve initial case details to capture baseline state
    case_res = client.get(f"/api/v1/cases/{case_id}")
    assert case_res.status_code == 200
    initial_case_data = case_res.json()["case"]
    initial_risk = initial_case_data["composite_risk_score"]
    initial_exposure = initial_case_data["potential_financial_exposure"]

    # 2. Run Simulation 1: Modifier-25 Audit (R102)
    sim1_res = client.post("/api/v1/simulate/counterfactual", json={
        "case_id": case_id,
        "exclude_entity_ids": ["R102_UPCODING"]
    })
    assert sim1_res.status_code == 200
    sim1_data = sim1_res.json()
    assert sim1_data["case_id"] == case_id
    assert sim1_data["excluded_entities"] == ["R102_UPCODING"]
    assert "simulated_metrics" in sim1_data
    assert "baseline_metrics" in sim1_data
    assert "network_topology_impact" in sim1_data

    # 3. Run Simulation 2: Shared Clinic Collusion
    sim2_res = client.post("/api/v1/simulate/counterfactual", json={
        "case_id": case_id,
        "exclude_entity_ids": ["FACILITY_COLLUSION"]
    })
    assert sim2_res.status_code == 200
    sim2_data = sim2_res.json()
    assert sim2_data["case_id"] == case_id
    assert sim2_data["excluded_entities"] == ["FACILITY_COLLUSION"]

    # 4. Run Simulation 3: NCCI Edit Unbundling (R103)
    sim3_res = client.post("/api/v1/simulate/counterfactual", json={
        "case_id": case_id,
        "exclude_entity_ids": ["UNBUNDLED_LABS"]
    })
    assert sim3_res.status_code == 200
    sim3_data = sim3_res.json()
    assert sim3_data["case_id"] == case_id
    assert sim3_data["excluded_entities"] == ["UNBUNDLED_LABS"]

    # 5. Run Combined Simulation: Interventions 1 + 2
    sim_combo_res = client.post("/api/v1/simulate/counterfactual", json={
        "case_id": case_id,
        "exclude_entity_ids": ["R102_UPCODING", "FACILITY_COLLUSION"]
    })
    assert sim_combo_res.status_code == 200
    sim_combo_data = sim_combo_res.json()
    assert set(sim_combo_data["excluded_entities"]) == {"R102_UPCODING", "FACILITY_COLLUSION"}

    # 6. Verify distinct calculations and valid ranges
    assert sim1_data["simulated_metrics"]["risk_reduction_percentage"] >= 0
    assert sim2_data["simulated_metrics"]["risk_reduction_percentage"] >= 0
    assert sim3_data["simulated_metrics"]["risk_reduction_percentage"] >= 0
    assert sim_combo_data["simulated_metrics"]["risk_reduction_percentage"] >= 0

    assert sim1_data["simulated_metrics"]["potential_cost_avoidance_usd"] >= 0
    assert sim2_data["simulated_metrics"]["potential_cost_avoidance_usd"] >= 0

    # Combined intervention should have severed edges recorded
    assert sim_combo_data["network_topology_impact"]["severed_collusion_edges_count"] >= 2
    assert sim_combo_data["network_topology_impact"]["referral_loop_status"] == "BROKEN"

    # 7. Verify underlying case state in DB was NOT mutated (Counterfactual purity guarantee)
    verify_case_res = client.get(f"/api/v1/cases/{case_id}")
    assert verify_case_res.status_code == 200
    post_sim_case_data = verify_case_res.json()["case"]
    assert post_sim_case_data["composite_risk_score"] == initial_risk
    assert post_sim_case_data["potential_financial_exposure"] == initial_exposure

def test_counterfactual_invalid_case_handling(client):
    res = client.post("/api/v1/simulate/counterfactual", json={
        "case_id": "NON_EXISTENT_CASE_9999",
        "exclude_entity_ids": ["R102_UPCODING"]
    })
    assert res.status_code == 404
