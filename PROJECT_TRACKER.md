# STRAW — Project Milestone Tracker

## Milestone 0: Repository Audit, Governance & Architecture Blueprint
- **Status:** Completed & Pushed
- **Acceptance Criteria:**
  - [x] Verify local workspace and remote `zakshub/straw` Git state without destructive actions.
  - [x] Ensure `~/2026-portfolio/ai-automation-lab/straw` and `/root/2026-portfolio/straw` resolve to the single canonical project.
  - [x] Ground UX/UI architecture in `/root/.intelligence/designer` (`DESIGN_BRIEF.md`).
  - [x] Establish `ARCHITECTURE.md`, `ROADMAP.md`, `PROJECT_STATUS.md`, and `PROJECT_DECISIONS.md`.

## Milestone 1: Core Foundation & Working End-to-End Operating System (Phase 1)
- **Status:** Completed, Verified & Pushed (`2b9acb3`)
- **Acceptance Criteria:**
  - [x] Persistent SQLite storage (`src/db/database.js`) using Node 26 native `node:sqlite`.
  - [x] Owner Profile & Capability Engine with 10 core capabilities and learning-cost assessment.
  - [x] Opportunity Discovery across 15 categories and 15 criteria with epistemic provenance tags.
  - [x] Transparent 11-Dimension Scoring Engine with weak-idea rejection rules.
  - [x] 15-Stage Product Execution Engine with real task-effort completion percentage.
  - [x] Mandatory Human Approval Gate and Personal Business Intelligence Memory with anti-repeat check.

## Milestone 2: Full Intelligence, Execution Diagnostics, Growth Operations & Hardening (Phases 2–6)
- **Status:** Completed & Verified
- **Concrete Tasks:**
  1. [x] **Phase 2 (Opportunity Intelligence Expansion):** Add structured `opportunity_competitors` matrix, non-destructive score sensitivity simulator (`POST /api/opportunities/:id/simulate`), and Markdown/JSON dossier exporter (`GET /api/opportunities/:id/export`).
  2. [x] **Phase 3 (Product Execution Deepening):** Add stage-order dependency diagnostics and next critical-path milestone identification (`dependency_diagnostics` in `src/engines/execution-engine.js`).
  3. [x] **Phase 4 (Growth & Monetization Operations):** Add `search_intent_clusters` planner (`POST /api/products/:id/clusters`) and honest Unit Economics / Break-Even calculator (`calculateUnitEconomics`).
  4. [x] **Phase 5 (Proactive AI Business Intelligence):** Implement `generateProactivePortfolioIntelligence` (`GET /api/intelligence/recommendations`) surfacing validation unlock actions, next execution steps, and unexplored high-fit product categories.
  5. [x] **Phase 6 (Hardening & Launch):** Add HTTP security headers (`nosniff`, `DENY`, `no-referrer`), CLI snapshot exporter (`node src/cli.js export-report`), and automated end-to-end tests (`tests/straw.test.js`).

## Milestone 3: Real-World Opportunity Intelligence & Evidence Verification (Phase 7)
- **Status:** Completed & Verified
- **Concrete Tasks:**
  1. [x] Add `research_sources`, `research_runs`, and `research_dossiers` tables and enrich `market_evidence` with `source_url`, `source_name`, `supporting_excerpt`, `published_at`, `confidence_score`, `source_reliability_score`, `verification_status`, `research_methodology`, `stance`, `is_stale`, and `content_fingerprint`.
  2. [x] Implement `verifyAndClassifyEvidence` and `analyzeOpportunityEvidenceQuality` in `src/engines/research-engine.js` so user-supplied labels or arbitrary strings cannot bypass verification without a real `http/https` URL and supporting excerpt.
  3. [x] Integrate stale evidence exclusion, duplicate detection, and conflicting evidence penalties (`HOLD_CONFLICTING_EVIDENCE`) into `scoreOpportunity` (`src/engines/scoring-engine.js`).
  4. [x] Implement legitimate public API collectors (`hn_algolia_api`, `wordpress_plugins_api`) with safe offline fallback and hard financial approval blocks for paid providers (`src-paid-keyword-api`).
  5. [x] Extend `src/public/index.html` and `src/public/app.js` with the `3. Research & Evidence Engine` workspace and manual verification controls.
  6. [x] Verify valid, invalid/unverified, duplicate, stale, and conflicting evidence cases in `tests/straw.test.js`.

