# STRAW — Master Execution Roadmap

## Phase 0: Project Audit and Foundation (Completed & Verified)
- [x] Inspect canonical local directory (`/root/2026-portfolio/straw` & `~/2026-portfolio/ai-automation-lab/straw`) and remote GitHub repository (`zakshub/straw`).
- [x] Verify runtime environment (`Node.js v26.3.1`, native `node:sqlite`, `node:test`).
- [x] Consult mandatory UX/UI intelligence repository (`/root/.intelligence/designer`) and capability map (`/root/.intelligence/capability_map.md`).
- [x] Document technical risks, epistemic guardrails, visual intelligence brief, and modular system architecture.

## Phase 1: Core Foundation (Completed & Verified)
- [x] Establish zero-dependency modular Node.js + native `node:sqlite` persistence layer (`src/db/`).
- [x] Create core relational data models across opportunities, evidence, capabilities, products, tasks, growth channels, metrics, approvals, and business intelligence memory.
- [x] Implement Owner Profile and Capability Engine (`src/engines/capability-engine.js`) pre-loaded with owner's actual skills and learning-cost evaluator.
- [x] Implement Opportunity Discovery, Market Evidence, and Transparent 11-Dimension Scoring Engine (`src/engines/opportunity-engine.js`, `src/engines/scoring-engine.js`).
- [x] Implement Product Execution 15-Stage Lifecycle & Real Progress Engine (`src/engines/execution-engine.js`).
- [x] Implement Growth, Distribution & Monetization Engine (`src/engines/growth-monetization-engine.js`).
- [x] Implement Mandatory Human Approval Gate (`src/engines/approval-engine.js`) and Personal Business Intelligence Memory (`src/engines/intelligence-engine.js`).
- [x] Build Sentinel-grounded Light/Dark Companion Business Workspace UI (`src/public/`).

## Phase 2: Opportunity Intelligence Expansion (Completed & Verified)
- [x] Add structured competitor matrix comparison table per opportunity (`opportunity_competitors` + `/api/opportunities/:id/competitors`).
- [x] Add opportunity dossier export in Markdown & JSON (`/api/opportunities/:id/export`).
- [x] Add non-destructive sensitivity analysis simulator (`/api/opportunities/:id/simulate` — "What if verified demand evidence is acquired?").

## Phase 3: Product Execution Deepening (Completed & Verified)
- [x] Add stage-gate dependency diagnostics and out-of-order stage execution warnings (`dependency_diagnostics` in `src/engines/execution-engine.js`).
- [x] Surface next critical-path milestone task and remaining effort hours across all 15 stages.

## Phase 4: Growth and Monetization Operations (Completed & Verified)
- [x] Add Search-Intent & Conversion Asset Cluster Planner (`search_intent_clusters` + `/api/products/:id/clusters`).
- [x] Add Honest Unit-Economics & Break-Even Calculator (`calculateUnitEconomics` in `src/engines/growth-monetization-engine.js`).

## Phase 5: Proactive AI Business Intelligence (Completed & Verified)
- [x] Add cross-project Proactive Portfolio Intelligence Synthesizer (`generateProactivePortfolioIntelligence` + `/api/intelligence/recommendations`).
- [x] Surface validation unlock actions, next execution milestones, anti-repeat rejection rules, and unexplored high-fit categories matched to Level-5 capabilities.

## Phase 6: Hardening and Launch Readiness (Completed & Verified)
- [x] Add HTTP security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`) and path-traversal guards.
- [x] Add executive snapshot export CLI (`node src/cli.js export-report`) and end-to-end automated test coverage across all phases (`tests/straw.test.js`).

## Phase 7: Real-World Opportunity Intelligence & Evidence-Based Market Discovery (Completed & Verified)
- [x] Implement `ResearchEngine` (`src/engines/research-engine.js`) with source registry (`research_sources`), discovery runs (`research_runs`), and 10-step research dossiers (`research_dossiers`).
- [x] Implement strict evidence verification rules (`verifyAndClassifyEvidence`) requiring a valid public `http/https` URL, non-empty supporting excerpt (`>= 15` chars), freshness check (`<= 365` days for market claims), and source reliability threshold (`>= 0.50`) before granting `verified_evidence`.
- [x] Implement SHA-256 content fingerprint duplicate detection (`computeEvidenceFingerprint`) and conflicting evidence penalty (`HOLD_CONFLICTING_EVIDENCE`).
- [x] Enforce strict epistemic separation between source evidence and AI synthesis (`AI_GENERATED_SYNTHESIS_NOT_SOURCE_EVIDENCE`) and hard financial approval locks for paid research APIs.
- [x] Extend STRAW Workspace UI with the `3. Research & Evidence Engine` tab, Discovery Run launcher, Central Evidence Library, and manual verification workflow.

## Phase 7.1: Research Integrity, Approval Security & Live Connector Validation (Completed & Verified)
- [x] **Milestone 1 (Financial Approval Security):** Removed `allow_paid_apis` as an authorization mechanism. Paid API execution requires a server-side verified `approval_request_id` checked via `ApprovalEngine.verifyFinancialAuthorization()` validating status (`approved`), non-expiration (`expires_at`), action category (`spend_money`/`purchase_service`), scope (`paid_research_execution`), provider identity (`authorized_provider_id`), and spending limit (`financial_commitment_usd >= requestedCostUsd`). Records `authorization_ref` on `research_runs`.
- [x] **Milestone 2 (Actual Evidence Verification):** Separated URL syntax validation from actual source content verification (`retrieveAndVerifySourceContent` & `checkExcerptInSourceContent`). Records `original_source_url`, `final_source_url`, `retrieved_at`, `http_status`, `source_content_hash`, `excerpt_verified_in_source`, and `verification_method`. Unretrieved URL-only records remain `practitioner_observation` (`pending_review`), fabricated excerpts (`excerpt_mismatch_fabricated`) are downgraded to `assumption`, blocked sources (`401`/`403`/`429`) require manual review, and willingness-to-pay claims inferred solely from install/star/discussion counts are blocked (`detectUnsupportedWillingnessToPayClaim`).
- [x] **Milestone 3 (Research Connector Audit):** Published full Source Capability Matrix (`getSourceCapabilityMatrix()` / `GET /api/research/matrix`) covering all 8 sources across 7 adapter keys (`hn_algolia_api`, `wordpress_plugins_api`, `github_repos_api`, `reddit_public_json`, `public_url_inspector` = `implemented`; `marketplace_directory_inspector`, `paid_search_provider` = `unsupported`).
- [x] **Milestone 4 (Hacker News Research Quality):** Updated `collectFromHackerNewsAlgolia` to fetch actual comment records (`tags=comment`), extract verbatim `comment_text`, record comment item URLs (`https://news.ycombinator.com/item?id=<comment_id>`), separate story popularity metadata from user pain evidence, and classify story-only fallbacks strictly as `pending_review` discovery signals.
- [x] **Milestone 5 & 6 (Testing & Final Acceptance):** Expanded `tests/straw.test.js` with mocked unit/integration tests for all security, verification, and connector edge cases plus one controlled live test against the free Hacker News Algolia API.
