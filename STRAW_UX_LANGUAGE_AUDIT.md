# STRAW UX Language & Cognitive Load Audit (`STRAW_UX_LANGUAGE_AUDIT.md`)

**Date:** 2026-11-04  
**Scope:** Full audit of STRAW V1.0 user interface (`src/public/index.html`, `src/public/app.js`, `src/public/styles.css`)  
**Design Governance:** Grounded in `/root/.intelligence/designer` (`SENTINEL.md`, `constitution/review-and-quality.md`, `constitution/evidence-policy.md`)

---

## 1. Executive Audit Findings

An inspection of the STRAW V1.0 interface identified **68 instances of technical, venture-capital, software-engineering, or epistemic jargon** exposed directly to the user without plain-language context. While STRAW's underlying engines enforce rigorous evidence verification and commercial separation, the user-facing wording previously required fluency in product management, software architecture, and venture evaluation to operate confidently.

### Key Usability & Communication Barriers Identified
1. **Navigation & Section Headings:** Terms like *"Deterministic Market Discovery"*, *"Source Adapter Capability Matrix"*, *"Attributed Market Evidence Ledger"*, and *"Gated Commitment Request"* obscure the simple 4-step workflow (*Find Business Ideas -> Compare & Score Ideas -> Plan First Product -> Approve Spending & Skills*).
2. **Scoring & Evaluation Metrics:** Metrics such as *"Heuristic Priority Index"*, *"Commercial Readiness"*, *"Technical & Capability Feasibility"*, *"Monetization Potential"*, and *"Buyer Validation Status: UNVERIFIED_WILLINGNESS_TO_PAY"* are accurate internally but intimidating to a non-technical user unless paired with everyday questions and expandable explanations.
3. **Evidence Provenance & Epistemic Tiers:** Terms like *"Provenance Tier"*, *"Practitioner Observation"*, *"SHA-256 Content Hash"*, *"Epistemic Label"*, and *"Stance: Contradicting"* need simple explanations of *why* STRAW checks web links and separates guesses from real proof.
4. **MVP Scoping & Execution Terminology:** Phrases like *"Core Wedge (&le;14-Day Build)"*, *"Explicitly Excluded Non-Goals (Anti-Scope-Creep Boundary)"*, and *"Critical-Path Milestone"* should be framed around *"What should we build first?"* and *"What will we skip for now so we finish fast?"*
5. **Absence of Localization & RTL Support:** The interface was English-only (`dir="ltr"`) with no Urdu (`اردو`) translation layer, no RTL layout mirroring, and no onboarding or Help Center for first-time users.

---

## 2. Screen-by-Screen Jargon Inventory & Plain-Language Mapping

### 2.1 Global Header & Primary Navigation

| Screen Location | Previous Technical Label | New Plain-English Label (`en`) | Pakistani Urdu Label (`ur`) | Internal ID / Enum Preserved |
| :--- | :--- | :--- | :--- | :--- |
| Brand Subtitle | Autonomous Business Discovery, Validation, Product Execution & Growth OS | Smart Business Idea Finder, Proof Checker & Product Planner | کاروباری آئیڈیاز کی تلاش، ثبوت کی جانچ اور مصنوعات کی منصوبہ بندی کا نظام | N/A |
| Header AI Pill | AI Mode: Local Deterministic | AI Mode: Safe Offline Mode (Free) | اے آئی موڈ: محفوظ لوکل موڈ (مفت) | `local` |
| Header Budget Pill | Budget Policy: Zero-Cost Default | Budget Rule: $0 Spent Without Your Approval | بجٹ اصول: آپ کی منظوری کے بغیر کوئی خرچ نہیں | `zero_cost` |
| Header Approvals Pill | Pending Approval Gates: N | Waiting for Your Approval: N | آپ کی منظوری کے منتظر: N | `pending_approvals` |
| Nav View 1 | 1. Discover & Research | 1. Find Business Ideas | ۱۔ کاروباری آئیڈیاز تلاش کریں | `data-tab="research"` |
| Nav View 2 | 2. Evaluate & Compare | 2. Compare & Score Ideas | ۲۔ آئیڈیاز کا موازنہ اور اسکور | `data-tab="opportunities"` |
| Nav View 3 | 3. Select & Plan MVP | 3. Plan First Product (MVP) | ۳۔ پہلی پروڈکٹ (MVP) کا منصوبہ | `data-tab="execution"` |
| Nav View 4 | 4. Approvals & Capabilities | 4. Approvals & My Skills | ۴۔ منظوریاں اور میری مہارتیں | `data-tab="approvals"` |
| Nav View 5 / Help | *(Missing)* | 5. Help & Guide | ۵۔ مدد اور رہنمائی | `data-tab="help"` |

