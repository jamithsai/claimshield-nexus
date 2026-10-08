# ClaimShield Nexus — Enterprise Security & Compliance Architecture

## 1. Security Architecture & Threat Model

ClaimShield Nexus operates in the high-stakes domain of Healthcare Program Integrity and Special Investigation Units (SIU). The platform implements defense-in-depth security principles to protect against insider threats, unauthorized data modifications, unauthorized operational actions, and algorithmic bias.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT / BROWSER TIERS                            │
│  - HTTPS / TLS 1.3  - Strict CSP  - Sanitized Inputs  - Role-Bound UI State │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ JWT Bearer Token (HMAC-SHA256)
┌─────────────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY & SECURITY MIDDLEWARE                       │
│  - Token Verification  - Rate Limiting  - Request Validation  - CORS Policy │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ Role Claim Extraction
┌─────────────────────────────────────────────────────────────────────────────┐
│                      ROLE-BASED ACCESS CONTROL (RBAC)                       │
│  - Endpoint Route Guards  - Least-Privilege Gatekeeper  - 4 Tiered Roles    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼ Authorized Execution
┌─────────────────────────────────────────────────────────────────────────────┐
│                    IMMUTABLE AUDIT LOGGING (MERKLE CHAIN)                   │
│  - Cryptographic Hash Chain (SHA-256)  - Tamper Detection  - User Provenance│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Role-Based Access Control (RBAC) Matrix

ClaimShield Nexus defines 4 distinct enterprise personas:

| Action / Capability | Investigator | Senior Investigator | Program Integrity Analyst | System Admin |
|---|:---:|:---:|:---:|:---:|
| **View Executive Metrics & Queue** | ✅ | ✅ | ✅ | ✅ |
| **Inspect Case Details & Genome** | ✅ | ✅ | ✅ | ✅ |
| **View Evidence Graph & Citations** | ✅ | ✅ | ✅ | ✅ |
| **Submit Case Notes & Disposition** | ✅ | ✅ | ✅ | ❌ |
| **Approve Formal Prepayment Hold** | ❌ | ✅ | ❌ | ✅ |
| **Refer Case to Law Enforcement (OIG)** | ❌ | ✅ | ❌ | ❌ |
| **Run Counterfactual Simulator** | ✅ | ✅ | ✅ | ✅ |
| **Run Red-Team Threat Simulator** | ❌ | ❌ | ✅ | ✅ |
| **Calibrate Rule Weights & Thresholds** | ❌ | ❌ | ✅ | ✅ |
| **Retrain / Re-tune ML Anomaly Models** | ❌ | ❌ | ✅ | ✅ |
| **Inspect Tamper-Evident Audit Ledger** | ❌ | ✅ | ✅ | ✅ |
| **Manage Users & Role Assignments** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Authentication & Session Protocol
- **Token Mechanism**: Standard JSON Web Tokens (JWT) signed with HMAC-SHA256 (`HS256`) and cryptographically secure entropy secrets.
- **Token Expiry**: Default session window of 8 hours (28,800 seconds) aligned with standard investigator shifts.
- **Bearer Dependency**: FastAPI `Depends(get_current_active_user)` and `Depends(require_role(role_list))` enforce declarative security directly on backend routes. Client-side state cannot bypass backend validation.

---

## 4. Responsible AI & Operational Safety Mandates
1. **No Autonomous Sanctions (REQ-M & REQ-N)**:
   - ClaimShield Nexus strictly prohibits any direct, automated denial of claims, suspension of provider billing licenses, or automatic financial recoupment without affirmative human review and dual-authorization where high-impact actions occur.
2. **Standardized Guardrail Terminology**:
   - The system is programmatically constrained from outputting definitive claims of "Fraud Confirmed" by an AI model. All analytical outputs are classified as **"Potential FWA Anomaly Indicators"**, **"Elevated Risk Behavior"**, or **"Suspicious Coordinated Pattern"**.
3. **Mandated Universal Disclaimer**:
   > *"This system identifies indicators associated with potential Fraud, Waste, and Abuse (FWA). It does not establish legal fraud. Human investigation and clinical chart review are required prior to any operational or adverse administrative action."*

---

## 5. Data Privacy & Synthetic Integrity
- **100% Synthetic Data Guarantee (REQ-A)**:
  - All patient names, provider NPIs, facility addresses, and claim financial amounts are synthetically generated through Faker and CMS statistical benchmarks.
  - Zero Real Protected Health Information (PHI) or Personally Identifiable Information (PII) is ingested, processed, or stored.
- **Dataset Identification & Segregation**:
  - Every response header includes `X-Data-Classification: SYNTHETIC_RESEARCH_BENCHMARK`.

---

## 6. Tamper-Evident Cryptographic Audit Ledger
To guarantee complete accountability and evidentiary admissibility for SIU investigations, all actions are written to an append-only audit stream with cryptographic chaining:

$$\text{Hash}_n = \text{SHA256}(\text{LogID}_n \parallel \text{Timestamp}_n \parallel \text{ActorID}_n \parallel \text{ActionType}_n \parallel \text{Payload}_n \parallel \text{Hash}_{n-1})$$

- If any record is modified, deleted, or inserted out of order, the Merkle chain verification immediately fails and alerts system administrators.
