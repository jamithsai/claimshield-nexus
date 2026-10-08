# ClaimShield Nexus — System Architecture & Design Specification

## 1. Executive Summary
**ClaimShield Nexus** is an enterprise-grade Healthcare Fraud, Waste & Abuse (FWA) / Program Integrity & Payment Integrity Intelligence Platform. Designed specifically for Special Investigation Units (SIU) and Program Integrity Analysts (such as those at Acentra Health), ClaimShield Nexus transforms large volumes of synthetic healthcare claims into a prioritized, evidence-backed queue of high-risk investigation opportunities.

The platform embodies the core operational flow:
```
DETECT → CONNECT → UNDERSTAND → PREDICT → PRIORITIZE → INVESTIGATE → DECIDE (HUMAN-IN-THE-LOOP)
```

---

## 2. Core Architectural Principles
1. **Explainability First (No Black-Box Scores)**: Every risk score, genome vector, and projection is deterministically traceable down to raw claim IDs, provider IDs, billing codes, graph edges, and statistical anomalies.
2. **Human-in-the-Loop Supremacy**: The AI assists and empowers the investigator; it never makes definitive fraud accusations or triggers irreversible operational sanctions autonomously.
3. **Multi-Detector Ensemble**: Synthesizes rule-based heuristics, machine learning anomaly detection, graph network topology, temporal behavior, and peer-group benchmarks.
4. **Behavioral Fingerprinting (Fraud Genome)**: Encodes complex multi-dimensional abuse patterns into an 8-to-10 dimension normalized fingerprint.
5. **Dynamic Risk Velocity & Trajectory**: Quantifies not just current static exposure, but scheme acceleration across 30, 60, and 90-day horizons.
6. **Enterprise Security & Auditability**: Role-Based Access Control (RBAC), tokenized auth, full data validation, and tamper-evident audit logging.

---

## 3. High-Level System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 SYNTHETIC DATA INGESTION                               │
│  - Members (10,000+)  - Providers (500+)  - Facilities (100+)  - Claims (100,000+)     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           DATA VALIDATION & QUALITY ENGINE                             │
│  - Completeness Check  - Schema Enforcement  - Integrity Scoring  - Anomaly Flagging   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        FEATURE ENGINEERING & BASELINE ANALYTICS                        │
│  - Peer-Group Baselines (Specialty, Region)  - Rolling Temporal Windows (30/60/90d)   │
│  - Utilization Metrics  - Billing Velocity  - Referral & Facility Concentration Ratios │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│           FWA RULE ENGINE             │       │      ML ANOMALY DETECTION ENGINE      │
│ - Rule R101: Duplicate Billing        │       │ - Algorithm: Isolation Forest         │
│ - Rule R102: Code Upcoding (E&M Level)│       │ - Multi-dimensional Feature Space:    │
│ - Rule R103: Service Unbundling       │       │   * Billed Amount Z-Score             │
│ - Rule R104: Phantom Services         │       │   * Daily Claim Density               │
│ - Rule R105: Excessive Utilization    │       │   * Procedure Diversity Index         │
│ - Rule R106: Impossible Temporal Gaps │       │   * Out-of-Region Patient Ratio       │
│ - Rule R107: Kickback / Concentration │       │   * Weekend/Holiday Billing Ratio     │
│ (Produces: Signal, Weight, Evidence)  │       │ (Produces: Anomaly Score & Feature SHAP)
└───────────────────┬───────────────────┘       └───────────────────┬───────────────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│     GRAPH & NETWORK INTELLIGENCE      │       │     TEMPORAL & VELOCITY ENGINE        │
│ - Heterogeneous Graph Construction:   │       │ - Scheme Evolution Tracking:          │
│   * Nodes: Provider, Member, Facility,│       │   * Day 0 → Day 30 → Day 60 → Day 90  │
│     Claim, Referral, Location         │       │ - Risk Velocity (Δ Risk / Δ Time)     │
│   * Edges: Submitted, Belongs, Operates│      │ - Dynamic Acceleration Signals:       │
│ - Centrality, Degree, Clustering Coeff│       │   * Rapid Network Expansion           │
│ - Suspicious Bipartite Ring Detection │       │   * Financial Exposure Trajectory     │
│ - Referral Loop / Kickback Detection  │       │ - 30/60/90-Day Predictive Projection  │
└───────────────────┬───────────────────┘       └───────────────────┬───────────────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 UNIFIED RISK ENGINE                                    │
│  - Normalized Composite Risk Score (0 - 100): Low / Medium / High / Critical          │
│  - Fraud Genome Fingerprint (10 Behavioral Dimensions)                                 │
│  - Scheme Fingerprint Similarity Matcher (Cosine / Jaccard vs Reference Patterns)      │
│  - Evidence Graph Synthesizer (Traceable Graph of Claims, Rules, and Nodes)            │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              SIU PRIORITIZATION ENGINE                                 │
│  - Multi-Dimensional Objective Function: Risk x Financial Exposure x Member Impact    │
│  - Severity & Evidence Strength Multipliers                                            │
│  - Investigation Capacity Queue (Top N Allocations)                                    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
┌───────────────────────────────────────┐       ┌───────────────────────────────────────┐
│     AI EVIDENCE BRIEF GENERATOR       │       │       ENTERPRISE SECURITY & RBAC      │
│ - Guardrailed LLM Synthesis           │       │ - JWT Authentication                  │
│ - Structured Input Only (Zero Halluc.)│       │ - Roles: Investigator, Senior Invest.,│
│ - Mandated Uncertainty & Disclaimer   │       │   Program Integrity Analyst, Admin    │
│ - Direct Reference to Evidence IDs    │       │ - Tamper-Evident Audit Ledger         │
└───────────────────┬───────────────────┘       └───────────────────┬───────────────────┘
                    │                                               │
                    └───────────────────────┬───────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         INVESTIGATOR WORKSPACE & FRONTEND                              │
