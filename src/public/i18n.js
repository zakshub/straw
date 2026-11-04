/**
 * STRAW Localization, Plain-Language Explanation & Help Center Engine
 * Default Language: English ('en', LTR)
 * Secondary Language: Pakistani Urdu ('ur', RTL — Modern Naskh/Sans Typography, No Nastaliq)
 */

export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' },
  ur: { code: 'ur', label: 'Urdu', nativeLabel: 'اردو', dir: 'rtl' }
};

export function getSupportedLanguage(lang) {
  return lang === 'ur' ? 'ur' : 'en';
}

export const UI_STRINGS = {
  en: {
    // Header & Brand
    brand_subtitle: 'Smart Business Idea Finder, Proof Checker & Product Planner',
    pill_ai_mode: 'AI Mode: Safe Local Mode (Free)',
    pill_budget: 'Budget Rule: $0 Spent Without Your Approval',
    pill_approvals: 'Waiting for Your Approval: {count}',
    theme_light_to_dark: 'Theme: Light Paper (Switch to Dark)',
    theme_dark_to_light: 'Theme: Dark Slate (Switch to Light)',
    lang_switcher_label: 'Language',
    help_btn_label: 'Help & Guide',
    getting_started_btn: 'Getting Started',

    // Navigation Tabs (Plain English + Preserved Step Numbers)
    nav_tab_research: '1. Find Business Ideas (Discover & Research)',
    nav_tab_opportunities: '2. Compare & Score Ideas (Evaluate & Compare)',
    nav_tab_execution: '3. Plan First Product (Select & Plan MVP)',
    nav_tab_approvals: '4. Approvals & My Skills (Approvals & Capabilities)',
    nav_tab_help: '5. Help & Guide (Knowledge Base)',

    // ExplainTerm Trigger
    explain_trigger: 'Understand in simple English',
    explain_simple_heading: 'Simple Explanation',
    explain_example_heading: 'Real-World Example',
    explain_technical_heading: 'Technical Detail (How STRAW Calculates This)',

    // Getting Started Banner
    gs_banner_title: 'New to STRAW? Start Here in 4 Easy Steps',
    gs_banner_subtitle: 'STRAW helps you find real problems, check if buyers will pay, and plan a simple first product without technical jargon.',
    gs_step_1_title: '1. Search for Real Problems',
    gs_step_1_desc: 'Search free public websites (Hacker News, GitHub, WordPress) for problems people talk about.',
    gs_step_2_title: '2. Check Two Separate Scores',
    gs_step_2_desc: 'Compare "How Ready Is This Idea to Sell?" against "How Difficult Is It to Build?"',
    gs_step_3_title: '3. Separate Competitors from Buyers',
    gs_step_3_desc: 'Remember: a competitor charging $49 proves competitors exist—not that customers paid us yet.',
    gs_step_4_title: '4. Plan What to Build First (MVP)',
    gs_step_4_desc: 'Pick your strongest idea, list must-have features for a 14-day build, and set clear buyer rules.',
    gs_open_help_btn: 'Open Full Help & Guide (13 Topics)',
    gs_hide_btn: 'Hide Getting Started Guide',
    gs_show_btn: 'Show Getting Started Guide',

    // View 1: Find Business Ideas (#tab-research)
    v1_heading: '1. Find Business Ideas & Check Real Market Proof',
    v1_desc: 'Search free public websites for real customer problems, save verified links with digital fingerprints (SHA-256), and see which sources are free versus locked behind your approval.',
    v1_run_box_title: 'Search Public Websites for Real Problems & Ideas (Free by Default)',
    v1_run_topic_label: 'What problem or topic do you want to search?',
    v1_run_opp_label: 'Connect to an Existing Idea (Optional)',
    v1_run_opp_standalone: 'Search Without Connecting to a Specific Idea',
    v1_run_source_label: 'Where should STRAW search?',
    v1_run_mode_label: 'Search Mode',
    v1_run_mode_live: 'Live Public Internet Search (Recommended)',
    v1_run_mode_offline: 'Saved Local Baseline Only (Offline)',
    v1_run_submit_btn: 'Search for Ideas & Proof',
    v1_sources_box_title: 'Connected Websites & Search Sources (Free vs. Paid)',
    v1_runs_box_title: 'Recent Searches & Plain-Language Summary',
    v1_runs_empty: 'No searches run yet. Use the search box above to find problems and proof.',
    v1_library_box_title: 'All Saved Proof & Website Link Verification',
    v1_th_source_name: 'Website Source & Adapter',
    v1_th_source_status: 'Status & Cost',
    v1_th_source_data: 'What Proof It Collects',
    v1_th_source_limits: 'Speed Limits & Rules',
    v1_th_ev_opp: 'Business Idea',
    v1_th_ev_tier: 'How Strong Is the Proof? (Tier & Category)',
    v1_th_ev_conf: 'Trust Score & Fingerprint',
    v1_th_ev_claim: 'Fact Found, Direct Quote & Link',
    v1_th_ev_actions: 'Your Review Controls',
    v1_btn_verify_http: 'Check Website Link Now',
    v1_btn_mark_verified: 'Mark Verified',
    v1_btn_mark_rejected: 'Reject Proof',

    // View 2: Compare & Score Ideas (#tab-opportunities)
    v2_heading: '2. Compare Business Ideas: How Ready to Sell vs. How Easy to Build',
    v2_desc: 'Compare all your business ideas side by side. STRAW separates "How Ready Is This Idea to Sell?" from "How Difficult Is It to Build?" so you never mistake an easy-to-build idea for a guaranteed buyer.',
    v2_filter_status_label: 'Filter by Status',
    v2_filter_status_all: 'All Statuses',
    v2_filter_status_approved: 'Approved to Test',
    v2_filter_status_evaluating: 'Still Checking Proof',
    v2_filter_status_rejected: 'Rejected / Paused',
    v2_filter_category_label: 'Filter by Category',
    v2_filter_category_all: 'All Categories',
    kpi_opportunities_label: 'Business Ideas Checked',
    kpi_opportunities_sub: '{approved} Approved · {evaluating} Checking · {rejected} Rejected',
    kpi_products_label: 'First Products Planned (MVP)',
    kpi_products_sub: 'Simple first-version plans & 15-step checklists',
    kpi_approvals_label: 'Waiting for Your Permission',
    kpi_approvals_sub: 'Safety locks on spending money or going public',
    kpi_capabilities_label: 'Your Personal Skills',
    kpi_capabilities_sub: 'UX/UI, Design Systems, Web Tools & AI Building',
    kpi_memory_label: 'Saved Lessons & Notes',
    kpi_memory_sub: 'Past decisions, rejected ideas & market notes',
    v2_matrix_box_title: 'Side-by-Side Business Idea Comparison Table',
    v2_th_idea: 'Business Idea & Category',
    v2_th_priority: 'Overall Idea Score',
    v2_th_commercial: 'How Ready to Sell?',
    v2_th_technical: 'How Easy to Build?',
    v2_th_decision: 'Recommendation & Proof Counts',
    v2_th_action: 'Action',
    v2_btn_inspect: 'Open Full Report',
    v2_sidebar_list_title: 'Select an Idea to Read Its Full Proof Report',
    v2_intake_box_title: 'Add a New Business Idea (4 Simple Questions)',
    v2_intake_desc: 'Enter 4 basic facts to score a new idea. Open the optional section below if you want to add cost guesses or a website link right away.',
    v2_lbl_title: '1. Idea Name (Required)',
    v2_lbl_category: '2. Product Category (Required)',
    v2_lbl_complexity: '3. How Difficult Is It to Build?',
    v2_opt_comp_low: 'Easy (Under 7 Days)',
    v2_opt_comp_manageable: 'Medium (7 to 14 Days)',
    v2_opt_comp_high: 'Hard (Over 14 Days)',
    v2_lbl_problem: '4. What Problem Does This Solve, and Who Has It? (Required)',
    v2_lbl_audience: 'Who Is the Target Customer? (Required)',
    v2_accordion_summary: 'Extra Details, Cost Guesses & Optional Link (Click to Open if Needed)',
    v2_submit_new_opp: 'Score & Save This Business Idea',

    // Dossier Detail Pane (View 2 Right Column)
    dossier_overall_score: 'Overall Idea Score',
    dossier_commercial_score: 'How Ready Is This Idea to Sell?',
    dossier_technical_score: 'How Easy Is It to Build?',
    dossier_rationale_heading: 'What These Scores Mean in Plain English',
    dossier_disclaimer_prefix: 'Important Honesty Note:',
    dossier_cat1_title: '1. Is the Problem Real?',
    dossier_cat1_sub: 'Verified sources showing the problem exists',
    dossier_cat2_title: '2. Are People Looking for This?',
    dossier_cat2_sub: 'Verified sources showing people want a fix',
    dossier_cat3_title: '3. Who Else Is Doing This?',
    dossier_cat3_sub: 'Verified competitors & their pricing pages',
    dossier_cat4_title: '4. Unverified Interest in Paying',
    dossier_cat4_sub: 'Verbal interest or waitlists (no payment yet)',
    dossier_cat5_title: '5. Would Customers Pay for This?',
    dossier_cat5_sub: 'Real customer payments, invoices or signed orders',
    dossier_btn_promote: 'Plan First Product (MVP) for This Idea',
    dossier_btn_approve: 'Mark Idea Approved',
    dossier_btn_hold: 'Keep Checking Proof',
    dossier_btn_reject: 'Reject Weak Idea',
    dossier_btn_export: 'Download Full Report (Markdown)',
    dossier_15_heading: '15-Point Idea Breakdown (Facts vs. Unproven Guesses Clearly Labeled)',
    dossier_11_heading: 'How STRAW Calculated the Score (11 Transparent Factors)',
    dossier_th_dim: 'Factor',
    dossier_th_group: 'Score Group',
    dossier_th_weight: 'Importance',
    dossier_th_score10: 'Score (1–10)',
    dossier_th_pts: 'Points Added',
    dossier_th_why: 'What This Measures',
    dossier_ev_heading: 'Saved Market Proof for This Idea ({count} Items · Average Trust: {conf}%)',
    dossier_ev_add_btn: 'Check Link, Save Proof & Recalculate Score',
    dossier_comp_heading: 'Other Tools & Competitors ({count} Listed)',
    dossier_comp_add_btn: 'Add Competitor to List',

    // View 3: Plan First Product / MVP (#tab-execution)
    v3_heading: '3. Plan Your First Simple Product (What to Build First & How to Test Buyers)',
    v3_desc: 'Turn your selected business idea into a clear, focused plan: What should we build first? What features will we skip for now? How much might we charge? And how will we know if real buyers want it?',
    v3_select_product_label: 'Choose Planned Product',
    v3_empty_products: 'No first product planned yet. Open an idea in "2. Compare & Score Ideas" and click "Plan First Product (MVP)".',
    v3_completion_label: '{pct}% Completed',
    v3_blueprint_heading: 'First Product (MVP) Plan & Buyer Test Rules',
    v3_cell_customer: 'Who Is the First Customer? [Guess Until Proven]',
    v3_cell_must_have: 'What Should We Build First? (Essential Features for a <=14-Day Build)',
    v3_cell_excluded: 'What Will We Skip for Now? (Features Left Out of Version 1)',
    v3_cell_pricing: 'How Much Might We Charge? [Unproven Price Idea]',
    v3_cell_validation: 'How Will We Know Customers Really Want It? (Build, Change Direction, or Stop Rules)',
    v3_edit_summary: 'Edit This Product Plan (Update Customer, Essential Features, Skipped Features, Price Idea & Buyer Rules)',
    v3_save_plan_btn: 'Save Updated Product Plan',
    v3_roadmap_heading: '15-Step Checklist from Idea to Launch',

    // View 4: Approvals & My Skills (#tab-approvals)
    v4_heading: '4. Your Spending Approvals, Safety Controls & Personal Skills',
    v4_desc: 'STRAW never spends money, calls paid tools, or launches anything publicly without your permission. Review pending requests here and manage your personal skill profile.',
    v4_queue_title: 'Decisions Waiting for Your Permission (Financial & Public Safety Lock)',
    v4_new_appr_title: 'Ask Permission for a New Expense or Public Action',
    v4_appr_submit_btn: 'Add Request to My Approval List',
    v4_cap_title: 'Your Personal Skills & Strengths (Used to Calculate "How Easy Is It to Build?")',
    v4_cap_add_title: 'Add or Update One of Your Skills',
    v4_cap_submit_btn: 'Save My Skill',
    v4_bi_title: 'Saved Business Lessons, Market Notes & Past Decisions',
    v4_bi_add_title: 'Save a New Lesson Learned or Market Note',
    v4_bi_submit_btn: 'Save Lesson to Memory',

    // View 5: Help Center & Knowledge Base (#tab-help)
    v5_heading: '5. Help Center, Plain-English Guide & Frequently Asked Questions',
    v5_desc: 'Everything you need to understand STRAW in simple everyday language—how ideas are found, how scores work, why competitor pricing is not buyer proof, and how to plan your first product.',
    v5_search_placeholder: 'Search help topics, scores, or glossary terms...',
    v5_topics_title: 'Help Topics (13 Guides)',

    // Badges & Status Labels
    rec_APPROVE_FOR_VALIDATION: 'READY TO TEST WITH BUYERS',
    rec_NEEDS_EVIDENCE: 'NEEDS MORE REAL PROOF',
    rec_HOLD_CONFLICTING_EVIDENCE: 'ON HOLD: MIXED PROOF',
    rec_REJECT_WEAK_IDEA: 'WEAK IDEA: DO NOT BUILD YET',

    tier_verified_evidence: 'VERIFIED WEB PROOF',
    tier_practitioner_observation: 'PERSONAL WORK OBSERVATION',
    tier_estimate: 'ROUGH ESTIMATE',
    tier_assumption: 'UNPROVEN GUESS',

    cat_problem_existence: '1. PROBLEM IS REAL',
    cat_market_demand: '2. PEOPLE WANT A SOLUTION',
    cat_competitor_activity: '3. COMPETITOR ACTIVITY',
    cat_unverified_willingness_to_pay: '4. UNVERIFIED INTEREST IN PAYING',
    cat_verified_commercial_commitment: '5. VERIFIED CUSTOMER PAYMENT / ORDER',
    cat_willingness_to_pay: '5. VERIFIED CUSTOMER PAYMENT / ORDER',

    // Feedback Notifications
    fb_lang_switched: 'Language set to English (Left-to-Right). Your business data and scores are unchanged.',
    fb_opp_status: 'Updated idea status to {status}.',
    fb_opp_promoted: 'Created first product (MVP) plan for "{name}"!',
    fb_appr_decided: 'Marked approval request as {decision}.',
    fb_http_verified: 'Website link checked: Status is {status} (Method: {method}).',
    fb_ev_reviewed: 'Updated proof status to {status}.',
    fb_task_updated: 'Checklist step marked as {status} — overall progress recalculated.',
    fb_opp_created: 'Scored "{title}": Overall Score {score}/100 ({rec})',
    fb_ev_added: 'Saved proof ({tier} | {status}). Updated Overall Score: {score}/100.',
    fb_run_done: 'Market search for "{query}" finished ({status}).',
    fb_comp_added: 'Added competitor to this idea.',
    fb_mvp_saved: 'Saved your updated First Product (MVP) plan.',
    fb_appr_created: 'Added new request to your Approval List.',
    fb_cap_saved: 'Saved skill to your personal profile.',
    fb_bi_saved: 'Saved lesson to your Business Memory.'
  },

  ur: {
    // Header & Brand
    brand_subtitle: 'کاروباری آئیڈیاز کی تلاش، ثبوت کی جانچ اور مصنوعات کی منصوبہ بندی کا آسان نظام',
    pill_ai_mode: 'اے آئی موڈ: محفوظ لوکل موڈ (مفت)',
    pill_budget: 'بجٹ اصول: آپ کی منظوری کے بغیر کوئی خرچ نہیں ($0)',
    pill_approvals: 'آپ کی منظوری کے منتظر فیصلے: {count}',
    theme_light_to_dark: 'ظاہری شکل: روشن کاغذ (ڈارک موڈ میں بدلیں)',
    theme_dark_to_light: 'ظاہری شکل: ڈارک موڈ (روشن موڈ میں بدلیں)',
    lang_switcher_label: 'زبان',
    help_btn_label: 'مدد اور رہنمائی',
    getting_started_btn: 'شروعات کیسے کریں',

    // Navigation Tabs (Pakistani Urdu)
    nav_tab_research: '۱۔ کاروباری آئیڈیاز تلاش کریں (تلاش اور تحقیق)',
    nav_tab_opportunities: '۲۔ آئیڈیاز کا موازنہ اور اسکور (جانچ اور موازنہ)',
    nav_tab_execution: '۳۔ پہلی پروڈکٹ (MVP) کا منصوبہ',
    nav_tab_approvals: '۴۔ منظوریاں اور میری مہارتیں',
    nav_tab_help: '۵۔ مدد اور رہنمائی (مکمل گائیڈ)',

    // ExplainTerm Trigger
    explain_trigger: 'آسان الفاظ میں سمجھیں',
    explain_simple_heading: 'آسان الفاظ میں وضاحت',
    explain_example_heading: 'عملی مثال',
    explain_technical_heading: 'تکنیکی تفصیل (سٹرا اسے کیسے ناپتا ہے)',

    // Getting Started Banner
    gs_banner_title: 'سٹرا (STRAW) میں نئے ہیں؟ ۴ آسان مراحل سے شروعات کریں',
    gs_banner_subtitle: 'سٹرا آپ کو مشکل اصطلاحات میں الجھائے بغیر لوگوں کے حقیقی مسائل تلاش کرنے، خریداروں کا ثبوت جانچنے اور پہلی سادہ پروڈکٹ کا منصوبہ بنانے میں مدد دیتا ہے۔',
    gs_step_1_title: '۱۔ حقیقی مسائل تلاش کریں',
    gs_step_1_desc: 'مفت عوامی ویب سائٹس (Hacker News، GitHub، WordPress) پر لوگوں کے حقیقی مسائل تلاش کریں۔',
    gs_step_2_title: '۲۔ دو الگ اسکورز دیکھیں',
    gs_step_2_desc: '”یہ آئیڈیا فروخت کے لیے کتنا تیار ہے؟“ اور ”اسے بنانا کتنا آسان ہے؟“ کا الگ الگ موازنہ کریں۔',
    gs_step_3_title: '۳۔ حریف اور گاہک کا فرق سمجھیں',
    gs_step_3_desc: 'یاد رکھیں: کسی حریف کی 49 ڈالر قیمت حریف کے وجود کا ثبوت ہے، ہمارے گاہک کی ادائیگی کا نہیں۔',
    gs_step_4_title: '۴۔ پہلی سادہ پروڈکٹ (MVP) کا منصوبہ بنائیں',
    gs_step_4_desc: 'بہترین آئیڈیا منتخب کریں، ۱۴ دن میں بننے والی بنیادی خصوصیات لکھیں اور خریداروں کی شرط طے کریں۔',
    gs_open_help_btn: 'مکمل مدد اور رہنمائی کھولیں (۱۳ عنوانات)',
    gs_hide_btn: 'شروعاتی گائیڈ چھپائیں',
    gs_show_btn: 'شروعاتی گائیڈ دکھائیں',

    // View 1: Find Business Ideas (#tab-research)
    v1_heading: '۱۔ کاروباری آئیڈیاز تلاش کریں اور حقیقی مارکیٹ ثبوت چیک کریں',
    v1_desc: 'مفت عوامی ویب سائٹس پر گاہکوں کے حقیقی مسائل تلاش کریں، ڈیجیٹل فنگر پرنٹ (SHA-256) کے ساتھ لنکس محفوظ کریں اور دیکھیں کہ کون سے ذرائع مفت ہیں اور کون سے آپ کی منظوری کے پابند ہیں۔',
    v1_run_box_title: 'حقیقی مسائل اور آئیڈیاز کے لیے عوامی ویب سائٹس تلاش کریں (بنیادی طور پر مفت)',
    v1_run_topic_label: 'آپ کس مسئلے یا موضوع کے بارے میں تلاش کرنا چاہتے ہیں؟',
    v1_run_opp_label: 'کسی موجودہ آئیڈیا سے جوڑیں (اختیاری)',
    v1_run_opp_standalone: 'کسی مخصوص آئیڈیا سے جوڑے بغیر آزاد تلاش',
    v1_run_source_label: 'سٹرا (STRAW) کہاں تلاش کرے؟',
    v1_run_mode_label: 'تلاش کا طریقہ',
    v1_run_mode_live: 'براہِ راست عوامی انٹرنیٹ تلاش (تجویز کردہ)',
    v1_run_mode_offline: 'صرف محفوظ شدہ لوکل ڈیٹا (آف لائن)',
    v1_run_submit_btn: 'آئیڈیاز اور ثبوت تلاش کریں',
    v1_sources_box_title: 'منسلک ویب سائٹس اور تلاش کے ذرائع (مفت بمقابلہ ادا شدہ)',
    v1_runs_box_title: 'حالیہ تلاشیں اور آسان خلاصہ',
    v1_runs_empty: 'ابھی تک کوئی تلاش نہیں کی گئی۔ اوپر دیے گئے فارم سے تلاش شروع کریں۔',
    v1_library_box_title: 'تمام محفوظ شدہ ثبوت اور ویب سائٹ لنک کی تصدیق',
    v1_th_source_name: 'ویب سائٹ کا نام اور ایڈاپٹر',
    v1_th_source_status: 'حالت اور لاگت',
    v1_th_source_data: 'یہ کون سا ثبوت جمع کرتا ہے',
    v1_th_source_limits: 'حدود اور اصول',
    v1_th_ev_opp: 'کاروباری آئیڈیا',
    v1_th_ev_tier: 'ثبوت کتنا مضبوط ہے؟ (درجہ اور قسم)',
    v1_th_ev_conf: 'اعتماد کا اسکور اور فنگر پرنٹ',
    v1_th_ev_claim: 'حاصل شدہ حقیقت، اقتباس اور لنک',
    v1_th_ev_actions: 'آپ کا کنٹرول',
    v1_btn_verify_http: 'ویب لنک ابھی چیک کریں',
    v1_btn_mark_verified: 'تصدیق کریں',
    v1_btn_mark_rejected: 'مسترد کریں',

    // View 2: Compare & Score Ideas (#tab-opportunities)
    v2_heading: '۲۔ کاروباری آئیڈیاز کا موازنہ: فروخت کی تیاری بمقابلہ بنانے میں آسانی',
    v2_desc: 'اپنے تمام کاروباری آئیڈیاز کا آمنے سامنے موازنہ کریں۔ سٹرا ”فروخت کی تیاری“ کو ”بنانے کی آسانی“ سے الگ رکھتا ہے تاکہ آپ صرف بنانے میں آسان چیز کو یقینی کاروبار نہ سمجھ لیں۔',
    v2_filter_status_label: 'حالت کے لحاظ سے فلٹر کریں',
    v2_filter_status_all: 'تمام حالات',
    v2_filter_status_approved: 'ٹیسٹ کے لیے منظور شدہ',
    v2_filter_status_evaluating: 'ابھی جانچ جاری ہے',
    v2_filter_status_rejected: 'مسترد یا موخر شدہ',
    v2_filter_category_label: 'قسم (کیٹیگری) کے لحاظ سے فلٹر کریں',
    v2_filter_category_all: 'تمام اقسام',
    kpi_opportunities_label: 'جانچے گئے کاروباری آئیڈیاز',
    kpi_opportunities_sub: '{approved} منظور · {evaluating} زیرِ جانچ · {rejected} مسترد',
    kpi_products_label: 'منصوبہ بند پہلی مصنوعات (MVP)',
    kpi_products_sub: 'پہلے ورژن کے سادہ منصوبے اور ۱۵ مراحل کی چیک لسٹ',
    kpi_approvals_label: 'آپ کی اجازت کے منتظر فیصلے',
    kpi_approvals_sub: 'رقم خرچ کرنے یا عوامی قدم اٹھانے پر حفاظتی لاک',
    kpi_capabilities_label: 'آپ کی ذاتی مہارتیں',
    kpi_capabilities_sub: 'ڈیزائن، ویب ٹولز، آرکیٹیکچر اور اے آئی بلڈنگ',
    kpi_memory_label: 'محفوظ کردہ اسباق اور مشاہدات',
    kpi_memory_sub: 'ماضی کے فیصلے، مسترد شدہ آئیڈیاز اور مارکیٹ کے نوٹس',
    v2_matrix_box_title: 'کاروباری آئیڈیاز کے آمنے سامنے موازنے کا جدول',
    v2_th_idea: 'کاروباری آئیڈیا اور قسم',
    v2_th_priority: 'مجموعی آئیڈیا اسکور',
    v2_th_commercial: 'فروخت کے لیے کتنا تیار ہے؟',
    v2_th_technical: 'بنانا کتنا آسان ہے؟',
    v2_th_decision: 'مشورہ اور مصدقہ ثبوتوں کی تعداد',
    v2_th_action: 'عمل',
    v2_btn_inspect: 'مکمل رپورٹ کھولیں',
    v2_sidebar_list_title: 'مکمل رپورٹ پڑھنے کے لیے کوئی آئیڈیا منتخب کریں',
    v2_intake_box_title: 'نیا کاروباری آئیڈیا شامل کریں (۴ آسان سوالات)',
    v2_intake_desc: 'نئے آئیڈیا کا اسکور جاننے کے لیے ۴ بنیادی باتیں درج کریں۔ اگر آپ لاگت کا اندازہ یا لنک بھی دینا چاہیں تو نیچے اختیاری حصہ کھولیں۔',
    v2_lbl_title: '۱۔ آئیڈیا کا نام (لازمی)',
    v2_lbl_category: '۲۔ پروڈکٹ کی قسم (لازمی)',
    v2_lbl_complexity: '۳۔ اسے بنانا کتنا مشکل ہے؟',
    v2_opt_comp_low: 'آسان (۷ دن سے کم)',
    v2_opt_comp_manageable: 'درمیانہ (۷ سے ۱۴ دن)',
    v2_opt_comp_high: 'مشکل (۱۴ دن سے زیادہ)',
    v2_lbl_problem: '۴۔ یہ کون سا مسئلہ حل کرتا ہے اور یہ مسئلہ کس کو درپیش ہے؟ (لازمی)',
    v2_lbl_audience: 'ہدف گاہک کون ہے؟ (لازمی)',
    v2_accordion_summary: 'اضافی تفصیلات، لاگت کے اندازے اور اختیاری لنک (ضرورت ہو تو یہاں کلک کر کے کھولیں)',
    v2_submit_new_opp: 'آئیڈیا کا اسکور نکالیں اور محفوظ کریں',

    // Dossier Detail Pane
    dossier_overall_score: 'مجموعی آئیڈیا اسکور',
    dossier_commercial_score: 'یہ آئیڈیا فروخت کے لیے کتنا تیار ہے؟',
    dossier_technical_score: 'اسے بنانا کتنا آسان ہے؟',
    dossier_rationale_heading: 'ان اسکورز کا آسان الفاظ میں مطلب',
    dossier_disclaimer_prefix: 'اہم وضاحت:',
    dossier_cat1_title: '۱۔ کیا مسئلہ واقعی موجود ہے؟',
    dossier_cat1_sub: 'مسئلے کے وجود کے مصدقہ ذرائع',
    dossier_cat2_title: '۲۔ کیا لوگ اس کا حل تلاش کر رہے ہیں؟',
    dossier_cat2_sub: 'لوگوں کی طلب کے مصدقہ ذرائع',
    dossier_cat3_title: '۳۔ مارکیٹ میں اور کون یہ کام کر رہا ہے؟',
    dossier_cat3_sub: 'مصدقہ حریف اور ان کی قیمتیں',
    dossier_cat4_title: '۴۔ ادائیگی میں غیر مصدقہ دلچسپی',
    dossier_cat4_sub: 'زبانی دلچسپی یا ویٹ لسٹ (ابھی ادائیگی نہیں ہوئی)',
    dossier_cat5_title: '۵۔ کیا گاہک واقعی پیسے دیں گے؟',
    dossier_cat5_sub: 'گاہک کی اصل ادائیگی، رسید یا دستخط شدہ معاہدہ',
    dossier_btn_promote: 'اس آئیڈیا کی پہلی پروڈکٹ (MVP) کا منصوبہ بنائیں',
    dossier_btn_approve: 'آئیڈیا منظور کریں',
    dossier_btn_hold: 'مزید ثبوت چیک کریں (ہولڈ)',
    dossier_btn_reject: 'کمزور آئیڈیا مسترد کریں',
    dossier_btn_export: 'مکمل رپورٹ ڈاؤن لوڈ کریں (Markdown)',
    dossier_15_heading: 'آئیڈیا کی ۱۵ نکاتی تفصیل (حقائق اور غیر مصدقہ اندازے واضح طور پر الگ ہیں)',
    dossier_11_heading: 'سٹرا نے یہ اسکور کیسے نکالا؟ (۱۱ شفاف پہلو)',
    dossier_th_dim: 'پہلو',
    dossier_th_group: 'اسکور گروپ',
    dossier_th_weight: 'اہمیت (وزن)',
    dossier_th_score10: 'اسکور (۱ تا ۱۰)',
    dossier_th_pts: 'شامل کردہ پوائنٹس',
    dossier_th_why: 'یہ کس چیز کو ناپتا ہے',
    dossier_ev_heading: 'اس آئیڈیا کے محفوظ شدہ مارکیٹ ثبوت ({count} ریکارڈز · اوسط اعتماد: {conf}%)',
    dossier_ev_add_btn: 'لنک چیک کریں، ثبوت جوڑیں اور دوبارہ اسکور نکالیں',
    dossier_comp_heading: 'دیگر موجودہ ٹولز اور حریف ({count} درج شدہ)',
    dossier_comp_add_btn: 'حریف کو فہرست میں شامل کریں',

    // View 3: Plan First Product / MVP (#tab-execution)
    v3_heading: '۳۔ اپنی پہلی سادہ پروڈکٹ کا منصوبہ بنائیں (پہلے کیا بنائیں اور خریداروں کو کیسے پرکھیں)',
    v3_desc: 'منتخب کردہ کاروباری آئیڈیا کو ایک واضح منصوبے میں بدلیں: ہمیں سب سے پہلے کیا بنانا چاہیے؟ ابھی کون سی چیزیں چھوڑ دینی چاہئیں؟ ممکنہ قیمت کیا ہوگی؟ اور کیسے پتہ چلے گا کہ خریدار واقعی یہ چاہتے ہیں؟',
    v3_select_product_label: 'منصوبہ بند پروڈکٹ منتخب کریں',
    v3_empty_products: 'ابھی کسی پہلی پروڈکٹ کا منصوبہ نہیں بنایا گیا۔ ”۲۔ آئیڈیاز کا موازنہ اور اسکور“ میں جا کر کسی آئیڈیا پر ”پہلی پروڈکٹ (MVP) کا منصوبہ بنائیں“ پر کلک کریں۔',
    v3_completion_label: '{pct}% مکمل',
    v3_blueprint_heading: 'پہلی سادہ پروڈکٹ (MVP) کا نقشہ اور خریداروں کی تصدیق کے اصول',
    v3_cell_customer: 'پہلا گاہک کون ہے؟ [تصدیق ہونے تک اندازہ]',
    v3_cell_must_have: 'ہمیں سب سے پہلے کیا بنانا چاہیے؟ (۱۴ دن میں بننے والی بنیادی خصوصیات)',
    v3_cell_excluded: 'ہم ابھی کیا چھوڑیں گے؟ (پہلے ورژن میں شامل نہ کی جانے والی چیزیں)',
    v3_cell_pricing: 'ہم کتنی قیمت رکھ سکتے ہیں؟ [غیر مصدقہ قیمت کا اندازہ]',
    v3_cell_validation: 'ہمیں کیسے پتہ چلے گا کہ گاہک واقعی یہ چاہتے ہیں؟ (بنانے، بدلنے یا روکنے کے اصول)',
    v3_edit_summary: 'اس پروڈکٹ کے منصوبے میں ترمیم کریں (گاہک، بنیادی خصوصیات، چھوڑی گئی چیزیں، قیمت اور اصول اپڈیٹ کریں)',
    v3_save_plan_btn: 'پروڈکٹ پلان کی تبدیلیاں محفوظ کریں',
    v3_roadmap_heading: 'آئیڈیا سے لانچ تک ۱۵ مراحل کی چیک لسٹ',

    // View 4: Approvals & My Skills (#tab-approvals)
    v4_heading: '۴۔ آپ کی مالی منظوریاں، حفاظتی کنٹرول اور ذاتی مہارتیں',
    v4_desc: 'سٹرا آپ کی واضح اجازت کے بغیر کبھی پیسے خرچ نہیں کرتا، ادا شدہ ٹولز نہیں چلاتا اور نہ ہی کوئی چیز عوامی طور پر لانچ کرتا ہے۔ یہاں زیرِ التوا درخواستوں کا فیصلہ کریں اور اپنی مہارتوں کا ریکارڈ رکھیں۔',
    v4_queue_title: 'آپ کی اجازت کے منتظر فیصلے (مالی اور عوامی حفاظتی لاک)',
    v4_new_appr_title: 'نئے خرچ یا عوامی قدم کے لیے منظوری کی درخواست درج کریں',
    v4_appr_submit_btn: 'منظوری کی فہرست میں شامل کریں',
    v4_cap_title: 'آپ کی ذاتی مہارتیں اور طاقتیں (جن سے ”بنانا کتنا آسان ہے؟“ کا حساب لگایا جاتا ہے)',
    v4_cap_add_title: 'اپنی کوئی نئی مہارت شامل یا اپڈیٹ کریں',
    v4_cap_submit_btn: 'مہارت محفوظ کریں',
    v4_bi_title: 'محفوظ کردہ کاروباری اسباق، مارکیٹ کے مشاہدات اور ماضی کے فیصلے',
    v4_bi_add_title: 'نیا سیکھا گیا سبق یا مارکیٹ کا مشاہدہ درج کریں',
    v4_bi_submit_btn: 'سبق کاروباری یادداشت میں محفوظ کریں',

    // View 5: Help Center & Knowledge Base (#tab-help)
    v5_heading: '۵۔ مدد اور رہنمائی کا مرکز، آسان گائیڈ اور عام سوالات',
    v5_desc: 'روزمرہ کی آسان زبان میں سٹرا (STRAW) کو سمجھنے کے لیے مکمل رہنمائی—آئیڈیاز کیسے تلاش کیے جاتے ہیں، اسکور کیسے کام کرتے ہیں، حریف کی قیمت گاہک کی ادائیگی کا ثبوت کیوں نہیں ہے، اور پہلی پروڈکٹ کا منصوبہ کیسے بنایا جائے۔',
    v5_search_placeholder: 'مددگار عنوانات، اسکورز یا اصطلاحات تلاش کریں...',
    v5_topics_title: 'رہنمائی کے عنوانات (۱۳ گائیڈز)',

    // Badges & Status Labels
    rec_APPROVE_FOR_VALIDATION: 'خریداروں کے ساتھ ٹیسٹ کے لیے تیار',
    rec_NEEDS_EVIDENCE: 'مزید حقیقی ثبوت درکار ہے',
    rec_HOLD_CONFLICTING_EVIDENCE: 'ہولڈ: متضاد ثبوت موجود ہیں',
    rec_REJECT_WEAK_IDEA: 'کمزور آئیڈیا: ابھی نہ بنائیں',

    tier_verified_evidence: 'مصدقہ ویب ثبوت',
    tier_practitioner_observation: 'ذاتی کام کا مشاہدہ',
    tier_estimate: 'محتاط اندازہ',
    tier_assumption: 'بغیر ثبوت کے مفروضہ',

    cat_problem_existence: '۱۔ مسئلہ واقعی موجود ہے',
    cat_market_demand: '۲۔ لوگ حل تلاش کر رہے ہیں',
    cat_competitor_activity: '۳۔ حریفوں کی سرگرمی اور قیمتیں',
    cat_unverified_willingness_to_pay: '۴۔ ادائیگی میں غیر مصدقہ دلچسپی',
    cat_verified_commercial_commitment: '۵۔ گاہک کی مصدقہ ادائیگی / معاہدہ',
    cat_willingness_to_pay: '۵۔ گاہک کی مصدقہ ادائیگی / معاہدہ',

    // Feedback Notifications
    fb_lang_switched: 'زبان اردو (دائیں سے بائیں) منتخب کر لی گئی ہے۔ آپ کا کاروباری ڈیٹا اور اسکورز بالکل محفوظ اور یکساں ہیں۔',
    fb_opp_status: 'آئیڈیا کی حالت {status} میں تبدیل کر دی گئی۔',
    fb_opp_promoted: '”{name}“ کے لیے پہلی پروڈکٹ (MVP) کا منصوبہ تیار کر لیا گیا!',
    fb_appr_decided: 'منظوری کی درخواست پر {decision} کا فیصلہ درج ہو گیا۔',
    fb_http_verified: 'ویب لنک چیک مکمل: حالت {status} (طریقہ: {method})۔',
    fb_ev_reviewed: 'ثبوت کی حالت {status} میں اپڈیٹ کر دی گئی۔',
    fb_task_updated: 'چیک لسٹ کا مرحلہ {status} کر دیا گیا — تکمیل کی فیصد دوبارہ نکال لی گئی۔',
    fb_opp_created: '”{title}“ کا اسکور نکال لیا گیا: مجموعی اسکور {score}/100 ({rec})',
    fb_ev_added: 'ثبوت محفوظ ہو گیا ({tier} | {status})۔ نیا مجموعی اسکور: {score}/100۔',
    fb_run_done: '”{query}“ کے لیے مارکیٹ تلاش مکمل ہو گئی ({status})۔',
    fb_comp_added: 'اس آئیڈیا میں حریف کا ریکارڈ شامل کر دیا گیا۔',
    fb_mvp_saved: 'پہلی پروڈکٹ (MVP) کے منصوبے کی تبدیلیاں محفوظ ہو گئیں۔',
    fb_appr_created: 'منظوری کی فہرست میں نئی درخواست شامل کر دی گئی۔',
    fb_cap_saved: 'آپ کی ذاتی پروفائل میں مہارت محفوظ ہو گئی۔',
    fb_bi_saved: 'کاروباری یادداشت میں نیا سبق محفوظ ہو گیا۔'
  }
};

