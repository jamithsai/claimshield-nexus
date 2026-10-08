# Healthcare Enterprise Design System: ClaimShield Nexus (Acentra Health Institutional System)

## 1. Visual Theme & Philosophy
ClaimShield Nexus is an institutional-grade healthcare program integrity, payment integrity, and special investigations unit (SIU) intelligence platform built for state Medicaid agencies, Medicare MACs, and commercial health plans. 

The visual identity embodies **Acentra Health institutional credibility, clinical precision, calm analytical clarity, and high-readability evidence transparency**. 

The design departs entirely from cybersecurity/SOC command centers, dark neon cockpits, and generic AI chatbot interfaces. Instead, it adheres to the authoritative Acentra Health institutional aesthetic: crisp glacier and white surfaces, deep obsidian pine text, forest healthcare green primary actions, deep ocean teal analytical benchmarks, and pale seafoam mint accents.

- **Atmosphere:** Clean, calm healthcare enterprise environment with soft white and glacier-tint surfaces, subtle teal borders, and high-contrast obsidian pine typography.
- **Density:** Calm Information Density (7/10) with well-aligned tabular grids, generous whitespace, and master-detail investigative workflows.
- **Color Temperature:** Grounded institutional healthcare palette (obsidian pine, forest green, deep ocean teal, pale seafoam mint, glacier tint).
- **Motion:** Restrained functional transitions (150ms ease-out) strictly for state changes, drawer expansion, and graph selection. Zero decorative ambient particle loops.

---

## 2. Acentra Institutional Color Palette & Semantic Hierarchy

### Core Canvas & Structural Neutral Tones
- **Primary Canvas Background:** `#F2FCFF` (Glacier Tint — calm clinical backdrop minimizing ocular fatigue)
- **Primary Surface / Cards:** `#FFFFFF` (Pure White with `1px solid rgba(4, 33, 38, 0.10)` border and `0 1px 2px rgba(4, 33, 38, 0.04)` subtle elevation)
- **Sub-Panels / Recessed Drawers:** `#F2FCFF` (Glacier Tint) and `#FFFFFF` (Clean White)
- **Divider Rules & Borders:** `rgba(4, 33, 38, 0.10)` (Subtle Obsidian Tint)
- **Primary Text (Headings/Data):** `#042126` (Obsidian Pine Teal — authoritative deep pine for maximum contrast)
- **Secondary Text (Body/Labels):** `rgba(4, 33, 38, 0.70)`
- **Muted Metadata / Captions:** `rgba(4, 33, 38, 0.50)`

### Acentra Healthcare Brand Accents
- **Primary Brand Green:** `#209B47` (Forest Healthcare Green — primary CTAs, active states, key data highlights)
- **Primary Brand Green Hover:** `#1B843C`
- **Secondary Brand Teal:** `#005F68` (Deep Ocean Teal — secondary actions, subheaders, peer comparison norms)
- **Soft Accent / Mint:** `#ACF2E5` (Pale Seafoam Mint — subtle badges, synthetic chip accents, highlight backgrounds)
- **Institutional Navy:** `#15497E` (Slate Healthcare Navy — analytical metrics, secondary buttons)

### Restrained Clinical Semantic Risk Indicators
Risk markers are restrained, high-legibility badges and borders (avoiding full-screen saturation):
- **CRITICAL (Risk $\ge 75$):** Text `#B91C1C` (Deep Crimson), Background `#FEE2E2`, Border `#FECACA`
- **HIGH (Risk $50 - 74$):** Text `#D97706` (Amber Ochre), Background `#FEF3C7`, Border `#FDE68A`
- **MEDIUM (Risk $25 - 49$):** Text `#15497E` (Slate Navy), Background `#EFF6FF`, Border `#BFDBFE`
- **LOW (Risk $< 25$):** Text `#1B843C` (Forest Green), Background `#E8F8EE` / `#ACF2E5`, Border `#BBF7D0`

---

## 3. Typographic Architecture
- **Primary Interface Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
  - Page Titles: `text-2xl font-bold text-[#042126] tracking-tight`
  - Section Headings: `text-lg font-semibold text-[#042126] tracking-tight`
  - Subheaders / Card Titles: `text-sm font-semibold text-[#005F68]`
  - Body Text: `text-sm text-[#042126]/80 leading-relaxed`
  - Metadata / Labels: `text-xs font-semibold text-[#042126]/60 uppercase tracking-wider`
- **Monospace Intelligence Figures:** `JetBrains Mono`, `ui-monospace`, `monospace`
  - Utilized for Claim IDs, Provider NPIs, CPT/HCPCS codes, dollar amounts, and tabular numeric columns (`.tabular-nums`).

