# ClaimShield Nexus — Data Model & Schema Specification

## 1. Overview
This document specifies the unified data model for **ClaimShield Nexus**. The data model supports multi-grain analytics—spanning individual claim line items, patient journeys, provider behavioral baselines, facility affiliations, complex network topologies, temporal evolution epochs, and immutable audit ledgers.

---

## 2. Entity Relationship Overview

```
                      ┌───────────────┐
                      │    MEMBER     │
                      │  (Beneficiary)│
                      └───────┬───────┘
                              │ 1
                              │
                              │ N
┌───────────────┐ 1   N ┌─────┴─────────┐ N   1 ┌───────────────┐
│   FACILITY    ├───────┤     CLAIM     ├───────┤   PROVIDER    │
│  (Hospital/Lab)       │  (Encounter)  │       │  (Physician)  │
└───────────────┘       └───────┬───────┘       └───────┬───────┘
                                │                       │
                                │ 1                     │ 1
                                │                       │
                                │ N                     │ N
                        ┌───────┴───────┐       ┌───────┴───────┐
                        │  RULE TRIGGER │       │  FRAUD GENOME │
                        │    EVENTS     │       │  FINGERPRINT  │
                        └───────┬───────┘       └───────┬───────┘
                                │                       │
                                └───────────┬───────────┘
                                            │ N
                                            │
                                            ▼ 1
                                    ┌───────────────┐
                                    │   SIU CASE    │
                                    │ (Investigation│
                                    │  Opportunity) │
                                    └───────┬───────┘
                                            │ 1
                                            │
                                            ▼ N
                                    ┌───────────────┐
                                    │  AUDIT LOG &  │
                                    │ HUMAN ACTIONS │
                                    └───────────────┘
```

---

## 3. Core Data Schemas

### 3.1 `Member` (Beneficiary)
| Field | Type | Description | Constraints / Examples |
|---|---|---|---|
| `member_id` | String | Unique synthetic member identifier | Primary Key (e.g., `MBR-849201`) |
| `first_name` | String | Synthetic first name | e.g., `Eleanor` |
| `last_name` | String | Synthetic last name | e.g., `Vance` |
| `date_of_birth` | Date | Member date of birth | ISO 8601 (`YYYY-MM-DD`) |
| `gender` | Enum | Gender identifier | `M`, `F`, `OTHER`, `UNKNOWN` |
| `plan_type` | Enum | Healthcare plan coverage | `MEDICARE_ADVANTAGE`, `MEDICAID`, `COMMERCIAL_PPO`, `COMMERCIAL_HMO` |
| `state` | String | Residence state | 2-letter US state code (`e.g., FL, CA, TX`) |
| `zip_code` | String | Residence ZIP code | 5-digit US ZIP (`e.g., 33101`) |
| `enrollment_start` | Date | Coverage effective date | ISO 8601 |
| `enrollment_end` | Date (Optional) | Coverage termination date | ISO 8601 |
| `risk_adjustment_factor` | Float | CMS HCC Risk Adjustment Factor | Default `1.0` (0.4 to 4.5) |

---

### 3.2 `Provider` (Healthcare Professional / Entity)
| Field | Type | Description | Constraints / Examples |
|---|---|---|---|
| `npi` | String | 10-digit National Provider Identifier | Primary Key (e.g., `NPI-1094827182`) |
| `provider_name` | String | Full physician / practice name | e.g., `Dr. Marcus Sterling, MD` |
| `specialty` | String | Clinical specialty taxonomy | e.g., `Pain Management`, `Internal Medicine`, `Clinical Laboratory` |
| `taxonomy_code` | String | Standard 10-character taxonomy code | e.g., `208VP0014X` |
| `primary_facility_id` | String (FK) | Main hospital/clinic affiliation | Foreign Key to `Facility.facility_id` |
| `city` | String | Practice city | e.g., `Miami` |
| `state` | String | Practice state code | 2-letter US state code |
| `zip_code` | String | Practice ZIP code | 5-digit US ZIP |
| `latitude` | Float | Geo-spatial latitude | e.g., `25.7617` |
| `longitude` | Float | Geo-spatial longitude | e.g., `-80.1918` |
| `enrollment_date` | Date | Credentialing/Medicaid enrollment date | ISO 8601 |
| `sanction_history` | Boolean | Prior OIG/LEIE exclusion flag | Default `false` |
| `peer_group_id` | String | Specialty & geography peer baseline group | e.g., `PG-FL-PAIN-MGMT` |

---

### 3.3 `Facility` (Institutional Billing Entity)
| Field | Type | Description | Constraints / Examples |
|---|---|---|---|
| `facility_id` | String | Unique synthetic facility identifier | Primary Key (e.g., `FAC-77312`) |
| `name` | String | Facility legal name | e.g., `Biscayne Advanced Diagnostic Center` |
| `facility_type` | Enum | Facility category | `INPATIENT_HOSPITAL`, `OUTPATIENT_CLINIC`, `AMBULATORY_SURGICAL_CENTER`, `INDEPENDENT_LAB`, `SKILLED_NURSING` |
| `address` | String | Street address | e.g., `450 Biscayne Blvd` |
| `city` | String | City name | e.g., `Miami` |
| `state` | String | State code | 2-letter US state code |
| `zip_code` | String | ZIP code | 5-digit US ZIP |
| `capacity_beds` | Integer | Licensed bed or station count | e.g., `50` |
| `accreditation_status`| Enum | Accreditation state | `FULL`, `PROBATIONARY`, `UNACCREDITED` |

