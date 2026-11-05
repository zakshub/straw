# STRAW — Sentinel Visual Intelligence Brief (`zakshub/designer`)

Grounded in `/root/.intelligence/designer` (`SENTINEL.md`, `brain/brand-intelligence/decision-protocol.md`, `color-intelligence.md`, `category-priors.md`, `anti-monotony.md`, and `pilots/wcag-labels/`), as well as `zakshub/zos` (`core/ZAK-DESIGN-DNA-v1.md`, `core/ZAK-SKILLS-CATALOG.md`), `zakshub/jobster` (`docs/design/ENTERPRISE_COMMAND_CENTER.md`), `zakshub/seo` (`docs/05_FRONTEND_UX_SPEC.md`), and `zakshub/heartbeat` (`docs/UI_AUDIT.md`).

---

## A. Product Context & Operational Persona

- **Product:** STRAW — Personal AI Business Opportunity Discovery, Proof Checker & Product Execution Operating System
- **Category / Subcategory:** Enterprise Venture Intelligence, Evidence Validation & Product Execution Command Plane
- **Primary Jobs to be Done:**
  1. **Decide:** Systematically evaluate and compare candidate business opportunities using an 11-dimension scoring model with explicit dual sub-scores (Commercial Readiness vs. Technical Feasibility).
  2. **Create:** Architect 15-stage digital product MVP blueprints with strict non-goal boundaries and objective buyer validation criteria.
  3. **Monitor:** Track real verified market evidence, SHA-256 digital content hashes, live HTTP verification, competitor pricing isolation, and genuine committed revenue.
  4. **Govern:** Guard the USD $0 financial boundary through explicit human approval gates for external APIs, advertising spend, or customer outreach.
- **Core Audience:** Owner-operator (Senior UX/UI Architect & Product Strategist building digital assets) as well as non-technical founders seeking plain-language clarity.
- **Expertise Level:** Expert product/UX practitioner; high sensitivity to information hierarchy, typographic precision, epistemic honesty, and operational clarity.
- **Trust / Risk Level:** High — false confidence, ungrounded projections, or fabricated demand signals lead to wasted engineering weeks and capital destruction.
- **Primary Devices:** Desktop workstation (1440px+), laptop/tablet (768px–1024px), and mobile viewports (360px–390px responsive inspection).
- **Information Density:** High, structured, scannable analytical ledgers and contextual dossier inspectors.

---

## B. Brand Position & Visual Personality

- **Working Signature:** *Structured Intensity + Human-Controlled Complexity* (ZAK Design DNA v1).
- **Challenger + Institutional Rigor:** Rejects hype-driven "AI startup" clichés in favor of an analytical venture operating ledger.
- **Utilitarian + Editorial Precision:** Uses crisp tabular numerals (`font-variant-numeric: tabular-nums`), explicit provenance badges (`[VERIFIED]`, `[ASSUMPTION]`, `[GATE: PENDING APPROVAL]`), and architectural specification dividers.
- **Engineered + Tactile:** Surfaces feel like archival drafting paper (Light mode) and calibrated phosphor-slate instruments (Dark mode).

---

## C. Category Scan & Anti-Monotony Audit (`anti-monotony.md`)

- **Dominant Competitor Clichés Explicitly Rejected:**
  1. Neon purple/indigo/cyan "AI magic" gradients, floating chat bubbles, and glowing particle canvases.
  2. Decorative dashboard cards with fake sparklines or ungrounded percentages.
  3. The recurring Sentinel aesthetic habit flagged in `anti-monotony.md`: "warm cream canvas + near-black left sidebar + green accent + 20px rounded cards".
  4. Trading-terminal pure black (`#000000`) halation that exhausts eyes during prolonged qualitative reading.
- **Category Conventions Preserved & Refined:**
  1. Tabular comparison grids for multi-dimensional scoring and evidence inspection.
  2. Semantic status signaling reinforced by shape, icon, and explicit text label (never color alone).
  3. Command center hierarchy with 4px spatial rhythm, live status badges, and immediate keyboard-accessible controls.

---

## D. Structural Directions Explored & Trade-Off Matrix

1. **Direction 1 — "Archival Ledger & Calibrated Slate Instrument" (Selected):**
   - *Structure:* Top horizontal command bar with status cluster + 4-stage workspace navigation + dual-column analytical ledger (scannable opportunity table on left, deep 11-dimension breakdown & evidence matrix on right).
   - *Geometry & Radius:* Disciplined 3px–6px technical radii, 1px architectural hairlines, monospace data tokens, and warm drafting stone (`#F6F5F1`) paired with carbon ink (`#161615`) and signal vermilion (`#C84B31`). Dark mode uses calibrated slate (`#111317` / `#181B20`) with terracotta accent (`#E26D52`).
   - *Trade-offs:* Exceptional readability, high information density without clutter, distinct venture-ledger character.
