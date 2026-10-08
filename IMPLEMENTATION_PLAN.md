# ClaimShield Nexus — Comprehensive Implementation Plan & Engineering Roadmap

## 1. Project Overview & Execution Strategy
This plan outlines the staged development of **ClaimShield Nexus** for the Acentra Health hiring hackathon. It guarantees complete compliance with all PS3 core non-negotiables and differentiators within the 24-hour hackathon timeframe.

---

## 2. Phase-by-Phase Roadmap

### Milestone 0: Architecture, Data Contracts & Planning (COMPLETED)
- `ARCHITECTURE.md`, `REQUIREMENTS_MATRIX.md`, `DATA_MODEL.md`, `API_PLAN.md`, `SECURITY.md`, `IMPLEMENTATION_PLAN.md`, `MODEL_CARD.md`, `DEMO_FLOW.md`.

### Milestone 1: High-Fidelity Synthetic Healthcare Data Engine
- **Files**: `backend/data/models.py`, `backend/data/generator.py`, `backend/data/seed_data.py`, `backend/data/validator.py`
- **Deliverables**:
  - Generate 100,000+ realistic synthetic claims across 500+ providers, 100+ facilities, and 10,000+ members.
  - Inject 6 explicit, clinically realistic FWA scheme archetypes:
    1. Severe Level 5 E&M Upcoding (Pain Management NPIs)
    2. Component Lab Panel Unbundling (Toxicology & Chemistry Labs)
    3. Duplicate Billing within 72h window
    4. Phantom Services (Billing while provider on leave / impossible calendar day hours)
    5. Rapid Volume & Utilization Spikes (Sudden 400% jump over 30 days)
    6. Coordinated Kickback & Referral Ring (Circular patient routing between ASC, Lab, and Specialist)
  - Calculate Data Quality Index (DQI) with simulated missingness/corrupted fields to test epistemic uncertainty.
- **Verification**: `tests/test_data_generator.py` validates schema adherence and ground truth scheme injection.

### Milestone 2: Multi-Detector Analytics Engine
- **Files**:
  - `backend/engine/rules/engine.py` + individual rule modules (`upcoding.py`, `unbundling.py`, `duplicate_billing.py`, `phantom_services.py`, `excessive_utilization.py`, `improbable_timing.py`)
  - `backend/engine/ml/isolation_forest.py` (Scikit-Learn Isolation Forest with feature extraction and SHAP-like feature importances)
  - `backend/engine/graph/network_engine.py` (NetworkX graph builder, degree centrality, PageRank, bipartite community detection, circular referral detector)
  - `backend/engine/temporal/tracker.py` & `risk_velocity.py` (Rolling 30/60/90-day trajectory, velocity derivative $\Delta\text{Risk}/\Delta t$)
- **Verification**: `tests/test_rules.py`, `tests/test_ml_detector.py`, `tests/test_graph_engine.py`, `tests/test_temporal.py`.

### Milestone 3: Unified Risk Engine, Fraud Genome & Evidence Graph
- **Files**:
  - `backend/engine/risk/risk_engine.py` (Normalized composite formula with inspectable sub-scores)
  - `backend/engine/risk/fraud_genome.py` (10-dimensional behavioral fingerprint calculation)
  - `backend/engine/risk/evidence_graph.py` (Traceable provenance tree from risk score down to claim IDs)
  - `backend/engine/similarity/matcher.py` (Cosine/Jaccard similarity against catalog of known FWA scheme templates)
  - `backend/engine/temporal/projection.py` (30/60/90-day predictive risk and financial exposure forecasting)
- **Verification**: `tests/test_risk_engine.py`, `tests/test_fraud_genome.py`, `tests/test_evidence_graph.py`.

### Milestone 4: SIU Prioritization & Guardrailed AI Briefs
- **Files**:
  - `backend/engine/siu/prioritizer.py` (Capacity-constrained queue ranking: Risk $\times$ Exposure $\times$ Member Impact $\times$ Evidence $\times$ Velocity)
  - `backend/engine/ai/brief_generator.py` (Deterministic template + LLM synthesis with zero hallucination constraints and mandatory disclaimers)
  - `backend/engine/risk/confidence_engine.py` (Epistemic uncertainty & DQI scoring)
- **Verification**: `tests/test_siu_prioritizer.py`, `tests/test_brief_generator.py`.

