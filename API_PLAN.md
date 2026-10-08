# ClaimShield Nexus — REST API Contract & Endpoint Specification

## 1. Overview
The **ClaimShield Nexus API** is organized around RESTful principles, JSON payloads, strict Pydantic v2 schemas, and JWT-based Role-Based Access Control (RBAC).

Base URL: `/api/v1`

---

## 2. Authentication & Session Endpoints

### 2.1 `POST /api/v1/auth/login`
- **Description**: Authenticate user and receive signed JWT access token.
- **Request Body**:
  ```json
  {
    "username": "investigator@acentra.com",
    "password": "correct_password"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in_seconds": 28800,
    "user": {
      "user_id": "USR-101",
      "username": "investigator@acentra.com",
      "full_name": "Sarah Jenkins, CFE",
      "role": "INVESTIGATOR",
      "assigned_capacity": 20
    }
  }
  ```

### 2.2 `GET /api/v1/auth/me`
- **Description**: Returns current authenticated user profile and permissions.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**: User profile object.

---

## 3. Executive & SIU Queue Endpoints

### 3.1 `GET /api/v1/overview/metrics`
- **Description**: Returns top-level Program Integrity KPIs.
- **Response `200 OK`**:
  ```json
  {
    "total_claims_analyzed": 105420,
    "total_financial_volume_usd": 48250000.0,
    "flagged_fwa_exposure_usd": 4120350.0,
    "fwa_exposure_percentage": 8.54,
    "active_investigation_cases": 24,
    "critical_risk_entities_count": 8,
    "detected_schemes_breakdown": {
      "UPCODING": 32,
      "UNBUNDLING": 28,
      "DUPLICATE_BILLING": 19,
      "PHANTOM_SERVICES": 14,
      "COLLUSION_RING": 11,
      "EXCESSIVE_UTILIZATION": 45
    },
    "risk_tier_distribution": {
      "CRITICAL": 8,
      "HIGH": 16,
      "MEDIUM": 35,
      "LOW": 142
    },
    "data_quality_index_overall": 0.96
  }
  ```

### 3.2 `GET /api/v1/siu/queue`
- **Description**: Returns prioritized list of SIU investigation opportunities.
- **Query Parameters**:
  - `capacity` (int, default: 20): Capacity limit for investigator allocation.
  - `sort_by` (string, default: `priority`): `priority`, `risk_score`, `exposure`, `velocity`, `member_impact`.
  - `tier` (string, optional): Filter by `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`.
  - `fwa_pattern` (string, optional): Filter by scheme type.
  - `status` (string, optional): Filter by case status.
- **Response `200 OK`**:
  ```json
  {
    "total_cases_available": 58,
    "capacity_allocated": 20,
    "cases": [
      {
        "case_id": "CASE-2026-0814",
        "target_entity_type": "PROVIDER",
        "target_entity_id": "NPI-1094827182",
        "target_entity_name": "Dr. Marcus Sterling, MD (Pain Mgmt)",
        "composite_risk_score": 92.4,
        "risk_tier": "CRITICAL",
        "risk_velocity": 41.2,
        "potential_financial_exposure": 487250.0,
        "member_impact_count": 142,
        "severity": "CRITICAL",
        "evidence_strength": "CONVINCING",
        "primary_fwa_pattern": "Coordinated Upcoding & Bipartite Lab Unbundling",
        "status": "NEW_OPPORTUNITY",
        "created_at": "2026-10-01T08:30:00Z",
        "fraud_genome_summary": {
          "billing_intensity": 0.94,
          "procedure_deviation": 0.91,
          "temporal_irregularity": 0.88,
          "referral_concentration": 0.96
        }
      }
    ]
  }
  ```

---

## 4. Case Investigation Deep-Dive Endpoints

