# Design System: ClaimShield Nexus — Healthcare Program Integrity & SIU Intelligence Platform

## 1. Visual Theme & Atmosphere
ClaimShield Nexus is an institutional-grade healthcare program integrity and special investigations intelligence platform designed for SIU investigators, forensic auditors, and payment integrity analysts. The visual language embodies architectural calm, clinical precision, and high-density legibility. It avoids consumer dashboard clichés, neon glows, and decorative AI tropes in favor of an operational cockpit that prioritizes evidence provenance, risk trajectory, and rapid triage decision-making.

- **Atmosphere:** Deep architectural slate with high-contrast evidentiary data grids, structured split workspaces, and sharp 1px structural dividing rules.
- **Density:** Cockpit Dense (8/10) with tabular-aligned figures and compact 36px/40px row heights.
- **Variance:** Offset Asymmetric Workbench (6/10) with master-detail investigation consoles.
- **Motion:** Restrained Fluid CSS (4/10) — purposeful state transitions (150ms ease-out), no distracting ambient particle loops.

## 2. Color Palette & Roles
The color architecture relies on high-contrast slate neutrals paired with strict, standardized healthcare integrity semantic indicators:

- **Canvas Base (`#0B132B` / `#0F172A` / `#F8FAFC`):** Bedrock application workspace backdrop.
- **Surface Elevation 1 (`#1E293B` / `#FFFFFF`):** Primary card, panel, and data grid container fill.
- **Surface Elevation 2 (`#334155` / `#F1F5F9`):** Sub-section headers, drawer overlays, and active row highlights.
- **Structural Rules (`#475569` / `#E2E8F0`):** 1px perimeter and divider lines.
- **Primary Ink (`#0F172A` / `#F8FAFC`):** Dominant typography, high-contrast headings.
- **Secondary Ink (`#64748B` / `#94A3B8`):** Supporting metadata, CPT descriptors, timestamps.

### Functional Healthcare Semantic Accents
- **Critical Risk / Hold Action (`#DC2626` / `#EF4444`):** Composite Risk $\ge 75$, Prepayment Review Holds, Collusion Rings.
- **High Risk / Alert (`#D97706` / `#F59E0B`):** Composite Risk $50 - 74$, Accelerating Velocity ($>+5.0$/mo).
- **Moderate / Watchlist (`#2563EB` / `#3B82F6`):** Statistical Outliers ($Z > 2.0$), Educational Reviews.
- **Compliant / Verified Normal (`#059669` / `#10B981`):** Merkle Chain Verified, Peer Baseline Norms.
- **Synthetic Benchmark Badge (`#7C3AED` / `#8B5CF6`):** Explicit `SYNTHETIC BENCHMARK • ZERO PHI` governance chip.

## 3. Typographic Architecture
- **Display & Section Headers:** `Inter` / `Geist` — Track-tight (`-0.02em`), 600 weight, authoritative structure.
- **Body & Clinical Descriptions:** `Inter` — Line-height `1.5`, max `75ch` measure, high contrast.
- **Monospace Intelligence Figures:** `JetBrains Mono` / `Geist Mono` — Mandatory for Claim IDs, NPI numbers, CPT/HCPCS codes, dollar amounts, and tabular numbers (`tabular-nums`).
- **Anti-Patterns Banned:** No serif fonts in software tables; no pure black (`#000000`); no low-contrast gray text on light backgrounds.

## 4. Component Stylings & Behaviors
- **Investigation Triage Table:** Compact data grid with fixed header, status badge pills, numeric right-alignment, and multi-criteria utility indicator.
- **Case Workbench Console:** Two-tier layout:
  - Persistent Case Header: Case ID, Target Entity, Risk Score Pill, Velocity Badge, Exposure ($), Impacted Patients.
  - 8 Interactive Investigation Tabs: Overview, Evidence Graph, Network Explorer, Fraud Genome, Scheme Evolution, Projections, AI Brief, Audit Ledger.
- **10-Dimensional Fraud Genome Radar:** Dynamic canvas/SVG radar mapping the 10 empirical behavioral dimensions with interactive hover tooltips and peer baseline overlay.
- **Evidence Provenance Graph:** Hierarchical node-link tree mapping `Root Target Entity` $\to$ `FWA Scheme Triggers` $\to$ `Claim IDs & CPT Codes`.
- **Counterfactual What-If Simulator:** Real-time recalculation panel showing risk reduction percentage ($\%$) and potential cost avoidance ($\$$) when excluding collusive facilities/referrals.
- **Merkle Chain Audit Ledger:** Monospace cryptographic log with verification status pill (`VALID_MERKLE_CHAIN` / `TAMPER_DETECTED`).

## 5. Navigation & Information Architecture
```
CLAIMSHIELD NEXUS
├── Command Center (/overview)
├── SIU Priority Queue (/queue)
├── Case Investigation Workspace (/cases/:id)
│   ├── Overview
│   ├── Evidence Graph
│   ├── Network Explorer
│   ├── Fraud Genome
│   ├── Scheme Evolution
│   ├── Projections (30/60/90)
│   ├── AI Investigation Brief
│   └── Human Decision & Audit
├── Network Explorer (/network)
├── Red-Team Simulator (/simulation)
└── Audit & Governance (/audit)
```

## 6. Anti-Patterns (Banned AI Clichés)
- ❌ No generic chatbots or floating AI bubbles as the primary navigation.
- ❌ No fake round percentages (`99.9%`, `100%`) without empirical evidence backing.
- ❌ No ungrounded LLM narratives; all AI brief text must be backed by explicit Claim IDs and rule triggers.
- ❌ No neon gradients or purple button glow effects.
- ❌ No definitive guilt statements (`"Provider is fraudulent"`); strictly use `"Potential FWA Anomaly Indicator"`.
