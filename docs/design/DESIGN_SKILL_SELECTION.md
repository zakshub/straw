# STRAW UX/UI Redesign — Skill Selection Report

**Date:** 2026-11-04  
**Project:** STRAW (`zakshub/straw`)  
**Mission:** UX/UI Frontend Redesign into a Distinctive, Polished Venture Operating Workspace  
**Status:** Approved Prior to Implementation  

---

## 1. Executive Summary & Inventory

In accordance with Section 10 of the Global Development Constitution and the STRAW UX/UI Redesign Brief, candidate skills across the canonical intelligence repositories (`zakshub/designer`, `zakshub/studio`, `zakshub/zos`, `zakshub/jobster`, `zakshub/seo`, and `zakshub/heartbeat`) were systematically evaluated.

- **Total Skills & Reference Frameworks Inspected:** 28 (Sentinel Designer Brain, Studio UX Boundary, 25 ZOS Skills, 3 Cross-Repo Venture Command Patterns)
- **Total Skills Selected:** 13 (9 Primary, 4 Supporting)
- **Total Skills Inspected but Excluded:** 15 (Documented with explicit operational rationale)

---

## 2. Selected Skills Matrix

| Repository | Skill ID | Source File Path | Relevance to STRAW Redesign | Concrete Task Responsibility | Expected Output Contribution | Role |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `zakshub/designer` | `designer-core` | `/root/.intelligence/designer/SENTINEL.md`<br>`brain/brand-intelligence/decision-protocol.md`<br>`color-intelligence.md`<br>`category-priors.md`<br>`anti-monotony.md`<br>`pilots/wcag-labels/` | Canonical UX/UI design authority; governs visual decisions, contrast, and layout. | Establish design language, semantic color roles, light/dark paired appearance, anti-monotony verification, and WCAG 2.2 label compliance. | Master visual design direction, token architecture, WCAG 2.2 compliance report. | **Primary** |
| `zakshub/studio` | `studio-ux-boundary` | `/root/.intelligence/studio/design/UX-BOUNDARY.md`<br>`SKILL.md` | Customer-safe boundary rules separating product presentation from internal prompts and raw reasoning. | Ensure user-facing UI surfaces only clear status, evidence provenance, and required actions without exposing raw internals. | Customer vs. internal audit; safe error and loading states. | **Supporting** |
| `zakshub/zos` | `01-zak-core` | `/root/.intelligence/zos/.agents/skills/01-zak-core/SKILL.md`<br>`core/ZAK-DESIGN-DNA-v1.md` | Core operating principles: structure ambiguity, system before surface, controlled contrast, and non-overclaiming. | Enforce ZAK Design DNA: Structured Intensity + Human-Controlled Complexity in operational mode. | Overall design cohesion, clear focal hierarchy, disciplined operational restraint. | **Primary** |
| `zakshub/zos` | `02-zak-systems-thinking` | `/root/.intelligence/zos/.agents/skills/02-zak-systems-thinking/SKILL.md` | Complex system decomposition into actors, relationships, states, and clear boundaries. | Organize 4-view workspace relationships (Research → Opportunities → Execution → Approvals). | Structured layout system, workspace state synchronization, clear module boundaries. | **Supporting** |
| `zakshub/zos` | `03-zak-product-thinking` | `/root/.intelligence/zos/.agents/skills/03-zak-product-thinking/SKILL.md` | Problem framing, friction reduction, MVP bounding, and non-goals isolation. | Structure the MVP planning interface, 15-stage checklist, feature exclusion list, and buyer validation gates. | MVP workbench UI layout, clear validation criteria display, non-goal callouts. | **Supporting** |
| `zakshub/zos` | `04-zak-ux-architecture` | `/root/.intelligence/zos/.agents/skills/04-zak-ux-architecture/SKILL.md` | Information architecture, dense-data layout, task flows, navigation, and operational clarity. | Redesign workspace navigation, command bar, dual-column analytical ledger, and empty/loading/error states. | Scannable analytical layouts, intuitive tab hierarchy, resilient interaction states. | **Primary** |
| `zakshub/zos` | `05-zak-ui-visual-design` | `/root/.intelligence/zos/.agents/skills/05-zak-ui-visual-design/SKILL.md` | High-quality visual execution: typography, hierarchy, surface treatments, borders, and responsive grid. | Design cards, tables, badges, score meters, dossier inspector, and responsive layouts (360px–1440px). | Elevated CSS styling, crisp hairlines, polished badges, scannable data grids. | **Primary** |
| `zakshub/zos` | `06-zak-design-systems` | `/root/.intelligence/zos/.agents/skills/06-zak-design-systems/SKILL.md` | Design token architecture, semantic variables, components, variants, and density rules. | Build coherent CSS custom property system for Light ("Archival Drafting Ledger") and Dark ("Night Operations Slate"). | Robust CSS token system (`--bg-canvas`, `--bg-surface`, `--status-*`, `--radius-*`). | **Primary** |
| `zakshub/zos` | `08-zak-design-to-code` | `/root/.intelligence/zos/.agents/skills/08-zak-design-to-code/SKILL.md` | Frontend translation preserving hierarchy, tokens, responsiveness, accessibility, and visual intent. | Implement CSS and HTML upgrades in `src/public/` with zero regression in existing DOM IDs and event listeners. | Clean, maintainable frontend implementation, responsive testing across viewports. | **Primary** |
| `zakshub/zos` | `17-zak-research-critique` | `/root/.intelligence/zos/.agents/skills/17-zak-research-critique/SKILL.md` | Objective critique using evidence, trade-offs, confidence levels, and counter-examples. | Conduct anti-monotony audit, evaluate candidate directions, and benchmark against venture command centers. | Anti-monotony review, trade-off matrix between terminal and archival styles. | **Supporting** |
| `zakshub/zos` | `20-zak-rtl-urdu-localization` | `/root/.intelligence/zos/.agents/skills/20-zak-rtl-urdu-localization/SKILL.md` | Native RTL interface design, modern Naskh/Sans typography, bilingual layout mirroring. | Ensure flawless Urdu RTL behavior, font fallbacks (strictly modern Naskh/Sans, no Nastaliq), and directional margins/paddings. | Full RTL CSS rules, mirrored layout grids, enhanced bilingual typography. | **Primary** |
| `zakshub/zos` | `22-zak-quality-review` | `/root/.intelligence/zos/.agents/skills/22-zak-quality-review/SKILL.md` | Rigorous, independent quality assurance across UX, visual hierarchy, accessibility, and code integrity. | Execute comprehensive audit before final completion, verify WCAG 2.2 AA/AAA contrast, and test responsiveness. | Final Quality Audit Report, severity classification, and release gating verification. | **Primary** |
| `zakshub/zos` | `23-zak-frontend-ui` | `/root/.intelligence/zos/.agents/skills/23-zak-frontend-ui/SKILL.md` | Semantic HTML, modern modular CSS/SCSS, component states, and vanilla JS UI integration. | Write semantic DOM structures, accessible form controls, clean badge markup, and dynamic state styling. | Enhanced `styles.css`, `index.html`, and `app.js` UI rendering routines. | **Primary** |