---

### 3.4 `Claim` (Healthcare Encounter Line-Item)
| Field | Type | Description | Constraints / Examples |
|---|---|---|---|
| `claim_id` | String | Unique synthetic claim identifier | Primary Key (e.g., `CLM-2026-948127`) |
| `member_id` | String (FK) | Beneficiary receiving service | Foreign Key to `Member.member_id` |
| `billing_provider_npi` | String (FK)| Billing entity/physician | Foreign Key to `Provider.npi` |
| `rendering_provider_npi`| String (FK)| Actual practitioner rendering care | Foreign Key to `Provider.npi` |
| `referring_provider_npi`| String (FK)| Physician ordering service / referral | Foreign Key to `Provider.npi` |
| `facility_id` | String (FK) | Service facility location | Foreign Key to `Facility.facility_id` |
| `service_date` | Date | Date service was performed | ISO 8601 (`YYYY-MM-DD`) |
| `service_end_date` | Date | End date for multi-day services | ISO 8601 (`YYYY-MM-DD`) |
| `paid_date` | Date | Date payment was disbursed | Must be $\ge$ `service_date` |
| `place_of_service` | String | CMS POS code | `11` (Office), `21` (Inpatient), `22` (Outpatient), `81` (Lab) |
| `primary_diagnosis` | String | ICD-10-CM diagnosis code | e.g., `M54.5` (Low back pain), `I10` (Essential hypertension) |
| `secondary_diagnosis` | String (Opt) | Secondary ICD-10 code | e.g., `E11.9` (Type 2 diabetes) |
| `procedure_code` | String | CPT / HCPCS procedure code | e.g., `99215` (E&M Level 5), `80307` (Presumptive drug screen) |
| `modifier_codes` | List[String] | CPT modifiers | e.g., `['25', '59']` |
| `units` | Integer | Units of service billed | e.g., `1`, `4`, `12` |
| `billed_amount` | Float | Amount billed by provider | In USD (e.g., `450.00`) |
| `allowed_amount` | Float | Fee schedule approved amount | In USD (e.g., `185.50`) |
| `paid_amount` | Float | Net amount disbursed to provider | In USD (e.g., `148.40`) |
| `claim_status` | Enum | Adjudication status | `PAID`, `DENIED`, `PENDING_REVIEW`, `ADJUSTED` |
| `data_quality_score` | Float | Record completeness score | `0.0` to `1.0` (1.0 = flawless) |

---

## 4. Derived & Analytical Schemas

### 4.1 `FraudGenome` (Behavioral Fingerprint)
| Dimension | Key | Type | Description |
|---|---|---|---|
| **Billing Intensity** | `billing_intensity` | Float [0-1] | Daily dollar volume & velocity relative to specialty peer baseline |
| **Procedure Deviation** | `procedure_deviation` | Float [0-1] | Over-representation of high-cost CPT codes (e.g., Level 5 E&M, generic unbundling) |
| **Temporal Irregularity**| `temporal_irregularity` | Float [0-1] | Weekend/holiday billing, impossible day-hour density (>24 hrs/day) |
| **Referral Concentration**| `referral_concentration`| Float [0-1] | High Gini/HHI coefficient of incoming/outgoing patient referral routes |
| **Facility Concentration**| `facility_concentration`| Float [0-1] | Extreme concentration in specific non-accredited or suspicious ASCs/Labs |
| **Member Concentration** | `member_concentration` | Float [0-1] | Disproportionate billing against shared cohort of high-utilizer members |
| **Geographic Anomaly** | `geographic_anomaly` | Float [0-1] | Dispersed patient commute distance exceeding reasonable clinical radiuses |
| **Network Density** | `network_density` | Float [0-1] | High bipartite clustering coefficient / participation in closed referral loops |
| **Financial Exposure** | `financial_exposure` | Float [0-1] | Total cumulative paid dollar volume at risk normalized to cohort maximum |
| **Utilization Deviation**| `utilization_deviation` | Float [0-1] | Frequency of visits per patient per 30-day window vs expected clinical course |

---

### 4.2 `SchemeEvolutionSnapshot` (Temporal Cohorts)
| Field | Type | Description |
|---|---|---|
| `epoch_label` | String | e.g., `Day 0 (Baseline)`, `Day 30`, `Day 60`, `Day 90 (Current)` |
| `date_start` | Date | Start of 30-day observation window |
| `date_end` | Date | End of 30-day observation window |
| `active_providers_count`| Integer | Count of linked providers in scheme cluster |
| `active_facilities_count`| Integer | Count of linked facilities in cluster |
| `active_members_count` | Integer | Total unique patients billed during epoch |
| `claim_volume` | Integer | Cumulative claims billed in epoch |
| `financial_exposure` | Float | Total dollar exposure ($) in epoch |
| `risk_score` | Float | Composite risk score at that snapshot (0 - 100) |
| `dominant_schemes` | List[String]| Triggered scheme tags (e.g., `['UPCODING', 'UNBUNDLING']`) |