## Milestone 4: Research Integrity, Approval Security & Live Connector Validation (Phase 7.1)
- **Status:** Completed & Verified
- **Concrete Tasks:**
  1. [x] **Financial Approval Security:** Removed `allow_paid_apis` bypass; implemented server-side `verifyFinancialAuthorization()` validating status, expiration, action category, authorization scope, provider identity, and spending limit; recorded `authorization_ref` on `research_runs`.
  2. [x] **Actual Evidence Verification:** Separated URL format checks from content verification (`retrieveAndVerifySourceContent()` / `checkExcerptInSourceContent()`); prevented URL-only manual entries from becoming `verified_evidence` without retrieved content confirmation; flagged fabricated excerpts (`excerpt_mismatch_fabricated`); handled blocked sources (`401`/`403`/`429`) and willingness-to-pay over-inference (`detectUnsupportedWillingnessToPayClaim()`).
  3. [x] **Research Connector Audit:** Implemented `getSourceCapabilityMatrix()` (`GET /api/research/matrix`) and live public collectors for `hn_algolia_api`, `wordpress_plugins_api`, `github_repos_api`, `reddit_public_json`, and `public_url_inspector`, while explicitly marking `marketplace_directory_inspector` and `paid_search_provider` as `unsupported`.
  4. [x] **Hacker News Research Quality:** Updated `collectFromHackerNewsAlgolia()` to retrieve verbatim comments (`tags=comment`), store comment URLs, separate story popularity from pain evidence, and treat story-only fallbacks as `pending_review` discovery signals.
  5. [x] **Testing & Live Validation:** Added comprehensive mocked unit/integration tests and 1 controlled live test against the free Hacker News Algolia endpoint in `tests/straw.test.js`.

## Milestone 5: Final Research Security & Test Reliability (Phase 7.2)
- **Status:** Completed & Verified
- **Concrete Tasks:**
  1. [x] **SSRF Prevention in Source Retrieval:** Implemented `isPrivateOrReservedIp()`, `isObfuscatedNumericHost()`, `validatePublicTargetWithDns()`, `readBodyWithSizeLimit()`, and `safePublicFetch()` in `src/engines/research-engine.js`. Rejects `localhost`, private IPv4/IPv6, loopback, link-local (`169.254.169.254`), CGNAT, IPv4-mapped IPv6, NAT64, 6to4, obfuscated integer/hex/octal IPs, and non-HTTP/HTTPS protocols; validates DNS resolution and blocks DNS rebinding (`ERR_SSRF_DNS_REBINDING`); manually validates redirects (`redirect: 'manual'`); enforces 512 KB response size limits and 5000ms timeouts; redacts internal IP/socket details from API responses.
  2. [x] **Full 64-Character SHA-256 Content Hash Validation:** Enforced 64-character hexadecimal SHA-256 digests (`computeContentHash()` / `isValidSha256Hex()`) for `source_content_hash`, distinct from the 24-character deduplication `content_fingerprint`.
  3. [x] **Test Suite Separation (`npm test` vs `npm run test:live`):** Kept `npm test` (`tests/straw.test.js`) 100% deterministic and offline; moved live external network validation into `scripts/run-live-tests.js` (`npm run test:live`), which reports `SKIPPED — NOT PASSED` and exits with code `2` when network access is unavailable.
  4. [x] **Financial Authorization Hardening:** Blocked client pre-approval injection in `POST /api/approvals` and `ApprovalEngine.createRequest()`, blocked reuse of consumed approvals (`APPROVAL_ALREADY_USED`), and enforced opportunity entity scope (`requestedOpportunityId`) and cumulative spend checks.

