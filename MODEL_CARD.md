# ClaimShield Nexus — Machine Learning & Analytics Model Card

## 1. Model Details

### 1.1 Core Specifications
- **Model Name**: ClaimShield Unsupervised Isolation Anomaly Detector (`CS-IForest-v1`)
- **Model Architecture**: Ensemble of Isolation Trees (Scikit-Learn `IsolationForest` implementation with custom statistical calibration)
- **Primary Task**: Multi-dimensional outlier detection over provider and facility behavioral vectors.
- **Model Release Date**: October 2026
- **License / Usage**: Acentra Health Hackathon — Program Integrity Intelligence Research

### 1.2 Multi-Detector Ensemble Architecture
ClaimShield Nexus does NOT rely exclusively on any single machine learning model. Instead, it utilizes a 4-tier hybrid ensemble:
1. **Deterministic Rule Engine**: 6 configurable clinical/billing logic rules with hard evidentiary triggers.
2. **ML Anomaly Detector**: Isolation Forest quantifying multivariate behavioral divergence.
3. **Graph Topological Engine**: Heterogeneous network graph calculating bipartite clustering, PageRank, and circular referral loops.
4. **Temporal Trajectory Engine**: First-order and second-order derivatives of risk progression over rolling 30/60/90-day epochs.

---

## 2. Intended Use & Non-Intended Use

### 2.1 Intended Use
- Identifying high-risk provider, facility, and referral clusters for Special Investigation Unit (SIU) prioritization.
- Ranking and triaging potential FWA cases based on multi-dimensional objective functions (Risk $\times$ Financial Exposure $\times$ Patient Impact).
- Surfacing explanatory behavioral features to assist human investigators in scoping audits.

### 2.2 Prohibited & Non-Intended Use
- ❌ **Automated Claim Denials**: The model must NEVER be used to automatically deny or withhold payments without affirmative human review.
- ❌ **Automated Provider Sanctions**: The model must NEVER be used to automatically revoke provider network credentialing or report to OIG without independent clinical and legal audit.
- ❌ **Sole Basis for Legal Action**: Model outputs are indicators of statistical anomaly, not conclusive proof of fraudulent intent.

---

## 3. Training & Benchmark Data

### 3.1 Dataset Description
- **Source**: High-fidelity synthetic healthcare encounter dataset engineered to mirror CMS Medicare Part B and Medicaid billing distributions.
- **Volume**: 100,000+ claims across 500+ providers, 100+ facilities, and 10,000+ members.
- **PII / PHI**: **Zero real patient or provider data**. 100% synthetically generated.

### 3.2 Feature Matrix Specification
| Feature Name | Type | Description | Baseline Normalization |
|---|---|---|---|
| `daily_claim_density` | Float | Average daily claim submissions per active billing day | Standardized against Specialty Mean |
| `billed_to_allowed_ratio` | Float | Ratio of provider billed dollar amount to standard CMS fee schedule | Z-Score per Procedure Code |
| `high_level_em_ratio` | Float | Percentage of E&M visits billed as Level 4 or Level 5 (CPT 99214/99215) | Z-Score against Specialty Benchmark |
| `unbundled_panel_frequency` | Float | Rate of billing constituent lab components separately on same date of service | Frequency Index $[0.0, 1.0]$ |
| `weekend_billing_ratio` | Float | Proportion of non-emergency claims submitted for Saturday/Sunday services | Normalized Ratio $[0.0, 1.0]$ |
| `patient_sharing_entropy` | Float | Shannon entropy of shared patient population with top 3 referring physicians | Inverted Entropy (0 = extreme collusion) |
| `out_of_region_patient_ratio`| Float | Percentage of beneficiaries traveling $>50$ miles for routine primary/office care | Geographic Ratio $[0.0, 1.0]$ |
| `procedure_diversity_index` | Float | Gini-Simpson index of unique CPT codes billed by provider | Diversity Index $[0.0, 1.0]$ |

---

## 4. Evaluation & Performance Characteristics

### 4.1 Hyperparameters
- `n_estimators`: 200 trees
- `max_samples`: `'auto'` ($\min(256, n)$)
- `contamination`: 0.05 (calibrated to expected 5% true anomalous population)
- `random_state`: 42 (guaranteeing deterministic reproducibility)

### 4.2 Interpretability & Feature Attribution
- The model computes local feature isolation depth to derive directional SHAP-like contributions for every flagged entity.
- Each anomaly score is accompanied by the top-3 contributing feature dimensions and their empirical divergence from peer baseline averages.

---

## 5. Limitations & Ethical Considerations

1. **Synthetic Data Drift**: Models calibrated on synthetic distributions may not capture novel emergent real-world fraud schemes without continuous active feedback.
2. **Clinical Specialization Confounders**: Highly specialized sub-specialists (e.g., quaternary neuro-oncology, complex revision arthroplasty) naturally exhibit skewed billing distributions. Peer-group stratifications are mandatory to prevent false positive skew.
3. **Epistemic Uncertainty Tracking**: When data quality is degraded (e.g., missing diagnosis codes, incomplete provider profiles), the platform explicitly lowers the **Confidence Index** rather than outputting false high-confidence anomaly scores.
