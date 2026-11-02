# STRAW — Master Execution Roadmap

## Phase 0: Project Audit and Foundation (Completed)
- [x] Inspect canonical local directory (`/root/2026-portfolio/straw` & `~/2026-portfolio/ai-automation-lab/straw`) and remote GitHub repository (`zakshub/straw`).
- [x] Verify runtime environment (`Node.js v26.3.1`, native `node:sqlite`, `node:test`).
- [x] Consult mandatory UX/UI intelligence repository (`/root/.intelligence/designer`) and capability map (`/root/.intelligence/capability_map.md`).
- [x] Document technical risks, epistemic guardrails, visual intelligence brief, and modular system architecture.

## Phase 1: Core Foundation (Milestone 1 — Completed & Verified)
- [x] Establish zero-dependency modular Node.js + native `node:sqlite` persistence layer (`src/db/`).
- [x] Create core relational data models across opportunities, evidence, capabilities, products, tasks, growth channels, metrics, approvals, and business intelligence memory.
- [x] Implement Owner Profile and Capability Engine (`src/engines/capability-engine.js`) pre-loaded with owner's actual skills and learning-cost evaluator.
- [x] Implement Opportunity Discovery, Market Evidence, and Transparent 11-Dimension Scoring Engine (`src/engines/opportunity-engine.js`, `src/engines/scoring-engine.js`).
- [x] Implement Product Execution 15-Stage Lifecycle & Real Progress Engine (`src/engines/execution-engine.js`).
- [x] Implement Growth, Distribution & Monetization Engine (`src/engines/growth-monetization-engine.js`).
- [x] Implement Mandatory Human Approval Gate (`src/engines/approval-engine.js`) and Personal Business Intelligence Memory (`src/engines/intelligence-engine.js`).
- [x] Build Sentinel-grounded Light/Dark Companion Business Workspace UI (`src/public/`).

## Phase 2: Opportunity Intelligence Expansion (Next Milestone)
- [ ] Add structured competitor matrix comparison table per opportunity.
- [ ] Add batch opportunity import/export (JSON/Markdown dossier export).
- [ ] Add interactive sensitivity analysis slider ("What if verified demand evidence increases?").

## Phase 3: Product Execution Deepening
- [ ] Add stage-gate checklists and UX architecture specification templates per stage.
- [ ] Add dependency graph blocker alerts across the 15 product stages.

## Phase 4: Growth and Monetization Operations
- [ ] Add search-intent cluster planner and directory launch checklist generator.
- [ ] Add unit-economics calculator (LTV:CAC ratio, payback period, break-even subscriber count) from real recorded data.

## Phase 5: Proactive AI Business Intelligence
- [ ] Add cross-opportunity pattern recognition and automated lesson-learned synthesis.
- [ ] Add optional live search/demand adapter hooks when external API keys are configured.

## Phase 6: Hardening and Production Launch
- [ ] Complete security review, backup/restore CLI workflow, mobile viewport ergonomics audit, and deployment guide.