---

## 3. Secondary Cross-Repository Architectural References

In addition to the above skills, three reference repositories provide direct design pattern guidance:

1. **`zakshub/jobster` (`docs/design/ENTERPRISE_COMMAND_CENTER.md`):**
   - *Applied Pattern:* Compact command center hierarchy, 4px spatial rhythm, scannable data density, semantic status colors, and clean inline SVG iconography.
2. **`zakshub/seo` (`docs/05_FRONTEND_UX_SPEC.md`):**
   - *Applied Pattern:* Evidence presentation desk, 11-dimension opportunity scorecard breakdown, plain-language glossary definitions, and visible consequences for approval gates.
3. **`zakshub/heartbeat` (`docs/UI_AUDIT.md`):**
   - *Applied Pattern:* Research desk view acceptance criteria, honest distinction between verified data and hypotheses, accessible dialog dismissal, and responsive audit checklist.

---

## 4. Inspected but Excluded Skills (With Operational Rationale)

| Skill ID | Source Path | Reason for Exclusion |
| :--- | :--- | :--- |
| `07-zak-healthcare-ux` | `zos/.agents/skills/07-zak-healthcare-ux/SKILL.md` | Domain-specific to telehealth, RPM, clinician dashboards, and medical devices. Irrelevant to venture opportunity operating system. |
| `09-zak-ai-product-builder` | `zos/.agents/skills/09-zak-ai-product-builder/SKILL.md` | Focuses on LLM pipeline design, prompt engineering, and model routing. The current task is strictly frontend UX/UI redesign; no AI backend changes. |
| `10-zak-agent-workflow-architecture` | `zos/.agents/skills/10-zak-agent-workflow-architecture/SKILL.md` | Pertains to multi-agent state machines and background worker topologies. STRAW backend workflows are locked; task scope is presentation only. |
| `11-zak-graphic-brand-design` | `zos/.agents/skills/11-zak-graphic-brand-design/SKILL.md` | Pertains to logos, marketing graphics, posters, and print identity. STRAW requires software UI/UX engineering, governed by `05-zak-ui-visual-design`. |
| `12-zak-creative-direction` | `zos/.agents/skills/12-zak-creative-direction/SKILL.md` | Pertains to cinematic storytelling, photography art direction, and AI image pipelines. STRAW is an analytical venture workspace requiring utilitarian clarity. |
| `13-zak-game-ui-narrative` | `zos/.agents/skills/13-zak-game-ui-narrative/SKILL.md` | Focused on game HUDs, inventory screens, and video game menus. Not applicable to enterprise business intelligence. |
| `14-zak-storytelling-writing` | `zos/.agents/skills/14-zak-storytelling-writing/SKILL.md` | Pertains to creative prose, narrative arcs, and essays. UI microcopy is governed by `20-zak-rtl-urdu-localization` and plain-language principles. |
| `15-zak-comics-worldbuilding` | `zos/.agents/skills/15-zak-comics-worldbuilding/SKILL.md` | Pertains to comic sequential layouts, comic book panels, and graphic novels. Irrelevant to venture analysis. |
| `16-zak-teaching-learning-design` | `zos/.agents/skills/16-zak-teaching-learning-design/SKILL.md` | Pertains to curriculum building and classroom exercises. The Help Center documentation structure is already complete. |
| `18-zak-knowledge-protocol-architecture` | `zos/.agents/skills/18-zak-knowledge-protocol-architecture/SKILL.md` | Pertains to knowledge schemas, database protocols, and data models. The STRAW database schema is frozen; no protocol modifications are permitted. |
| `19-zak-automation-vps` | `zos/.agents/skills/19-zak-automation-vps/SKILL.md` | Pertains to server hosting, cron orchestration, VPS deployment, and daemon operations. Current task is local browser UI enhancement. |
| `21-zak-content-portfolio-linkedin` | `zos/.agents/skills/21-zak-content-portfolio-linkedin/SKILL.md` | Pertains to public portfolio presentation and social media carousels. Not applicable to the runtime application interface. |
| `24-zak-multimedia-elearning` | `zos/.agents/skills/24-zak-multimedia-elearning/SKILL.md` | Historical Flash/SCORM multimedia e-learning patterns. Obsolete for modern web software application design. |
| `25-zak-wordpress-blog-systems` | `zos/.agents/skills/25-zak-wordpress-blog-systems/SKILL.md` | Pertains to WordPress theme engines, PHP templates, and blogging platforms. STRAW is a standalone web application. |
| `studio-photographic-reality` | `studio/knowledge/photographic-reality/` | Pertains to universal image generation and camera lens realism. STRAW does not generate or display generated photorealistic artwork. |

---

## 5. Implementation Authorization

This Skill Selection Plan establishes the governing intellectual boundaries for the STRAW UX/UI Redesign. All design decisions, token allocations, typography rules, component layouts, and verification audits will strictly adhere to the selected skills above.
