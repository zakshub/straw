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
└── tests/
    └── straw.test.js                 # End-to-end acceptance test suite across all engines and HTTP endpoints
```

---

## 3. Persistent SQLite Data Schema (`data/straw.sqlite`)

- **`owner_profile`**: Single-row canonical record of owner identity, primary direction (`product_entrepreneurship`), secondary options, technical constraints, and risk tolerance.
- **`owner_capabilities`**: Tracked capabilities (`id`, `name`, `category`, `proficiency_level` 1–5, `execution_mode`, `notes`).
- **`opportunities`**: Core opportunity records covering all 15 evaluation fields (`id`, `title`, `slug`, `category`, `status`, `problem_statement`, `target_audience`, `demand_summary`, `competitors_summary`, `alternatives_summary`, `market_gaps`, `differentiation_potential`, `dev_complexity`, `estimated_dev_days`, `operational_cost_monthly_usd`, `monetization_model`, `acquisition_strategy`, `revenue_potential_notes`, `main_risks`, `required_capabilities_json`, `new_skills_needed_json`, `learning_cost_notes`, `overall_score`, `recommendation`, `score_breakdown_json`, `decision_rationale`, `rejection_reason`, `invalidation_conditions`, `created_at`, `updated_at`).
- **`market_evidence`**: Traceable research claims linked to opportunities (`id`, `opportunity_id`, `claim_type`, `statement`, `evidence_tier` [`verified_evidence` | `practitioner_observation` | `estimate` | `assumption`], `source_url_or_ref`, `observed_at`).
- **`products`**: Active product execution records linked to approved opportunities (`id`, `opportunity_id`, `name`, `tagline`, `current_stage_number` 1–15, `current_stage_name`, `positioning`, `tech_stack`, `monetization_model`, `primary_acquisition_channel`, `status`, `completion_pct`, `created_at`, `updated_at`).
- **`product_tasks`**: Granular execution tasks across the 15 lifecycle stages (`id`, `product_id`, `stage_number`, `stage_name`, `milestone_name`, `title`, `estimated_hours`, `actual_hours`, `status` [`todo` | `in_progress` | `blocked` | `done`], `dependencies`, `risks`, `acceptance_criteria`).
- **`growth_channels`**: Evaluated and active acquisition channels per product (`id`, `product_id`, `channel_type`, `fit_score`, `estimated_cac_usd`, `expected_return_notes`, `requires_spend`, `status`, `action_plan`).
- **`performance_metrics`**: Honest, non-fabricated business metrics (`id`, `product_id`, `period_label`, `visitors`, `acquisition_source`, `conversion_rate_pct`, `active_users`, `retention_pct`, `revenue_usd`, `operating_cost_usd`, `cac_usd`, `ltv_usd`, `data_provenance`, `recorded_at`).
- **`approval_requests`**: Hard governance gate (`id`, `entity_type`, `entity_id`, `action_type`, `title`, `description`, `financial_impact_usd`, `is_public_commitment`, `status` [`pending` | `approved` | `rejected`], `owner_notes`, `requested_at`, `decided_at`).
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
| `POST` | `/api/ai/evaluate` | Run structured opportunity critique & capability-fit synthesis |
