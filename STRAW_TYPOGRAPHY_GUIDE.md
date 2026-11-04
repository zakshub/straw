# STRAW Urdu & Latin Typography Guide (`STRAW_TYPOGRAPHY_GUIDE.md`)

**Date:** 2026-11-04  
**Version:** 1.0  
**Design Reference:** 29LT (`https://www.29lt.com/`) — **29LT Zarid Sans AL** & **29LT Bukra**  
**Strict Rule:** Clean, modern Arabic Naskh / Sans-Serif typography only. **Nastaliq is strictly prohibited.**

---

## 1. Typography Direction & Design Rationale

STRAW's visual design system (*"Archival Drafting Ledger & Calibrated Slate Instrument"*) requires high-density data tables, compact status badges, multi-column forms, and bilingual mixed Urdu/English technical text to be effortlessly legible at 12px–18px UI sizes on both desktop and mobile screens.

### Why Nastaliq Is Prohibited in STRAW
Traditional Urdu Nastaliq typefaces (*Jameel Noori Nastaleeq*, *Noto Nastaliq Urdu*, *Awami Nastaliq*, etc.) use steep diagonal baselines, tall vertical word stacking, and delicate calligraphic joins. In modern data-dense software interfaces, Nastaliq causes:
- Severe vertical line-height bloat (`2.2+`), clipping text inside compact buttons, badges, and table rows.
- Poor readability at small UI sizes (`11px–13px`).
- Visual collision when mixed inline with Latin numbers, currency symbols (`$49`), and technical identifiers (`SHA-256`).

Therefore, STRAW **strictly forbids Nastaliq** and uses a **modern, horizontal-baseline Arabic Naskh / Sans-Serif typographic direction** inspired by **29LT**.

---

## 2. Evaluation of 29LT Reference Typefaces

We evaluated two multiscript (Arabic/Urdu + Latin) typefaces from **29LT (`https://www.29lt.com/`)** that support both Extended Arabic (Pakistani Urdu) and Latin scripts:

### 2.1 **29LT Zarid Sans AL** (Primary UI & Body Reference)
- **Design Character:** A humanist contemporary Naskh/Sans multiscript typeface designed by Pascal Zoghbi (`29LT`).
- **Suitability for STRAW Body, Forms, Help Center & Tables:**
  - Open counters, generous x-height / loop height, and a horizontal baseline that aligns seamlessly with Latin text.
  - Full support for Extended Arabic / Urdu characters (`ٹ، ڈ، ڑ، ں، ے، ہ، ھ، گ، چ، پ، ژ`) and contextual cursive joining.
  - Outstanding clarity in long-form Help Center articles, expandable `ExplainTerm` explanations, and compact table cells (`13px–15px`).

### 2.2 **29LT Bukra** (Headings, KPI Metrics & Navigation Reference)
- **Design Character:** A bold, geometric-humanist display and interface sans-serif with wide proportions and crisp terminal geometry.
- **Suitability for STRAW Headings, Badges & KPI Values:**
  - Commands strong visual hierarchy in section titles (`18px–22px`), KPI numeric readouts (`24px`), and top navigation tabs without needing decorative styling.

---

## 3. Font Licensing Audit & Safe Implementation Strategy

### 3.1 Commercial Licensing Finding
- Both **29LT Zarid Sans AL** and **29LT Bukra** are proprietary commercial typefaces owned by **29Letters (29LT)**.
- Deploying, downloading, or embedding `.woff2` / `.ttf` binary files of 29LT fonts inside a repository without a purchased 29LT Webfont / App License violates copyright and the STRAW project constraint (*"Do not download, embed or deploy commercial font files without the required license"*).

