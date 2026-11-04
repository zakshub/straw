# STRAW — Current Capability & Repository Forensic Audit

**Date:** 2026-11-04  
**Repository:** `https://github.com/zakshub/straw` (`/root/2026-portfolio/straw`)  
**Audit Objective:** Inspect the actual codebase, SQLite database (`data/straw.sqlite`), HTTP API routes (`src/server.js`), frontend workspace (`src/public/`), CLI (`src/cli.js`), and test suites (`tests/straw.test.js`, `scripts/run-live-tests.js`) to classify every capability honestly before locking the STRAW V1.0 MVP boundary.

---

## 1. Classification Legend

Every capability in the repository is classified using five strict categories:
- **A. Implemented and verified working** — Code exists, passes automated/live verification, and works reliably without known logic flaws.
- **B. Implemented but not adequately verified** — Code exists and runs, but has a known verification gap, edge-case bug, or epistemic flaw uncovered during Phase 8.1.
- **C. Partially implemented** — Structural scaffolding or deterministic local logic exists, but external or commercial depth is incomplete.
- **D. Planned but not implemented** — Registered in the database or roadmap as a placeholder/unsupported adapter with no working implementation.
- **E. Unnecessary for the first release (Defer to V1.5 / V2.0 / V3.0)** — Code may already exist in the repository from Phases 3–5, but belongs to later lifecycle stages (post-launch telemetry, active software build tracking, search-intent cluster management) and adds cognitive clutter to V1.0.

---

## 2. Module-by-Module Capability Classification

### 2.1 Storage, Runtime & Security Infrastructure

