# STRAW Content Style Guide (`STRAW_CONTENT_STYLE_GUIDE.md`)

**Date:** 2026-11-04  
**Version:** 1.0  
**Purpose:** Establish permanent plain-language writing, epistemic honesty, and English/Urdu localization standards for STRAW.

---

## 1. Core Writing Philosophy: Plain English First

STRAW is built to help its owner make calm, well-reasoned business decisions without being misled by hype or slowed down by technical jargon. Every label, button, score explanation, and notification must be immediately understandable to an intelligent non-technical person who has no background in venture capital, software engineering, or financial modeling.

### Golden Rules of STRAW Copywriting
1. **Lead with a human question or plain action:**
   - *Avoid:* `Commercial Readiness & Buyer WTP Heuristic`
   - *Use:* `How Ready Is This Idea to Sell? (Commercial Readiness)`
2. **Keep sentences short and concrete:**
   - Aim for 10 to 18 words per sentence in UI descriptions and explanations.
   - Use active voice (*"STRAW checks the website link"* rather than *"HTTP source content verification is executed"*).
3. **Never hide technical precision—translate it:**
   - Keep the technical concept accessible via the `ExplainTerm` component (`Understand in simple English` / `آسان الفاظ میں سمجھیں`), which provides:
     - **Simple Explanation:** What this means in everyday life.
     - **Practical Example:** A short real-world example.
     - **Technical Detail:** How STRAW calculates or verifies it behind the scenes.

---

## 2. Canonical Plain-English Terminology Map

Whenever referring to core STRAW concepts in headings, tables, cards, or help articles, use these approved plain-English terms:

| Technical Concept | Approved Plain-English Label | Everyday Question Form |
| :--- | :--- | :--- |
| Opportunity Discovery | **Find Business Ideas** | *What real problems can we solve?* |
| Market Demand | **Are People Looking for This?** | *Are people actively asking for a solution?* |
| Competitor Activity | **Who Else Is Doing This?** | *What other tools or companies already exist?* |
| Unverified Willingness to Pay | **Unverified Interest in Paying** | *Did someone say they might buy, without paying yet?* |
| Verified Commercial Commitment | **Would Customers Pay for This?** | *Have real buyers paid money or signed an order?* |
| Evidence Quality / Provenance | **How Strong Is the Proof?** | *Is this backed by a real source or is it just a guess?* |
| Commercial Readiness | **How Ready Is This Idea to Sell?** | *Do we have proof that customers will buy this?* |
| Technical Feasibility | **How Difficult Is It to Build?** | *Can we build this easily with our current skills?* |
| Priority Index | **Overall Idea Score** | *How does this idea rank overall out of 100?* |
| MVP Scope | **What Should We Build First?** | *What is the simplest useful version we can launch?* |
| Excluded Non-Goals | **What Will We Skip for Now?** | *What features should we leave out of version 1?* |
| Buyer Validation Criteria | **How Will We Know Customers Want It?** | *When should we build, change direction, or stop?* |
| Human Approval Gate | **Waiting for Your Permission** | *Does this action spend money or go public?* |

---

## 3. Epistemic Honesty & Uncertainty Rules

STRAW's defining architectural rule is that **it never confuses a good-sounding idea with proof that customers will pay**. All copy in both English and Urdu must follow these honesty rules:

1. **Never claim guaranteed success or guaranteed revenue:**
   - Always describe the Priority Index (`0–100`) as a **comparison score**, never as a probability of business success.
2. **Always distinguish the 5 types of market evidence:**
   - **1. Problem Existence:** The problem is real (e.g., a law or technical pain exists).
   - **2. Market Demand:** People are searching or asking for help with this problem.
   - **3. Competitor Activity:** Other companies sell products in this space (including competitor pricing pages). **Competitor pricing is NEVER proof that buyers will pay for our product.**
   - **4. Unverified Interest in Paying:** Verbal interest, survey votes, or waitlist signups without payment.
   - **5. Verified Commercial Commitment:** Real money paid (invoice/receipt), signed customer contract, or confirmed purchase order.