/**
 * Reusable Plain-Language Explanations (`ExplainTerm` catalog)
 * Every entry provides:
 * - title: Concept name
 * - simple: Plain everyday explanation
 * - example: Concrete practical example
 * - technical: Underlying STRAW engineering/scoring rule
 */
export const EXPLAIN_TERMS = {
  en: {
    priority_index: {
      title: 'Overall Idea Score (Priority Index, 0–100)',
      simple: 'A single score from 0 to 100 that helps you rank your business ideas from strongest to weakest.',
      example: 'If Idea A scores 78/100 and Idea B scores 52/100, start by testing Idea A first. However, a 78/100 score is a comparison rank—not a 78% guarantee of making money.',
      technical: 'Weighted sum across 11 dimensions (Demand 16%, Problem Severity 11%, Capability Fit 12%, Monetization 9%, etc.), subject to hard caps when verified external evidence is missing.'
    },
    commercial_readiness: {
      title: 'How Ready Is This Idea to Sell? (Commercial Readiness, 0–100)',
      simple: 'Shows how much real proof we have that customers want this product and will actually pay us for it.',
      example: 'An idea with only competitor links and zero paying customers is capped at 58/100 or lower. Once 4 real buyers pay for early access, this score rises above 80/100.',
      technical: 'Normalized score across the 6 commercial dimensions (Demand Evidence, Problem Severity, Audience Specificity, Competition Gaps, Differentiation, Monetization, Acquisition Ease). Strictly capped at <=58 until verified buyer willingness-to-pay evidence is attached.'
    },
    technical_feasibility: {
      title: 'How Difficult Is It to Build? (Technical Feasibility, 0–100)',
      simple: 'Shows how easily, quickly, and cheaply you can build the first version using the skills you already have.',
      example: 'Because you already have strong UX, Design Systems, and Web skills, a browser contrast tool scores 90/100 (very easy for you to build), even before you know if customers will buy it.',
      technical: 'Normalized score across the 4 execution dimensions: Owner Capability Fit (12%), Speed to MVP (9%), Operational Simplicity (5%), and Maintenance Burden (4%).'
    },
    score_separation: {
      title: 'Why "Ready to Sell" and "Easy to Build" Are Kept Separate',
      simple: 'Being able to build something easily does not mean people will buy it. STRAW separates these two scores so you never build a product just because it is easy for you to code or design.',
      example: 'ContrastPair OKLCH scores 90/100 on "Easy to Build" but only 55/100 on "Ready to Sell" until real buyers pay.',
      technical: 'Enforces Milestone M-V1.2 separation between commercial_readiness_score and technical_feasibility_score with independent evidence caps.'
    },
    cat_problem_existence: {
      title: '1. Is the Problem Real? (Problem Existence)',
      simple: 'Proof that the headache, rule, or problem actually happens in the real world.',
      example: 'W3C publishing WCAG 2.2 accessibility rules or merchants complaining about fake cash-on-delivery orders proves the problem is real.',
      technical: 'Classified as `problem_existence`. Confirms pain exists, but does not by itself unlock high Demand or Willingness-to-Pay scores.'
    },
    cat_market_demand: {
      title: '2. Are People Looking for This? (Market Demand)',
      simple: 'Proof that real people are actively searching for a tool, installing plugins, or asking for help to solve this problem.',
      example: 'Thousands of WordPress site owners installing an accessibility checker plugin or asking on forums for an automated fix.',
      technical: 'Classified as `market_demand`. Requires verified external sources showing active user search, adoption, or solution requests.'
    },
    cat_competitor_activity: {
      title: '3. Who Else Is Doing This? (Competitor Activity)',
      simple: 'Proof that other companies or tools already exist in this space—including how much competitors charge on their pricing pages.',
      example: 'Seeing that Stark charges $49/month proves competitors exist. IMPORTANT: A competitor charging $49 does NOT prove customers will pay $49 for our new product.',
      technical: 'Classified exclusively as `competitor_activity`. Competitor pricing URLs and third-party plan descriptions are strictly prevented from counting as buyer willingness to pay.'
    },
    cat_unverified_wtp: {
      title: '4. Unverified Interest in Paying',
      simple: 'Someone told you "I might buy this", joined a free waitlist, or asked for a price quote, but has not paid any money or signed an order yet.',
      example: 'Five designers say in an interview "Yes, $39 sounds fair" (`pricing_reaction`), but none of them have paid an invoice yet.',
      technical: 'Classified as `unverified_willingness_to_pay` (statuses: `verbal_interest`, `pricing_reaction`, `proposal_requested`). Does not unlock `VERIFIED_BUYER_WTP`.'
    },
    cat_verified_commitment: {
      title: '5. Would Customers Pay for This? (Verified Commercial Commitment)',
      simple: 'Hard proof that real customers have paid money, signed a contract, or placed a confirmed purchase order for YOUR product.',
      example: 'Four design team leads pay $49 each ($196 total) via Stripe invoice for early access to your tool.',
      technical: 'Classified as `verified_commercial_commitment` with statuses `contract_signed`, `purchase_order_confirmed`, or `payment_received` and a verified source/reference. Unlocks `VERIFIED_BUYER_WTP`.'
    },
    evidence_tiers: {
      title: 'How Strong Is the Proof? (4 Evidence Tiers)',
      simple: 'STRAW labels every claim by how trustworthy it is: (1) Verified Web Proof, (2) Personal Work Observation, (3) Rough Estimate, or (4) Unproven Guess.',
      example: 'If you enter an idea with only an Unproven Guess, STRAW limits its Demand score to 3.5/10 until you attach a real website link.',
      technical: 'Provenance tiers: `verified_evidence` (requires live HTTP 200 fetch + excerpt match + SHA-256 hash), `practitioner_observation` (capped <=6.0), `estimate` (capped <=4.5), and `assumption` (capped <=3.5).'
    },
    evidence_verification: {
      title: 'Website Link Verification & Digital Fingerprint (SHA-256)',
      simple: 'When you add a website link as proof, STRAW visits that page to check that your quote is really there, and saves a unique digital code (SHA-256) so nobody can fake the proof.',
      example: 'If someone pastes a broken link or makes up a quote that is not on the page, STRAW automatically downgrades it to "Unverified".',
      technical: 'SSRF-hardened `retrieveAndVerifySourceContent()` blocks private/local IPs, verifies HTTP 200 content, checks normalized excerpt inclusion, and computes a 64-char hex SHA-256 hash per individual source.'
    },
    source_adapter: {
      title: 'Connected Search Sources (Free vs. Paid)',
      simple: 'These are the public websites STRAW can search automatically for problems and proof. Free sources work anytime at $0 cost; paid sources are locked unless you approve spending.',
      example: 'Hacker News Algolia, GitHub, WordPress.org, StackExchange, and Reddit are 100% free public sources.',
      technical: 'Registered collectors in `ResearchEngine`. Paid adapters (`is_paid_service=1`) require an unconsumed, source-bound approval token from `ApprovalEngine`.'
    },
    mvp_scope: {
      title: 'What Should We Build First? (MVP — Minimum Viable Product)',
      simple: 'An MVP is the simplest, smallest version of your product that solves the main problem in 14 days or less, so you can test it with real buyers before spending months building extra features.',
      example: 'Instead of building a full cloud platform with team billing, build a simple browser tool that checks color contrast and exports a report.',
      technical: 'Stored in `products.mvp_must_have_features`, `mvp_excluded_scope`, `pricing_hypothesis`, and `buyer_validation_criteria`.'
    },
    excluded_scope: {
      title: 'What Will We Skip for Now? (Excluded Non-Goals)',
      simple: 'A clear list of features you promise NOT to build in Version 1 so you don\'t waste time or get stuck overbuilding.',
      example: 'Skip user accounts, team billing dashboards, and mobile apps until your first 5 customers pay for the core tool.',
      technical: 'Anti-scope-creep boundary (`mvp_excluded_scope`) required on every promoted MVP product plan.'
    },
    buyer_validation_criteria: {
      title: 'How Will We Know Customers Really Want It? (Build / Pivot / Abandon Rules)',
      simple: 'Exact goals you set BEFORE launching so you can decide calmly whether to keep building, change direction (pivot), or stop and try another idea.',
      example: 'BUILD IF: 5 customers pre-order at $39 in 14 days. CHANGE DIRECTION IF: They ask for a CLI tool instead. STOP IF: Fewer than 2 people buy.',
      technical: 'Structured validation gate (`buyer_validation_criteria`) requiring explicit `BUILD IF:`, `PIVOT IF:`, and `ABANDON IF:` thresholds.'
    },
    approval_gate: {
      title: 'Human Approval Gate (Financial & Public Safety Lock)',
      simple: 'A hard safety lock that stops STRAW from spending a single dollar, calling paid APIs, running ads, or publishing anything publicly without your click.',
      example: 'If a research run tries to use a $49 paid keyword tool without your approval, STRAW blocks it immediately (`MISSING_APPROVAL`).',
      technical: 'Enforced by `ApprovalEngine.verifyPaidResearchAuthorization()` with one-time token consumption (`consumed_at`), category matching, and USD budget validation.'
    },
    capability_fit: {
      title: 'Your Personal Skills & Strengths (Capability Fit)',
      simple: 'Matches each business idea against the skills you already have (like UX/UI Design, Design Systems, WordPress, and AI-Assisted Coding) so you pick ideas you can build well.',
      example: 'A design-system tool scores 9.5/10 on Capability Fit for you, whereas a hardware factory idea would score very low.',
      technical: 'Deterministic matching in `CapabilityEngine` comparing opportunity category requirements against the owner\'s 1–5 proficiency matrix.'
    }
  },

  ur: {
    priority_index: {
      title: 'مجموعی آئیڈیا اسکور (Priority Index — 0 تا 100)',
      simple: '۰ سے ۱۰۰ تک کا ایک مجموعی نمبر جو آپ کو اپنے کاروباری آئیڈیاز کو مضبوط سے کمزور کی ترتیب میں رکھنے میں مدد دیتا ہے۔',
      example: 'اگر آئیڈیا الف کا اسکور 78/100 ہے اور آئیڈیا ب کا 52/100، تو پہلے آئیڈیا الف کو آزمائیں۔ لیکن یاد رکھیں: 78 اسکور موازنے کے لیے ہے، یہ پیسے کمانے کی ۷۸ فیصد گارنٹی نہیں ہے۔',
      technical: '۱۱ مختلف پہلوؤں کا مجموعی اسکور۔ اگر بیرونی مصدقہ ثبوت موجود نہ ہو تو اسکور پر خودکار حد (Cap) لگ جاتی ہے۔'
    },
    commercial_readiness: {
      title: 'یہ آئیڈیا فروخت کے لیے کتنا تیار ہے؟ (Commercial Readiness — 0 تا 100)',
      simple: 'یہ بتاتا ہے کہ ہمارے پاس اس بات کا کتنا ثبوت ہے کہ لوگ واقعی یہ پروڈکٹ چاہتے ہیں اور اس کے پیسے دیں گے۔',
      example: 'جس آئیڈیا میں صرف حریفوں کے لنکس ہوں لیکن کسی گاہک کی ادائیگی کا ثبوت نہ ہو، اس کا یہ اسکور 58/100 یا اس سے کم پر روک دیا جاتا ہے۔ جب حقیقی خریدار ادائیگی کرتے ہیں تب ہی یہ اسکور 80 سے اوپر جاتا ہے۔',
      technical: '۶ کاروباری پہلوؤں کا مجموعی اسکور۔ جب تک گاہک کی مصدقہ ادائیگی یا معاہدہ شامل نہ ہو، یہ اسکور 58 پر محدود رہتا ہے۔'
    },
    technical_feasibility: {
      title: 'اسے بنانا کتنا آسان یا مشکل ہے؟ (Technical Feasibility — 0 تا 100)',
      simple: 'یہ بتاتا ہے کہ آپ اپنی موجودہ مہارتوں کی مدد سے اس پروڈکٹ کا پہلا ورژن کتنی آسانی، تیزی اور کم خرچ میں بنا سکتے ہیں۔',
      example: 'چونکہ آپ کو ڈیزائن سسٹمز اور ویب ٹولز میں مہارت حاصل ہے، اس لیے براؤزر ٹول بنانا آپ کے لیے 90/100 (بہت آسان) ہو سکتا ہے، چاہے ابھی گاہک کی تصدیق باقی ہو۔',
      technical: '۴ تعمیراتی پہلوؤں کا اسکور: آپ کی مہارتوں سے مطابقت (12%)، بنانے کی رفتار (9%)، چلانے کی سادگی (5%) اور دیکھ بھال کا بوجھ (4%)۔'
    },
    score_separation: {
      title: '”فروخت کی تیاری“ اور ”بنانے کی آسانی“ کو الگ کیوں رکھا گیا ہے؟',
      simple: 'کسی چیز کو آسانی سے بنا لینے کا یہ مطلب نہیں کہ لوگ اسے خریدیں گے بھی۔ سٹرا ان دونوں اسکورز کو الگ رکھتا ہے تاکہ آپ صرف اس وجہ سے وقت ضائع نہ کریں کہ کوئی چیز بنانا آسان ہے۔',
      example: 'ContrastPair OKLCH کا بنانے کی آسانی کا اسکور 90/100 ہے، لیکن فروخت کی تیاری کا اسکور گاہک کی ادائیگی تک 55/100 رہتا ہے۔',
      technical: 'کمرشل ریڈینیس اور ٹیکنیکل فیزیبلٹی کو الگ الگ ناپا جاتا ہے تاکہ تکنیکی آسانی کاروباری کمی کو چھپا نہ سکے۔'
    },
    cat_problem_existence: {
      title: '۱۔ کیا مسئلہ واقعی موجود ہے؟ (Problem Existence)',
      simple: 'اس بات کا ثبوت کہ یہ پریشانی، قانون یا تکنیکی مسئلہ حقیقی دنیا میں واقعی پایا جاتا ہے۔',
      example: 'ویب ایکسیسبیلٹی کے قوانین یا کیش آن ڈیلیوری میں جعلی آرڈرز کے نقصانات یہ ثابت کرتے ہیں کہ مسئلہ حقیقی ہے۔',
      technical: 'اسے `problem_existence` کے درجے میں رکھا جاتا ہے۔ یہ مسئلے کا ثبوت ہے، لیکن اکیلے گاہک کی ادائیگی کا ثبوت نہیں۔'
    },
    cat_market_demand: {
      title: '۲۔ کیا لوگ اس کا حل تلاش کر رہے ہیں؟ (Market Demand)',
      simple: 'اس بات کا ثبوت کہ حقیقی لوگ اس مسئلے کو حل کرنے کے لیے ٹولز تلاش کر رہے ہیں، پلگ ان انسٹال کر رہے ہیں یا مدد مانگ رہے ہیں۔',
      example: 'ہزاروں ویب سائٹ مالکان کا ایکسیسبیلٹی چیک کرنے والا پلگ ان انسٹال کرنا یا فورمز پر حل مانگنا۔',
      technical: 'اسے `market_demand` کے درجے میں رکھا جاتا ہے۔ اس کے لیے بیرونی ویب ذرائع کا ثبوت لازمی ہے۔'
    },
    cat_competitor_activity: {
      title: '۳۔ مارکیٹ میں اور کون یہ کام کر رہا ہے؟ (Competitor Activity)',
      simple: 'اس بات کا ثبوت کہ دیگر کمپنیاں یا ٹولز پہلے سے موجود ہیں—بشمول یہ کہ حریف کمپنیاں اپنی ویب سائٹ پر کیا قیمت لیتی ہیں۔',
      example: 'اگر Stark کمپنی 49 ڈالر ماہانہ لیتی ہے تو اس سے ثابت ہوتا ہے کہ حریف موجود ہے۔ اہم اصول: حریف کی قیمت یہ ثابت نہیں کرتی کہ گاہک آپ کی نئی پروڈکٹ کو بھی 49 ڈالر دیں گے۔',
      technical: 'اسے صرف `competitor_activity` شمار کیا جاتا ہے۔ حریفوں کے پرائسنگ پیجز کو کبھی بھی ہمارے خریدار کی ادائیگی کا ثبوت نہیں مانا جاتا۔'
    },
    cat_unverified_wtp: {
      title: '۴۔ ادائیگی میں غیر مصدقہ دلچسپی (Unverified Interest in Paying)',
      simple: 'کسی نے زبانی کہا کہ ”میں یہ خریدوں گا“، مفت ویٹ لسٹ میں نام لکھوایا یا قیمت پوچھی، لیکن ابھی کوئی رقم ادا نہیں کی اور نہ ہی پکا آرڈر دیا۔',
      example: 'پانچ ڈیزائنرز انٹرویو میں کہتے ہیں کہ 39 ڈالر مناسب قیمت ہے، لیکن ابھی کسی نے بل ادا نہیں کیا۔',
      technical: 'اسے `unverified_willingness_to_pay` کہا جاتا ہے (`verbal_interest`، `pricing_reaction`، `proposal_requested`)۔ اس سے مصدقہ ادائیگی کا لاک نہیں کھلتا۔'
    },
    cat_verified_commitment: {
      title: '۵۔ کیا گاہک واقعی پیسے دیں گے؟ (Verified Commercial Commitment)',
      simple: 'اس بات کا پکا ثبوت کہ حقیقی گاہکوں نے آپ کی پروڈکٹ کے لیے رقم ادا کر دی ہے، معاہدے پر دستخط کیے ہیں یا پکا پرچیز آرڈر دیا ہے۔',
      example: 'چار ڈیزائن ٹیموں کے سربراہ آپ کے ٹول کے ابتدائی ورژن کے لیے 49 ڈالر فی کس (کل 196 ڈالر) رسید کے ذریعے ادا کرتے ہیں۔',
      technical: 'اسے `verified_commercial_commitment` کہا جاتا ہے (`payment_received`، `contract_signed`، `purchase_order_confirmed`)۔ صرف اس سے `VERIFIED_BUYER_WTP` کھلتا ہے۔'
    },
    evidence_tiers: {
      title: 'ثبوت کتنا مضبوط ہے؟ (ثبوت کے ۴ درجے)',
      simple: 'سٹرا ہر بات کو اس کی مضبوطی کے لحاظ سے ۴ درجوں میں رکھتا ہے: (۱) مصدقہ ویب ثبوت، (۲) ذاتی کام کا مشاہدہ، (۳) محتاط اندازہ، یا (۴) بغیر ثبوت کے مفروضہ۔',
      example: 'اگر آپ بغیر کسی لنک کے صرف اپنا مفروضہ درج کریں تو سٹرا طلب کے اسکور کو 3.5/10 سے اوپر نہیں جانے دیتا۔',
      technical: 'چار درجے: `verified_evidence` (ویب لنک اور اقتباس کی تصدیق لازمی)، `practitioner_observation` (حد 6.0)، `estimate` (حد 4.5) اور `assumption` (حد 3.5)۔'
    },
    evidence_verification: {
      title: 'ویب لنک کی جانچ اور ڈیجیٹل فنگر پرنٹ (SHA-256)',
      simple: 'جب آپ ثبوت کے طور پر کوئی ویب سائٹ لنک دیتے ہیں تو سٹرا خود اس صفحے کو چیک کرتا ہے کہ آپ کا لکھا ہوا اقتباس وہاں موجود ہے یا نہیں، اور ثبوت کے طور پر ۶۴ حروف کا ڈیجیٹل کوڈ (SHA-256) محفوظ کرتا ہے۔',
      example: 'اگر کوئی غلط لنک دے یا ایسی بات لکھے جو اس ویب پیج پر موجود ہی نہ ہو تو سٹرا اسے خودکار طور پر ”غیر مصدقہ“ کر دیتا ہے۔',
      technical: 'محفوظ HTTP جانچ کے ذریعے صفحے کا مواد چیک کیا جاتا ہے اور ہر ماخذ کا الگ SHA-256 ہیش بنایا جاتا ہے۔'
    },
    source_adapter: {
      title: 'منسلک تلاش کے ذرائع (مفت بمقابلہ ادا شدہ)',
      simple: 'یہ وہ عوامی ویب سائٹس ہیں جہاں سٹرا خودکار طور پر مسائل اور ثبوت تلاش کر سکتا ہے۔ مفت ذرائع بغیر کسی خرچ کے کام کرتے ہیں، جبکہ ادا شدہ ذرائع آپ کی منظوری کے بغیر نہیں چل سکتے۔',
      example: 'Hacker News، GitHub، WordPress.org، StackExchange اور Reddit بالکل مفت عوامی ذرائع ہیں۔',
      technical: 'ادا شدہ سروسز (`is_paid_service=1`) کو چلانے کے لیے `ApprovalEngine` کی طرف سے منظور شدہ اور غیر استعمال شدہ ٹوکن لازمی ہے۔'
    },
    mvp_scope: {
      title: 'ہمیں سب سے پہلے کیا بنانا چاہیے؟ (MVP — پہلی سادہ پروڈکٹ)',
      simple: 'MVP آپ کی پروڈکٹ کا وہ سب سے سادہ اور مختصر ورژن ہے جو ۱۴ دن یا اس سے کم وقت میں بن سکے اور بنیادی مسئلہ حل کر دے، تاکہ آپ مہینوں لگانے سے پہلے حقیقی خریداروں کو دکھا کر پرکھ سکیں۔',
      example: 'مکمل کلاؤڈ پلیٹ فارم بنانے کے بجائے پہلے ایک سادہ ٹول بنائیں جو رنگوں کا کنٹراسٹ چیک کر کے رپورٹ دے۔',
      technical: 'پروڈکٹ کے ریکارڈ میں بنیادی خصوصیات، چھوڑی گئی چیزیں، قیمت کا اندازہ اور خریداروں کی تصدیق کی شرائط محفوظ کی جاتی ہیں۔'
    },
    excluded_scope: {
      title: 'ہم ابھی کیا چھوڑیں گے؟ (پہلے ورژن میں شامل نہ ہونے والی چیزیں)',
      simple: 'ان خصوصیات کی واضح فہرست جو آپ پہلے ورژن میں ہرگز نہیں بنائیں گے تاکہ وقت ضائع نہ ہو اور کام بروقت مکمل ہو۔',
      example: 'پہلے ۵ گاہکوں کی ادائیگی سے پہلے یوزر اکاؤنٹس، بلنگ ڈیش بورڈ اور موبائل ایپ بنانے سے گریز کریں۔',
      technical: 'اضافی کام سے بچنے کی حد (`mvp_excluded_scope`) جو ہر MVP پلان میں واضح طور پر لکھی جاتی ہے۔'
    },
    buyer_validation_criteria: {
      title: 'ہمیں کیسے پتہ چلے گا کہ گاہک واقعی یہ چاہتے ہیں؟ (بنانے، بدلنے یا روکنے کے اصول)',
      simple: 'کام شروع کرنے سے پہلے طے کیے گئے واضح اصول تاکہ آپ جذبات کے بجائے حقائق کی بنیاد پر فیصلہ کریں کہ پروڈکٹ آگے بڑھانی ہے، رخ بدلنا ہے یا روک دینی ہے۔',
      example: 'بنائیں اگر: ۱۴ دن میں ۵ گاہک 39 ڈالر میں پری آرڈر کریں۔ رخ بدلیں اگر: گاہک براؤزر کے بجائے کمانڈ لائن ٹول مانگیں۔ روک دیں اگر: ۲ سے کم گاہک دلچسپی لیں۔',
      technical: 'خریداروں کی تصدیق کا معیار جس میں `BUILD IF:`، `PIVOT IF:` اور `ABANDON IF:` کی شرائط لازمی ہیں۔'
    },
    approval_gate: {
      title: 'مالی اور عوامی منظوری کا حفاظتی لاک (Human Approval Gate)',
      simple: 'ایک مضبوط حفاظتی لاک جو سٹرا کو آپ کی کلک کے بغیر ایک روپیہ یا ڈالر خرچ کرنے، ادا شدہ ٹول چلانے یا عوامی طور پر کچھ شائع کرنے سے روکتا ہے۔',
      example: 'اگر کوئی تلاش 49 ڈالر والا ادا شدہ ٹول آپ کی منظوری کے بغیر چلانے کی کوشش کرے تو سٹرا اسے فوراً روک دیتا ہے (`MISSING_APPROVAL`)۔',
      technical: '`ApprovalEngine` کے ذریعے ہر مالی قدم، بجٹ کی حد اور ایک بار استعمال ہونے والے ٹوکن کی سخت جانچ۔'
    },
    capability_fit: {
      title: 'آپ کی ذاتی مہارتوں سے مطابقت (Capability Fit)',
      simple: 'ہر کاروباری آئیڈیا کا آپ کی موجودہ مہارتوں (جیسے UX/UI ڈیزائن، ڈیزائن سسٹمز، ورڈپریس اور اے آئی کوڈنگ) سے موازنہ تاکہ آپ وہ کام چنیں جو آپ بہترین طریقے سے بنا سکتے ہیں۔',
      example: 'ڈیزائن سسٹم کا ٹول آپ کی مہارتوں کے لحاظ سے 9.5/10 اسکور لیتا ہے۔',
      technical: '`CapabilityEngine` کے ذریعے آئیڈیا کی ضروریات کا آپ کی ۱ تا ۵ مہارت کی سطحوں سے خودکار موازنہ۔'
    }
  }
};