| Capability / Component | Source File(s) | Class | V1.0 Role | Forensic Verification Notes |
| :--- | :--- | :---: | :--- | :--- |
| **Zero-Dependency SQLite Persistence (`node:sqlite` WAL)** | [`src/db/database.js`](file:///root/2026-portfolio/straw/src/db/database.js) | **A** | **Keep in V1.0** | 15 relational tables with foreign keys, idempotent column migrations (`ensureColumn`), and `:memory:` test isolation. Verified by `npm test`. |
| **SSRF Defense-in-Depth (`safePublicFetch`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L168-L454) | **A** | **Keep in V1.0** | Rejects `localhost`, private IPv4/IPv6, loopback, link-local (`169.254.169.254`), CGNAT, obfuscated numeric/hex/octal IPs, DNS rebinding (`validatePublicTargetWithDns`), and oversized responses (`>512 KB`). Verified in Test #7. |
| **HTTP Security Headers & Static File Guard** | [`src/server.js`](file:///root/2026-portfolio/straw/src/server.js#L19-L29) | **A** | **Keep in V1.0** | Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, path-traversal protection, and `1 MB` JSON body cap. |
| **Single-Use Scoped Financial Approval Gate** | [`src/engines/approval-engine.js`](file:///root/2026-portfolio/straw/src/engines/approval-engine.js#L141-L275) | **A** | **Keep in V1.0** | Blocks client pre-approval injection, checks `status === 'approved'`, expiration, scope, provider ID, opportunity entity match, spending limit, and single-use consumption (`APPROVAL_ALREADY_USED`). Verified in Test #3 & #6. |
| **Offline vs Live Test Suite Separation** | [`tests/straw.test.js`](file:///root/2026-portfolio/straw/tests/straw.test.js), [`scripts/run-live-tests.js`](file:///root/2026-portfolio/straw/scripts/run-live-tests.js) | **A** | **Keep in V1.0** | `npm test` runs 7 suites 100% offline (`1.8s`). `npm run test:live` runs live HN Algolia validation and exits with code `2` (`SKIPPED — NOT PASSED`) if offline. |

---

### 2.2 Owner Capability & Business Memory Engines

| Capability / Component | Source File(s) | Class | V1.0 Role | Forensic Verification Notes |
| :--- | :--- | :---: | :--- | :--- |
| **Owner Profile & 10-Skill Capability Matrix** | [`src/engines/capability-engine.js`](file:///root/2026-portfolio/straw/src/engines/capability-engine.js#L3-L127) | **A** | **Keep in V1.0** | Models Zak's actual strengths (UX/UI `5/5`, Product Arch `5/5`, Figma `5/5`, IA `5/5`, WordPress `4/5`, HTML/CSS `4/5`, Basic JS `3/5`, AI-Assisted Dev `5/5`). |
| **Capability Fit & Learning-Cost Evaluator** | [`src/engines/capability-engine.js`](file:///root/2026-portfolio/straw/src/engines/capability-engine.js#L133-L207) | **A** | **Keep in V1.0** | Deterministic calculation of `fit_score` (`1–10`), `execution_difficulty`, and `learning_cost_estimate` based on required vs missing skills and `dev_complexity`. |
| **Anti-Repeat Rejected Opportunity Memory** | [`src/engines/intelligence-engine.js`](file:///root/2026-portfolio/straw/src/engines/intelligence-engine.js#L57-L98) | **A** | **Keep in V1.0** | Detects keyword/category overlap with previously rejected ideas (`status = 'rejected'`) and flags a warning unless `hasNewVerifiedEvidence` is true. |
| **Proactive Portfolio Intelligence Queue** | [`src/engines/intelligence-engine.js`](file:///root/2026-portfolio/straw/src/engines/intelligence-engine.js#L104-L177) | **A** | **Keep in V1.0 (Simplify)** | Surfaces evidence unlock actions and pending owner gates. Hardcoded `unexplored_high_fit_categories` array (lines 145–164) is static and can be simplified. |

---

### 2.3 Research & Evidence Engine (`src/engines/research-engine.js`)

| Capability / Component | Source File(s) | Class | V1.0 Role | Forensic Verification Notes |
| :--- | :--- | :---: | :--- | :--- |
| **64-Char SHA-256 Content Hashing & Excerpt Match** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L622-L735) | **A** | **Keep in V1.0** | `computeContentHash()` produces a 64-char hex SHA-256 digest (`source_content_hash`) separate from the 24-char `content_fingerprint`. Rejects fabricated excerpts (`excerpt_mismatch_fabricated`). |
| **Willingness-to-Pay Over-Inference Guardrail** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L737-L785) | **A** | **Keep in V1.0** | `detectUnsupportedWillingnessToPayClaim()` downgrades `pricing` claims that cite only free install counts, GitHub stars, or discussion points. |
| **Hacker News Algolia Connector (`hn_algolia_api`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L1982-L2093) | **A** | **Keep in V1.0** | Retrieves verbatim comments (`tags=comment`), records `news.ycombinator.com/item?id=...`, and downgrades story-only hits to `practitioner_observation` discovery signals. |
| **WordPress.org Plugin API (`wordpress_plugins_api`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L2100-L2155) | **B** | **Fix Before V1.0** | **Defect Uncovered in Phase 8.1:** Passes the shared batch Search API JSON (`rawText`) as `retrieved_source_content` for all plugins in the loop while setting `source_url` to each plugin's HTML page, causing identical SHA-256 hashes across different plugins from the same search. |
| **GitHub Public Repos API (`github_repos_api`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L2160-L2218) | **B** | **Fix Before V1.0** | **Defect Uncovered in Phase 8.1:** Same batch Search API JSON hashing defect—caused `incluud/color-contrast-checker` and `Kl-webmedia/wunderui-contrast` to share the exact same `source_content_hash`. |
| **Public URL & W3C Spec Inspector (`public_url_inspector`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L640-L654), `#L2309-L2406` | **B** | **Fix Before V1.0** | **Two Defects Uncovered in Phase 8.1:** (1) `extractValidPublicUrl()` strips trailing slashes (`.replace(/\/$/, '')`), causing 301 redirect loops on servers that require trailing slashes (`w3.org`, `wordpress.org/plugins/.../`). (2) `normalizeTextForVerification()` strips `<script type="application/ld+json">`, missing descriptions embedded in JSON-LD. |
| **Reddit Public JSON Connector (`reddit_public_json`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L2223-L2304) | **B** | **Keep in V1.0 (Optional)** | Parser is tested with mocked responses, but Reddit frequently blocks datacenter IPs with `HTTP 403/429` without OAuth. Must be labeled clearly as best-effort / manual fallback in V1.0. |
| **10-Step Research Dossier Table (`research_dossiers`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L2412-L2532) | **C / E** | **Consolidate in V1.0** | Duplicates `OpportunityEngine.exportOpportunityDossierMarkdown()`. Stored in `research_dossiers` table via `POST /api/opportunities/:id/dossier`, but never displayed in the frontend UI. |
| **Marketplace Directory Scraper (`marketplace_directory_inspector`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L156-L167) | **D** | **Defer (`unsupported`)** | Explicitly marked `unsupported` (Product Hunt requires OAuth; Figma/Chrome Web Store block automated scraping). Individual public URLs use `public_url_inspector`. |
| **Paid Keyword/Search Trend Provider (`paid_search_provider`)** | [`src/engines/research-engine.js`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L140-L155) | **D / E** | **Defer to V2.0+** | Registered as `unsupported` and hard-locked behind `verifyFinancialAuthorization()`. Not needed for V1.0. |

---

### 2.4 Opportunity Evaluation, Scoring & AI Orchestration

| Capability / Component | Source File(s) | Class | V1.0 Role | Forensic Verification Notes |
| :--- | :--- | :---: | :--- | :--- |
| **15-Criteria Opportunity Record & Competitor Matrix** | [`src/engines/opportunity-engine.js`](file:///root/2026-portfolio/straw/src/engines/opportunity-engine.js#L27-L132) | **A** | **Keep in V1.0** | Full CRUD, competitor matrix (`opportunity_competitors`), and Markdown/JSON dossier export work reliably. |
| **11-Dimension Scoring Engine (`scoreOpportunity`)** | [`src/engines/scoring-engine.js`](file:///root/2026-portfolio/straw/src/engines/scoring-engine.js#L69-L244) | **B** | **Critical Fix Before V1.0** | **Commercial Scoring Flaw Uncovered in Phase 8.1:** (1) Unlocking full `demand_evidence` (`8.5–9.2/10`) only checks `active_verified_count >= 1`, failing to distinguish *problem/competitor existence* from *buyer willingness to pay*. (2) `monetization_potential` (`10%`) and `time_to_first_revenue` (`7%`) accept optimistic caller numbers with zero verified pricing/buyer-intent evidence. (3) Supply-side buildability accounts for `41%` of the total score, inflating free utility ideas to `84–88.8/100`. |
| **Score Sensitivity Simulator (`simulateOpportunityScore`)** | [`src/engines/opportunity-engine.js`](file:///root/2026-portfolio/straw/src/engines/opportunity-engine.js#L138-L196) | **A / E** | **Defer UI Button from V1.0** | Works mathematically, but simulating hypothetical evidence on unvalidated ideas distracted from real buyer validation in Phase 8. Hide button in V1.0 UI. |
| **Local Deterministic Strategist & Synthesizer (`AIOrchestrator`)** | [`src/engines/ai-orchestrator.js`](file:///root/2026-portfolio/straw/src/engines/ai-orchestrator.js#L13-L187) | **C** | **Keep Local Mode in V1.0** | Deterministic local synthesis and concept critique work and enforce `AI_GENERATED_SYNTHESIS_NOT_SOURCE_EVIDENCE`. Live external LLM API calls (`gemini`, `openai`, `anthropic`) are env-var flags only (not wired to SDK HTTP calls) and are unnecessary for V1.0. |

---

### 2.5 Product Execution & Growth Modules

| Capability / Component | Source File(s) | Class | V1.0 Role | Forensic Verification Notes |
| :--- | :--- | :---: | :--- | :--- |
| **Opportunity-to-Product Promotion & Roadmap Generator** | [`src/engines/execution-engine.js`](file:///root/2026-portfolio/straw/src/engines/execution-engine.js#L149-L252) | **C** | **Adapt for V1.0 `SELECT → PLAN`** | Generates product concept positioning, tech stack, monetization tradeoffs, and 15 milestone stages (`4h–16h` estimates). **Gap for V1.0:** Needs explicit MVP feature scope (`must_have_features` vs `excluded_scope`) and must default to a **Plan / Validation Blueprint** rather than pushing unvalidated ideas straight into Stage 7 software coding. |
| **Interactive 15-Stage Task Hour Tracker & Stage-14 Gate** | [`src/engines/execution-engine.js`](file:///root/2026-portfolio/straw/src/engines/execution-engine.js#L39-L144), `#L254-L320` | **A / E** | **Defer Active Build Tracking to V2.0** | Backend logic is verified and working, but interactive task hour logging belongs in **V2.0 (Product Execution)** once an opportunity has passed **V1.5 (Commercial Validation)**. |
| **Growth Channels, Search-Intent Clusters & LTV/CAC Telemetry** | [`src/engines/growth-monetization-engine.js`](file:///root/2026-portfolio/straw/src/engines/growth-monetization-engine.js#L1-L283) | **A / E** | **Defer to V3.0 (Growth & Automation)** | Works in backend tests, but managing SEO query clusters, visitor conversion rates, and LTV/CAC ratios before a product even exists or has 1 paying buyer is premature bloat. |

---

## 3. Identified Duplications & Unnecessary Complexity

### 3.1 Duplicated Functionality in the Current Codebase
1. **Two Overlapping Dossier Generators:**
   - [`OpportunityEngine.exportOpportunityDossierMarkdown()`](file:///root/2026-portfolio/straw/src/engines/opportunity-engine.js#L198-L267) (`GET /api/opportunities/:id/export`) generates a clean Markdown/JSON dossier on the fly and is linked in the UI.
   - [`ResearchEngine.generateAndSaveResearchDossier()`](file:///root/2026-portfolio/straw/src/engines/research-engine.js#L2412-L2532) (`POST /api/opportunities/:id/dossier`) writes a 10-step JSON wrapper plus the exact same Markdown output into the `research_dossiers` table, which the UI never reads.
   - **V1.0 Resolution:** Use a single canonical **Opportunity Evaluation & MVP Plan Report** exporter (`GET /api/opportunities/:id/export`).
2. **Duplicated Evidence Tables Across Tab 2 and Tab 3:**
   - Tab 2 (`Opportunity & Scoring Engine`) renders an opportunity's evidence table and an "Add Evidence" form.
   - Tab 3 (`Research & Evidence Engine`) renders a second "Central Evidence Library" table across all opportunities with manual Verify/Reject buttons.
   - **V1.0 Resolution:** Keep evidence inspection and verification directly inside the Opportunity Dossier & Research workflow so the owner does not have to jump between two tabs to verify a URL.
3. **Duplicated Research Collector Logic in `scripts/run-phase8-experiment.js`:**
   - `scripts/run-phase8-experiment.js` implemented custom helper functions (`fetchHnComment`, `fetchWpPlugins`, `fetchGitHubSearch`) instead of calling `ResearchEngine.executeDiscoveryRun()` for every source.
   - **V1.0 Resolution:** All discovery runs must flow through the single hardened `ResearchEngine` pipeline.

### 3.2 Unnecessary UI & Workflow Complexity for a Non-Technical Business Owner
1. **7 Top-Level Navigation Tabs (`index.html` lines 36–44):**
   - Exposes `1. Command Ledger`, `2. Opportunity & Scoring Engine`, `3. Research & Evidence Engine`, `4. Product Execution (15-Stage)`, `5. Growth & Monetization`, `6. Approval & Financial Gates`, and `7. Capabilities & Business Memory` simultaneously.
   - A business owner trying to go from `DISCOVER -> PLAN` is confronted with post-launch LTV/CAC tables, SEO cluster forms, and 15-stage task status dropdowns before choosing what to build.
2. **28-Field Manual Opportunity Intake Form (`index.html` lines 127–284):**
   - Creating a new opportunity currently requires filling out 14 text inputs, 9 manual numeric dimension sliders (`1–10`), and 3 initial evidence fields.
   - **V1.0 Resolution:** Allow creating an opportunity hypothesis with 4 core fields (`Title`, `Category`, `Problem Statement`, `Target Buyer`) plus optional evidence/URLs, while auto-initializing baseline dimension estimates transparently until evidence is attached.