---

### 2.2 View 1: Find Business Ideas (`#tab-research`)

| Element | Previous Technical Label | New Plain-English Label (`en`) | Pakistani Urdu Label (`ur`) | Needs `ExplainTerm`? |
| :--- | :--- | :--- | :--- | :--- |
| Section Heading | 1. Deterministic Market Discovery, Source Adapter Matrix & Evidence Verification | 1. Find Business Ideas & Check Real Market Proof | ۱۔ کاروباری آئیڈیاز تلاش کریں اور حقیقی مارکیٹ ثبوت چیک کریں | Yes (`market_discovery`) |
| Discovery Form Title | Execute Market Discovery Run (Free Public Sources by Default) | Search Public Websites for Real Problems & Ideas | حقیقی مسائل اور آئیڈیاز کے لیے عوامی ویب سائٹس تلاش کریں | Yes (`discovery_run`) |
| Input `run-topic` | Discovery Query / Problem Hypothesis | What problem or topic do you want to search? | آپ کس مسئلے یا موضوع کے بارے میں تلاش کرنا چاہتے ہیں؟ | No |
| Select `run-opp-select` | Link to Opportunity (Optional) | Connect to an Existing Idea (Optional) | کسی موجودہ آئیڈیا سے جوڑیں (اختیاری) | No |
| Select `run-source-select` | Research Source Adapter | Where should STRAW search? | سٹرا (STRAW) کہاں تلاش کرے؟ | Yes (`source_adapter`) |
| Select `run-live-mode` | Live Public Fetch Mode | Search Mode | تلاش کا طریقہ | Yes (`live_fetch_mode`) |
| Submit Button | Run Market Discovery | Search for Ideas & Proof | آئیڈیاز اور ثبوت تلاش کریں | No |
| Sources Box Title | Source Adapter Capability Matrix (Real vs. Unsupported Collectors) | Connected Websites & Search Sources (Free vs. Paid) | منسلک ویب سائٹس اور تلاش کے ذرائع (مفت بمقابلہ ادا شدہ) | Yes (`source_adapter`) |
| Runs Box Title | Recent Discovery Runs & Local Epistemic Synthesis | Recent Searches & Plain-Language Summary | حالیہ تلاشیں اور آسان خلاصہ | Yes (`epistemic_synthesis`) |
| Evidence Library Title | Central Attributed Evidence Library & HTTP Source Verification | All Saved Proof & Website Verification Check | تمام محفوظ شدہ ثبوت اور ویب سائٹ کی تصدیق | Yes (`evidence_verification`) |

---

### 2.3 View 2: Compare & Score Ideas (`#tab-opportunities`)

