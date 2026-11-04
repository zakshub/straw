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

## 2. Current Implementation Status (Phases 0–8.1 Complete & Verified)

| Module / Subsystem | Phase | Status | Implementation File | Verification |
| :--- | :--- | :--- | :--- | :--- |
| **SQLite Storage & 15-Table Schema** | Phase 1–7.2 | **Operational** | `src/db/database.js`, `src/db/seed.js` | Verified via `npm test` |
| **Owner Profile & Capability Engine** | Phase 1 | **Operational** | `src/engines/capability-engine.js` | Verified via `npm test` |
| **Opportunity Discovery, Competitor Matrix, Simulator & Markdown Export** | Phase 1–2 | **Operational** | `src/engines/opportunity-engine.js` | Verified via `npm test` |
| **Transparent 11-Dimension Scoring Engine** | Phase 1–7.1 | **Operational** | `src/engines/scoring-engine.js` | Verified via `npm test` |
| **15-Stage Product Execution & Dependency Diagnostics** | Phase 1–3 | **Operational** | `src/engines/execution-engine.js` | Verified via `npm test` |
| **Growth, Search Clusters, Monetization & Unit Economics** | Phase 1–4 | **Operational** | `src/engines/growth-monetization-engine.js` | Verified via `npm test` |
| **Human Approval & Single-Use Scoped Financial Authorization Verifier** | Phase 1, 7.1 & 7.2 | **Operational** | `src/engines/approval-engine.js` | Verified via `npm test` |
| **Personal Business Intelligence & Proactive Portfolio Synthesizer** | Phase 1–5 | **Operational** | `src/engines/intelligence-engine.js` | Verified via `npm test` |
| **SSRF-Hardened Research, 64-Char SHA-256 Content Verifier & Capability Matrix** | Phase 7, 7.1 & 7.2 | **Operational** | `src/engines/research-engine.js`, `scripts/run-live-tests.js` | `npm test` (offline) + `npm run test:live` |
| **Replaceable AI Orchestration Layer** | Phase 1–7 | **Operational** | `src/engines/ai-orchestrator.js` | Verified via `npm test` |
| **Sentinel Light/Dark Business Workspace UI & Hardened Server** | Phase 1–7.2 | **Operational** | `src/public/`, `src/server.js`, `src/cli.js` | Verified via HTTP & DOM checks |
| **Phase 8 Real Market Discovery Experiment & Dossier Report** | Phase 8 | **Completed** | `scripts/run-phase8-experiment.js`, `MARKET_DISCOVERY_REPORT_PHASE8.md` | 11 opportunities evaluated (9 qualified, 1 held, 1 rejected) |
| **Phase 8.1 Independent Evidence Audit & Commercial Validation** | Phase 8.1 | **Completed** | `PHASE8_1_INDEPENDENT_EVIDENCE_AUDIT.md` | Forensic SHA-256 & source audit, score reassessment, real buyer investigation (`CONDITIONAL HOLD` on build pending 10 buyer interviews) |
| **STRAW V1.0 MVP Consolidation & Versioned Release Blueprint** | Strategy / V1.0 Plan | **82.0% Verified (`11.5h` Remaining)** | `STRAW_MVP_PRODUCT_BLUEPRINT.md`, `STRAW_VERSION_ROADMAP.md`, `STRAW_V1_ACCEPTANCE_CRITERIA.md`, `STRAW_CURRENT_CAPABILITY_AUDIT.md` | Defines V1.0 (`DISCOVER -> PLAN`), defers V1.5/V2.0/V3.0 scope, and maps 3 final milestones (`M-V1.1` to `M-V1.3`) |

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