│  1. Executive Program Integrity Dashboard                                              │
│  2. SIU Prioritization Queue & Capacity Manager                                        │
│  3. Deep Case Investigation Workspace (Fraud Genome, Evolution Radar, Velocity Spark)  │
│  4. Interactive Network & Evidence Explorer (Graph Visualization)                      │
│  5. 30/60/90-Day Risk Trajectory & Counterfactual Simulator                            │
│  6. FWA Red-Team Threat Simulator & Detector Performance Center                        │
│  7. Investigator Decision Modal & Immutable Audit History                              │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Deep Dives

### 4.1 Data Pipeline & Ingestion Layer
- Generates and consumes high-fidelity synthetic healthcare data adhering to CMS standard formats:
  - **Claims**: Claim ID, Member ID, Billing Provider NPI, Rendering Provider NPI, Facility ID, Service Date, Paid Date, ICD-10 Diagnosis Codes, CPT/HCPCS Procedure Codes, Billed Amount, Paid Amount, Denial Code.
  - **Providers**: NPI, Name, Specialty, Taxonomy Code, Practice Location (City, State, Zip, Coordinates), Enrollment Date, Sanction History Flag.
  - **Members**: Member ID, Age, Gender, Plan Type, Geographic Region, Enrollment Span.
  - **Facilities**: Facility ID, Name, Facility Type (Inpatient, Outpatient, ASC, Diagnostic Lab), Address, Bed Count/Capacity.
- Data Validation Module computes a **Data Quality Index (DQI)** for each record:
  - Missingness penalty, format validation, temporal consistency (Service Date <= Paid Date), code validity.

### 4.2 Multi-Detector Engine
1. **FWA Rule Engine (Deterministic)**:
   - Configurable rule definitions with threshold triggers, severity ratings (`LOW`, `MED`, `HIGH`, `CRITICAL`), and evidence attachment.
   - Comprehensive rule catalog covering all PS3 scenarios:
     - Duplicate claims within 72h window
     - Level 4/5 E&M upcoding (>3 standard deviations from specialty mean)
     - Panel unbundling (individual component billing vs composite code)
     - Phantom services (claims billed after member death / provider on leave / impossible overlapping hours)
     - Rapid utilization spikes (>250% of 90-day baseline)
     - Referral reciprocity and circular loops
2. **ML Anomaly Detection (Unsupervised Isolation Forest)**:
   - Feature Matrix: Standardized behavioral vectors per provider per 30-day epoch.
   - Outputs continuous anomaly score `[-1.0, 1.0]`, calibrated into `[0.0, 1.0]` anomaly probability.
   - Feature contribution ranking (surfacing which specific features triggered the isolation path).
3. **Graph & Network Intelligence (NetworkX / Heterogeneous Topology)**:
   - Evaluates:
     - Node Degree, Betweenness Centrality, PageRank
     - Bipartite Shared-Patient Clustering (identifying collusion rings)
     - Referral Loop Index & Kickback Probability (directed cycle detection)
     - Facility Concentration HHI (Herfindahl-Hirschman Index)