| Element | Previous Technical Label | New Plain-English Label (`en`) | Pakistani Urdu Label (`ur`) | Needs `ExplainTerm`? |
| :--- | :--- | :--- | :--- | :--- |
| Section Heading | 2. Opportunity Evaluation, Commercial Readiness vs. Feasibility & 4-Way Evidence | 2. Compare Business Ideas: How Ready to Sell vs. How Easy to Build | ۲۔ کاروباری آئیڈیاز کا موازنہ: فروخت کی تیاری بمقابلہ بنانے میں آسانی | Yes (`score_separation`) |
| KPI 1 | Evaluated Opportunities | Business Ideas Checked | جانچے گئے کاروباری آئیڈیاز | No |
| KPI 2 | Planned MVP Products | First Products Planned | منصوبہ بند پہلی مصنوعات (MVP) | Yes (`mvp_scope`) |
| KPI 3 | Pending Owner Gates | Waiting for Your Approval | آپ کی منظوری کے منتظر فیصلے | Yes (`approval_gate`) |
| KPI 4 | Owner Capability Areas | Your Skills & Strengths | آپ کی مہارتیں اور طاقتیں | Yes (`capability_fit`) |
| KPI 5 | Institutional Memory | Saved Lessons & Notes | محفوظ کردہ اسباق اور مشاہدات | No |
| Table Metric 1 | Priority Index (Heuristic Index) | Overall Idea Score (Priority Index) | مجموعی آئیڈیا اسکور (ترجیحی اشاریہ) | Yes (`priority_index`) |
| Table Metric 2 | Commercial Readiness | How Ready Is This Idea to Sell? | یہ آئیڈیا فروخت کے لیے کتنا تیار ہے؟ | Yes (`commercial_readiness`) |
| Table Metric 3 | Technical Feasibility | How Difficult Is It to Build? | اسے بنانا کتنا آسان یا مشکل ہے؟ | Yes (`technical_feasibility`) |
| Evidence Cat 1 | 1. Problem Existence | 1. Is the Problem Real? (Problem Existence) | ۱۔ کیا مسئلہ واقعی موجود ہے؟ | Yes (`cat_problem_existence`) |
| Evidence Cat 2 | 2. Market Demand | 2. Are People Looking for This? (Market Demand) | ۲۔ کیا لوگ اس کا حل تلاش کر رہے ہیں؟ | Yes (`cat_market_demand`) |
| Evidence Cat 3 | 3. Competitor Activity | 3. Who Else Is Doing This? (Competitor Activity) | ۳۔ مارکیٹ میں اور کون یہ کام کر رہا ہے؟ | Yes (`cat_competitor_activity`) |
| Evidence Cat 4 | 4. Unverified Buyer WTP | 4. Unverified Interest in Paying (No Payment Proof Yet) | ۴۔ ادائیگی میں غیر مصدقہ دلچسپی (ابھی پکا ثبوت نہیں) | Yes (`cat_unverified_wtp`) |
| Evidence Cat 5 | 5. Verified Commercial Commitment | 5. Would Customers Pay for This? (Verified Payment / Signed Order) | ۵۔ کیا گاہک واقعی پیسے دیں گے؟ (مصدقہ ادائیگی یا معاہدہ) | Yes (`cat_verified_commitment`) |
| Intake Form Title | Evaluate New Opportunity (4 Core Fields) | Add a New Business Idea (4 Simple Questions) | نیا کاروباری آئیڈیا شامل کریں (۴ آسان سوالات) | No |
| Accordion Summary | Advanced Assumptions & Optional Initial Evidence (11 Optional Fields — Expand if needed) | Extra Details, Cost Guesses & Optional Link (Click to open if needed) | اضافی تفصیلات، لاگت کے اندازے اور لنک (ضرورت ہو تو کھولیں) | Yes (`evidence_tiers`) |

---

### 2.4 View 3: Plan First Product / MVP (`#tab-execution`)

