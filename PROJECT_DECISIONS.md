# STRAW — Architecture & Product Decisions Log

## Decision 1: Native `node:sqlite` + Zero External Runtime Dependencies
- **Date:** 2026-11-02
- **Context:** STRAW requires persistent structured storage for opportunities, evidence, capabilities, products, tasks, approvals, and business intelligence without introducing unnecessary dependencies or brittle infrastructure.
- **Decision:** Use Node.js `v26.3.1` built-in `node:sqlite` (`DatabaseSync`), `node:http`, and `node:test`.
- **Rationale:** Zero external npm bloat, zero native compilation failures, instant startup, 100% offline/local capability, and ACID-compliant relational persistence in `data/straw.sqlite`.

## Decision 2: Epistemic Provenance Enforcement in Opportunity Scoring
- **Date:** 2026-11-02
- **Context:** Generic AI business tools hallucinate market demand and encourage building products simply because AI can code them.
- **Decision:** Every market research claim requires an explicit `evidence_tier` (`verified_evidence`, `practitioner_observation`, `estimate`, `assumption`). In the 11-Dimension Scoring Engine, if an opportunity has zero `verified_evidence` records, its Demand Evidence score is capped and the engine explicitly flags the risk or recommends `NEEDS_EVIDENCE` / `REJECT_WEAK_IDEA`.

## Decision 3: Anti-Repeat Memory for Rejected Opportunities
- **Date:** 2026-11-02
- **Context:** Section 9 requires STRAW to avoid repeatedly suggesting ideas that have already been rejected unless new evidence changes the situation.
- **Decision:** When creating or evaluating an opportunity, `intelligence-engine.js` checks existing `rejected` opportunities for category/keyword/problem overlap and returns an explicit warning alongside the prior `rejection_reason` and `invalidation_conditions` unless `new_verified_evidence_provided` is true.

## Decision 4: Hard Human Approval Checkpoints
- **Date:** 2026-11-02
- **Context:** Section 10 mandates explicit owner approval before spending money, purchasing services, publishing public content, launching products, running ads, contacting customers, sending business communications, or making irreversible production changes.
- **Decision:** Gated actions (such as transitioning a product to Stage 14/15 Launch, activating a paid acquisition channel, or committing monthly operational spend > $0) automatically generate a `pending` record in `approval_requests` and block execution until the owner explicitly approves or rejects the request with notes.

## Decision 5: Phase 7 & 7.1 Actual Source Content Verification & Financial Approval Hardening
- **Date:** 2026-11-04
- **Context:** In Phase 7, a record could be marked `verified_evidence` based on URL syntax and a manually supplied excerpt without confirming that the retrieved source actually contained the excerpt, and `allow_paid_apis: true` could bypass the paid research approval gate if passed directly.
- **Decision:**
  1. **Financial Approval Security:** Removed `allow_paid_apis` as an authorization mechanism. Paid API execution in `executeDiscoveryRun()` now requires an `approval_request_id` verified server-side immediately before execution via `ApprovalEngine.verifyFinancialAuthorization()`, checking `status === 'approved'`, non-expiration (`expires_at`), `action_category`, `authorization_scope === 'paid_research_execution'`, `authorized_provider_id`, and `financial_commitment_usd >= requestedCostUsd`.
  2. **Actual Source Content Verification:** `verifyAndClassifyEvidence()` and `retrieveAndVerifySourceContent()` now require `excerpt_verified_in_source === 1` and a SHA-256 `source_content_hash` from retrieved HTTP 200 source content before classifying a finding as `verified_evidence`. Valid URLs without retrieved content are held as `practitioner_observation` (`pending_review`, `url_format_only_unverified`). Retrieved pages that do not contain the excerpt are downgraded to `assumption` (`excerpt_mismatch_fabricated`). Pages blocking automated retrieval (`401`/`403`/`429`) preserve `original_source_url` and require manual review (`automated_retrieval_blocked_manual_required`).
  3. **Willingness-to-Pay Guardrail:** Product listings, plugin install counts, GitHub stars, and discussion comment/point counts are never accepted as proof of willingness to pay (`detectUnsupportedWillingnessToPayClaim()`).

## Decision 6: Phase 7.2 SSRF Defense-in-Depth, 64-Char SHA-256 Integrity & Offline/Live Test Separation
- **Date:** 2026-11-04
- **Context:** Source URL fetching (`retrieveAndVerifySourceContent()` and live research connectors) needed full Server-Side Request Forgery (SSRF) protection, `computeContentHash()` previously sliced SHA-256 digests to 32 characters, and the standard `npm test` suite included a live internet call.
- **Decision:**
  1. **SSRF Defense-in-Depth (`safePublicFetch`):** All outbound HTTP/HTTPS fetches validate protocol (`http:`/`https:` only), reject internal/localhost/single-label hostnames, block obfuscated numeric/hex/octal IPs before URL canonicalization, reject private/loopback/link-local/CGNAT/ULA/IPv4-mapped IPv4 & IPv6 ranges (`isPrivateOrReservedIp`), perform two-phase pre-flight and connection-time DNS resolution checks (`validatePublicTargetWithDns`) to mitigate DNS rebinding, disable automatic redirects (`redirect: 'manual'`) to validate every redirect target before following, cap response bodies at `512 KB` (`MAX_SOURCE_RESPONSE_BYTES`), enforce `5000ms` timeouts, and redact internal network details from API error responses.
  2. **Full 64-Character SHA-256 Content Hash:** `computeContentHash()` returns the complete 64-character hexadecimal SHA-256 digest (`/^[a-f0-9]{64}$/i`) stored in `source_content_hash`, while `computeEvidenceFingerprint()` remains a separate 24-character deduplication key stored in `content_fingerprint`.
  3. **Test Suite Separation:** Standard `npm test` (`tests/straw.test.js`) runs 100% deterministically offline. Live external connector verification runs via `npm run test:live` (`scripts/run-live-tests.js`) and exits with code `2` (`SKIPPED — NOT PASSED`) if internet access is unavailable.
  4. **Single-Use Scoped Financial Approvals:** `ApprovalEngine.createRequest()` and `POST /api/approvals` reject client attempts to pass `status !== 'pending'` or `decided_at`, and `verifyFinancialAuthorization()` enforces single-use consumption (`APPROVAL_ALREADY_USED`), cumulative spending limits, and opportunity entity scope.

## Technical Risks & Constraints Register
1. **Unverified External Market Data:** Without live paid API integrations (e.g., paid keyword/traffic APIs), market evidence must be entered or imported with explicit source links and provenance tiers. STRAW enforces this by never fabricating traffic or revenue statistics.
2. **Single-Node SQLite Concurrency:** `node:sqlite` with `PRAGMA journal_mode = WAL` handles personal operating system concurrency effortlessly; if STRAW is ever deployed as a multi-tenant cloud SaaS, the storage adapter in `src/db/` can be swapped to PostgreSQL.