## Milestone 6: Real Market Discovery Experiment (Phase 8)
- **Status:** Completed & Verified (`100%`)
- **Concrete Tasks:**
  1. [x] **M8.1 — Live Multi-Category Market Research (2.0h, 100%):** Queried free public APIs (`hn_algolia_api`, `wordpress_plugins_api`, `github_repos_api`, W3C, W3Techs) across all 9 target categories (Global + Pakistan).
  2. [x] **M8.2 — Evidence Verification & SHA-256 Auditing (1.5h, 100%):** Verified 16 HTTP 200 source records with 64-char SHA-256 `source_content_hash` digests and enforced willingness-to-pay guardrails.
  3. [x] **M8.3 — 11-Dimension Scoring & Epistemic Filtering (1.5h, 100%):** Scored 11 opportunities across all 9 categories; shortlisted the 9 qualifying opportunities (`78.3`–`88.8/100`), held `ClinicFlow PK` (`70.8/100`, `NEEDS_EVIDENCE`), and rejected `AutoBlog AI` (`40.5/100`, `REJECT_WEAK_IDEA`).
  4. [x] **M8.4 — Dossier Synthesis & Validation Plan (1.0h, 100%):** Generated `MARKET_DISCOVERY_REPORT_PHASE8.md` with 12-question dossiers, 12-criterion evaluation tables, competitor comparisons, top 3 recommendations, and a 14-day zero-spend validation plan.

## Milestone 7: Independent Evidence Audit & Commercial Validation (Phase 8.1)
- **Status:** Completed & Verified (`100%`)
- **Concrete Tasks:**
  1. [x] **M8.1.1 — Adversarial Audit of Top 3 Opportunities:** Separated verified problem existence, market demand, competitor activity, and willingness to pay (`$0` proven across all candidates) from unverified projections for `Sentinel A11y`, `ContrastPair OKLCH`, and `PakCOD Shield`.
  2. [x] **M8.1.2 — Source Verification & Identical SHA-256 Hash Forensics:** Audited all supporting sources across 7 criteria; diagnosed the batch Search API JSON payload hashing defect in `collectFromGitHubPublicApi` and `collectFromWordPressPluginApi`; verified true individual page SHA-256 digests (`5a2d0d3d...` and `ce9aa4cb...`); uncovered the trailing-slash redirect loop in `extractValidPublicUrl()`.
  3. [x] **M8.1.3 — Scoring Engine Critique & Revised Commercial Scores:** Identified 4 score-inflation mechanisms in `src/engines/scoring-engine.js` and recalculated audited commercial scores (`Sentinel A11y`: `88.8` -> `71.2`; `AuditReady EAA`: `83.9` -> `69.5`; `ConversionFlow WP`: `78.3` -> `66.8`; `PakCOD Shield`: `84.1` -> `63.4`; `ContrastPair OKLCH`: `86.2` -> `58.5`).
  4. [x] **M8.1.4 — Real Buyer Investigation & Commercial Validation Protocol:** Investigated real buyer behavior across HN, WordPress.org, and GitHub; decoupled `Sentinel A11y` and `ContrastPair OKLCH`; replaced vanity validation metrics with a 4-step owner-gated buyer conversation & paid pilot protocol in `PHASE8_1_INDEPENDENT_EVIDENCE_AUDIT.md`.

