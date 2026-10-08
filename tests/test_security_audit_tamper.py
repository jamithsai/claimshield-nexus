"""
Dedicated Enterprise Security, RBAC & Cryptographic Merkle Chain Tamper Test Suite
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.data.database import db
from backend.security.auth import create_access_token, User
from backend.security.audit import TamperEvidentAuditLedger, GENESIS_HASH

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_all_four_rbac_roles_permissions(client):
    # Setup test users for all 4 roles
    investigator = User(user_id="U-INV", username="inv@test.com", full_name="Investigator User", role="INVESTIGATOR")
    senior_inv = User(user_id="U-SR", username="senior@test.com", full_name="Senior Inv User", role="SENIOR_INVESTIGATOR")
    analyst = User(user_id="U-AN", username="analyst@test.com", full_name="Analyst User", role="PROGRAM_INTEGRITY_ANALYST")
    admin = User(user_id="U-ADM", username="admin@test.com", full_name="Admin User", role="ADMIN")

    token_inv = create_access_token(investigator)
    token_senior = create_access_token(senior_inv)
    token_analyst = create_access_token(analyst)
    token_admin = create_access_token(admin)

    # 1. Endpoint: /auth/users (Requires ADMIN or SENIOR_INVESTIGATOR)
    # Investigator: 403 Forbidden
    res1 = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {token_inv}"})
    assert res1.status_code == 403

    # Senior Investigator: 200 OK
    res2 = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {token_senior}"})
    assert res2.status_code == 200

    # Admin: 200 OK
    res3 = client.get("/api/v1/auth/users", headers={"Authorization": f"Bearer {token_admin}"})
    assert res3.status_code == 200

    # 2. Endpoint: /simulate/redteam (Requires PROGRAM_INTEGRITY_ANALYST, ADMIN, or SENIOR_INVESTIGATOR)
    # Investigator: 403 Forbidden
    res4 = client.post("/api/v1/simulate/redteam", headers={"Authorization": f"Bearer {token_inv}"}, json={"scheme_type": "UNBUNDLED_LAB_RING"})
    assert res4.status_code == 403

    # Analyst: 200 OK
    res5 = client.post("/api/v1/simulate/redteam", headers={"Authorization": f"Bearer {token_analyst}"}, json={"scheme_type": "UNBUNDLED_LAB_RING"})
    assert res5.status_code == 200

def test_invalid_and_malformed_tokens(client):
    # Garbage token
    res1 = client.get("/api/v1/auth/users", headers={"Authorization": "Bearer invalid_garbage_token_xyz"})
    assert res1.status_code == 401

    # Malformed bearer scheme
    res2 = client.get("/api/v1/auth/users", headers={"Authorization": "Basic dXNlcjpwYXNz"})
    assert res2.status_code in [401, 403]

def test_merkle_chain_tamper_detection():
    # 1. Verify clean chain
    clean_verif = TamperEvidentAuditLedger.verify_chain_integrity()
    assert clean_verif["is_tampered"] is False
    assert clean_verif["status"] == "VALID_MERKLE_CHAIN"

    # Record two clean actions
    user = User(user_id="U-AUD-TEST", username="auditor@test.com", full_name="Auditor", role="ADMIN")
    e1 = TamperEvidentAuditLedger.record_action(user, "TEST_ACTION_1", "RESOURCE_A", {"state": 1})
    e2 = TamperEvidentAuditLedger.record_action(user, "TEST_ACTION_2", "RESOURCE_B", {"state": 2})

    verif_after_add = TamperEvidentAuditLedger.verify_chain_integrity()
    assert verif_after_add["is_tampered"] is False

    # 2. Simulate Malicious Tampering: mutate the payload details of e1 in-memory
    original_details = e1.details
    e1.details = {"state": 999999, "malicious_tamper": True}

    # 3. Verify that Merkle Chain detects payload mismatch immediately
    tampered_verif = TamperEvidentAuditLedger.verify_chain_integrity()
    assert tampered_verif["is_tampered"] is True
    assert "TAMPERING_DETECTED" in tampered_verif["status"]
    assert tampered_verif["tampered_log_id"] == e1.log_id

    # 4. Restore original details to leave ledger in pristine state
    e1.details = original_details
    restored_verif = TamperEvidentAuditLedger.verify_chain_integrity()
    assert restored_verif["is_tampered"] is False
