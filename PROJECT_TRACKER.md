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
