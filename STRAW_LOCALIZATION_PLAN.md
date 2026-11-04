# STRAW Localization & Bidirectional UX Architecture (`STRAW_LOCALIZATION_PLAN.md`)

**Date:** 2026-11-04  
**Version:** 1.0  
**Supported Languages:** English (`en` — Default, LTR) & Pakistani Urdu (`ur` — اردو, RTL)

---

## 1. Architectural Objectives

1. **English by Default:** Every new session starts in plain, everyday English (`lang="en"`, `dir="ltr"`).
2. **Instantaneous Language Switching:** A persistent language switcher (`English` | `اردو`) in the top command bar switches the entire application between English and Urdu immediately without requiring a server round-trip or page reload.
3. **Cross-Session Persistence:** The selected language is stored in `localStorage.getItem('straw_lang')` (`'en'` or `'ur'`) and restored automatically on page load.
4. **Strict Separation of Presentation from Business Data:** Switching languages changes only presentation text, document direction (`ltr` vs. `rtl`), and typography tokens. It **never** modifies SQLite records, API payloads, scoring weights, evidence classifications, or financial approval locks.
5. **Zero Raw Keys:** A defensive translation resolver `t(key, params)` falls back cleanly to the English string if a key is ever absent, ensuring raw localization identifiers are never displayed to users.

---

## 2. Module Structure

```text
src/public/
├── index.html          # Semantic HTML workspace with data-i18n attributes, language switcher & Help Center panel
├── styles.css          # Light/Dark tokens, LTR/RTL logical layout rules, Urdu Naskh/Sans font stack, ExplainTerm & Help styles
├── i18n.js             # Centralized English (en) & Urdu (ur) dictionaries, EXPLAIN_TERMS catalog, HELP_CENTER_ARTICLES & helpers
└── app.js              # Interactive workspace controller wired to i18n.js, ExplainTerm popovers & Help Center navigation
```

---

## 3. Localization API (`src/public/i18n.js`)

### 3.1 Core Functions
- `getSupportedLanguage(rawLang)`: Normalizes language input to `'en'` or `'ur'`, defaulting to `'en'`.
- `t(key, replacements = {}, lang = currentLang)`: Resolves a dot-notation or flat dictionary key in the active language, substituting `{count}`, `{score}`, `{title}`, etc., and falling back to `STRINGS.en[key]` if needed.
- `renderExplainTerm(termKey, lang = currentLang)`: Renders an accessible inline explanation trigger and expandable card:
  - Trigger button: `Understand in simple English` (`en`) / `آسان الفاظ میں سمجھیں` (`ur`) with `aria-expanded="false"` and `data-explain-term="<termKey>"`.
  - Expandable panel (`role="region"`):
    - **Simple Explanation** (`simple`)
    - **Real-World Example** (`example`)
    - **Technical Explanation** (`technical`)
- `getHelpArticles(lang = currentLang)`: Returns the 13 structured Help Center sections and Getting Started walkthrough in the active language.

---

## 4. Right-to-Left (`RTL`) Layout Engineering for Urdu (`dir="rtl"`)

When `state.lang === 'ur'`, `applyLanguage('ur')` sets:
```html
<html lang="ur" dir="rtl" data-theme="light|dark">
```

### 4.1 Bidirectional Layout Rules in `src/public/styles.css`
1. **Document Direction & Font Stack Switching:**
   - `[dir="rtl"] body` switches automatically to `--font-sans-ur` with `line-height: 1.75` and `letter-spacing: 0` (preventing broken Arabic/Urdu cursive letter joins).
2. **Table & Grid Alignment:**
   - `.data-table th, .data-table td` uses `text-align: start` (left-aligned in English LTR, right-aligned in Urdu RTL).
3. **Mixed Urdu + Technical Tokens (`dir="ltr"` Islands):**
   - URLs (`https://...`), SHA-256 hashes, code identifiers (`opp-oklch-contrast-inspector`), and HTTP status codes are wrapped in `<code>` or `.mono` with `direction: ltr; unicode-bidi: embed;` so technical strings never scramble inside an Urdu sentence.
4. **Navigation, Filter Bars, and Dossier Split View:**
   - Flex and CSS Grid containers flow naturally from right to left under `dir="rtl"`.
   - In the 2-column opportunity workspace (`.split-dossier-layout`), the opportunity list sidebar sits on the right in RTL and the detail inspection pane sits on the left.

---

## 5. Verification Checklist

- [x] Fresh session defaults to `en` (`dir="ltr"`).
- [x] Clicking `اردو` switches `document.documentElement.lang = 'ur'` and `document.documentElement.dir = 'rtl'`.
- [x] Selected language persists in `localStorage.getItem('straw_lang')`.
- [x] Every navigation tab, form label, button, KPI card, table header, status badge, notification, `ExplainTerm` widget, and Help Center article renders in both English and Urdu.
- [x] Underlying API responses (`/api/dashboard`, `/api/opportunities`, `/api/products`, `/api/approvals`) remain 100% identical regardless of active UI language.