/**
 * 13-Section Help Center & Knowledge Base Articles (English & Pakistani Urdu)
 */
export const HELP_CENTER_SECTIONS = {
  en: [
    {
      id: 'getting-started',
      number: '1',
      title: 'Getting Started (First-Time User Guide)',
      summary: 'A 6-step walkthrough for using STRAW from your first search to your first product plan.',
      bullets: [
        'Step 1 — Understand STRAW: STRAW helps you find real problems, check if buyers will pay, and plan a simple first product (MVP) without wasting time or money.',
        'Step 2 — Run a Free Market Search: Open "1. Find Business Ideas", type a topic (e.g., "accessible color contrast tool"), pick a free public source like Hacker News Algolia, and click "Search for Ideas & Proof".',
        'Step 3 — Open an Idea & Check Its Two Scores: Open "2. Compare & Score Ideas" and inspect "How Ready Is This Idea to Sell?" alongside "How Easy Is It to Build?"',
        'Step 4 — Check Proof vs. Guesses: Look at the 5 Evidence Categories. See how STRAW separates competitor pricing from real customer payment proof.',
        'Step 5 — Plan Your First Product (MVP): Click "Plan First Product (MVP)" on your best idea. In View 3, list must-have features for a 14-day build, what to skip for now, and buyer test rules.',
        'Step 6 — Download Your Report: Click "Download Full Report (Markdown)" in View 2 to save a complete summary of your idea, proof, and MVP plan.'
      ]
    },
    {
      id: 'what-is-straw',
      number: '2',
      title: 'What is STRAW?',
      summary: 'Your personal Business Idea Finder, Proof Checker, and Product Planner.',
      bullets: [
        'Who it is for: Designers, builders, freelancers, and business owners who want to launch useful digital products based on real proof instead of guesswork.',
        'What problem it solves: Most products fail because people spend months building something nobody wants to buy. STRAW checks market proof before you overbuild.',
        'What STRAW never does automatically: STRAW never spends your money, never runs paid ads without you, never contacts customers on its own, and never promises guaranteed riches. You stay in 100% control.'
      ]
    },
    {
      id: 'why-straw-exists',
      number: '3',
      title: 'Why STRAW Exists',
      summary: 'Why a normal notes app, spreadsheet, or generic AI chatbot is not enough.',
      bullets: [
        'Generic AI chatbots flatter your ideas: If you ask a normal AI chatbot if your business idea is good, it usually says "Great idea!" and invents fake revenue numbers.',
        'Spreadsheets mix up guesses and facts: In a plain spreadsheet, an unproven opinion looks the same as a verified customer invoice.',
        'STRAW enforces honesty: It checks real website links (https://), saves digital fingerprints (SHA-256), separates build ease from sales readiness, and caps commercial scores until real buyers commit.'
      ]
    },
    {
      id: 'how-straw-works',
      number: '4',
      title: 'How STRAW Works (8-Step Workflow)',
      summary: 'The complete journey from discovering a problem to planning a testable first product.',
      bullets: [
        '1. Discover Problems: Search public communities (Hacker News, GitHub, WordPress.org, StackExchange, Reddit) for real user frustrations.',
        '2. Collect Proof: Save real links, dates, and direct quotes from those sources.',
        '3. Score the Idea: Evaluate the idea across 11 clear factors.',
        '4. Compare Ideas Side by Side: See which ideas are easiest for you to build and which ones still need buyer proof.',
        '5. Pick One Focus Idea: Choose the strongest idea instead of chasing five ideas at once.',
        '6. Plan the MVP (What to Build First): Scope a simple version you can build in 14 days or less, and write down what features to skip.',
        '7. Set Buyer Test Rules: Define clear Build, Change Direction (Pivot), or Stop (Abandon) rules.',
        '8. Approve Next Steps: Use View 4 to review and approve any action that spends money or goes public.'
      ]
    },
    {
      id: 'finding-business-ideas',
      number: '5',
      title: 'Finding Business Ideas',
      summary: 'How to run free public discovery searches and add your own ideas in 4 simple questions.',
      bullets: [
        'Free Public Sources ($0 Cost): Hacker News Algolia, GitHub Repositories, WordPress.org Plugin Directory, StackExchange, and Reddit Public JSON are free and enabled by default.',
        'Paid Sources (Locked by Default): Paid keyword/SEO databases require real money and are automatically blocked unless you approve a spending request in View 4.',
        'Adding Your Own Idea: In View 2, fill out just 4 fields—Idea Name, Category, Build Difficulty, and Problem/Customer—to score a new idea immediately.'
      ]
    },
    {
      id: 'understanding-scores',
      number: '6',
      title: 'Understanding Opportunity Scores',
      summary: 'What Overall Idea Score, Ready to Sell, and Easy to Build actually mean.',
      bullets: [
        'Overall Idea Score (Priority Index, 0–100): A combined ranking across all 11 factors to help you sort your list. It is NOT a probability of financial success.',
        'How Ready Is This Idea to Sell? (Commercial Readiness, 0–100): Measures real buyer demand and payment proof. Capped at 58/100 or lower until you have verified buyer willingness to pay.',
        'How Easy Is It to Build? (Technical Feasibility, 0–100): Measures how well the idea fits your personal skills and how fast you can build Version 1.'
      ]
    },
    {
      id: 'understanding-evidence',
      number: '7',
      title: 'Understanding Market Evidence (5 Categories)',
      summary: 'How STRAW separates a real problem or competitor pricing from paying customers.',
      bullets: [
        '1. Is the Problem Real? (Problem Existence): Confirms a regulatory or workflow problem actually exists.',
        '2. Are People Looking for This? (Market Demand): Confirms users actively search for or request a solution.',
        '3. Who Else Is Doing This? (Competitor Activity): Confirms other tools exist, including competitor pricing pages. Competitor pricing NEVER counts as proof that buyers will pay us.',
        '4. Unverified Interest in Paying: Verbal interest, survey responses, or free waitlists without payment.',
        '5. Would Customers Pay for This? (Verified Commercial Commitment): Paid pilot receipts, paid customer invoices, signed contracts, or confirmed purchase orders for OUR product.'
      ]
    },
    {
      id: 'understanding-commercial-readiness',
      number: '8',
      title: 'Understanding Commercial Readiness Stages',
      summary: 'How an idea moves from an unproven guess to verified buyer commitment.',
      bullets: [
        'Stage 1 — Guess / Assumption: An initial idea with no outside proof yet.',
        'Stage 2 — Problem & Competitor Proof Only (UNVERIFIED_WILLINGNESS_TO_PAY): We know the problem exists and competitors charge money, but zero customers have paid us yet.',
        'Stage 3 — Unverified Buyer Interest: Customers expressed verbal interest, reacted to pricing, or asked for a proposal.',
        'Stage 4 — Verified Buyer Commitment (VERIFIED_BUYER_WTP): Customers signed a contract, confirmed a purchase order, or paid an invoice. Only Stage 4 unlocks a Commercial Readiness score above 80/100.'
      ]
    },
    {
      id: 'idea-to-mvp',
      number: '9',
      title: 'From Idea to MVP (What Should We Build First?)',
      summary: 'How to scope a 14-day first product and avoid wasting months overbuilding.',
      bullets: [
        'Who Is the First Customer? Pick a specific group with an urgent need, not "everyone on the internet".',
        'What Should We Build First? (Must-Have V1 Features): Only the 2–3 core features required to solve the main problem.',
        'What Will We Skip for Now? (Excluded Non-Goals): Features intentionally left out of Version 1 (like team billing dashboards or mobile apps) until customers pay.',
        'Build / Pivot / Abandon Rules: Set exact numbers (e.g., "Build if 5 customers pre-order at $39 in 14 days; stop if fewer than 2 buy").'
      ]
    },
    {
      id: 'approvals-and-control',
      number: '10',
      title: 'Approvals and User Control',
      summary: 'How STRAW protects your budget and requires your permission before spending or launching.',
      bullets: [
        'Zero-Cost Default: STRAW runs locally at $0 cost by default.',
        'Mandatory Approval Queue: Any action that spends money, buys a service, runs paid ads, publishes content, or launches publicly waits in View 4 for your decision.',
        'One-Time Financial Lock: Even when you approve a paid research run, STRAW verifies the exact source, dollar cap, and single-use token so it can never be reused silently.'
      ]
    },
    {
      id: 'faq',
      number: '11',
      title: 'Frequently Asked Questions (FAQ)',
      summary: 'Quick answers to common questions about scores, competitors, languages, and safety.',
      bullets: [
        'Q: Does a score of 80/100 guarantee my product will make money? — A: No. Scores help you compare ideas honestly; only real paying customers prove commercial success.',
        'Q: Why doesn\'t a competitor\'s $49/month pricing page count as Willingness to Pay? — A: Because it proves customers pay the competitor, not that they will switch to or pay for our new product.',
        'Q: Does switching between English and اردو change my data or scores? — A: Never. Only the display language and reading direction (LTR/RTL) change.',
        'Q: Why does Verified Proof require an https:// link and direct quote? — A: So STRAW can fetch the page, confirm the quote is real, and save a SHA-256 fingerprint.'
      ]
    },
    {
      id: 'glossary',
      number: '12',
      title: 'Plain-Language Glossary',
      summary: 'Simple definitions of every business and technical term used in STRAW.',
      bullets: [
        'MVP (Minimum Viable Product): The simplest first version of a product that solves the core problem for early users.',
        'Commercial Readiness: A 0–100 score showing how much proof we have that buyers want and will pay for this idea.',
        'Technical Feasibility: A 0–100 score showing how easily we can build the product with our current skills.',
        'Priority Index: The overall 0–100 comparison score combining all 11 evaluation factors.',
        'Verified Evidence: A fact confirmed from a live https:// web page with a matching excerpt and SHA-256 fingerprint.',
        'Practitioner Observation: Something noticed from personal work experience without an external study or payment receipt yet.',
        'Assumption / Guess: An unproven belief about target customers, pricing, or future revenue.',
        'Human Approval Gate: A safety lock requiring your explicit click before spending money or taking public action.'
      ]
    },
    {
      id: 'vision-and-roadmap',
      number: '13',
      title: 'Product Vision and Honest Roadmap (V1.0 vs. Future Versions)',
      summary: 'Clear distinction between what works in STRAW V1.0 today and what is planned for future releases.',
      bullets: [
        'Available Today in STRAW V1.0: 4-view workspace + bilingual Help Center (English & Urdu), 5 free public discovery connectors, SSRF-safe HTTP source verification with SHA-256 hashing, 11-dimension scoring with Commercial Readiness vs. Technical Feasibility separation, 5-category commercial evidence model, MVP blueprint planner with 15-stage checklist, Markdown dossier export, and Human Approval Gates.',
        'Planned for V1.5 (Guided Validation Experiments — Future): Landing page smoke-test tracker, customer interview script templates, and pre-order conversion tracking.',
        'Planned for V2.0 (Build & Launch Execution — Future): Starter code scaffolding and launch packaging checklists.',
        'Planned for V3.0 (Growth & Revenue Optimization — Future): Live payment provider webhooks and marketing channel ROI analytics.'
      ]
    }
  ],

  ur: [
    {
      id: 'getting-started',
      number: '۱',
      title: 'شروعات کیسے کریں (پہلی بار استعمال کرنے والوں کے لیے گائیڈ)',
      summary: 'پہلی تلاش سے لے کر پہلی پروڈکٹ کے منصوبے تک سٹرا (STRAW) استعمال کرنے کے ۶ آسان مراحل۔',
      bullets: [
        'پہلا قدم — سٹرا کا مقصد سمجھیں: سٹرا آپ کو لوگوں کے حقیقی مسائل تلاش کرنے، خریداروں کا ثبوت جانچنے اور وقت یا پیسہ ضائع کیے بغیر پہلی سادہ پروڈکٹ (MVP) کا منصوبہ بنانے میں مدد دیتا ہے۔',
        'دوسرا قدم — مفت مارکیٹ تلاش چلائیں: ”۱۔ کاروباری آئیڈیاز تلاش کریں“ کھولیں، کوئی مسئلہ لکھیں (مثلاً accessible color contrast tool)، مفت ذریعہ Hacker News Algolia منتخب کریں اور ”آئیڈیاز اور ثبوت تلاش کریں“ پر کلک کریں۔',
        'تیسرا قدم — آئیڈیا کھولیں اور دو الگ اسکورز دیکھیں: ”۲۔ آئیڈیاز کا موازنہ اور اسکور“ میں جا کر ”یہ آئیڈیا فروخت کے لیے کتنا تیار ہے؟“ اور ”اسے بنانا کتنا آسان ہے؟“ کا موازنہ کریں۔',
        'چوتھا قدم — ثبوت اور اندازوں کا فرق دیکھیں: ثبوت کی ۵ اقسام دیکھیں کہ کس طرح حریف کی قیمت کو ہمارے گاہک کی اصل ادائیگی سے الگ رکھا گیا ہے۔',
        'پانچواں قدم — پہلی پروڈکٹ (MVP) کا منصوبہ بنائیں: اپنے بہترین آئیڈیا پر ”پہلی پروڈکٹ (MVP) کا منصوبہ بنائیں“ پر کلک کریں اور حصہ ۳ میں ۱۴ دن کی بنیادی خصوصیات اور خریداروں کی شرائط طے کریں۔',
        'چھٹا قدم — مکمل رپورٹ ڈاؤن لوڈ کریں: حصہ ۲ میں ”مکمل رپورٹ ڈاؤن لوڈ کریں (Markdown)“ پر کلک کر کے اپنے آئیڈیا اور منصوبے کی فائل محفوظ کریں۔'
      ]
    },
    {
      id: 'what-is-straw',
      number: '۲',
      title: 'سٹرا (STRAW) کیا ہے؟',
      summary: 'آپ کا ذاتی کاروباری آئیڈیا تلاش کرنے، ثبوت جانچنے اور پروڈکٹ کی منصوبہ بندی کرنے والا نظام۔',
      bullets: [
        'یہ کس کے لیے ہے: ڈیزائنرز، ڈویلپرز، فری لانسرز اور کاروباری مالکان جو محض اندازوں کے بجائے حقیقی ثبوت کی بنیاد پر ڈیجیٹل مصنوعات بنانا چاہتے ہیں۔',
        'یہ کون سا مسئلہ حل کرتا ہے: اکثر لوگ مہینوں محنت کر کے ایسی چیز بنا لیتے ہیں جسے کوئی نہیں خریدتا۔ سٹرا بنانے سے پہلے ثبوت چیک کر کے آپ کو اس نقصان سے بچاتا ہے۔',
        'سٹرا خود سے کیا نہیں کرتا: سٹرا کبھی آپ کی اجازت کے بغیر پیسے خرچ نہیں کرتا، خود سے اشتہارات نہیں چلاتا، گاہکوں سے رابطہ نہیں کرتا اور نہ ہی یقینی منافع کا جھوٹا وعدہ کرتا ہے۔'
      ]
    },
    {
      id: 'why-straw-exists',
      number: '۳',
      title: 'سٹرا کیوں بنایا گیا ہے؟',
      summary: 'ایک عام نوٹس ایپ، ایکسل شیٹ یا عام اے آئی چیٹ بوٹ کافی کیوں نہیں ہے؟',
      bullets: [
        'عام اے آئی چیٹ بوٹس خوشامدی ہوتے ہیں: عام اے آئی سے پوچھیں تو وہ ہر آئیڈیا کی تعریف کرتا ہے اور خیالی منافع کے اعداد و شمار گھڑ لیتا ہے۔',
        'عام شیٹس لنکس کی تصدیق نہیں کرتیں: عام فہرست میں آپ کا ذاتی مفروضہ اور گاہک کی ادا شدہ رسید ایک جیسے نظر آتے ہیں۔',
        'سٹرا سچائی اور ثبوت کا پابند ہے: یہ اصل ویب لنکس (https://) چیک کرتا ہے، ڈیجیٹل فنگر پرنٹ (SHA-256) محفوظ کرتا ہے، اور گاہک کی ادائیگی کے بغیر فروخت کی تیاری کا اسکور اوپر نہیں جانے دیتا۔'
      ]
    },
    {
      id: 'how-straw-works',
      number: '۴',
      title: 'سٹرا کیسے کام کرتا ہے (۸ مراحل کا طریقہ کار)',
      summary: 'مسئلہ تلاش کرنے سے لے کر پہلی پروڈکٹ کی منصوبہ بندی تک کا مکمل سفر۔',
      bullets: [
        '۱۔ مسائل کی تلاش: عوامی ویب سائٹس (Hacker News، GitHub، WordPress.org، StackExchange، Reddit) پر لوگوں کے حقیقی مسائل تلاش کریں۔',
        '۲۔ ثبوت جمع کرنا: اصل لنکس، تاریخیں اور اقتباسات محفوظ کریں۔',
        '۳۔ آئیڈیا کی جانچ: ہر آئیڈیا کو ۱۱ شفاف پہلوؤں سے پرکھیں۔',
        '۴۔ آمنے سامنے موازنہ: دیکھیں کہ کون سا آئیڈیا بنانا آسان ہے اور کس میں ابھی خریدار کا ثبوت باقی ہے۔',
        '۵۔ بہترین آئیڈیا کا انتخاب: ایک وقت میں کئی کام کرنے کے بجائے سب سے مضبوط آئیڈیا منتخب کریں۔',
        '۶۔ پہلی سادہ پروڈکٹ (MVP) کا منصوبہ: ۱۴ دن یا اس سے کم میں بننے والا مختصر ورژن طے کریں اور اضافی چیزیں چھوڑ دیں۔',
        '۷۔ خریداروں کی تصدیق کے اصول: پہلے سے طے کریں کہ کب بنانا ہے (BUILD)، کب رخ بدلنا ہے (PIVOT) اور کب روکنا ہے (ABANDON)۔',
        '۸۔ اخراجات کی منظوری: حصہ ۴ میں جا کر کسی بھی خرچ یا عوامی قدم کا خود فیصلہ کریں۔'
      ]
    },
    {
      id: 'finding-business-ideas',
      number: '۵',
      title: 'کاروباری آئیڈیاز کیسے تلاش کریں',
      summary: 'مفت عوامی ویب سائٹس پر تلاش چلانے اور ۴ آسان سوالات سے نیا آئیڈیا شامل کرنے کا طریقہ۔',
      bullets: [
        'مفت عوامی ذرائع ($0 خرچ): Hacker News، GitHub، WordPress.org، StackExchange اور Reddit بالکل مفت ہیں اور پہلے سے فعال ہیں۔',
        'ادا شدہ ذرائع (پہلے سے لاک): پیسوں والے کی ورڈ ٹولز اس وقت تک بند رہتے ہیں جب تک آپ حصہ ۴ میں ان کے بجٹ کی منظوری نہ دیں۔',
        'اپنا آئیڈیا شامل کرنا: حصہ ۲ میں صرف ۴ خانے پر کریں—آئیڈیا کا نام، قسم، بنانے کی مشکل، اور مسئلہ و گاہک—تاکہ فوری اسکور نکل آئے۔'
      ]
    },
    {
      id: 'understanding-scores',
      number: '۶',
      title: 'آئیڈیا کے اسکورز کو کیسے سمجھیں',
      summary: 'مجموعی آئیڈیا اسکور، فروخت کی تیاری اور بنانے کی آسانی کا اصل مطلب۔',
      bullets: [
        'مجموعی آئیڈیا اسکور (Priority Index — 0 تا 100): تمام ۱۱ پہلوؤں کو ملا کر بنایا گیا موازنہ اسکور۔ یہ کاروباری کامیابی کی گارنٹی نہیں ہے۔',
        'یہ آئیڈیا فروخت کے لیے کتنا تیار ہے؟ (Commercial Readiness — 0 تا 100): یہ گاہک کی طلب اور ادائیگی کے ثبوت کو ناپتا ہے۔ گاہک کی ادائیگی کے ثبوت کے بغیر یہ 58/100 سے اوپر نہیں جاتا۔',
        'اسے بنانا کتنا آسان ہے؟ (Technical Feasibility — 0 تا 100): یہ ناپتا ہے کہ آپ کی ذاتی مہارتوں کے مطابق پہلا ورژن کتنی آسانی اور تیزی سے بن سکتا ہے۔'
      ]
    },
    {
      id: 'understanding-evidence',
      number: '۷',
      title: 'مارکیٹ ثبوت کی ۵ اقسام کو سمجھیں',
      summary: 'سٹرا کسی مسئلے یا حریف کی قیمت کو حقیقی گاہک کی ادائیگی سے کیسے الگ رکھتا ہے۔',
      bullets: [
        '۱۔ کیا مسئلہ واقعی موجود ہے؟ (Problem Existence): ثابت کرتا ہے کہ کوئی قانونی یا تکنیکی مشکل واقعی موجود ہے۔',
        '۲۔ کیا لوگ اس کا حل تلاش کر رہے ہیں؟ (Market Demand): ثابت کرتا ہے کہ لوگ اس مسئلے کے حل کے لیے ٹولز تلاش کر رہے ہیں۔',
        '۳۔ مارکیٹ میں اور کون یہ کام کر رہا ہے؟ (Competitor Activity): ثابت کرتا ہے کہ دیگر ٹولز اور ان کی قیمتیں موجود ہیں۔ حریف کی قیمت ہرگز یہ ثابت نہیں کرتی کہ گاہک ہمیں بھی پیسے دیں گے۔',
        '۴۔ ادائیگی میں غیر مصدقہ دلچسپی: زبانی دلچسپی، سروے یا مفت ویٹ لسٹ جس میں ابھی پیسے ادا نہ کیے گئے ہوں۔',
        '۵۔ کیا گاہک واقعی پیسے دیں گے؟ (Verified Commercial Commitment): ہماری اپنی پروڈکٹ کے لیے ادا شدہ رسید، دستخط شدہ معاہدہ یا کنفرم پرچیز آرڈر۔'
      ]
    },
    {
      id: 'understanding-commercial-readiness',
      number: '۸',
      title: 'فروخت کی تیاری (Commercial Readiness) کے ۴ مراحل',
      summary: 'کوئی آئیڈیا محض مفروضے سے پکے کاروباری ثبوت تک کیسے پہنچتا ہے۔',
      bullets: [
        'مرحلہ ۱ — مفروضہ (Guess): ابتدائی خیال جس کا ابھی کوئی بیرونی ثبوت نہیں۔',
        'مرحلہ ۲ — صرف مسئلے اور حریف کا ثبوت (UNVERIFIED_WILLINGNESS_TO_PAY): مسئلہ اور حریف موجود ہیں لیکن ابھی ہمارے کسی گاہک نے ادائیگی نہیں کی۔',
        'مرحلہ ۳ — زبانی دلچسپی: ممکنہ گاہکوں نے زبانی دلچسپی دکھائی یا قیمت کے بارے میں پوچھا۔',
        'مرحلہ ۴ — مصدقہ کاروباری کمٹمنٹ (VERIFIED_BUYER_WTP): گاہک نے معاہدہ کیا، پرچیز آرڈر دیا یا بل ادا کر دیا۔ صرف اس مرحلے پر فروخت کی تیاری کا اسکور 80 سے اوپر کھلتا ہے۔'
      ]
    },
    {
      id: 'idea-to-mvp',
      number: '۹',
      title: 'آئیڈیا سے پہلی سادہ پروڈکٹ (MVP) تک کا سفر',
      summary: '۱۴ دن میں بننے والی پہلی پروڈکٹ کی منصوبہ بندی اور اضافی کام سے بچنے کا طریقہ۔',
      bullets: [
        'پہلا گاہک کون ہے؟ ایک مخصوص گروپ لکھیں جسے فوری ضرورت ہو، نہ کہ ”انٹرنیٹ کا ہر صارف“۔',
        'ہمیں سب سے پہلے کیا بنانا چاہیے؟ (Must-Have Features): صرف ۲ سے ۳ بنیادی خصوصیات جو اصل مسئلہ حل کریں۔',
        'ہم ابھی کیا چھوڑیں گے؟ (Excluded Non-Goals): وہ تمام پیچیدہ چیزیں (جیسے بلنگ ڈیش بورڈ یا موبائل ایپ) جو پہلے گاہکوں کی ادائیگی تک نہیں بنائی جائیں گی۔',
        'بنانے، بدلنے یا روکنے کے اصول: واضح اہداف لکھیں (مثلاً: اگر ۱۴ دن میں ۵ گاہک 39 ڈالر میں پری آرڈر کریں تو بنائیں گے، ورنہ روک دیں گے)۔'
      ]
    },
    {
      id: 'approvals-and-control',
      number: '۱۰',
      title: 'مالی منظوریاں اور آپ کا مکمل کنٹرول',
      summary: 'سٹرا آپ کے بجٹ کی حفاظت کیسے کرتا ہے اور ہر اہم قدم سے پہلے اجازت کیسے لیتا ہے۔',
      bullets: [
        'صفر خرچ کی پالیسی: سٹرا بنیادی طور پر مفت ذرائع اور لوکل سسٹم پر چلتا ہے جس کا خرچ $0 ہے۔',
        'لازمی منظوری کی فہرست: پیسے خرچ کرنے، سبسکرپشن لینے، اشتہار چلانے یا پروڈکٹ لانچ کرنے والا ہر قدم حصہ ۴ میں آپ کے فیصلے کا انتظار کرتا ہے۔',
        'ایک بار استعمال ہونے والا مالی لاک: جب آپ کسی ادا شدہ تلاش کی منظوری دیتے ہیں تو سٹرا ماخذ، رقم کی حد اور ٹوکن چیک کرتا ہے تاکہ وہ دوبارہ خودکار طور پر استعمال نہ ہو سکے۔'
      ]
    },
    {
      id: 'faq',
      number: '۱۱',
      title: 'عام پوچھے جانے والے سوالات (FAQ)',
      summary: 'اسکورز، حریفوں، زبان کی تبدیلی اور حفاظت کے بارے میں عام سوالات کے سادہ جوابات۔',
      bullets: [
        'سوال: کیا 80/100 اسکور کا مطلب ہے کہ کاروبار یقینی طور پر پیسے کمائے گا؟ — جواب: نہیں۔ اسکورز آئیڈیاز کا موازنہ کرنے کے لیے ہیں؛ اصل کامیابی صرف تب ثابت ہوتی ہے جب گاہک پیسے ادا کریں۔',
        'سوال: حریف کی 49 ڈالر ماہانہ قیمت کو گاہک کی ادائیگی کا ثبوت کیوں نہیں مانا جاتا؟ — جواب: کیونکہ اس سے ثابت ہوتا ہے کہ لوگ حریف کو پیسے دیتے ہیں، یہ ثابت نہیں ہوتا کہ وہ آپ کی نئی پروڈکٹ خریدیں گے۔',
        'سوال: انگریزی اور اردو کے درمیان زبان بدلنے سے میرے ڈیٹا پر کیا اثر پڑتا ہے؟ — جواب: صرف اسکرین کی زبان اور سمت بدلتی ہے؛ آپ کے تمام آئیڈیاز، اسکورز اور ریکارڈ بالکل محفوظ اور یکساں رہتے ہیں۔',
        'سوال: مصدقہ ثبوت کے لیے https:// لنک اور اقتباس کیوں ضروری ہے؟ — جواب: تاکہ سٹرا ویب پیج چیک کر کے تصدیق کر سکے اور SHA-256 فنگر پرنٹ محفوظ کر سکے۔'
      ]
    },
    {
      id: 'glossary',
      number: '۱۲',
      title: 'آسان فرہنگ (Glossary — اصطلاحات کے سادہ معانی)',
      summary: 'سٹرا میں استعمال ہونے والی ہر کاروباری اور تکنیکی اصطلاح کی آسان وضاحت۔',
      bullets: [
        'MVP (پہلی سادہ پروڈکٹ): پروڈکٹ کا وہ سب سے مختصر اور سادہ ورژن جو ابتدائی گاہکوں کا بنیادی مسئلہ حل کرے۔',
        'Commercial Readiness (فروخت کی تیاری): ۰ تا ۱۰۰ اسکور جو بتاتا ہے کہ گاہکوں کی طلب اور ادائیگی کا کتنا ثبوت موجود ہے۔',
        'Technical Feasibility (بنانے میں آسانی): ۰ تا ۱۰۰ اسکور جو بتاتا ہے کہ ہماری موجودہ مہارتوں سے یہ پروڈکٹ کتنی آسانی سے بن سکتی ہے۔',
        'Priority Index (مجموعی آئیڈیا اسکور): ۱۱ پہلوؤں کو ملا کر بنایا گیا ۰ تا ۱۰۰ موازنہ اسکور۔',
        'Verified Evidence (مصدقہ ویب ثبوت): ایسا ثبوت جس کا اصل https:// لنک اور اقتباس سٹرا نے چیک کر کے تصدیق کیا ہو۔',
        'Practitioner Observation (ذاتی مشاہدہ): ذاتی کام کے تجربے سے دیکھی گئی بات جس کا ابھی بیرونی لنک یا ادائیگی کا ثبوت نہ ہو۔',
        'Assumption (مفروضہ / اندازہ): گاہک، قیمت یا آمدنی کے بارے میں غیر مصدقہ خیال۔',
        'Human Approval Gate (حفاظتی لاک): وہ لاک جو آپ کی کلک کے بغیر پیسے خرچ کرنے یا عوامی قدم اٹھانے سے روکتا ہے۔'
      ]
    },
    {
      id: 'vision-and-roadmap',
      number: '۱۳',
      title: 'پروڈکٹ کا وژن اور روڈ میپ (آج کیا موجود ہے اور مستقبل میں کیا آئے گا)',
      summary: 'موجودہ STRAW V1.0 کی سہولیات اور مستقبل کے ورژنز (V1.5، V2.0، V3.0) کے درمیان واضح فرق۔',
      bullets: [
        'موجودہ STRAW V1.0 میں آج دستیاب سہولیات: ۴ بنیادی حصے + دو لسانی مدد اور رہنمائی (انگریزی اور اردو)، ۵ مفت عوامی تلاش کے ذرائع، محفوظ ویب لنک تصدیق (SHA-256)، فروخت کی تیاری اور بنانے کی آسانی کے الگ اسکورز، ثبوت کی ۵ اقسام، ۱۵ مراحل والا MVP پلانر، Markdown رپورٹ ایکسپورٹ اور مالی منظوری کے حفاظتی لاکس۔',
        'مستقبل کا منصوبہ — V1.5 (خریداروں کے تجربات): لینڈنگ پیج ٹیسٹ، گاہکوں کے انٹرویو ٹیمپلیٹس اور پری آرڈر ٹریکنگ۔',
        'مستقبل کا منصوبہ — V2.0 (پروڈکٹ کی تعمیر اور لانچ): کوڈ ٹیمپلیٹس اور لانچ چیک لسٹ کی خودکار تیاری۔',
        'مستقبل کا منصوبہ — V3.0 (مارکیٹنگ اور آمدنی میں اضافہ): حقیقی ادائیگیوں کا ریکارڈ اور مارکیٹنگ چینلز کے منافع کا تجزیہ۔'
      ]
    }
  ]
};

