# Healthcare Enterprise Design System: ClaimShield Nexus

## 1. Visual Theme & Philosophy
ClaimShield Nexus is an institutional-grade healthcare program integrity, payment integrity, and special investigations unit (SIU) intelligence platform. The visual identity embodies **clinical precision, institutional trust, calm analytical clarity, and high-readability evidence transparency**. 

The design departs entirely from cybersecurity/SOC command centers, dark neon cockpits, and generic AI chatbot interfaces. Instead, it mirrors modern enterprise clinical systems (e.g., Epic, Cerner, Change Healthcare, Optum) with crisp light surfaces, restrained color accents, and structured, interactive evidence exploration.

- **Atmosphere:** Clean, calm healthcare enterprise environment with soft white surfaces, subtle dividers, and high-contrast charcoal typography.
- **Density:** Calm Information Density (7/10) with well-aligned tabular grids, generous whitespace, and master-detail investigative workflows.
- **Color Temperature:** Neutral-to-cool clinical tones (slate, crisp white, deep navy blue, subtle teal).
- **Motion:** Restrained functional transitions (150ms ease-out) strictly for state changes, drawer expansion, and graph selection. Zero decorative ambient particle loops.

---

## 2. Color Palette & Semantic Hierarchy

### Core Canvas & Structural Neutral Tones
- **Primary Canvas Background:** `#F8FAFC` (Slate 50 — soft off-white backdrop minimizing eye strain)
- **Primary Surface / Cards:** `#FFFFFF` (Pure White with `1px solid #E2E8F0` border and `0 1px 2px rgba(15, 23, 42, 0.04)` subtle elevation)
- **Sub-Panels / Recessed Drawers:** `#F1F5F9` (Slate 100) and `#F8FAFC` (Slate 50)
- **Divider Rules & Borders:** `#E2E8F0` (Slate 200) and `#CBD5E1` (Slate 300)
- **Primary Text (Headings/Data):** `#0F172A` (Slate 900 — deep charcoal for maximum contrast and readability)
- **Secondary Text (Body/Labels):** `#334155` (Slate 700)
- **Muted Metadata / Captions:** `#64748B` (Slate 500)

### Healthcare Accent Colors
- **Primary Brand Accent:** `#0284C7` (Sky 600 / Healthcare Blue — authoritative clinical tone)
- **Primary Accent Hover/Active:** `#0369A1` (Sky 700)
- **Secondary Accent:** `#0D9488` (Teal 600 — trusted medical teal)
- **Governance Badge:** `#4F46E5` / `bg-indigo-50 text-indigo-700 border-indigo-200` (`SYNTHETIC BENCHMARK • ZERO PHI`)

### Restrained Clinical Semantic Risk Indicators
Risk markers are restrained, high-legibility badges and borders (avoiding full-screen saturation):
- **CRITICAL (Risk $\ge 75$):** Text `#B91C1C` (Red 700), Background `#FEF2F2` (Red 50), Border `#FECACA` (Red 200)
- **HIGH (Risk $50 - 74$):** Text `#B45309` (Amber 700), Background `#FFFBEB` (Amber 50), Border `#FDE68A` (Amber 200)
- **MEDIUM (Risk $25 - 49$):** Text `#1D4ED8` (Blue 700), Background `#EFF6FF` (Blue 50), Border `#BFDBFE` (Blue 200)
- **LOW (Risk $< 25$):** Text `#15803D` (Green 700), Background `#F0FDF4` (Green 50), Border `#BBF7D0` (Green 200)

---