## Milestone 8: STRAW V1.0 MVP Definition & Versioned Release Blueprint
- **Status:** Completed & Pushed (`32a36cf`)
- **Deliverables Created:**
  1. [x] [`STRAW_CURRENT_CAPABILITY_AUDIT.md`](./STRAW_CURRENT_CAPABILITY_AUDIT.md) — Classified every feature across the repository (`A` through `E`), identified duplicated functionality, and triaged Phase 8.1 technical defects.
  2. [x] [`STRAW_MVP_PRODUCT_BLUEPRINT.md`](./STRAW_MVP_PRODUCT_BLUEPRINT.md) — Defined the focused V1.0 workflow (`DISCOVER -> RESEARCH -> EVALUATE -> PRIORITIZE -> SELECT -> PLAN`), separated V1.0 vs. deferred features, streamlined the 4-view non-technical owner journey, and mapped the `11.5h` completion plan (`M-V1.1`, `M-V1.2`, `M-V1.3`).
  3. [x] [`STRAW_VERSION_ROADMAP.md`](./STRAW_VERSION_ROADMAP.md) — Defined self-contained releases for `V1.0` (Opportunity Intelligence), `V1.5` (Commercial Validation), `V2.0` (Product Execution), and `V3.0` (Growth & Business Automation).
  4. [x] [`STRAW_V1_ACCEPTANCE_CRITERIA.md`](./STRAW_V1_ACCEPTANCE_CRITERIA.md) — Established 10 objective acceptance criteria for calling STRAW V1.0 complete without confusing software functionality with commercial buyer validation.

## Milestone 9: STRAW V1.0 MVP Implementation (`M-V1.1`, `M-V1.2`, `M-V1.3`)
- **Status:** Completed, Verified & Pushed (`100%`)
- **Completed Milestones:**
  1. [x] **M-V1.1 — Evidence Integrity (`62d1104`, 100%):**
     - Fixed per-item 64-character SHA-256 `source_content_hash` attribution in `collectFromGitHubPublicApi` and `collectFromWordPressPluginApi` (plus idempotent migration repair in `src/db/database.js`).
     - Fixed trailing-slash preservation in `extractValidPublicUrl()` so directory URLs (`/TR/WCAG22/`, `/plugins/slug/`) resolve without 301 redirect loops.
     - Fixed `<script type="application/ld+json">` description extraction in `normalizeTextForVerification()`.
     - Implemented 4-way commercial evidence classification (`problem_existence`, `market_demand`, `competitor_activity`, `willingness_to_pay`).
  2. [x] **M-V1.2 — Commercial Evaluation (`d7732cb`, 100%):**
     - Separated `commercial_readiness_score` (`0–100`) from `technical_feasibility_score` (`0–100`) in `src/engines/scoring-engine.js`.
     - Prevented `problem_existence` and `competitor_activity` from unlocking high demand or monetization scores when `verified_willingness_to_pay_count === 0`.
     - Upgraded `exportOpportunityDossierMarkdown()` in `src/engines/opportunity-engine.js` with explicit score disclaimers (`NOT a probability of commercial success`), 4-category evidence tables, and `[UNVERIFIED COMMERCIAL ASSUMPTION]` labels.
  3. [x] **M-V1.3 — MVP Workspace (`100%`):**
     - Consolidated 7 navigation tabs into 4 clear V1 views (`1. Discover & Research`, `2. Evaluate & Compare`, `3. Select & Plan MVP`, `4. Approvals & Capabilities`) in `src/public/index.html` and `src/public/app.js`.
     - Streamlined opportunity creation to 4 core fields visible by default with optional advanced assumptions collapsed inside `<details class="advanced-assumptions-accordion">`.
     - Upgraded the Selected Opportunity MVP Planning workflow (`ExecutionEngine.promoteOpportunityToProduct`, `ExecutionEngine.updateMvpPlan`, `PATCH /api/products/:id`) to include `target_audience`, `mvp_must_have_features`, `mvp_excluded_scope`, `pricing_hypothesis`, and `buyer_validation_criteria` (`BUILD IF / PIVOT IF / ABANDON IF`).
     - Added automated Test Suites #8, #9, and #10 in `tests/straw.test.js` (`10/10` suites passing).