3. **Label assumptions visibly:**
   - Target customer descriptions, pricing ideas, and revenue estimates must carry clear plain-language tags such as `[Guess Until Proven]` / `[تصدیق ہونے تک اندازہ]` or `[Unverified Price Idea]`.

---

## 4. Pakistani Urdu (`اردو`) Localization Style Guide

### 4.1 Tone and Register
- Write in **clear, natural, modern Pakistani Urdu** suitable for an educated everyday reader or business owner in Pakistan.
- Avoid overly archaic Persian/Arabic literary phrasing that obscures practical meaning.
- Avoid awkward literal word-for-word translations of English software idioms; translate the **meaning** clearly and respectfully.
- Where a widely understood acronym is helpful (such as `MVP`, `AI`, `URL`, `USD`), write the clear Urdu explanation alongside the familiar term: e.g., `پہلی سادہ پروڈکٹ (MVP)`.

### 4.2 Approved Urdu Terminology Table

| English Concept | Approved Pakistani Urdu Translation (`ur`) |
| :--- | :--- |
| Find Business Ideas | کاروباری آئیڈیاز تلاش کریں |
| Compare & Score Ideas | آئیڈیاز کا موازنہ اور اسکور |
| Plan First Product (MVP) | پہلی پروڈکٹ (MVP) کا منصوبہ |
| Approvals & My Skills | منظوریاں اور میری مہارتیں |
| Help & Guide | مدد اور رہنمائی |
| Understand in simple English | آسان الفاظ میں سمجھیں |
| Overall Idea Score | مجموعی آئیڈیا اسکور |
| How Ready Is This Idea to Sell? | یہ آئیڈیا فروخت کے لیے کتنا تیار ہے؟ |
| How Difficult Is It to Build? | اسے بنانا کتنا آسان یا مشکل ہے؟ |
| How Strong Is the Proof? | ثبوت کتنا مضبوط ہے؟ |
| 1. Is the Problem Real? | ۱۔ کیا مسئلہ واقعی موجود ہے؟ |
| 2. Are People Looking for This? | ۲۔ کیا لوگ اس کا حل تلاش کر رہے ہیں؟ |
| 3. Who Else Is Doing This? | ۳۔ مارکیٹ میں اور کون یہ کام کر رہا ہے؟ |
| 4. Unverified Interest in Paying | ۴۔ ادائیگی میں غیر مصدقہ دلچسپی |
| 5. Would Customers Pay for This? | ۵۔ کیا گاہک واقعی پیسے دیں گے؟ (مصدقہ ادائیگی) |
| What Should We Build First? | ہمیں سب سے پہلے کیا بنانا چاہیے؟ |
| What Will We Skip for Now? | ہم ابھی کیا چھوڑیں گے؟ |
| Waiting for Your Permission | آپ کی اجازت کے منتظر فیصلے |
| Verified Proof | مصدقہ ثبوت |
| Personal Observation | ذاتی مشاہدہ |
| Estimate | اندازہ |
| Guess / Assumption | مفروضہ (بغیر ثبوت کے اندازہ) |

### 4.3 What Must NEVER Be Translated
To guarantee zero corruption of business logic, scoring, or database state:
- Never translate internal IDs (`opp-oklch-contrast-inspector`, `prod-sentinel-a11y`, `src-hn-algolia`).
- Never translate API route paths (`/api/opportunities`, `/api/research/runs`).
- Never translate database enum values (`verified_evidence`, `practitioner_observation`, `payment_received`, `approved`, `rejected`) in form `value=""` attributes or JSON payloads—only translate their human-visible display labels.
- Never alter numeric scores (`78/100`), currency amounts (`$196 USD`), dates (`2026-10-25`), or SHA-256 hashes when switching between English and Urdu.
