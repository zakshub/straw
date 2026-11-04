# STRAW — Project Audit & Live Implementation Status

**Last Updated:** 2026-11-04  
**Canonical Repository:** `https://github.com/zakshub/straw`  
**Local Workspace:** `/root/2026-portfolio/straw` (symlinked at `/root/2026-portfolio/ai-automation-lab/straw`)

---

## 1. Initial Audit Findings (Phase 0)

1. **Repository State at Inspection:**
   - Remote GitHub repository `zakshub/straw` existed (`created_at: 2026-11-02T06:57:49Z`, `size: 0`, 0 commits, `main` default branch).
   - Local workspace `/root/2026-portfolio/straw` existed as an empty directory (`0` files, uninitialized Git repository).
   - Path alias `/root/2026-portfolio/ai-automation-lab/straw` was linked directly to `/root/2026-portfolio/straw` to prevent directory drift or duplicate repositories.
2. **Runtime & Environment Assessment:**
   - Linux environment with Node.js `v26.3.1`, npm `11.17.0`, and Python `3.13.13`.
   - Native `node:sqlite` (`DatabaseSync`) and `node:test` are built into Node `v26.3.1`, allowing a fast, zero-external-dependency SQLite-backed architecture.

---

## 2. Current Implementation Status (STRAW V1.0 MVP Complete & Verified — `100%`)

| Module / Subsystem | Phase | Status | Implementation File | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **SQLite Storage, 15-Table Schema & Legacy Batch-Hash Repair** | Phase 1–V1.3 | **Operational (V1.0)** | `src/db/database.js`, `src/db/seed.js` | Verified via `npm test` (10 suites) |
| **Owner Profile & Capability Engine** | Phase 1 | **Operational (V1.0)** | `src/engines/capability-engine.js` | Verified via `npm test` |
| **Opportunity Discovery, 4-Way Evidence Dossier & Markdown Export** | Phase 1–V1.2 | **Operational (V1.0)** | `src/engines/opportunity-engine.js` | Verified via `npm test` |
| **Dual Commercial Readiness vs. Technical Feasibility Scoring Engine** | Phase 1–V1.2 | **Operational (V1.0)** | `src/engines/scoring-engine.js` | Verified via `npm test` |
| **Selected Opportunity MVP Blueprint & 15-Stage Execution Engine** | Phase 1–V1.3 | **Operational (V1.0)** | `src/engines/execution-engine.js` | Verified via `npm test` |
| **Growth, Search Clusters, Monetization & Unit Economics (Deferred to V3.0 UI)** | Phase 1–4 | **Backend Preserved** | `src/engines/growth-monetization-engine.js` | Verified via `npm test` |
| **Human Approval & Single-Use Scoped Financial Authorization Verifier** | Phase 1, 7.1 & 7.2 | **Operational (V1.0)** | `src/engines/approval-engine.js` | Verified via `npm test` |
| **Personal Business Intelligence & Proactive Portfolio Synthesizer** | Phase 1–5 | **Operational (V1.0)** | `src/engines/intelligence-engine.js` | Verified via `npm test` |
| **SSRF-Hardened Research, Per-Item 64-Char SHA-256 & 4-Category Classifier** | Phase 7–V1.1 | **Operational (V1.0)** | `src/engines/research-engine.js`, `scripts/run-live-tests.js` | `npm test` (offline) + `npm run test:live` |
| **Replaceable AI Orchestration Layer** | Phase 1–7 | **Operational (V1.0)** | `src/engines/ai-orchestrator.js` | Verified via `npm test` |
| **Consolidated 4-View V1.0 Workspace UI & Hardened Server** | Phase 1–V1.3 | **Operational (V1.0)** | `src/public/`, `src/server.js`, `src/cli.js` | Verified via HTTP & DOM checks |
| **Phase 8 Real Market Discovery Experiment & Dossier Report** | Phase 8 | **Completed** | `scripts/run-phase8-experiment.js`, `MARKET_DISCOVERY_REPORT_PHASE8.md` | 11 opportunities evaluated (9 qualified, 1 held, 1 rejected) |
| **Phase 8.1 Independent Evidence Audit & Commercial Validation** | Phase 8.1 | **Completed** | `PHASE8_1_INDEPENDENT_EVIDENCE_AUDIT.md` | Forensic SHA-256 & source audit, score reassessment, real buyer investigation (`CONDITIONAL HOLD` on build pending 10 buyer interviews) |
| **STRAW V1.0 MVP Release (`M-V1.1`, `M-V1.2`, `M-V1.3`)** | V1.0 Release | **Completed & Verified (`100%`)** | `src/engines/`, `src/public/`, `tests/straw.test.js` | All 10 automated acceptance suites pass (`10/10`) |
| **STRAW V1.0 Operational Smoke Test** | Post-V1.0 Smoke Test | **Completed & Verified (`100%`)** | `scripts/smoke-test-v1.js`, `STRAW_V1_OPERATIONAL_SMOKE_TEST.md` | Verified all 9 end-to-end workflows on live server (`http://127.0.0.1:4310`) with zero defects |

---

## 3. Phase 7.1 Source Capability Matrix

