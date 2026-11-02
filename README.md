# STRAW — Personal AI Business Operating System

**Canonical Repository:** [https://github.com/zakshub/straw](https://github.com/zakshub/straw)  
**Primary Local Path:** `/root/2026-portfolio/straw` (aliased at `~/2026-portfolio/ai-automation-lab/straw`)

STRAW is a personal AI-assisted business opportunity discovery, market evaluation, product execution, distribution, and monetization operating system built for digital product entrepreneurship.

Unlike generic AI wrappers, SEO dashboards, or freelance job boards, STRAW operates as a structured **Venture Discovery & Execution Control Plane** anchored in the owner's actual capabilities, strict epistemic separation (`verified_evidence` vs `practitioner_observation` vs `estimate` vs `assumption`), transparent 11-dimension opportunity scoring, 15-stage product development tracking, multi-channel growth planning, and hard human approval gates for all financial and public commitments.

---

## Core Architecture & Modules

1. **Owner Profile & Capability Engine (`src/engines/capability-engine.js`)**
   - Models the owner's verified strengths (Senior UX/UI Design, Product Architecture, Figma & Design Systems, Complex Information Architecture, WordPress, HTML/CSS, Basic JS, AI-Assisted Development, Creative AI Workflows, Product Strategy).
   - Evaluates opportunity execution feasibility against current capabilities and quantifies learning cost when new technical skills are required.

2. **Opportunity Discovery & Market Research Engine (`src/engines/opportunity-engine.js`)**
   - Supports 15 digital business categories: Micro SaaS, Niche Websites, AI-Powered Tools, Browser Utilities, Interactive Web Apps, Browser Games, Digital Templates, Figma Resources & Design Systems, WordPress Themes/Plugins, Educational Products, Downloadable Guides, Creative Production Systems, Automation Products, Industry-Specific Software, and Emerging Digital Models.
   - Evaluates all 15 mandatory criteria per opportunity and attaches explicit provenance (`verified_evidence`, `practitioner_observation`, `estimate`, `assumption`) to every market claim.

3. **Transparent 11-Dimension Scoring & Decision Engine (`src/engines/scoring-engine.js`)**
   - Evaluates Problem Severity, Demand Evidence, Audience Accessibility, Competition Intensity, Differentiation, Development Feasibility, Initial Investment, Monetization Potential, Time to First Revenue, Long-Term Scalability, and Owner Capability Fit.
   - Automatically flags and recommends rejecting weak ideas (e.g., high technical complexity or zero verified demand evidence — *"Do not build simply because AI can build it"*).

4. **Product Execution & 15-Stage Lifecycle Engine (`src/engines/execution-engine.js`)**
   - Transforms approved opportunities into tracked product builds across 15 structured stages (from Problem Definition and Market Validation to UX Architecture, Implementation, QA, Deployment, Launch, and Post-Launch Improvements).
   - Computes completion percentage strictly from actual completed tasks and milestones — never fictional progress.

5. **Growth, Distribution & Monetization Engine (`src/engines/growth-monetization-engine.js`)**
   - Recommends acquisition channels (SEO, Content Marketing, Search Intent, Communities, Product Directories, Email, Partnerships, Organic Social, and Approval-Gated Paid Ads) matched to product category and audience accessibility.
   - Evaluates monetization models (Subscriptions, One-Time Purchases, Freemium, Licensing, Digital Downloads, Affiliate, Advertising, Productized Services) with explicit tradeoff analysis and honest performance metrics.

6. **Personal Business Intelligence & Anti-Repeat Memory (`src/engines/intelligence-engine.js`)**
   - Retains institutional memory of approved/rejected opportunities, business decisions, research findings, launch outcomes, and lessons learned.
   - Detects overlap with previously rejected ideas unless new verified evidence invalidates the prior rejection reason.

7. **Human Approval & Financial Control System (`src/engines/approval-engine.js`)**
   - Requires explicit owner sign-off before spending money, purchasing services, publishing public content, launching products, running ads, contacting customers, sending business communications, or modifying production systems.

8. **Replaceable AI Orchestration Layer (`src/engines/ai-orchestrator.js`)**
   - Operates deterministically out-of-the-box with zero API spend (`local` mode) while exposing clean, replaceable provider adapters for Gemini, OpenAI, or Anthropic when configured.

---

## Quick Start

```bash
# Run automated verification suite
npm test

# Inspect database and system status via CLI
npm run audit:db

# Start the STRAW Business Operating System server (default: http://127.0.0.1:4310)
npm start
```

---

## Documentation Index

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System architecture, data models, API boundaries, and security rules.
- [`DESIGN_BRIEF.md`](./DESIGN_BRIEF.md) — Sentinel (`zakshub/designer`) visual intelligence brief, light/dark companion design tokens, WCAG 2.2 label compliance, and anti-monotony audit.
- [`ROADMAP.md`](./ROADMAP.md) — Master phased execution roadmap (Phases 0–6).
- [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) — Audit report and live implementation status.
- [`PROJECT_TRACKER.md`](./PROJECT_TRACKER.md) — Milestone tracker, acceptance criteria, and verification log.
- [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md) — Architectural and product decisions log with risk register.