---

## 4. Primary Screen Architecture & Navigation Shell

### A. Compact Healthcare Navigation Shell
- **Brand Identity:** `CLAIMSHIELD NEXUS` with forest green shield icon and Program Integrity sub-badge.
- **Global Navigation Tabs:** `Overview`, `SIU Queue`, `Case Investigation`, `Network Explorer`, `Detector Efficacy`, `Audit Ledger`.
- **Right Utility Area:**
  - `SYNTHETIC BENCHMARK • ZERO PHI` clinical chip with `#ACF2E5` mint accent.
  - Active RBAC Role Switcher (`Investigator`, `Senior Investigator`, `Program Integrity Analyst`, `Admin`).
  - Active Investigation Counter badge.

### B. Program Integrity Executive Overview
- **Header:** "Program Integrity Overview" — "Monitor claims activity, emerging FWA risk, financial exposure and investigator workload."
- **KPI Summary Grid (4 Cards):** Total Claims Reviewed, Flagged FWA Indicators, High-Risk Open Cases, Flagged Financial Exposure.
- **30-Day Epoch Trend Chart:** Clean light area chart with Forest Green (`#209B47`) baseline transitioning to Crimson (`#B91C1C`) scheme acceleration.
- **Scheme Taxonomy Breakdown & Priority Watchlist:** Distribution by scheme type (Upcoding, Unbundling, Duplicate, Phantom, Utilization) with Deep Ocean Teal (`#005F68`) bars.

### C. SIU Priority Triage Work Queue
- **Operational Controls:** Capacity toggles ($K = 5, 10, 20, 50$) in `#209B47`, multi-attribute utility formula badge, search box, severity/scheme filters.
- **Tabular Queue Grid:** Priority rank, Case ID, Target Provider/Entity, Composite Risk Badge, Primary Scheme Signal, Exposure, Impacted Members, Risk Velocity pill, Evidence Strength, Action ("Investigate").

### D. Case Investigation Workspace Console
- **Persistent Case Header:** Case ID, Target Entity, Specialty, Composite Risk score pill, Flagged Exposure, Member count, Velocity derivative, Status, and "Record SIU Disposition" modal trigger.
- **8 Modular Investigation Tabs:**
  1. **Overview & Trace:** Multi-detector synthesis (Rule, ML, Graph, Temporal) with interactive **Trace Evidence** accordion revealing exact data sources and formulas.
  2. **Evidence Graph:** Light analytical DAG mapping Provider $\to$ Flagged Claims $\to$ Triggered Rules $\to$ Statistical Outlier metrics with node detail drawer.
  3. **Network Explorer:** Bipartite graph showing shared members, billing facilities, and referral collusion rings with `#209B47` and `#005F68` node markers.
  4. **10-D Fraud Genome:** Restrained radar chart comparing Provider behavioral vector (`#209B47`) against specialty peer benchmark (`#005F68`) with clickable dimension drill-down.
  5. **Scheme Evolution:** Interactive timeline with epoch scrubber (Day 0, Day 30, Day 60, Day 90) tracking baseline $\to$ emerging $\to$ accelerating $\to$ burst states.
  6. **30/60/90 Projections:** Toggleable escalation risk and projected financial exposure with confidence interval bands and disclaimer note.
  7. **Investigation Brief:** Structured clinical audit report with statutory citations (42 CFR § 455), counterfactual what-if scenarios, and copy/export tools.
  8. **Claim Ledger:** High-density tabular grid of raw claims with inline CPT/ICD-10 badges, billed vs allowed amounts, and rule violation indicators.

### E. Human-in-the-Loop (HITL) & Merkle Audit Ledger
- **Cryptographic Disposition Modal:** Structured form for review evidence $\to$ human disposition $\to$ clinical rationale $\to$ SHA-256 Merkle chain commitment with `#209B47` signing button.
- **Audit Governance Console:** Enterprise compliance log with green "AUDIT INTEGRITY VERIFIED" status badge and chain verification.

---

## 5. Anti-Patterns (Strictly Enforced)
- ❌ NO dark full-screen backgrounds or glowing neon grids.
- ❌ NO glassmorphism, blur filters, or futuristic cyber aesthetics.
- ❌ NO definitive guilt accusations (e.g. "Fraud Confirmed"); strictly use "Potential FWA Anomaly Indicator" and "Human Review Required".
- ❌ NO ungrounded AI summaries; all narrative points must link directly to synthetic claim records and rule triggers.
