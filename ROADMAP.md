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

## Phase 7.2: Final Research Security & Test Reliability (Completed & Verified)
- [x] **1. SSRF Prevention in Source Retrieval (`safePublicFetch`, `isPrivateOrReservedIp`, `validatePublicTargetWithDns`):**
  - Reject `localhost`, private IPv4 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.0/8`, `::1`), link-local & cloud metadata (`169.254.0.0/16`, `169.254.169.254`, `fe80::/10`), CGNAT (`100.64.0.0/10`), private/ULA IPv6 (`fc00::/7`, `fd00::/8`), IPv4-mapped IPv6 (`::ffff:0:0/96`), NAT64 (`64:ff9b::/96`), 6to4 (`2002::/16`), multicast/broadcast/reserved ranges, obfuscated numeric/hex/octal IPs (`2130706433`, `0x7f000001`, `0177.0.0.1`, `127.1`), and internal hostnames (`.local`, `.internal`, `.localhost`, `metadata.google.internal`).
  - Validate DNS resolution before connecting and perform two-phase DNS rebinding detection (`ERR_SSRF_DNS_REBINDING`).
  - Disable automatic redirects (`redirect: 'manual'`) and manually validate every redirect hop (`MAX_SAFE_REDIRECTS = 3`), blocking redirects to private/internal targets or non-HTTP/HTTPS schemes.
  - Enforce response size limits (`MAX_SOURCE_RESPONSE_BYTES = 512 * 1024`) and strict request timeouts (`5000ms`), and redact internal IP addresses and raw network socket error codes from API responses.
- [x] **2. Full 64-Character SHA-256 Content Hash Validation:**
  - Updated `computeContentHash()` and `isValidSha256Hex()` to enforce a complete 64-character hexadecimal SHA-256 digest (`/^[a-f0-9]{64}$/i`) for `source_content_hash`, kept strictly separate from the 24-character deduplication `content_fingerprint` (`computeEvidenceFingerprint()`).
- [x] **3. Separation of Live Tests from Standard Offline Tests:**
  - `npm test` (`tests/straw.test.js`) runs 100% deterministically offline with zero internet dependency.
  - `npm run test:live` (`scripts/run-live-tests.js`) executes the controlled live external test against Hacker News Algolia and exits with non-zero code `2` (`SKIPPED — NOT PASSED`) when network access is unavailable so a skipped live test is never reported as passed.
- [x] **4. Financial Authorization Hardening:**
  - Prevented clients from creating pre-approved requests (`POST /api/approvals` and `ApprovalEngine.createRequest()`), prevented reuse of single-use consumed `authorization_ref` records (`APPROVAL_ALREADY_USED`), and enforced opportunity entity scope (`requestedOpportunityId`) and cumulative spending limit checks immediately prior to execution.

## Phase 8: Real Market Discovery Experiment (Completed & Verified)
- [x] **M8.1 (Live Multi-Category Market Research):** Executed real public research queries across Hacker News Algolia, WordPress.org Plugin Directory API, GitHub Public Repositories API, W3C Normative Standards, and W3Techs across all 9 target categories (covering both Global and Pakistan-specific markets) with `$0` paid API spend.
- [x] **M8.2 (Evidence Verification & SHA-256 Auditing):** Ingested 16 content-verified HTTP 200 evidence records (all validated with 64-character SHA-256 `source_content_hash` digests) plus practitioner observations and contradicting risk evidence.
- [x] **M8.3 (11-Dimension Scoring & Epistemic Filtering):** Evaluated 11 candidate opportunities across all 9 categories: **9 opportunities qualified** for the shortlist (`78.3/100` to `88.8/100`), **1 opportunity (`ClinicFlow PK`, `70.8/100`)** was held as `NEEDS_EVIDENCE` due to unverified local clinic self-serve willingness to pay, and **1 opportunity (`AutoBlog AI`, `40.5/100`)** was rejected (`REJECT_WEAK_IDEA`) with contradicting evidence proving thin LLM wrappers fail economically.
- [x] **M8.4 (Dossier Synthesis & Validation Plan):** Generated [`MARKET_DISCOVERY_REPORT_PHASE8.md`](file:///root/2026-portfolio/straw/MARKET_DISCOVERY_REPORT_PHASE8.md) via [`scripts/run-phase8-experiment.js`](file:///root/2026-portfolio/straw/scripts/run-phase8-experiment.js) (`npm run experiment:phase8`) containing all 12 research answers, 12 evaluation scores, competitor matrices, top 3 recommendations, and a 14-day zero-spend validation plan for the #1 recommended opportunity.

## Phase 8.1: Independent Evidence Audit & Commercial Validation (Completed & Verified)
- [x] **1. Audit Top Three Opportunities (`Sentinel A11y`, `ContrastPair OKLCH`, `PakCOD Shield`):** Strictly separated verified problem existence, verified market demand, verified competitor activity, and verified willingness to pay (`$0` direct proof across all 3) from unverified buyer assumptions and commercial projections.
- [x] **2. Source Verification & Identical SHA-256 Hash Forensics:** Audited every source supporting the top 3 opportunities across 7 criteria; proved that the identical SHA-256 hashes on `incluud/color-contrast-checker` and `Kl-webmedia/wunderui-contrast` resulted from batch Search API JSON payload hashing in `collectFromGitHubPublicApi()`; verified their distinct individual live page hashes (`5a2d0d3d...` and `ce9aa4cb...`); documented the trailing-slash redirect loop in `extractValidPublicUrl()`.
- [x] **3. Reassess Opportunity Scores:** Identified 4 score-inflation mechanisms in `src/engines/scoring-engine.js` and published revised commercial audit scores in [`PHASE8_1_INDEPENDENT_EVIDENCE_AUDIT.md`](file:///root/2026-portfolio/straw/PHASE8_1_INDEPENDENT_EVIDENCE_AUDIT.md) without modifying production code or existing Phase 8 data.
- [x] **4. Real Buyer Investigation & Revised Validation Protocol:** Investigated real buyer behavior across UX agencies, SaaS teams, Pakistani WooCommerce stores, and open-source contrast utilities; decoupled `Sentinel A11y` and `ContrastPair OKLCH`; placed immediate product builds on `CONDITIONAL HOLD` pending 10 owner-approved buyer validation conversations and paid pilot/pre-order checks.

---

## Versioned Product Release Strategy (`V1.0` to `V3.0`)
See [`STRAW_MVP_PRODUCT_BLUEPRINT.md`](./STRAW_MVP_PRODUCT_BLUEPRINT.md), [`STRAW_VERSION_ROADMAP.md`](./STRAW_VERSION_ROADMAP.md), [`STRAW_V1_ACCEPTANCE_CRITERIA.md`](./STRAW_V1_ACCEPTANCE_CRITERIA.md), and [`STRAW_CURRENT_CAPABILITY_AUDIT.md`](./STRAW_CURRENT_CAPABILITY_AUDIT.md).

### STRAW `V1.0`: Opportunity Intelligence & MVP Planning (`100%` Complete & Verified)
- [x] **Milestone `M-V1.1` (Evidence Integrity, Per-Item Hashing & Redirect Fixes — Completed & Pushed `62d1104`):** Fixed batch Search API SHA-256 hash attribution in `collectFromGitHubPublicApi()` and `collectFromWordPressPluginApi()`; preserved trailing slashes in `extractValidPublicUrl()`; extracted JSON-LD descriptions before stripping `<script>` tags; implemented 4-way commercial evidence classification (`problem_existence`, `market_demand`, `competitor_activity`, `willingness_to_pay`).
- [x] **Milestone `M-V1.2` (Commercial vs. Feasibility Scoring Separation & Dossier Upgrade — Completed & Pushed `d7732cb`):** Separated `commercial_readiness_score` and `technical_feasibility_score` in `scoreOpportunity()`; capped `demand_evidence` and `monetization_potential` when `verified_willingness_to_pay_count === 0`; included explicit score disclaimers (`NOT a probability of commercial success`), 4-way evidence breakdown, and `[UNVERIFIED COMMERCIAL ASSUMPTION]` labels in exported Markdown dossiers.
- [x] **Milestone `M-V1.3` (Focused 4-View V1 Workspace & MVP Plan Refinements — Completed & Verified):** Consolidated UI navigation into 4 V1 views (`1. Discover & Research`, `2. Evaluate & Compare`, `3. Select & Plan MVP`, `4. Approvals & Capabilities`); hid premature V3 telemetry bloat; streamlined opportunity creation to 4 core fields; added structured MVP Must-Have Features, Excluded Non-Goals, Pricing Hypothesis, and Buyer Validation Criteria (`BUILD IF / PIVOT IF / ABANDON IF`); verified all 10 criteria in `STRAW_V1_ACCEPTANCE_CRITERIA.md` via `npm test` (`10/10` suites passing).

### Future Deferred Releases
- **STRAW `V1.5` (Commercial Buyer Validation — `12.0h` Est.):** Buyer discovery interview tracker, pricing/pilot commitment logger, owner-gated outreach scripts, and automated Build/Pivot/Abandon threshold gates.
- **STRAW `V2.0` (Product Execution & Launch Control — `14.0h` Est.):** Interactive 15-stage software build time-tracking for commercially validated products, AI-assisted build spec pack exporter, optional external LLM adapter, and Stage 14 Owner Launch Gate.
- **STRAW `V3.0` (Growth, Distribution & Business Telemetry — `16.0h` Est.):** Multi-channel distribution workspace, search-intent cluster planner, post-launch revenue/LTV:CAC ledger, and optional paid search volume integrations.