### Milestone 5: Enterprise Backend REST API, RBAC & Audit Ledger
- **Files**:
  - `backend/main.py`
  - `backend/security/auth.py` (JWT generation and verification, 4 roles)
  - `backend/security/audit.py` (SHA-256 Merkle chain tamper-evident audit ledger)
  - `backend/api/routes/` (`auth.py`, `overview.py`, `siu.py`, `cases.py`, `graph.py`, `simulation.py`, `analytics.py`, `audit.py`)
- **Verification**: `tests/test_api_endpoints.py`, `tests/test_security_rbac.py`, `tests/test_audit_ledger.py`.

### Milestone 6: High-Fidelity Enterprise SIU Frontend
- **Tech**: React 18, Vite, TypeScript, TailwindCSS, Lucide Icons, Recharts, Custom Graph Visualizer
- **Primary Views**:
  1. Executive / Program Integrity Overview
  2. SIU Command Center & Capacity-Aware Priority Queue
  3. Deep Case Investigation Workspace
  4. Fraud Genome Radar & Dimensional Deep Dive
  5. Scheme Evolution Timeline (Day 0 → Day 30 → Day 60 → Day 90)
  6. Risk Velocity Sparkline & Acceleration Alerts
  7. Interactive Heterogeneous Network Explorer
  8. Evidence Graph (Score-to-Claim Traceability Tree)
  9. 30/60/90-Day Predictive Trajectory & Exposure Forecaster
  10. Guardrailed AI Investigation Brief with One-Click Export
  11. Human Investigator Action Modal & Cryptographic Audit Trail
- **Verification**: Vitest component testing & browser interactive flow verification.

### Milestone 7: Advanced Wow Differentiators
- **Files**:
  - `backend/engine/simulation/counterfactual.py` (What-If Entity Removal simulator)
  - `backend/engine/simulation/redteam.py` (Dynamic novel FWA threat injection & detector stress test)
  - `backend/engine/analytics/performance.py` (Detector Venn overlap, precision/recall, coverage)
  - `backend/engine/workflow/feedback.py` (Investigator feedback loop for model calibration)
- **Verification**: `tests/test_advanced_features.py`.

### Milestone 8: End-to-End System Testing & Verification
- Comprehensive full-suite integration tests (`tests/test_e2e_flow.py`).

---

## 3. Workstream Parallelization Plan

```
Workstream Alpha (Backend & ML Intelligence)
  ├─ Data Generator & Schemas
  ├─ FWA Rule Engine & ML Isolation Forest
  ├─ Graph Intelligence & Centrality
  ├─ Fraud Genome & Unified Risk Engine
  └─ REST API & RBAC Security

Workstream Beta (Frontend & Data Visualization)
  ├─ App Shell, Design Tokens & Auth State
  ├─ Executive Dashboard & SIU Priority Queue
  ├─ Case Deep-Dive & Fraud Genome Radar
  ├─ Interactive Network Explorer & Evidence Tree
  └─ Scheme Evolution & Simulator Interfaces
```

---

## 4. Prioritization & Deferral Boundaries

| Priority | Feature / Module | Status | Hackathon Criticality |
|---|---|---|---|
| **P0** | Synthetic Data, FWA Rules, ML Isolation Forest, Graph Model | Non-Negotiable | Must have 100% working |
| **P0** | Unified Risk Engine, Fraud Genome, Risk Velocity, SIU Queue | Non-Negotiable | Must have 100% working |
| **P0** | Case Workspace, Evidence Graph, AI Briefs, Human Review, Audit | Non-Negotiable | Must have 100% working |
| **P1** | Scheme Evolution Radar (Day 0/30/60/90), 30/60/90 Projections | High Value Differentiator | Core differentiator |
| **P1** | JWT RBAC & Merkle Tamper-Evident Audit Ledger | High Value Differentiator | Enterprise credibility |
| **P2** | Counterfactual Simulator & Red-Team Threat Simulator | Advanced Differentiator | Built on unified graph engine |
| **P2** | Detector Performance Center & Investigator Feedback Loop | Advanced Differentiator | Built on analytical engine |
| **P3** | Multi-Region Geographical Heatmap Clustered Tiles | Optional Cosmetic | Can be simplified to tabular spatial anomaly |