### 4.1 `GET /api/v1/cases/{case_id}`
- **Description**: Retrieves full 360-degree case investigation workspace payload.
- **Response `200 OK`**:
  ```json
  {
    "case_id": "CASE-2026-0814",
    "target_entity": {
      "npi": "NPI-1094827182",
      "name": "Dr. Marcus Sterling, MD",
      "specialty": "Interventional Pain Management",
      "city": "Miami",
      "state": "FL",
      "primary_facility": "Biscayne Specialty Surgical Suites",
      "peer_group": "PG-FL-PAIN-MGMT"
    },
    "composite_risk_score": 92.4,
    "risk_breakdown": {
      "rule_signals_score": 95.0,
      "ml_anomaly_score": 88.5,
      "graph_network_score": 94.0,
      "risk_velocity_score": 92.0,
      "financial_exposure_score": 89.0,
      "member_impact_score": 85.0
    },
    "fraud_genome": {
      "billing_intensity": 0.94,
      "procedure_deviation": 0.91,
      "temporal_irregularity": 0.88,
      "referral_concentration": 0.96,
      "facility_concentration": 0.84,
      "member_concentration": 0.79,
      "geographic_anomaly": 0.72,
      "network_density": 0.93,
      "financial_exposure": 0.95,
      "utilization_deviation": 0.87
    },
    "triggered_rules": [
      {
        "rule_id": "R102",
        "rule_name": "Severe E&M Level Upcoding",
        "severity": "CRITICAL",
        "description": "Provider billed CPT 99215 in 89.4% of office visits (peer baseline: 14.2%, z-score: +4.82)",
        "affected_claims_count": 312,
        "potential_excess_usd": 142000.0
      }
    ],
    "ml_insights": {
      "anomaly_score": -0.84,
      "percentile": 99.8,
      "top_contributing_features": [
        {"feature": "daily_claim_density", "importance": 0.38, "value": "44.2 claims/day (peer avg: 12.1)"},
        {"feature": "level5_em_ratio", "importance": 0.31, "value": "89.4% (peer avg: 14.2%)"}
      ]
    },
    "data_quality": {
      "overall_dqi": 0.94,
      "missing_fields_count": 2,
      "confidence_rating": "HIGH_CONFIDENCE",
      "limitations": [
        "Evaluated on synthetic CMS encounter patterns; clinical chart audit recommended for medical necessity confirmation."
      ]
    }
  }
  ```

### 4.2 `GET /api/v1/cases/{case_id}/evidence-graph`
- **Description**: Returns hierarchical evidence tree linking composite risk down to exact claims.
- **Response `200 OK`**: JSON structure with nodes (`ROOT`, `CATEGORY`, `RULE`, `ML`, `CLAIM`, `ENTITY`) and directed edges.

### 4.3 `GET /api/v1/cases/{case_id}/evolution`
- **Description**: Returns 90-day historical evolution data (Day 0, Day 30, Day 60, Day 90 snapshots).
- **Response `200 OK`**: Array of `SchemeEvolutionSnapshot`.

### 4.4 `GET /api/v1/cases/{case_id}/projection`
- **Description**: Returns 30/60/90-day risk and financial exposure projections with confidence intervals.
- **Response `200 OK`**:
  ```json
  {
    "case_id": "CASE-2026-0814",
    "trajectory_classification": "ACCELERATING_ESCALATION",
    "projections": [
      {
        "horizon_days": 30,
        "projected_additional_exposure_usd": 185000.0,
        "projected_risk_score": 94.8,
        "ci_low": 150000.0,
        "ci_high": 220000.0
      },
      {
        "horizon_days": 60,
        "projected_additional_exposure_usd": 410000.0,
        "projected_risk_score": 97.2,
        "ci_low": 340000.0,
        "ci_high": 490000.0
      },
      {
        "horizon_days": 90,
        "projected_additional_exposure_usd": 680000.0,
        "projected_risk_score": 99.1,
        "ci_low": 570000.0,
        "ci_high": 810000.0
      }
    ],
    "disclaimer": "Statistical projection for prioritization only; not a factual certainty."
  }
  ```