## 3. Typographic Architecture
- **Primary Interface Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`
  - Page Titles: `text-2xl font-bold text-slate-900 tracking-tight`
  - Section Headings: `text-lg font-semibold text-slate-800 tracking-tight`
  - Subheaders / Card Titles: `text-sm font-semibold text-slate-700`
  - Body Text: `text-sm text-slate-600 leading-relaxed`
  - Metadata / Labels: `text-xs font-medium text-slate-500 uppercase tracking-wider`
- **Monospace Intelligence Figures:** `JetBrains Mono`, `ui-monospace`, `monospace`
  - Utilized for Claim IDs, Provider NPIs, CPT/HCPCS codes, dollar amounts, and tabular numeric columns (`.tabular-nums`).

---

## 4. Primary Screen Architecture & Navigation Shell

### A. Compact Healthcare Navigation Shell
- **Brand Identity:** `CLAIMSHIELD NEXUS` with clinical shield icon and Program Integrity sub-badge.
- **Global Navigation Tabs:** `Overview`, `SIU Queue`, `Case Investigation`, `Network Explorer`, `Detector Efficacy`, `Audit Ledger`.
- **Right Utility Area:**
  - `SYNTHETIC BENCHMARK • ZERO PHI` clinical chip.
  - Active RBAC Role Switcher (`Investigator`, `Senior Investigator`, `Program Integrity Analyst`, `Admin`).
  - Active Investigation Counter badge.

### B. Program Integrity Executive Overview
- **Header:** "Program Integrity Overview" — "Monitor claims activity, emerging FWA risk, financial exposure and investigator workload."
- **KPI Summary Grid (4 Cards):** Total Claims Reviewed, Flagged FWA Indicators, High-Risk Open Cases, Flagged Financial Exposure.
- **30-Day Epoch Trend Chart:** Clean light area chart showing historical baseline transitioning to active scheme acceleration.
- **Scheme Taxonomy Breakdown & Priority Watchlist:** Distribution by scheme type (Upcoding, Unbundling, Duplicate, Phantom, Utilization).

### C. SIU Priority Triage Work Queue
- **Operational Controls:** Capacity toggles ($K = 5, 10, 20, 50$), multi-attribute utility formula badge, search box, severity/scheme filters.
- **Tabular Queue Grid:** Priority rank, Case ID, Target Provider/Entity, Composite Risk Badge, Primary Scheme Signal, Exposure, Impacted Members, Risk Velocity pill, Evidence Strength, Action ("Investigate").

### D. Case Investigation Workspace Console
- **Persistent Case Header:** Case ID, Target Entity, Specialty, Composite Risk score pill, Flagged Exposure, Member count, Velocity derivative, Status, and "Record SIU Disposition" modal trigger.
- **8 Modular Investigation Tabs:**
  1. **Overview & Trace:** Multi-detector synthesis (Rule, ML, Graph, Temporal) with interactive **Trace Evidence** accordion revealing exact data sources and formulas.
  2. **Evidence Graph:** Light analytical DAG mapping Provider $\to$ Flagged Claims $\to$ Triggered Rules $\to$ Statistical Outlier metrics with node detail drawer.
  3. **Network Explorer:** Bipartite graph showing shared members, billing facilities, and referral collusion rings.
  4. **10-D Fraud Genome:** Restrained radar chart comparing Provider behavioral vector against specialty peer benchmark with clickable dimension drill-down.
  5. **Scheme Evolution:** Interactive timeline with epoch scrubber (Day 0, Day 30, Day 60, Day 90) tracking baseline $\to$ emerging $\to$ accelerating $\to$ burst states.
  6. **30/60/90 Projections:** Toggleable escalation risk and projected financial exposure with confidence interval bands and disclaimer note.
  7. **Investigation Brief:** Structured clinical audit report with statutory citations (42 CFR § 455), counterfactual what-if scenarios, and copy/export tools.
  8. **Claim Ledger:** High-density tabular grid of raw claims with inline CPT/ICD-10 badges, billed vs allowed amounts, and rule violation indicators.

### E. Human-in-the-Loop (HITL) & Merkle Audit Ledger
- **Cryptographic Disposition Modal:** Structured form for review evidence $\to$ human disposition $\to$ clinical rationale $\to$ SHA-256 Merkle chain commitment.
- **Audit Governance Console:** Enterprise compliance log with green "AUDIT INTEGRITY VERIFIED" status badge and chain verification.

---

## 5. Anti-Patterns (Strictly Enforced)
- ❌ NO dark full-screen backgrounds or glowing neon grids.
- ❌ NO glassmorphism, blur filters, or futuristic cyber aesthetics.
- ❌ NO definitive guilt accusations (e.g. "Fraud Confirmed"); strictly use "Potential FWA Anomaly Indicator" and "Human Review Required".
- ❌ NO ungrounded AI summaries; all narrative points must link directly to synthetic claim records and rule triggers.
