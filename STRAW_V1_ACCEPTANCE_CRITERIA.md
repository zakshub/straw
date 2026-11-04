# STRAW V1.0 — Objective Acceptance Criteria & Completion Definition

**Date:** 2026-11-04  
**Repository:** `https://github.com/zakshub/straw` (`/root/2026-portfolio/straw`)  
**Purpose:** Define the exact, objective, verifiable conditions required to declare **STRAW V1.0 (Opportunity Intelligence & MVP Planning System)** complete, and prevent premature claims of commercial validation.

---

## 1. Epistemic Rule on V1.0 Completion vs. Commercial Validation

> **CRITICAL DISTINCTION:**  
> Passing all 10 criteria in this document proves that **STRAW V1.0 works reliably as an Opportunity Intelligence and MVP Planning software product**.  
> It does **NOT** prove that any business opportunity inside the database (`Sentinel A11y`, `AuditReady EAA`, `ConversionFlow WP`, etc.) is commercially validated. Commercial validation of an opportunity requires real buyer willingness-to-pay evidence (`V1.5`), never software execution alone.

---

## 2. The 10 Mandatory Acceptance Criteria for STRAW V1.0

STRAW V1.0 may be marked **`100% COMPLETE`** if and only if all 10 criteria below pass verification.

### Criterion 1: Reliable Execution in the Current Environment
- **Requirement:** STRAW must start, initialize its SQLite database (`data/straw.sqlite`), serve its HTTP API and web interface (`src/server.js`), and execute CLI commands (`src/cli.js`) reliably in the local Linux / Node.js (`v26.3.1`) environment with zero external npm dependencies.
- **Current Status:** **PASSING (`100%`)**
- **Verification Check:**
  - `npm test` exits with code `0`.
  - `npm run audit:db` prints the complete system status without errors.
  - `GET /api/health` returns `HTTP 200` with `{"status": "ok", "service": "straw-business-os"}`.