4. **Temporal Trajectory & Risk Velocity**:
   - Calculates weekly/monthly risk progression over 90 historical days.
   - Risk Velocity: $\text{Velocity} = \frac{\Delta \text{Risk Score}}{\Delta t} + \alpha (\text{New Provider Addition Rate}) + \beta (\text{Financial Growth Factor})$.
   - 30/60/90-Day Projections: Trend extrapolation bounded by uncertainty cones, modeling baseline continuation vs accelerating scheme expansion.

### 4.3 Unified Risk Engine & The Fraud Genome
- **Composite Risk Score Formula**:
  $$\text{Risk Score} = w_{\text{rule}} S_{\text{rule}} + w_{\text{ml}} S_{\text{ml}} + w_{\text{graph}} S_{\text{graph}} + w_{\text{vel}} S_{\text{vel}} + w_{\text{fin}} S_{\text{fin}} + w_{\text{mbr}} S_{\text{mbr}}$$
  *Defaults: $w_{\text{rule}}=0.25, w_{\text{ml}}=0.20, w_{\text{graph}}=0.20, w_{\text{vel}}=0.15, w_{\text{fin}}=0.10, w_{\text{mbr}}=0.10$ (fully inspectable & configurable).*
- **Fraud Genome Vector (10 Dimensions in $[0.0, 1.0]$)**:
  1. Billing Intensity
  2. Procedure Deviation
  3. Temporal Irregularity
  4. Referral Concentration
  5. Facility Concentration
  6. Member Concentration
  7. Geographic Anomaly
  8. Network Density
  9. Financial Exposure Index
  10. Utilization Deviation

### 4.4 Responsible AI & Evidence Brief Generator
- Guardrailed prompt architecture with strict JSON schema inputs.
- Mandated outputs: Executive Summary, Key Behavioral Indicators, Quantified Financial & Patient Exposure, Counter-Evidence / Mitigating Factors, Recommended Next Investigative Steps, Evidence Table (Claim IDs, NPIs, Rules), Confidence Rating, and Mandatory System Disclaimers.
- Absolutely zero hallucinatory claim synthesis; strictly derives narratives from confirmed detector signals.

### 4.5 Enterprise Security, RBAC & Audit
- JWT Bearer Authentication with HMAC-SHA256 signature.
- 4 Granular Roles:
  - `investigator`: View queue, examine cases, add notes, propose findings.
  - `senior_investigator`: Review cases, approve/reject escalation, trigger simulations.
  - `program_integrity_analyst`: Configure rules, calibrate ML thresholds, view performance analytics.
  - `admin`: User management, system configuration, full audit ledger access.
- Tamper-Evident In-Memory/SQLite Audit Log with cryptographic hash chaining (SHA-256) ensuring immutable provenance of investigator actions.

---

## 5. Technology Stack Selection

| Component | Selected Technology | Rationale |
|---|---|---|
| **Backend API** | Python 3.13 + FastAPI + Pydantic v2 | High performance, native async, instant OpenAPI schema, robust typing, seamless ML integration |
| **Data & ML Processing** | NumPy + Pandas + Scikit-Learn | Standard, battle-tested for Isolation Forest, PCA, statistical baseline modeling, z-score normalization |
| **Graph Intelligence** | NetworkX + Custom Topological Algorithms | Fast in-memory graph algorithms, cycle detection, bipartite clustering, community detection |
| **Synthetic Data Engine** | Faker + Custom Healthcare Domain Generator | Generates statistically realistic claims, NPIs, ICD-10/CPT codes, temporal timelines, embedded fraud schemes |
| **Frontend UI** | React 18 + Vite + TypeScript + Tailwind CSS | Ultra-responsive, modular, clean enterprise UX, hot-module reload |
| **Data Visualizations** | Recharts + Cytoscape.js / Vis-Network + Lucide Icons | Rich interactive radar charts, time series velocity sparklines, zoomable network graphs, evidence trees |
| **Authentication & RBAC** | PyJWT + Passlib / Bcrypt | Industry-standard stateless token authentication with role-claim verification |
| **Testing Framework** | Pytest (Backend) + Vitest/Playwright (E2E & UI) | Complete test coverage across data quality, rules, ML, graph, security, and UI |

---

## 6. Deployment & Execution Topology
- **Local / Self-Contained Deployment**: Single command orchestration (`python run_server.py` & `npm run dev`) with pre-seeded, high-fidelity synthetic claims database.
- Zero external cloud/database dependency needed for evaluation, ensuring 100% deterministic reproducibility for hackathon judges.