| Source Name | Adapter Key | Status | Auth Requirement | Cost Tier | Data Actually Retrieved | Evidence Types Supported | Rate Limit | Known Restrictions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hacker News Algolia Public Discussion API** | `hn_algolia_api` | `implemented` | `none` | Free | Verbatim `comment_text`, comment `objectID` URL, `story_id`, `story_title`, `created_at`, plus story fallback metadata | `demand`, `audience`, `competitor` | 60 req/min | Story popularity does not prove willingness to pay; story-only hits without comments are `pending_review` discovery signals |
| **WordPress.org Official Plugin Directory API** | `wordpress_plugins_api` | `implemented` | `none` | Free | Plugin `name`, `slug`, `version`, `short_description`, `active_installs`, `rating`, `num_ratings`, `last_updated` | `competitor`, `audience` | 30 req/min | Free install counts prove ecosystem presence/alternatives only, never willingness to pay |
| **GitHub Public Repositories & Issues API** | `github_repos_api` | `implemented` | `optional_token` | Free | `full_name`, `html_url`, `description`, `stargazers_count`, `open_issues_count`, `updated_at` | `competitor`, `technical` | 10 req/min | Unauthenticated limit 10 req/min; stars indicate technical alternatives, not commercial willingness to pay |
| **Reddit Public Discussions JSON Feed** | `reddit_public_json` | `implemented` | `none` | Free | Subreddit `title`, `selftext`, `permalink`, `created_utc`, `num_comments` | `demand`, `audience` | 10 req/min | Cloud/datacenter IPs are frequently blocked (`403`/`429`) without OAuth; link-only posts without `selftext` are discovery signals |
| **Public Competitor Website & Pricing Page Inspector** | `public_url_inspector` | `implemented` | `none` | Free | HTTP status, resolved URL, `<title>`, visible text body, SHA-256 content hash, excerpt verification | `pricing`, `competitor`, `demand` | 20 req/min | Requires `target_url`; JS-only SPAs or Cloudflare challenges (`403`/`429`) are flagged for manual review |
| **W3C & Regulatory Normative Specifications** | `public_url_inspector` | `implemented` | `none` | Free | Full public HTML specification text, document title, HTTP status, excerpt verification | `demand`, `technical`, `risk` | 30 req/min | Requires `target_url` pointing to public specification URI |
| **Public Ecosystem Marketplaces (Chrome Web Store / Figma / Product Hunt)** | `marketplace_directory_inspector` | `unsupported` | `oauth_or_browser_session` | Free | None (automated search disabled; individual public URLs can use `public_url_inspector`) | `competitor`, `customer_reviews` | 0 req/min | Product Hunt v2 requires OAuth token; Chrome Web Store & Figma Community block automated search scraping |
| **Commercial Search Trend & Keyword Volume API (DataForSEO / Brave Paid)** | `paid_search_provider` | `unsupported` | `paid_api_key_and_owner_approval` | Paid | None until commercial API credentials and server-side approved `approval_request_id` are provided | `demand` | 30 req/min | Hard-locked by `ApprovalEngine.verifyFinancialAuthorization()` |

---

## 4. STRAW V1.0 Operational Smoke Test Status

- **Status:** **Completed & Verified (`100%`)**
- **Artifact:** [`STRAW_V1_OPERATIONAL_SMOKE_TEST.md`](./STRAW_V1_OPERATIONAL_SMOKE_TEST.md)
- **Live Test Runner:** `scripts/smoke-test-v1.js` against daemon at `http://127.0.0.1:4310`
- **Verified Workflow Checkpoints:**
  1. [x] Git branch `main`, tracking `origin/main`, commit chain (`32a36cf`, `62d1104`, `d7732cb`, `bf0df32`) intact.
  2. [x] Application daemon started cleanly (`node src/server.js`), health probe returned 200 with local AI mode.
  3. [x] All 4 consolidated workspace views verified in DOM (`#tab-research`, `#tab-opportunities`, `#tab-execution`, `#tab-approvals`); premature V3 tabs (`data-tab="growth"`) confirmed hidden.
  4. [x] Live free public discovery run executed on `src-hn-algolia` querying `"accessible color contrast tool"` with 64-char SHA-256 hashes generated and de-duplication verified.
  5. [x] Opportunity evidence classifications (4-way) and dual sub-scores (Commercial 58.0, Technical 91.5) verified distinct on `opp-oklch-contrast-inspector`.
  6. [x] Simplified opportunity intake form verified (4 core fields) creating `opp-63b27d9b`.
  7. [x] Promotion to MVP plan verified with `<= 10`-day must-have features, excluded scope, and buyer validation gates (`BUILD IF / PIVOT IF / ABANDON IF`).
  8. [x] MVP plan inline editing verified (`PATCH /api/products/:id`) with SQLite persistence.
  9. [x] Full Markdown dossier export verified with score disclaimer, dual scores, 4-way evidence matrix, and Section 7 MVP blueprint.
  10. [x] Financial governance and human approval lock verified: pending ledger intact, unauthorized paid API run blocked with `MISSING_APPROVAL`.

