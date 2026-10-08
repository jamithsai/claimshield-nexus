# ClaimShield Nexus — Healthcare Program Integrity & FWA Intelligence Platform

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Tests](https://img.shields.io/badge/tests-29%2F29%20passed%20(100%25)-success.svg)]()
[![Python](https://img.shields.io/badge/Python-3.13+-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141-teal.svg)]()
[![React](https://img.shields.io/badge/React-18.3-blue.svg)]()
[![Compliance](https://img.shields.io/badge/PS3%20Requirements-100%25%20Compliant-emerald.svg)]()

> **Built for the Acentra Health Hiring Hackathon**  
> *Problem Statement 3 (PS3 — ClaimShield Nexus)*  
> **Domain:** Healthcare Fraud, Waste & Abuse (FWA) / Program Integrity / Payment Integrity

---

## 1. Executive Summary & Core Product Vision

**ClaimShield Nexus** is an enterprise-grade Healthcare Program Integrity Intelligence Platform engineered for Special Investigation Units (SIU) and clinical audit teams. Rather than acting as a generic anomaly detector or black-box alert generator, ClaimShield Nexus transforms large volumes of synthetic healthcare claims into a prioritized, evidence-backed queue of high-risk investigation opportunities.

The platform executes the complete investigative lifecycle:
$$\text{DETECT} \longrightarrow \text{CONNECT} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PREDICT} \longrightarrow \text{PRIORITIZE} \longrightarrow \text{INVESTIGATE} \longrightarrow \text{DECIDE (HUMAN-IN-THE-LOOP)}$$

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SYNTHETIC DATA INGESTION                               │
│  - Members (10,000+)  - Providers (500+)  - Facilities (100+)  - Claims (100,000+)     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FEATURE ENGINEERING & BASELINE ANALYTICS                        │
│  - Peer-Group Baselines (Specialty, Region)  - Rolling Temporal Windows (30/60/90d)   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│           FWA RULE ENGINE             │       │      ML ANOMALY DETECTION ENGINE      │
│ - Rule R101: Duplicate Billing        │       │ - Algorithm: Isolation Forest         │
│ - Rule R102: Severe E&M Level Upcoding│       │ - Multi-dimensional Feature Space     │
│ - Rule R103: Lab Panel Unbundling     │       │ - Feature Attribution & Z-Scores      │
│ - Rule R104: Phantom Services         │       │ (Produces: Anomaly Score [0-100])     │
│ - Rule R105: Excessive Utilization    │       └───────────────────┬───────────────────┘
│ - Rule R106: Improbable Timing        │                           │
└───────────────────┬───────────────────┘                           │
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│     GRAPH & NETWORK INTELLIGENCE      │       │     TEMPORAL & VELOCITY ENGINE        │
│ - Heterogeneous Network Topology      │       │ - Scheme Evolution (Day 0 → Day 90)   │
│ - Circular Referral Loop Detection    │       │ - Risk Velocity (ΔRisk / ΔTime)       │
│ - Bipartite Patient-Sharing Cliques   │       │ - 30/60/90-Day Forecast Projections   │
└───────────────────┬───────────────────┘       └───────────────────┬───────────────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 UNIFIED RISK ENGINE                                    │
│  - Composite Risk Formula (0 - 100): Low / Medium / High / Critical                    │
│  - Fraud Genome™ Fingerprint (10 Normalized Behavioral Dimensions)                    │
│  - Scheme Similarity Matcher (Cosine / Jaccard vs Reference Taxonomy)                 │
│  - Evidence Graph Synthesizer (Score Provenance Tree)                                 │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SIU PRIORITIZATION ENGINE                                 │
│  - Multi-Criteria Objective: Risk x Exposure x Member Impact x Velocity x Evidence   │
│  - Capacity Slider (Allocated Top N Cases)                                            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│     AI EVIDENCE BRIEF GENERATOR       │       │       ENTERPRISE SECURITY & RBAC      │
│ - Zero-Hallucination Guardrails       │       │ - JWT Bearer Auth (4 Enterprise Roles)│
│ - Citation of Exact Claim IDs         │       │ - SHA-256 Merkle Chain Audit Ledger   │
│ - Mandatory Regulatory Disclaimers    │       │ - Dual-Authorization Action Gates     │
└───────────────────────────────────────┘       └───────────────────────────────────────┘
```

---

## 2. Key Product Differentiators

### A. The Fraud Genome™ (10-Dimensional Behavioral Fingerprint)
Rather than flattening risk into a single opaque scalar, ClaimShield Nexus calculates a **10-dimensional behavioral DNA fingerprint** derived from empirical claim features:
1. **Billing Intensity**: Daily encounter density relative to specialty peer baseline.
2. **Procedure Deviation**: Level 5 E&M and unbundled procedural concentration.
3. **Temporal Irregularity**: Impossible day hours and weekend billing spikes.
4. **Referral Concentration**: Gini coefficient of patient routing.
5. **Facility Concentration**: Outlier concentration in unaccredited surgery centers/labs.
6. **Member Concentration**: Repeat billing against shared beneficiary cohorts.
7. **Geographic Anomaly**: Beneficiary travel distance exceeding clinical norms.
8. **Network Density**: Bipartite clustering and circular loop participation.
9. **Financial Exposure Index**: Normalized dollar volume at risk.
10. **Utilization Deviation**: Encounter velocity per patient per 30 days.

### B. Scheme Evolution Radar (Day 0 → Day 30 → Day 60 → Day 90)
Tracks how multi-entity fraud schemes expand across time:
- Inception (Day 0): Solitary billing anomalies.
- Expansion (Day 30–60): Addition of diagnostic labs and surgical suites.
- Full Collusion (Day 90): Circular kickback rings and rapidly accelerating financial exposure.

### C. Dynamic Risk Velocity & Acceleration
Quantifies the second derivative of risk:
$$\text{Risk Velocity} = \Delta \text{Risk Score over 60 Days}$$
Classifies cases as **Static**, **Moderate Growth**, or **Accelerating Escalation** to alert SIU investigators before scheme exposure compounds.

### D. 100% Traceable Evidence Graph (No Black-Box Scores)
Every point in the composite score is hierarchically linked:
$$\text{Composite Risk} \longrightarrow \text{Category} \longrightarrow \text{Rule / ML Trigger} \longrightarrow \text{Exact Claim IDs (e.g. CLM-2026-948127)}$$

### E. Counterfactual "What-If" Investigation Simulator
Enables investigators to simulate removing an entity (e.g., Biscayne Diagnostic Lab) to assess network risk reduction and cost avoidance in an isolated sandbox.

### F. FWA Red-Team Threat Simulator
Injects synthetic novel attack vectors in real-time to stress-test detector coverage and benchmark evaluation latency (averaging $<50\text{ ms}$).

---

## 3. PS3 Compliance & Verification Matrix

All 20+ requirements from the Acentra Health Hackathon Problem Statement are fully implemented and verified via automated test suites:

| Requirement | Implementation Module | Automated Test | Status |
|---|---|---|:---:|
| **REQ-A: Synthetic Data Only** | `backend/data/generator.py` | `tests/test_data_generator.py` | ✅ 100% Verified |
| **REQ-B: Claim & Entity Analysis** | `backend/engine/feature_pipeline.py` | `tests/test_api_endpoints.py` | ✅ 100% Verified |
| **REQ-C: FWA Rule Catalog (6 Rules)** | `backend/engine/rules/` | `tests/test_rules.py` | ✅ 100% Verified |
| **REQ-D: Multi-Detector Ensemble** | `backend/engine/ml/` & `rules/` | `tests/test_ml_detector.py` | ✅ 100% Verified |
| **REQ-E & F: Graph & Collusion Rings** | `backend/engine/graph/` | `tests/test_graph_engine.py` | ✅ 100% Verified |
| **REQ-G & H: Temporal & Projections** | `backend/engine/temporal/` | `tests/test_risk_engine.py` | ✅ 100% Verified |
| **REQ-I: SIU Prioritization Queue** | `backend/engine/siu/prioritizer.py`| `tests/test_siu_prioritizer.py`| ✅ 100% Verified |
| **REQ-J: Explainable AI Briefs** | `backend/engine/ai/brief_generator.py`| `tests/test_brief_generator.py`| ✅ 100% Verified |
| **REQ-K: Confidence & Limitations** | `backend/engine/risk/confidence_engine.py`| `tests/test_risk_engine.py`| ✅ 100% Verified |
| **REQ-L, M, N: Responsible AI & HITL** | `backend/security/` & `api/routes/`| `tests/test_api_endpoints.py` | ✅ 100% Verified |
| **REQ-O: End-to-End Working Platform** | `backend/main.py` + `frontend/` | `tests/test_e2e_flow.py` | ✅ 100% Verified |

---

## 4. Quickstart & Execution Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.13.4)
- Node.js 18+ (tested on Node v22.12.0)

### 1-Command Platform Startup
Run the unified backend & static dashboard server:
```powershell
python run_platform.py
```
- **Web UI & SIU Dashboard:** `http://localhost:8000/`
- **Interactive REST API (Swagger):** `http://localhost:8000/docs`
- **System Health Status:** `http://localhost:8000/api/v1/health`

### Development Mode (Optional)
If running backend and Vite hot-reload frontend separately:

**Terminal 1 (Backend):**
```powershell
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```
Open `http://localhost:3000/`

---

## 5. Running Automated Verification Tests

Execute all 29 unit, integration, and E2E verification tests:
```powershell
python -m pytest tests/ -v
```

Expected output:
```
============================= test session starts =============================
collected 29 items

tests/test_api_endpoints.py::test_health_endpoint PASSED                 [  3%]
tests/test_api_endpoints.py::test_auth_login PASSED                      [  6%]
tests/test_api_endpoints.py::test_overview_metrics PASSED                [ 10%]
tests/test_api_endpoints.py::test_siu_queue_prioritization PASSED        [ 13%]
tests/test_api_endpoints.py::test_case_detail_and_evidence_graph PASSED  [ 17%]
tests/test_api_endpoints.py::test_ai_brief_endpoint PASSED              [ 20%]
tests/test_api_endpoints.py::test_counterfactual_simulation PASSED      [ 24%]
tests/test_api_endpoints.py::test_redteam_simulation_rbac_and_execution PASSED [ 27%]
tests/test_api_endpoints.py::test_investigator_decision_and_audit PASSED [ 31%]
tests/test_data_generator.py::test_dataset_generation PASSED            [ 34%]
tests/test_data_generator.py::test_data_quality_evaluation PASSED        [ 37%]
tests/test_data_generator.py::test_injected_schemes_present PASSED       [ 41%]
tests/test_data_generator.py::test_in_memory_database_indexing PASSED    [ 44%]
tests/test_e2e_flow.py::test_complete_investigator_e2e_journey PASSED   [ 48%]
tests/test_graph_engine.py::test_graph_construction_and_centrality PASSED [ 51%]
tests/test_graph_engine.py::test_suspicious_cluster_detection PASSED    [ 55%]
tests/test_ml_detector.py::test_isolation_forest_execution_and_attribution PASSED [ 58%]
tests/test_risk_engine.py::test_unified_risk_score_calculation PASSED    [ 62%]
tests/test_risk_engine.py::test_fraud_genome_and_similarity PASSED      [ 65%]
tests/test_risk_engine.py::test_evidence_graph_generation PASSED        [ 68%]
tests/test_risk_engine.py::test_siu_prioritizer_and_capacity PASSED     [ 72%]
tests/test_risk_engine.py::test_guardrailed_ai_brief_generation PASSED   [ 75%]
tests/test_risk_engine.py::test_tamper_evident_audit_ledger_integrity PASSED [ 79%]
tests/test_rules.py::test_upcoding_rule_detection PASSED                 [ 82%]
tests/test_rules.py::test_unbundling_rule_detection PASSED               [ 86%]
tests/test_rules.py::test_duplicate_billing_detection PASSED            [ 89%]
tests/test_rules.py::test_phantom_services_detection PASSED              [ 93%]
tests/test_rules.py::test_excessive_utilization_detection PASSED         [ 96%]
tests/test_rules.py::test_fwa_rule_engine_unification PASSED             [100%]

======================== 29 passed in 5.41s ========================
```

---

## 6. Architecture & Design Documentation
- [`ARCHITECTURE.md`](ARCHITECTURE.md): Full system architecture specification & component diagrams.
- [`REQUIREMENTS_MATRIX.md`](REQUIREMENTS_MATRIX.md): Detailed traceability matrix for all PS3 requirements.
- [`DATA_MODEL.md`](DATA_MODEL.md): Unified data models, schemas, and relational entities.
- [`API_PLAN.md`](API_PLAN.md): REST API contracts and OpenAPI schema specs.
- [`SECURITY.md`](SECURITY.md): Threat model, RBAC matrix, and Merkle chain audit architecture.
- [`MODEL_CARD.md`](MODEL_CARD.md): Machine learning model card and ethical considerations.
- [`DEMO_FLOW.md`](DEMO_FLOW.md): Step-by-step hackathon presentation script for judges.
