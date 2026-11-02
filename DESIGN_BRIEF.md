# STRAW — Sentinel Visual Intelligence Brief (`zakshub/designer`)

Grounded in `/root/.intelligence/designer` (`SENTINEL.md`, `brain/brand-intelligence/decision-protocol.md`, `color-intelligence.md`, `category-priors.md`, `anti-monotony.md`, and `pilots/wcag-labels/`).

---

## A. Product Context

- **Product:** STRAW — Personal AI Business Opportunity Discovery & Execution Operating System
- **Category / Subcategory:** Enterprise / Founder Venture Intelligence & Product Execution Control Plane
- **Primary Jobs to be Done:** Decide (evaluate & score market opportunities), Create (plan 15-stage digital products), Monitor (track verified evidence, real task completion, acquisition channels, and honest revenue metrics), and Govern (approve or reject financial/public commitments).
- **Core Audience:** Owner-operator (Senior UX/UI Architect & Product Strategist building digital assets).
- **Expertise Level:** Expert product/UX practitioner; high sensitivity to information hierarchy, typographic precision, and epistemic honesty.
- **Trust / Risk Level:** High — false confidence or fabricated metrics lead to wasted engineering weeks or capital loss.
- **Primary Devices:** Desktop workstation and mobile viewport (Pixel 7 Pro / responsive inspection).
- **Information Density:** High, structured, scannable tabular and dossier layouts.

---

## B. Brand Position & Visual Personality

- **Challenger + Institutional Rigor:** Rejects hype-driven "AI startup" aesthetics in favor of an analytical venture ledger.
- **Utilitarian + Editorial Precision:** Uses crisp tabular numerals (`font-variant-numeric: tabular-nums`), explicit provenance badges (`VERIFIED` vs `ASSUMPTION`), and architectural specification dividers.
- **Engineered + Tactile:** Surfaces feel like archival drafting paper (Light mode) and calibrated phosphor-slate instruments (Dark mode).

---

## C. Category Scan & Cliché Rejection

- **Clichés Explicitly Rejected:**
  1. Purple/indigo/cyan "AI magic" gradients and glowing chat bubbles.
  2. Decorative metric cards with fake sparklines or ungrounded percentages.
  3. The overused "warm cream canvas + near-black left sidebar + green accent + 20px rounded cards" formula flagged in `anti-monotony.md`.
- **Conventions Preserved:**
  1. Tabular comparison grids for multi-dimensional scoring.
  2. Semantic status signaling reinforced by shape, icon, and explicit text label (never color alone).

---

## D. Three Structural Directions Explored

1. **Direction 1 — "Archival Ledger & Drafting Instrument" (Selected):**
   - Top horizontal command bar with structural module tabs + split analytical workspace (dossier list on left, deep 11-dimension breakdown & evidence matrix on right), crisp `4px` technical radii, `1px` architectural hairlines, monospace data tokens, and warm drafting stone (`#F6F5F1`) paired with carbon ink (`#141413`) and signal vermilion (`#C84B31`).
2. **Direction 2 — "Dark Quant Terminal":**
   - Ultra-dense monochrome black terminal (`#000000`) with neon green/amber tickers. Rejected as primary because prolonged reading of qualitative problem statements and UX flows suffers on pure black (`#000000` halation).
3. **Direction 3 — "Modular Canvas Board":**
   - Spatial freeform Kanban cards with floating toolbars. Rejected because freeform cards obscure 11-dimension comparative ranking and strict epistemic evidence auditing.

---

## E. Mandatory Appearance Pairing (Light & Dark Companions)

Per `/root/.intelligence/designer/brain/brand-intelligence/decision-protocol.md` (Section 7), both **Light** and **Dark** appearances are engineered as independent perceptual systems (toggled seamlessly via the workspace header and persisted in preferences):

### 1. Light Appearance (Primary — "Archival Drafting Ledger")
- **Canvas (`--bg-canvas`):** `#F6F5F1` (Warm drafting stone — reduces glare during long analytical reading)
- **Primary Surface (`--bg-surface`):** `#FFFFFF`
- **Raised / Subtle Surface (`--bg-subtle`):** `#EFECE6`
- **Structural Hairline (`--border-color`):** `#D5D1C8`
- **Primary Ink (`--text-primary`):** `#161615` (WCAG AAA contrast > 15:1)
- **Secondary Ink (`--text-secondary`):** `#52504C` (WCAG AA+ contrast > 7:1)
- **Brand / Interactive Accent (`--accent-primary`):** `#C84B31` (Signal Vermilion — distinct from generic fintech blue and AI purple)
- **Semantic Provenance & Status:**
  - Verified Evidence / Approved (`--status-verified`): `#1B653E` on `#E3F3EA`
  - Practitioner Observation / Info (`--status-info`): `#1D5685` on `#E5EFF8`
  - Estimate / Warning (`--status-warn`): `#945306` on `#FDF0DF`
  - Assumption / Reject / High Risk (`--status-danger`): `#A82828` on `#FBE9E9`

### 2. Dark Companion ("Night Operations & Calibrated Slate")
- **Canvas (`--bg-canvas`):** `#111317` (Deep graphite slate — avoids pure `#000` halation)
- **Primary Surface (`--bg-surface`):** `#181B20`
- **Raised / Subtle Surface (`--bg-subtle`):** `#20242B`
- **Structural Hairline (`--border-color`):** `#2C323B`
- **Primary Ink (`--text-primary`):** `#ECEAE4`
- **Secondary Ink (`--text-secondary`):** `#A0A6B2`
- **Brand / Interactive Accent (`--accent-primary`):** `#E26D52` (Desaturated luminous terracotta calibrated for dark luminance hierarchy)
- **Semantic Provenance & Status:** Re-tuned background alpha and foreground luminance (`#5CD692`, `#6CB4EE`, `#F2B25C`, `#F27474`) so badges remain crisp without neon bleed.

---

## F. WCAG 2.2 Accessibility & Label Grounding (`pilots/wcag-labels/`)

- **WCAG 2.5.3 (Label in Name):** Every interactive button, filter, and form control ensures its programmatic accessible name begins with or exactly matches its visible text label.
- **WCAG 3.3.2 (Labels or Instructions):** Every input, select, and textarea has an explicit `<label for="...">` plus clear format instructions (e.g., evidence tier requirements, cost units in USD, effort in hours/days).
- **Non-Color Reinforcement:** Every score badge, evidence tier tag, and approval gate state includes an explicit text prefix (`[VERIFIED]`, `[ASSUMPTION]`, `[GATE: PENDING APPROVAL]`) and structural border treatment.