2. **Direction 2 — "Dark Quant Terminal":**
   - *Structure:* Monolithic dark command screen with dense monospace tickers and high-contrast neon data tables.
   - *Trade-offs:* High scannability for numeric feeds, but severe eye strain during long qualitative problem statement analysis and lack of natural light mode. Rejected as primary.
3. **Direction 3 — "Modular Spatial Canvas":**
   - *Structure:* Freeform Kanban boards with draggable cards and floating toolbars.
   - *Trade-offs:* Tactile flexibility for brainstorms, but degrades rigorous 11-dimension comparative ranking, audit trails, and strict epistemic verification. Rejected.

---

## E. Mandatory Appearance Pairing (Light & Dark Companion Systems)

Per `/root/.intelligence/designer/brain/brand-intelligence/decision-protocol.md` (Section 7), Light and Dark appearances are engineered as separate perceptual systems rather than mechanical inversions:

### 1. Light Appearance ("Archival Drafting Ledger" — Primary Analytical Surface)
- **Canvas (`--bg-canvas`):** `#F6F5F1` (Warm drafting stone — eliminates blinding glare during multi-hour review)
- **Primary Surface (`--bg-surface`):** `#FFFFFF` (Pure white card surfaces for high content contrast)
- **Raised / Subtle Surface (`--bg-subtle`):** `#EFECE6` (Muted surface for navigation and control bars)
- **Elevated Component (`--bg-elevated`):** `#FAF9F6` (Lightly raised table headers and detail blocks)
- **Structural Hairlines (`--border-color`):** `#D5D1C8` (Warm stone border, 1px crisp separation)
- **Strong Border (`--border-strong`):** `#9E998E` (Defines focused containers and active selections)
- **Primary Ink (`--text-primary`):** `#161615` (Carbon black — WCAG AAA contrast ratio > 15:1)
- **Secondary Ink (`--text-secondary`):** `#4E4C47` (Graphite tone — WCAG AA+ contrast ratio > 7:1)
- **Muted Ink (`--text-muted`):** `#6E6B64` (Accessible metadata labels — WCAG AA contrast ratio > 4.5:1)
- **Interactive Accent (`--accent-primary`):** `#C84B31` (Signal Vermilion — high distinctiveness from generic SaaS blue)
- **Interactive Hover (`--accent-primary-hover`):** `#A93B23`
- **Accent Contrast Ink (`--accent-contrast`):** `#FFFFFF`
- **Semantic Status Architecture (Re-tuned with high-contrast text and borders):**
  - *Verified / Approved (`--status-verified`):* `#185C37` fg on `#E1F3E8` bg, border `#8EC9A8`
  - *Informational / Observational (`--status-info`):* `#1B4F79` fg on `#E4EFF8` bg, border `#96BEE0`
  - *Estimate / Warning (`--status-warn`):* `#8C4D04` fg on `#FDF0DF` bg, border `#E0B67E`
  - *Assumption / Danger / Reject (`--status-danger`):* `#9E2222` fg on `#FBE8E8` bg, border `#DFA0A0`

### 2. Dark Companion ("Night Operations Slate" — High-Focus Low-Light System)
- **Canvas (`--bg-canvas`):** `#111317` (Deep graphite slate — prevents pure black OLED halation)
- **Primary Surface (`--bg-surface`):** `#181B20` (Calibrated dark charcoal surface)
- **Raised / Subtle Surface (`--bg-subtle`):** `#20242B` (Subtle toolbar and filter background)
- **Elevated Component (`--bg-elevated`):** `#252A33` (Distinct nested cards and table headers)
- **Structural Hairlines (`--border-color`):** `#2C323B` (Low-glare technical hairline)
- **Strong Border (`--border-strong`):** `#495261` (Crisp active selection border)
- **Primary Ink (`--text-primary`):** `#ECEAE4` (Soft warm chalk — WCAG AAA contrast ratio > 14:1)
- **Secondary Ink (`--text-secondary`):** `#B0B6C2` (Cool slate — WCAG AA+ contrast ratio > 7.5:1)
- **Muted Ink (`--text-muted`):** `#858D9C` (Secondary metadata — WCAG AA contrast ratio > 4.8:1)
- **Interactive Accent (`--accent-primary`):** `#E26D52` (Desaturated luminous terracotta tuned for dark luminance)
- **Interactive Hover (`--accent-primary-hover`):** `#F08268`
- **Accent Contrast Ink (`--accent-contrast`):** `#111317`
- **Semantic Status Architecture (Calibrated alpha and luminance):**
  - *Verified / Approved (`--status-verified`):* `#6CE0A3` fg on `rgba(24, 92, 55, 0.28)` bg, border `#2D7A50`
  - *Informational / Observational (`--status-info`):* `#7CC0F5` fg on `rgba(27, 79, 121, 0.28)` bg, border `#336D9C`
  - *Estimate / Warning (`--status-warn`):* `#F5BC6B` fg on `rgba(140, 77, 4, 0.28)` bg, border `#96601E`
  - *Assumption / Danger / Reject (`--status-danger`):* `#F78686` fg on `rgba(158, 34, 34, 0.28)` bg, border `#9C3A3A`