### Criterion 2: End-to-End Opportunity Discovery Workflow (`DISCOVER`)
- **Requirement:** STRAW must execute discovery runs (`POST /api/research/runs` and `ResearchEngine.executeDiscoveryRun()`) across its implemented free public connectors (`hn_algolia_api`, `wordpress_plugins_api`, `github_repos_api`, `public_url_inspector`) and manual intake, preserving all SSRF protections (`safePublicFetch` blocking localhost, private IPv4/IPv6, link-local, obfuscated IPs, DNS rebinding, and `>512 KB` responses) and handling trailing-slash redirects cleanly.
- **Current Status:** **PASSING (`100%` — Verified in Milestone `M-V1.1`, Suite #8)**

### Criterion 3: Traceable Research Evidence & Content Verification (`RESEARCH`)
- **Requirement:** Every `market_evidence` record must store traceable provenance (`original_source_url`, `final_source_url`, `source_name`, `supporting_excerpt`, `retrieved_at`, `http_status`, `verification_method`, 64-character hex `source_content_hash`, and 24-character `content_fingerprint`). No record can be marked `verified_evidence` unless `http_status === 200`, `excerpt_verified_in_source === 1`, and `isValidSha256Hex(source_content_hash)` is true.
- **Current Status:** **PASSING (`100%` — Verified in Milestone `M-V1.1`, Suite #8)**

### Criterion 4: Strict Epistemic Separation of Facts, Observations, Estimates, Assumptions & AI Synthesis
- **Requirement:** STRAW must classify and badge every claim distinctly as:
  1. `verified_evidence` (HTTP 200 content-verified source fact)
  2. `practitioner_observation` (unretrieved URL, blocked `403` source requiring manual review, or practitioner observation)
  3. `estimate` (calculated time/cost/market estimate)
  4. `assumption` (unverified hypothesis or downgraded fabricated excerpt)
  5. `AI_GENERATED_SYNTHESIS_NOT_SOURCE_EVIDENCE` (AI summaries, which can never count toward `active_verified_count`).
- **Current Status:** **PASSING (`100%`)**
- **Verification Check:** Verified by `tests/straw.test.js` Suites #2 and #5.

### Criterion 5: Realistic Commercial Evaluation Separated from Technical Feasibility (`EVALUATE`)
- **Requirement:** The scoring engine (`src/engines/scoring-engine.js`) and evidence quality analyzer (`analyzeOpportunityEvidenceQuality()`) must explicitly separate:
  - **4 Evidence Buckets:** (1) *Verified Problem Existence*, (2) *Verified Market Demand*, (3) *Verified Competitor Activity*, and (4) *Verified Willingness to Pay (`pricing` / buyer payment proof)*.
  - **2 Sub-Scores:** **Commercial Readiness Score (`0–100`)** vs. **Technical & Capability Feasibility Score (`0–100`)** alongside the Overall Score.
  - **Willingness-to-Pay Gate:** When an opportunity has `0` verified willingness-to-pay records (even if it has verified W3C specs, GitHub stars, or free WordPress plugin installs), `demand_evidence`, `monetization_potential`, and `commercial_readiness_score` must be capped and clearly flagged (`UNVERIFIED_WILLINGNESS_TO_PAY`).
- **Current Status:** **PASSING (`100%` — Verified in Milestone `M-V1.2`, Suite #9)**

### Criterion 6: Useful Ranked Opportunity Comparison & Auditable Dossier Report (`PRIORITIZE`)
- **Requirement:** STRAW must rank opportunities and allow exporting a comprehensive Markdown/JSON Opportunity Report (`GET /api/opportunities/:id/export`) that clearly explains:
  - Why an idea is recommended for validation, held, or rejected (`REJECT_WEAK_IDEA`).
  - Its Commercial Readiness vs. Technical Feasibility sub-scores and explicit score disclaimer (`NOT a probability of commercial success`).
  - Its 4-way evidence breakdown (Problem vs. Demand vs. Competitors vs. Willingness to Pay) and `[UNVERIFIED COMMERCIAL ASSUMPTION]` labels.
  - Its structured Competitor Matrix and Anti-Repeat Rejection Memory checks.
- **Current Status:** **PASSING (`100%` — Verified in Milestone `M-V1.2`, Suite #9)**

### Criterion 7: Practical MVP Concept & Build Plan Generation (`SELECT -> PLAN`)
- **Requirement:** For any owner-selected opportunity, STRAW must generate and persist a practical **MVP Product Concept & Build Plan** containing:
  1. Product Name, Tagline, Category, and Target Customer Persona (`target_audience`).
  2. **MVP Must-Have Features** (`mvp_must_have_features`, `<= 14` day AI-assisted build wedge) vs. **Explicitly Excluded Non-Goals** (`mvp_excluded_scope`).
  3. **Pricing & Monetization Hypothesis** (`pricing_hypothesis`) with explicit tradeoffs.
  4. **Pre-Build Buyer Validation Criteria** (`buyer_validation_criteria`, exact Build / Pivot / Abandon thresholds).
  5. **Phased Milestone Development & Launch Roadmap** with realistic effort hour estimates, dependencies, and risks tailored to the owner's UX/Figma/WP/HTML/CSS/AI-assisted development profile.
- **Current Status:** **PASSING (`100%` — Verified in Milestone `M-V1.3`, Suite #10)**

### Criterion 8: Mandatory Owner Approval & Financial Controls (`GOVERNANCE`)
- **Requirement:** STRAW must enforce hard human approval gates (`ApprovalEngine`) for all 8 gated action categories (`spend_money`, `purchase_service`, `publish_content`, `launch_product`, `run_ads`, `contact_customers`, `send_communications`, `production_change`). Paid research execution must verify server-side single-use scoped authorizations (`verifyFinancialAuthorization()`) and reject client-supplied pre-approval injection, expired/rejected/pending records, provider mismatches, spending overruns, and reused authorizations (`APPROVAL_ALREADY_USED`).
- **Current Status:** **PASSING (`100%`)**
- **Verification Check:** Verified by `tests/straw.test.js` Suites #3 and #6.

### Criterion 9: Reliable Persistence & State Recovery
- **Requirement:** All opportunities, evidence records, content hashes, competitor matrices, research runs, MVP plans, capabilities, approval requests, and business intelligence memory entries must persist reliably in SQLite across server restarts and be retrievable via both REST API and CLI.
- **Current Status:** **PASSING (`100%`)**
- **Verification Check:** Verified by `tests/straw.test.js` and `npm run audit:db`.

### Criterion 10: Focused Non-Technical V1 User Experience & Passing Automated Test Suite
- **Requirement:**
  1. The web workspace (`src/public/index.html` and `src/public/app.js`) must present a clean, understandable **4-View V1 Workflow** (`1. Discover & Research`, `2. Evaluate & Compare`, `3. Select & Plan MVP`, `4. Approvals & Capabilities`) with Light/Dark companion appearance modes and WCAG 2.2 accessible form labels, hiding premature V3.0 post-launch telemetry clutter.
  2. The offline automated test suite (`npm test`) must verify all V1.0 requirements—including the Phase 8.1 hash attribution fix, trailing-slash redirect fix, and commercial vs. feasibility scoring gates—and pass in `<= 5 minutes` (target `< 5 seconds`).
- **Current Status:** **PASSING (`100%` — Verified in Milestone `M-V1.3`, Suite #10)**

---

## 3. Summary Checklist for V1.0 Sign-Off

| # | Acceptance Criterion | Current Status | Verified Milestone |
| :-: | :--- | :---: | :---: |
| 1 | Reliable execution in local Node.js + SQLite environment | **PASS (`100%`)** | Complete |
| 2 | Opportunity discovery workflow + SSRF + redirect handling | **PASS (`100%`)** | `M-V1.1` (`62d1104`) |
| 3 | Traceable 64-char SHA-256 per-item content verification | **PASS (`100%`)** | `M-V1.1` (`62d1104`) |
| 4 | Epistemic separation (`verified`, `observation`, `estimate`, `assumption`, `AI`) | **PASS (`100%`)** | Complete |
| 5 | Commercial Readiness separated from Technical Feasibility (WTP gate) | **PASS (`100%`)** | `M-V1.2` (`d7732cb`) |
| 6 | Ranked opportunity comparison & 4-way evidence Markdown dossier | **PASS (`100%`)** | `M-V1.2` (`d7732cb`) |
| 7 | Practical MVP Concept, Scope, Validation Gate & Build Roadmap | **PASS (`100%`)** | `M-V1.3` |
| 8 | Mandatory Owner Approval & single-use financial authorization gates | **PASS (`100%`)** | Complete |
| 9 | Reliable SQLite persistence and state retrieval | **PASS (`100%`)** | Complete |
| 10 | Focused 4-View V1 UI & passing offline acceptance test suite (`npm test`) | **PASS (`100%`)** | `M-V1.3` |
| **—** | **OVERALL STRAW V1.0 READINESS** | **`100%` Verified (`10/10` Suites)** | **STRAW V1.0 Complete** |
