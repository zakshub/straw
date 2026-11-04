# STRAW — Technical Architecture & Data Specification

## 1. Architectural Principles

1. **Zero-Bloat, High-Resilience Runtime:** Built directly on Node.js 26 (`v26.3.1`) native modules (`node:sqlite`, `node:http`, `node:test`, `node:crypto`). Zero fragile native compilation dependencies (`node-gyp`), zero external container requirements for local operation, and instant startup on Linux, macOS, Windows, or mobile cloud workspaces.
2. **Epistemic Honesty by Construction:** Every market claim, demand metric, competitor record, and revenue projection must carry an explicit `evidence_type` (`verified_evidence`, `practitioner_observation`, `estimate`, `assumption`). The Scoring Engine automatically penalizes unverified assumptions and blocks "build because AI can build it" traps.
3. **Hard Human Approval Boundary:** Financial commitments, public publishing, product launches, paid ads, and external customer communications cannot execute autonomously; they create immutable `approval_requests` records requiring explicit owner sign-off.
4. **Replaceable AI Orchestration:** Business rules, scoring math, capability fit calculation, and completion tracking are deterministic and auditable in code. Optional LLM synthesis sits behind a strict provider interface (`src/engines/ai-orchestrator.js`).

---

## 2. Modular System Boundaries

```
/root/2026-portfolio/straw
├── src/
│   ├── db/
│   │   ├── database.js               # SQLite connection, WAL configuration, schema migrations
│   │   └── seed.js                   # Initial owner profile, capabilities, and baseline verified records
│   ├── engines/
│   │   ├── capability-engine.js      # Owner Profile & Capability Engine + skill-gap/learning-cost calculator
│   │   ├── opportunity-engine.js     # 15-category Opportunity Discovery & 15-point Evaluation + Evidence Engine
│   │   ├── scoring-engine.js         # Transparent 11-dimension Scoring & Decision Recommendation Engine
│   │   ├── execution-engine.js       # 15-stage Product Lifecycle, Milestones, Tasks & Real Progress Engine
│   │   ├── growth-monetization-engine.js # Acquisition Channels, Monetization Models & Honest Metrics Ledger
│   │   ├── approval-engine.js        # Mandatory Human Approval Gate & Financial/Public Control Ledger
│   │   ├── intelligence-engine.js    # Personal Business Intelligence, Decision Log & Anti-Repeat Guard
│   │   ├── research-engine.js        # Phase 7: Real-World Research, Evidence Verification & 10-Step Dossier Engine
│   │   └── ai-orchestrator.js        # Replaceable AI Provider Layer (Local Deterministic + LLM Adapters)
│   ├── public/
│   │   ├── index.html                # Semantic, WCAG 2.2-grounded Business Workspace shell
│   │   ├── styles.css                # Dual-appearance (Light Drafting / Dark Phosphor) design system
│   │   └── app.js                    # Interactive client controller for all 7 operational workspaces
│   ├── server.js                     # REST API + Static Workspace HTTP Server
│   └── cli.js                        # Diagnostic and audit CLI entry point
├── scripts/
│   └── run-live-tests.js             # Phase 7.2: Separated Live External API Test Runner (`npm run test:live`)
└── tests/
    └── straw.test.js                 # Deterministic offline acceptance test suite (`npm test`)
```

---

## 3. Persistent SQLite Data Schema (`data/straw.sqlite`)