### 3.2 Implemented Production Font Stack (`src/public/styles.css`)
To respect intellectual property while achieving the exact clean, modern Naskh/Sans typographic behavior immediately:
1. **Primary CSS Font Variables (`--font-sans-ur` and `--font-display-ur`)** place `'29LT Zarid Sans AL'` and `'29LT Bukra'` first in the stack so any licensed machine or self-hosted licensed webfont file activates automatically.
2. **Verified Open-Source & System Modern Naskh/Sans Fallbacks** are loaded immediately after:
   - `'IBM Plex Sans Arabic'` / `'Noto Sans Arabic'` / `'Vazirmatn'` (clean, horizontal-baseline modern Naskh/Sans typefaces with full Pakistani Urdu glyph coverage, open counters, and balanced Latin metrics).
   - System high-legibility Arabic/Urdu UI fonts (`'Geeza Pro'`, `'Segoe UI'`, `'Tahoma'`, `sans-serif`).
3. **Zero Nastaliq Fonts:** No Nastaliq font family appears anywhere in STRAW's CSS.

```css
:root {
  --font-sans-en: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif;
  --font-sans-ur: "29LT Zarid Sans AL", "29LT Bukra", "IBM Plex Sans Arabic", "Noto Sans Arabic", "Vazirmatn", "Geeza Pro", "Segoe UI", Tahoma, sans-serif;
  --font-display-ur: "29LT Bukra", "29LT Zarid Sans AL", "IBM Plex Sans Arabic", "Noto Sans Arabic", "Vazirmatn", "Geeza Pro", "Segoe UI", sans-serif;
  --font-mono: "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}
```

### 3.3 How to Drop In Licensed 29LT Webfonts Later
If the owner purchases a 29LT Webfont license for `29LT Zarid Sans AL` and `29LT Bukra`, place the `.woff2` files in `src/public/fonts/` and uncomment the `@font-face` block in `src/public/styles.css`:
- `src/public/fonts/29LTZaridSansAL-Regular.woff2` (`font-weight: 400`)
- `src/public/fonts/29LTZaridSansAL-SemiBold.woff2` (`font-weight: 600`)
- `src/public/fonts/29LTBukra-Bold.woff2` (`font-weight: 700`)

---

## 4. Pakistani Urdu Glyph & Orthography Verification

All Urdu localization strings in `src/public/i18n.js` and `STRAW_HELP_CENTER_CONTENT.md` have been verified against the following orthographic requirements:

| Requirement | Verified Characters / Rules | Status |
| :--- | :--- | :--- |
| **Retroflex Consonants** | `ٹ` (Te), `ڈ` (Dal), `ڑ` (Re) — e.g., `پروڈکٹ`, `اسٹیک`, `بڑا` | Verified |
| **Persian/Urdu Stops & Affricates** | `پ` (Pe), `چ` (Che), `ژ` (Zhe), `گ` (Gaf) — e.g., `پہلی`, `جانچ`, `اگلا` | Verified |
| **Nasalization (Noon Ghunna)** | `ں` (Dotless final Noon Ghunna) vs `ن` (Medial/Initial Noon) — e.g., `آسان الفاظ میں سمجھیں`, `تلاش کریں` | Verified |
| **Choti Ye & Bari Ye** | `ی` (`U+06CC` Farsi/Urdu Ye) vs `ے` (`U+06D2` Bari Ye) — never substituted with Arabic `ي` (`U+064A` with two dots below) | Verified |
| **Gol He & Do-Chashmi He** | `ہ` (`U+06C1` He Goal) for words like `یہ`, `توجہ`, and `ھ` (`U+06BE` He Doachashmee) exclusively for aspirated consonants (`بھ`, `پھ`, `تھ`, `ٹھ`, `جھ`, `چھ`, `دھ`, `ڈھ`, `کھ`, `گھ`) — e.g., `سمجھیں`, `مضبوط` | Verified |
| **Urdu Punctuation** | Full stop `۔` (`U+06D4`), Urdu comma `،` (`U+060C`), Urdu question mark `؟` (`U+061F`) | Verified |
| **Zero Letter-Spacing in RTL** | `letter-spacing: 0 !important` enforced on all `[dir="rtl"]` headings, labels, and badges so cursive joins never break | Verified |
| **Mixed LTR Technical Tokens** | Numbers (`85/100`, `$196`), URLs, and IDs isolated with `unicode-bidi: embed; direction: ltr` | Verified |