---

## F. Multiscript Typography System

### 1. English (Default, LTR)
- **Primary Font Stack:** System UI / Inter (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif`)
- **Monospace Data Stack:** `"JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace`
- **Typographic Scale:**
  - Brand Title: `18px`, weight `700`, letter-spacing `0.04em`
  - Section Headings: `18px`, weight `700`, line-height `1.3`
  - Card / Box Headings: `15px`, weight `700`, line-height `1.35`
  - Primary Body: `13px`–`14px`, weight `400`/`500`, line-height `1.5`
  - Microcopy / Tokens: `11px`–`12px`, weight `600`, letter-spacing `0.04em`
  - Tabular Numerals: Enforced globally via `font-variant-numeric: tabular-nums` to ensure scannable numeric comparison.

### 2. Urdu (Secondary, RTL)
- **Typography Standard:** Strictly modern Naskh / Arabic sans-serif typography. **Nastaliq fonts are explicitly prohibited** due to calligraphic baseline shifts and layout breakage in dense software interfaces.
- **Font Stack Hierarchy:** `"29LT Zarid Sans AL", "29LT Bukra", "IBM Plex Sans Arabic", "Noto Sans Arabic", "Vazirmatn", "Geeza Pro", "Segoe UI", Tahoma, sans-serif`.
- **Licensing & Asset Disclosure:** 29LT fonts are referenced in the CSS font family stack for aesthetic intent, but are **not** bundled as local `.woff2` files. The system transparently falls back to widely installed modern Naskh/Sans fonts (`IBM Plex Sans Arabic`, `Noto Sans Arabic`, `Segoe UI`, `Tahoma`).
- **RTL Layout Rules:**
  - Mirror navigation order, table column sequence, form labels, and button placement.
  - Line-height relaxed to `1.75` to accommodate Arabic diacritics and ascenders/descenders.
  - Zero letter-spacing enforced on all Urdu text (`letter-spacing: 0 !important`) to prevent cursive glyph detachment.
  - Directional margins and paddings using CSS Logical Properties (`margin-inline-start`, `padding-inline-end`).

---

## G. WCAG 2.2 Accessibility & Label Grounding (`pilots/wcag-labels/`)

- **WCAG 2.5.3 (Label in Name):** Every interactive button, filter select, and input control ensures its programmatic accessible name begins with or exactly matches its visible text label.
- **WCAG 3.3.2 (Labels or Instructions):** Every form control has an explicit `<label for="...">` with clear contextual instructions and format expectations.
- **WCAG 2.4.7 (Focus Visible):** High-contrast focus rings (`2px solid var(--focus-ring)` with `2px` offset) applied to all interactive elements.
- **Non-Color State Reinforcement:** Every status badge, evidence tier tag, and approval gate includes an explicit textual prefix (`[VERIFIED]`, `[ASSUMPTION]`, `[REJECTED]`, `[GATE: PENDING APPROVAL]`) and structural border styling so color blindness never obscures system state.
- **WCAG 1.4.3 & 1.4.11 (Contrast):** Text contrast exceeds 7:1 for normal text and 4.5:1 for metadata. UI components and borders maintain at least 3:1 against adjacent surfaces.

---

## H. Four Workspace Views & Information Architecture

1. **View 1 — Discover & Research:** Free public search input, connected source matrix (Hacker News, GitHub, WordPress, Common Crawl), recent runs log, and verified evidence library with SHA-256 integrity hashes.
2. **View 2 — Evaluate & Compare:** Filterable opportunity table with dual sub-scores (Commercial Readiness vs Technical Feasibility), recommendation pills, and comprehensive 11-dimension dossier inspector with 4-category evidence audit.
3. **View 3 — Select & Plan MVP:** 15-stage digital product checklist, visual progress meter, narrow wedge feature definition, excluded non-goals, and falsifiable buyer validation rules.
4. **View 4 — Approvals & Capabilities:** Hard USD $0 budget lock banner, pending/approved governance ledger, and 10-point founder capability matrix with learning cost trade-offs.
5. **View 5 — Help Center & Knowledge Base:** 13 structured topics with plain-English definitions, practical examples, technical calculations, and instant term explainers (`(?)`).