---

### 4.3 `RiskProjection` (30/60/90 Day Horizon)
| Field | Type | Description |
|---|---|---|
| `horizon_days` | Integer | Forecast duration: `30`, `60`, or `90` days |
| `projected_risk_score` | Float | Estimated risk score assuming scheme trajectory continues |
| `projected_financial_exposure` | Float | Estimated cumulative dollars at risk |
| `projected_claim_count` | Integer | Estimated additional claim volume |
| `projected_member_impact` | Integer | Estimated additional beneficiaries affected |
| `confidence_interval_low` | Float | 10th percentile lower bound (USD) |
| `confidence_interval_high`| Float | 90th percentile upper bound (USD) |
| `trajectory_classification`| Enum | `STATIC`, `MODERATE_GROWTH`, `ACCELERATING_ESCALATION` |
| `disclaimer` | String | Explicit statement: *"Statistical projection for prioritization only; not a factual certainty."* |

---

### 4.4 `SIUCase` (Prioritized Investigation Case)
| Field | Type | Description |
|---|---|---|
| `case_id` | String | Unique Case ID (e.g., `CASE-2026-0814`) |
| `target_entity_type` | Enum | `PROVIDER`, `FACILITY`, `NETWORK_RING`, `MEMBER_COLLUSION` |
| `target_entity_id` | String | Primary NPI or Facility ID or Ring ID |
| `target_entity_name` | String | Human readable entity name |
| `composite_risk_score` | Float | Overall risk score `0.0 - 100.0` |
| `risk_tier` | Enum | `LOW` (0-30), `MEDIUM` (31-60), `HIGH` (61-80), `CRITICAL` (81-100) |
| `risk_velocity` | Float | Rate of score change over last 60 days ($\Delta \text{Risk}$) |
| `potential_financial_exposure` | Float | Total dollar exposure ($) |
| `member_impact_count` | Integer | Count of impacted beneficiaries |
| `severity` | Enum | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `evidence_strength` | Enum | `LOW`, `MODERATE`, `STRONG`, `CONVINCING` |
| `status` | Enum | `NEW_OPPORTUNITY`, `ASSIGNED`, `UNDER_INVESTIGATION`, `ESCALATED`, `CLEARED_FALSE_POSITIVE`, `REFERRED_LE` |
| `assigned_investigator_id` | String (Opt)| User ID of assigned investigator |
| `primary_fwa_pattern` | String | e.g., `Coordinated Upcoding & Referral Loop Ring` |
| `fraud_genome` | FraudGenome | 10-dimension behavioral fingerprint object |
| `data_quality_index` | Float | Dataset completeness and reliability factor (`0.0 - 1.0`) |
| `created_at` | DateTime | Case generation timestamp |
| `updated_at` | DateTime | Last updated timestamp |

---

### 4.5 `EvidenceGraph`
| Field | Type | Description |
|---|---|---|
| `case_id` | String | Associated SIU Case |
| `nodes` | List[Dict] | Hierarchical node list: `ROOT_RISK`, `SIGNAL_CATEGORY`, `DETECTOR_RULE`, `ML_FACTOR`, `CLAIM_EVIDENCE`, `ENTITY_NODE` |
| `edges` | List[Dict] | Directed causal/evidence edges: `EXPLAINS`, `TRIGGERED_BY`, `SOURCED_FROM`, `LINKS_TO` |
| `total_evidence_claims` | Integer | Total specific Claim IDs referenced in graph |

---

### 4.6 `AuditLogEntry` (Tamper-Evident Ledger)
| Field | Type | Description |
|---|---|---|
| `log_id` | String | Unique log entry ID (e.g., `AUD-100293`) |
| `timestamp` | DateTime | UTC timestamp of event |
| `actor_user_id` | String | User ID performing action |
| `actor_role` | Enum | `INVESTIGATOR`, `SENIOR_INVESTIGATOR`, `PROGRAM_INTEGRITY_ANALYST`, `ADMIN` |
| `action_type` | Enum | `CASE_VIEWED`, `STATUS_CHANGED`, `NOTE_ADDED`, `EVIDENCE_EXPORTED`, `SIMULATION_EXECUTED`, `DECISION_RECORDED`, `RULE_MODIFIED` |
| `target_resource` | String | e.g., `CASE-2026-0814` |
| `details` | Dict | Structured payload of previous state vs new state |
| `client_ip` | String | Client IP address |
| `prev_hash` | String | SHA-256 hash of previous audit log record (Merkle chain) |
| `current_hash` | String | SHA-256 hash of (`log_id` + `timestamp` + `details` + `prev_hash`) |