- **`owner_profile`**: Single-row canonical record of owner identity, primary direction (`product_entrepreneurship`), secondary options, technical constraints, and risk tolerance.
- **`owner_capabilities`**: Tracked capabilities (`id`, `name`, `category`, `proficiency_level` 1–5, `execution_mode`, `notes`).
- **`opportunities`**: Core opportunity records covering all 15 evaluation fields (`id`, `title`, `slug`, `category`, `status`, `problem_statement`, `target_audience`, `demand_summary`, `competitors_summary`, `alternatives_summary`, `market_gaps`, `differentiation_potential`, `dev_complexity`, `estimated_dev_days`, `operational_cost_monthly_usd`, `monetization_model`, `acquisition_strategy`, `revenue_potential_notes`, `main_risks`, `required_capabilities_json`, `new_skills_needed_json`, `learning_cost_notes`, `overall_score`, `recommendation`, `score_breakdown_json`, `decision_rationale`, `rejection_reason`, `invalidation_conditions`, `created_at`, `updated_at`).
- **`market_evidence`**: Traceable research claims linked to opportunities (`id`, `opportunity_id`, `claim_type`, `statement`, `evidence_tier`, `requested_evidence_tier`, `source_citation`, `source_url`, `original_source_url`, `final_source_url`, `source_name`, `supporting_excerpt`, `published_at`, `observed_at`, `retrieved_at`, `http_status`, `source_content_hash`, `excerpt_verified_in_source`, `verification_method`, `confidence_score`, `source_reliability_score`, `verification_status`, `verification_notes`, `research_methodology`, `stance`, `is_stale`, `content_fingerprint`, `research_run_id`).
- **`research_sources`**: Registered market discovery sources and capability matrix metadata (`id`, `name`, `source_type`, `base_url`, `adapter_key`, `adapter_status` [`implemented` | `unsupported`], `auth_requirement`, `base_reliability_score`, `requires_api_key`, `is_paid_service`, `rate_limit_rpm`, `data_retrieved_summary`, `supported_evidence_types_json`, `known_restrictions`, `terms_and_robots_note`, `enabled`).
- **`research_runs`**: Auditable market discovery runs (`id`, `query_topic`, `target_category`, `opportunity_id`, `methodology`, `sources_queried_json`, `status`, `findings_created_count`, `duplicates_skipped_count`, `conflicts_detected_count`, `ai_synthesis_json`, `execution_notes`, `started_at`, `completed_at`, `authorization_ref`, `estimated_cost_usd`).
- **`research_dossiers`**: Persisted 10-step opportunity discovery dossiers (`id`, `opportunity_id`, `pipeline_steps_json`, `evidence_quality_summary_json`, `ai_synthesis_json`, `recommendation`, `overall_confidence`, `created_at`).
- **`approval_requests`**: Hard governance gate (`id`, `entity_type`, `entity_id`, `action_category`, `title`, `description`, `financial_commitment_usd`, `is_public_action`, `status` [`pending` | `approved` | `rejected`], `owner_decision_notes`, `requested_at`, `decided_at`, `authorized_provider_id`, `authorization_scope`, `expires_at`).
- **`business_intelligence_log`**: Cross-project memory (`id`, `entry_type` [`decision` | `lesson_learned` | `market_observation` | `research_finding`], `related_opportunity_id`, `related_product_id`, `title`, `summary`, `evidence_tier`, `implications`, `created_at`).

---

## 4. API Boundaries

| Method | Endpoint | Responsibility |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Runtime health, DB integrity, and active AI provider mode |
| `GET` | `/api/dashboard` | Unified executive summary, capability snapshot, pipeline counts, and pending approvals |
| `GET/POST` | `/api/capabilities` | Inspect or update owner profile and capability matrix |
| `GET/POST` | `/api/opportunities` | List/filter opportunities or create & score a new opportunity with anti-repeat check |
| `GET/PATCH` | `/api/opportunities/:id` | Detailed opportunity view, re-scoring, status transition (`approved`/`rejected`), and evidence list |
| `POST` | `/api/opportunities/:id/evidence` | Attach verified evidence, practitioner observations, estimates, or assumptions |
| `POST` | `/api/opportunities/:id/promote` | Convert an approved opportunity into an active 15-stage Product Project |
| `GET/POST` | `/api/products` | List active products with real calculated completion % and task breakdown |
| `POST/PATCH` | `/api/products/:id/tasks` | Add or update product tasks and recalculate real completion percentage |
| `GET/POST` | `/api/products/:id/growth` | Manage acquisition channels, monetization strategy, and honest performance metrics |
| `GET/POST/PATCH` | `/api/approvals` | List, create, approve, or reject gated financial/public actions |
| `GET/POST` | `/api/intelligence` | Query or record cross-project decisions, lessons learned, and market observations |
| `GET` | `/api/research/sources` | List registered research sources and terms/rate-limit metadata |
| `GET` | `/api/research/matrix` | Inspect Phase 7.1 Source Capability Matrix (`implemented` vs `unsupported`, auth, cost, rate limits, restrictions) |
| `GET/POST` | `/api/research/runs` | List or execute discovery runs (paid sources require server-verified `approval_request_id`; `allow_paid_apis` is ignored) |
| `GET/PATCH` | `/api/research/evidence` | Filter Central Evidence Library or perform manual review on pending/blocked findings |
| `POST` | `/api/research/evidence/:id/verify-source` | Retrieve live HTTP source URL and verify `supporting_excerpt` against actual page content |
| `POST` | `/api/ai/evaluate` | Run structured opportunity critique & capability-fit synthesis |