function escapeAttr(val) {
  return String(val ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function t(key, params = {}, lang = 'en') {
  const safeLang = getSupportedLanguage(lang);
  const dict = UI_STRINGS[safeLang] || UI_STRINGS.en;
  let template = dict[key] ?? UI_STRINGS.en[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    template = template.replaceAll(`{${k}}`, String(v ?? ''));
  }
  return template;
}

/**
 * Renders the reusable `ExplainTerm` inline component.
 * Displays a polite button ("Understand in simple English" / "آسان الفاظ میں سمجھیں")
 * that toggles an accessible explanation card with Simple Explanation, Example, and Technical Detail.
 */
export function renderExplainTerm(termKey, lang = 'en') {
  const safeLang = getSupportedLanguage(lang);
  const catalog = EXPLAIN_TERMS[safeLang] || EXPLAIN_TERMS.en;
  const item = catalog[termKey] || EXPLAIN_TERMS.en[termKey];
  if (!item) return '';

  const triggerLabel = t('explain_trigger', {}, safeLang);
  const simpleHeading = t('explain_simple_heading', {}, safeLang);
  const exampleHeading = t('explain_example_heading', {}, safeLang);
  const technicalHeading = t('explain_technical_heading', {}, safeLang);

  return `
    <span class="explain-term-wrapper" data-explain-wrapper="${escapeAttr(termKey)}">
      <button
        type="button"
        class="explain-term-btn"
        data-explain-toggle="${escapeAttr(termKey)}"
        aria-expanded="false"
      >
        <span class="explain-term-icon" aria-hidden="true">?</span>
        <span>${escapeAttr(triggerLabel)}</span>
      </button>
      <div class="explain-term-card hidden" role="region" aria-label="${escapeAttr(item.title)}">
        <div class="explain-term-card-title">${escapeAttr(item.title)}</div>
        <div class="explain-term-section">
          <strong>${escapeAttr(simpleHeading)}:</strong> ${escapeAttr(item.simple)}
        </div>
        ${
          item.example
            ? `<div class="explain-term-section">
                <strong>${escapeAttr(exampleHeading)}:</strong> ${escapeAttr(item.example)}
              </div>`
            : ''
        }
        <div class="explain-term-section explain-term-tech">
          <strong>${escapeAttr(technicalHeading)}:</strong> ${escapeAttr(item.technical)}
        </div>
      </div>
    </span>
  `;
}

/**
 * Renders the first-time user Getting Started banner at the top of the workspace.
 */
export function renderGettingStartedBanner(lang = 'en', collapsed = false) {
  const safeLang = getSupportedLanguage(lang);
  if (collapsed) {
    return `
      <div class="getting-started-collapsed-bar">
        <span><strong>${escapeAttr(t('gs_banner_title', {}, safeLang))}</strong></span>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-small btn-secondary" data-gs-toggle="expand">${escapeAttr(t('gs_show_btn', {}, safeLang))}</button>
          <button type="button" class="btn btn-small btn-primary" data-goto-tab="help">${escapeAttr(t('gs_open_help_btn', {}, safeLang))}</button>
        </div>
      </div>
    `;
  }

  return `
    <div class="getting-started-banner" role="region" aria-label="${escapeAttr(t('gs_banner_title', {}, safeLang))}">
      <div class="getting-started-header">
        <div>
          <h2 class="getting-started-title">${escapeAttr(t('gs_banner_title', {}, safeLang))}</h2>
          <p class="getting-started-subtitle">${escapeAttr(t('gs_banner_subtitle', {}, safeLang))}</p>
        </div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-small btn-primary" data-goto-tab="help">${escapeAttr(t('gs_open_help_btn', {}, safeLang))}</button>
          <button type="button" class="btn btn-small btn-secondary" data-gs-toggle="collapse">${escapeAttr(t('gs_hide_btn', {}, safeLang))}</button>
        </div>
      </div>
      <div class="getting-started-grid">
        <div class="getting-started-step" data-goto-tab="research" style="cursor:pointer;">
          <strong>${escapeAttr(t('gs_step_1_title', {}, safeLang))}</strong>
          <p>${escapeAttr(t('gs_step_1_desc', {}, safeLang))}</p>
        </div>
        <div class="getting-started-step" data-goto-tab="opportunities" style="cursor:pointer;">
          <strong>${escapeAttr(t('gs_step_2_title', {}, safeLang))}</strong>
          <p>${escapeAttr(t('gs_step_2_desc', {}, safeLang))}</p>
        </div>
        <div class="getting-started-step" data-goto-tab="opportunities" style="cursor:pointer;">
          <strong>${escapeAttr(t('gs_step_3_title', {}, safeLang))}</strong>
          <p>${escapeAttr(t('gs_step_3_desc', {}, safeLang))}</p>
        </div>
        <div class="getting-started-step" data-goto-tab="execution" style="cursor:pointer;">
          <strong>${escapeAttr(t('gs_step_4_title', {}, safeLang))}</strong>
          <p>${escapeAttr(t('gs_step_4_desc', {}, safeLang))}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Renders the 13-Section Help Center & Knowledge Base inside #tab-help
 */
export function renderHelpCenterContent(lang = 'en', activeSectionId = 'getting-started', searchQuery = '') {
  const safeLang = getSupportedLanguage(lang);
  const sections = HELP_CENTER_SECTIONS[safeLang] || HELP_CENTER_SECTIONS.en;
  const q = String(searchQuery || '').trim().toLowerCase();

  const filtered = q
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.bullets.some((b) => b.toLowerCase().includes(q))
      )
    : sections;

  const selected = filtered.find((s) => s.id === activeSectionId) || filtered[0] || sections[0];

  return `
    <div class="help-center-layout">
      <aside class="ledger-box help-sidebar" aria-label="${escapeAttr(t('v5_topics_title', {}, safeLang))}">
        <div class="box-header">
          <h3>${escapeAttr(t('v5_topics_title', {}, safeLang))}</h3>
        </div>
        <div class="form-group" style="margin-bottom: 12px;">
          <input
            type="text"
            id="help-search-input"
            value="${escapeAttr(searchQuery)}"
            placeholder="${escapeAttr(t('v5_search_placeholder', {}, safeLang))}"
            aria-label="${escapeAttr(t('v5_search_placeholder', {}, safeLang))}"
          />
        </div>
        <div class="help-topic-list">
          ${filtered
            .map(
              (sec) => `
            <button
              type="button"
              class="help-topic-btn ${sec.id === selected.id ? 'active' : ''}"
              data-help-topic="${escapeAttr(sec.id)}"
            >
              <span class="help-topic-num">${escapeAttr(sec.number)}.</span>
              <span>${escapeAttr(sec.title)}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </aside>

      <article class="ledger-box help-article-pane">
        <div class="box-header">
          <div>
            <span class="badge badge-info">[${escapeAttr(safeLang === 'ur' ? 'موضوع' : 'TOPIC')} ${escapeAttr(selected.number)} / 13]</span>
            <h3 style="font-size: 19px; margin-top: 6px;">${escapeAttr(selected.number)}. ${escapeAttr(selected.title)}</h3>
            <p class="section-desc" style="margin-top: 4px;">${escapeAttr(selected.summary)}</p>
          </div>
        </div>
        <ul class="help-bullet-list">
          ${selected.bullets.map((b) => `<li>${escapeAttr(b)}</li>`).join('')}
        </ul>

        <hr class="structural-divider" />
        <h4 class="sub-box-title">${escapeAttr(safeLang === 'ur' ? 'تمام ۱۳ رہنما موضوعات کا خلاصہ' : 'All 13 Help Center Guides at a Glance')}</h4>
        <div class="criteria-grid">
          ${sections
            .map(
              (sec) => `
            <div class="criteria-cell" style="cursor:pointer;" data-help-topic="${escapeAttr(sec.id)}">
              <strong>${escapeAttr(sec.number)}. ${escapeAttr(sec.title)}</strong>
              <div class="dossier-item-meta">${escapeAttr(sec.summary)}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </article>
    </div>
  `;
}
