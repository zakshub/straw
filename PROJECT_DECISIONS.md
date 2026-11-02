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

## Technical Risks & Constraints Register
1. **Unverified External Market Data:** Without live paid API integrations (e.g., paid keyword/traffic APIs), market evidence must be entered or imported with explicit source links and provenance tiers. STRAW enforces this by never fabricating traffic or revenue statistics.
2. **Single-Node SQLite Concurrency:** `node:sqlite` with `PRAGMA journal_mode = WAL` handles personal operating system concurrency effortlessly; if STRAW is ever deployed as a multi-tenant cloud SaaS, the storage adapter in `src/db/` can be swapped to PostgreSQL.