### 4.5 `GET /api/v1/cases/{case_id}/brief`
- **Description**: Generates an evidence-backed AI Investigation Brief with explicit citations and guardrails.
- **Response `200 OK`**:
  ```json
  {
    "brief_id": "BRF-9921",
    "case_id": "CASE-2026-0814",
    "generated_at": "2026-10-08T14:00:00Z",
    "executive_summary": "High-confidence multi-pattern FWA indicator identified for Dr. Marcus Sterling...",
    "behavioral_findings": [
      "Extreme E&M Level 5 upcoding exceeding specialty peer group baseline by +4.82 sigma.",
      "Coordinated referral circular ring involving Biscayne Diagnostic Lab."
    ],
    "financial_exposure_summary": "$487,250.00 across 312 flagged claim records.",
    "mitigating_factors": "Provider treats high-acuity chronic pain referrals; however, volume anomalies remain inexplicable.",
    "recommended_investigative_actions": [
      "Subpoena medical charts for top 20 Level 5 E&M encounters.",
      "Interview referring physicians in suspected Biscayne loop.",
      "Issue prepayment medical review hold pending documentation."
    ],
    "evidence_citations": [
      {"claim_id": "CLM-2026-948127", "cpt": "99215", "billed": 450.0, "rule": "R102"},
      {"claim_id": "CLM-2026-948128", "cpt": "80307", "billed": 220.0, "rule": "R103"}
    ],
    "mandatory_disclaimer": "This system identifies indicators associated with potential FWA. It does not establish fraud. Human investigation is required."
  }
  ```

---

## 5. Network & Graph Exploration Endpoints

### 5.1 `GET /api/v1/graph/case/{case_id}`
- **Description**: Returns local sub-graph surrounding the target case entity.
- **Response `200 OK`**:
  ```json
  {
    "nodes": [
      {"id": "NPI-1094827182", "label": "Dr. Marcus Sterling", "type": "PROVIDER", "risk": 92.4},
      {"id": "FAC-77312", "label": "Biscayne Specialty Suites", "type": "FACILITY", "risk": 86.0},
      {"id": "MBR-849201", "label": "Eleanor Vance", "type": "MEMBER", "risk": 45.0}
    ],
    "edges": [
      {"source": "NPI-1094827182", "target": "FAC-77312", "relationship": "OPERATES_AT", "weight": 312},
      {"source": "NPI-1094827182", "target": "MBR-849201", "relationship": "BILLED_FOR", "weight": 18}
    ]
  }
  ```

### 5.2 `GET /api/v1/graph/clusters`
- **Description**: Detects suspicious collusion rings, referral loops, and high-density bipartite cliques across entire graph.
- **Response `200 OK`**: List of identified suspicious clusters with member NPIs, loop type, and centrality scores.

---

## 6. Advanced Simulation & Intelligence Endpoints

### 6.1 `POST /api/v1/simulate/counterfactual`
- **Description**: Counterfactual What-If analysis (e.g. simulate removing an entity from network).
- **Request Body**:
  ```json
  {
    "case_id": "CASE-2026-0814",
    "exclude_entity_ids": ["FAC-77312"]
  }
  ```
- **Response `200 OK`**: Baseline network risk vs Counterfactual risk delta and dollar impact.

### 6.2 `POST /api/v1/simulate/redteam`
- **Description**: Inject synthetic novel FWA scheme variants and test detector response.
- **Request Body**:
  ```json
  {
    "scheme_type": "UNBUNDLED_LAB_PANEL_RING",
    "intensity_multiplier": 1.5,
    "claim_count": 50
  }
  ```
- **Response `200 OK`**: Injection result, detection triggered status, time to detect, and detector breakdown.

### 6.3 `GET /api/v1/analytics/detector-perf`
- **Description**: Returns multi-detector performance metrics, overlap Venn data, coverage, and precision/recall.

---

## 7. Investigator Action & Human-in-the-Loop Endpoints

### 7.1 `POST /api/v1/cases/{case_id}/decision`
- **Description**: Submits human investigator review outcome, case notes, and action recommendation.
- **Request Body**:
  ```json
  {
    "decision": "ESCALATE_TO_FORMAL_AUDIT",
    "disposition": "CONFIRMED_SUSPICIOUS",
    "investigator_notes": "Reviewed top 20 claim samples. Clear pattern of repeated level 5 E&M without matching diagnostic complexity.",
    "recommended_action": "ISSUE_PREPAYMENT_REVIEW_HOLD",
    "feedback_category": "CORRECT_DETECTION"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "SUCCESS",
    "case_id": "CASE-2026-0814",
    "updated_status": "UNDER_INVESTIGATION",
    "audit_log_id": "AUD-100492",
    "message": "Investigator decision recorded and cryptographically logged to audit ledger."
  }
  ```

### 7.2 `GET /api/v1/audit/logs`
- **Description**: Returns immutable audit trail stream with cryptographic hash verification status.