| Element | Previous Technical Label | New Plain-English Label (`en`) | Pakistani Urdu Label (`ur`) | Needs `ExplainTerm`? |
| :--- | :--- | :--- | :--- | :--- |
| Section Heading | 3. Selected Opportunity MVP Plan, Scope Boundaries & Buyer Validation Criteria | 3. Plan Your First Simple Product (What to Build First & How to Test Buyers) | ۳۔ اپنی پہلی سادہ پروڈکٹ کا منصوبہ بنائیں (پہلے کیا بنائیں اور خریداروں کو کیسے پرکھیں) | Yes (`mvp_scope`) |
| Blueprint Box 1 | Target Customer Segment [ASSUMPTION UNTIL VALIDATED] | Who Is the First Customer? [Guess Until Proven] | پہلا گاہک کون ہے؟ [تصدیق ہونے تک اندازہ] | Yes (`customer_assumption`) |
| Blueprint Box 2 | Must-Have V1 Features (<=14-Day Build Wedge) | What Should We Build First? (Essential Features Only) | ہمیں سب سے پہلے کیا بنانا چاہیے؟ (صرف بنیادی خصوصیات) | Yes (`mvp_scope`) |
| Blueprint Box 3 | Explicitly Excluded Non-Goals (Anti-Scope-Creep Boundary) | What Will We Skip for Now? (Save Time & Avoid Overbuilding) | ہم ابھی کیا چھوڑیں گے؟ (وقت بچائیں اور اضافی کام سے بچیں) | Yes (`excluded_scope`) |
| Blueprint Box 4 | Pricing & Monetization Hypothesis [UNVERIFIED] | How Much Might We Charge? [Price Idea — Not Proven Yet] | ہم کتنی قیمت رکھ سکتے ہیں؟ [قیمت کا اندازہ — ابھی غیر مصدقہ] | Yes (`pricing_hypothesis`) |
| Blueprint Box 5 | Buyer Validation Criteria (Explicit Build / Pivot / Abandon Thresholds) | How Will We Know Customers Really Want It? (Build, Change, or Stop Rules) | ہمیں کیسے پتہ چلے گا کہ گاہک واقعی یہ چاہتے ہیں؟ (بنانے، بدلنے یا روکنے کے اصول) | Yes (`buyer_validation_criteria`) |
| Roadmap Table | 15-Stage Product Development Workflow, Milestones & Acceptance Criteria | 15-Step Checklist from Idea to Launch | آئیڈیا سے لانچ تک ۱۵ مراحل کی چیک لسٹ | Yes (`fifteen_stage_workflow`) |

---

### 2.5 View 4: Approvals & My Skills (`#tab-approvals`)

| Element | Previous Technical Label | New Plain-English Label (`en`) | Pakistani Urdu Label (`ur`) | Needs `ExplainTerm`? |
| :--- | :--- | :--- | :--- | :--- |
| Section Heading | 4. Human Approval Gates, Financial Controls & Owner Capability Profile | 4. Your Spending Approvals, Safety Controls & Personal Skills | ۴۔ آپ کی مالی منظوریاں، حفاظتی کنٹرول اور ذاتی مہارتیں | Yes (`approval_gate`) |
| Approval Queue | Mandatory Human Approval Queue & Financial Lock Ledger | Decisions Waiting for Your Permission (Nothing Spent Without You) | آپ کی اجازت کے منتظر فیصلے (آپ کی مرضی کے بغیر کوئی خرچ نہیں) | Yes (`approval_gate`) |
| New Request Form | Register New Gated Commitment Request | Ask Permission for a New Expense or Public Action | نئے خرچ یا عوامی قدم کے لیے منظوری کی درخواست درج کریں | No |
| Capability Box | Owner Capability Engine & Execution Profile | Your Personal Skills & Strengths (What You Can Build Easily) | آپ کی ذاتی مہارتیں اور طاقتیں (جو آپ آسانی سے بنا سکتے ہیں) | Yes (`capability_fit`) |
| Memory Box | Personal Business Intelligence & Rejection Memory Ledger | Saved Lessons, Market Notes & Past Decisions | محفوظ کردہ کاروباری اسباق، مارکیٹ کے مشاہدات اور ماضی کے فیصلے | Yes (`institutional_memory`) |

---

## 3. Audit Conclusion & Action Plan

1. **Rewrite all visible UI headings, labels, buttons, empty states, and helper text** in plain, everyday English while preserving all internal database keys, API contracts, and DOM IDs.
2. **Add the reusable `ExplainTerm` component** (`Understand in simple English` / `آسان الفاظ میں سمجھیں`) beside every score, metric, evidence category, recommendation status, and governance rule.
3. **Provide complete Pakistani Urdu (`اردو`) localization** with instantaneous LTR/RTL layout switching (`dir="rtl"`) and clean Naskh/Sans typography (inspired by 29LT Zarid Sans AL and 29LT Bukra, strictly forbidding Nastaliq).
4. **Embed a comprehensive 13-topic Help Center & First-Time User Getting Started Guide** directly inside the workspace in both English and Urdu.
