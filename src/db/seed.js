import { DEFAULT_OWNER_CAPABILITIES } from '../engines/capability-engine.js';

export function ensureSeeded(db, engines) {
  const existingProfile = db.prepare('SELECT id FROM owner_profile WHERE id = 1').get();
  if (existingProfile) {
    return { seeded: false };
  }

  const now = new Date().toISOString();

  // 1. Seed Owner Profile
  db.prepare(`
    INSERT INTO owner_profile (
      id, owner_name, primary_direction, secondary_options_json,
      engineering_constraint_summary, execution_preference_summary, updated_at
    ) VALUES (1, ?, ?, ?, ?, ?, ?)
  `).run(
    'Zak (Owner & Lead Product Architect)',
    'Product Entrepreneurship — Building & Operating Profitable Digital Assets',
    JSON.stringify(['Selective Productized Services', 'High-Leverage Consulting', 'Strategic Partnerships']),
    'Owner is a Senior UX/UI Architect, Product Designer, and Strategist—not a traditional career software engineer. Prioritize opportunities executable via AI-assisted development, existing platforms (WordPress, Figma, Web standards), low-code tools, reusable design/code systems, and manageable technical complexity.',
    'Favor high-margin digital products with verified market demand, clear differentiation via superior UX/information architecture, near-$0 baseline burn, and organic/directory/search distribution.',
    now
  );

  // 2. Seed Owner's 10 Core Capabilities
  const insertCap = db.prepare(`
    INSERT INTO owner_capabilities (id, name, category, proficiency_level, execution_leverage, notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const cap of DEFAULT_OWNER_CAPABILITIES) {
    insertCap.run(cap.id, cap.name, cap.category, cap.proficiency_level, cap.execution_leverage, cap.notes, now);
  }

  // 3. Seed Opportunities across diverse categories
  const { opportunityEngine, executionEngine, growthEngine } = engines;

  // Opportunity 1: Approved & Promoted to Active Product
  const opp1 = opportunityEngine.createOpportunity({
    id: 'opp-a11y-design-kit',
    title: 'Sentinel A11y: WCAG 2.2 Dual-Mode Figma System & Form Label Inspector',
    slug: 'sentinel-a11y-wcag22-figma-inspector',
    category: 'Figma Resources and Design Systems',
    status: 'approved',
    problem_statement:
      'Product teams and agencies face strict European Accessibility Act (EAA) and WCAG 2.2 enforcement (specifically 2.5.3 Label-in-Name and 3.3.2 Form Instructions), but most Figma UI kits and frontend handoffs fail accessibility audits because light/dark tokens and programmatic labels are not paired structurally.',
    target_audience:
      'B2B SaaS product designers, design system leads, and boutique web agencies shipping accessible web applications.',
    demand_summary:
      'High compliance-driven buyer urgency from EAA 2025/2026 enforcement and WCAG 2.2 adoption across European and US SaaS teams.',
    competitors_summary:
      'Generic Figma kits (Untitled UI, Ant Design Kit) focus on aesthetics; Stark plugin charges recurring SaaS fees ($15–$25/mo) but does not provide ready-to-ship dual-mode accessible component architectures.',
    alternatives_summary:
      'Manual W3C checklist spreadsheets, expensive accessibility consultants ($3,000+ per audit), or retrofitting ARIA labels after engineering build.',
    market_gaps:
      'No commercial Figma + HTML/CSS companion kit combines non-inverted Light/Dark perceptual token pairing with pre-validated WCAG 2.2 form/control specifications.',
    differentiation_potential:
      'Direct unfair advantage: built on verified W3C WCAG 2.2 Label-in-Name and dual-appearance color intelligence rather than generic decorative templates.',
    dev_complexity: 'low',
    estimated_dev_days: 10,
    operational_cost_monthly_usd: 0,
    monetization_model: 'Freemium Browser Inspector + $79 Single / $249 Team License for Full Figma & Token System',
    acquisition_strategy:
      'Figma Community free starter file, interactive browser WCAG label checker utility (SEO/Search Intent), and designer community teardowns.',
    revenue_potential_notes:
      'Estimated 20–50 licenses/month achievable via Figma Community + organic search utility funnel without paid ad spend (Estimate—requires launch verification).',
    main_risks:
      'Figma platform feature changes or lower initial conversion from free community file to paid pro pack.',
    required_capabilities: [
      'Senior UX and UI Design',
      'Figma and Design Systems',
      'Information Architecture and Complex Workflows',
      'HTML and CSS',
      'AI Assisted Development'
    ],
    new_skills_needed: [],
    dimension_inputs: {
      problem_severity: 8.5,
      demand_evidence: 8.5,
      audience_accessibility: 9.0,
      competition_intensity: 7.5,
      differentiation: 9.2,
      development_feasibility: 9.5,
      initial_investment: 10.0,
      monetization_potential: 8.5,
      time_to_first_revenue: 9.0,
      long_term_scalability: 8.5
    },
    evidence: [
      {
        claim_type: 'demand',
        statement:
          'W3C WCAG 2.2 normative specification (2.5.3 Label in Name, 3.3.2 Labels or Instructions) and European Accessibility Act enforcement mandate verifiable form labeling for commercial digital products.',
        evidence_tier: 'verified_evidence',
        source_citation: 'https://www.w3.org/TR/2024/REC-WCAG22-20241212/ (Verified in Sentinel wcag-labels pilot)'
      },
      {
        claim_type: 'competitor',
        statement:
          'Commercial Figma design systems consistently rank among top-grossing digital assets on Gumroad, Lemon Squeezy, and Figma Community when tied to concrete engineering handoff savings.',
        evidence_tier: 'practitioner_observation',
        source_citation: 'Market scan of commercial Figma system pricing ($69–$299 tier benchmark)'
      }
    ]
  });

  // Opportunity 2: Evaluating (High-potential WordPress & UX Architecture asset)
  opportunityEngine.createOpportunity({
    id: 'opp-wp-ux-audit-blocks',
    title: 'ConversionFlow WP: High-Clarity B2B Service & Checkout Block System for WordPress',
    slug: 'conversionflow-wp-b2b-checkout-blocks',
    category: 'WordPress Themes and Plugins',
    status: 'evaluating',
    problem_statement:
      'Service businesses and WooCommerce merchants lose qualified leads because standard WordPress page builders encourage bloated, low-contrast, slow-loading pages with confusing multi-step quote/checkout forms.',
    target_audience:
      'WordPress freelancers, boutique agencies, and SMB owners running WooCommerce or B2B lead-generation sites.',
    demand_summary:
      'Consistent demand in WordPress ecosystem for lightweight, native Gutenberg block patterns that replace heavy Elementor/Divi setups.',
    competitors_summary:
      'GenerateBlocks, Kadence Blocks, CartFlows ($99–$299/yr). Many focus on generic layouts rather than guided B2B diagnostic & quote workflows.',
    alternatives_summary:
      'Stitching together Gravity Forms + heavy page builders + custom CSS patches.',
    market_gaps:
      'Lack of UX-architected, accessible decision-tree and service-scoping block patterns that work natively in modern WordPress without bloat.',
    differentiation_potential:
      'Combines senior UX information architecture with lightweight native WordPress block patterns and clean HTML/CSS.',
    dev_complexity: 'manageable',
    estimated_dev_days: 18,
    operational_cost_monthly_usd: 5,
    monetization_model: 'Annual Plugin/Pattern Library License ($59/yr solo, $149/yr agency) + Free Lite directory version',
    acquisition_strategy:
      'WordPress.org Plugin Directory organic installs, comparison teardowns, and WordPress agency communities.',
    revenue_potential_notes:
      'Strong recurring annual renewal potential if free directory version achieves steady active installs (Estimate).',
    main_risks:
      'Customer support overhead from conflicting third-party WordPress themes.',
    required_capabilities: [
      'WordPress and Website Development',
      'Senior UX and UI Design',
      'HTML and CSS',
      'Basic JavaScript and Programming Knowledge',
      'AI Assisted Development'
    ],
    new_skills_needed: ['WordPress Block API packaging & licensing webhook integration'],
    dimension_inputs: {
      problem_severity: 7.8,
      demand_evidence: 7.5,
      audience_accessibility: 8.5,
      competition_intensity: 6.5,
      differentiation: 8.0,
      development_feasibility: 8.2,
      initial_investment: 9.5,
      monetization_potential: 8.0,
      time_to_first_revenue: 7.5,
      long_term_scalability: 8.0
    },
    evidence: [
      {
        claim_type: 'audience',
        statement:
          'WordPress powers over 40% of the web, with strong ongoing migration from legacy page builders toward lightweight native block systems.',
        evidence_tier: 'verified_evidence',
        source_citation: 'W3Techs CMS Usage Statistics & WordPress.org Block Directory trends'
      },
      {
        claim_type: 'pricing',
        statement:
          'Freemium WordPress plugins with a $59–$149/yr Pro tier represent a proven monetization standard in the WP ecosystem.',
        evidence_tier: 'practitioner_observation',
        source_citation: 'WordPress commercial plugin pricing analysis'
      }
    ]
  });

  // Opportunity 3: Discovered — Demonstrates Epistemic Guardrail (0 verified evidence -> NEEDS_EVIDENCE)
  opportunityEngine.createOpportunity({
    id: 'opp-ux-flow-simulator',
    title: 'StateCraft UX: Interactive Complex Workflow & Edge-Case Simulator',
    slug: 'statecraft-ux-workflow-simulator',
    category: 'Browser Based Utilities',
    status: 'discovered',
    problem_statement:
      'UX architects and product managers frequently miss empty states, error states, permission gates, and loading states when handing static happy-path screens to developers.',
    target_audience:
      'Product managers, UX architects, and solo founders specifying complex web workflows.',
    demand_summary:
      'Assumed pain point based on personal product design experience; external willingness-to-pay for a standalone browser tool is not yet verified.',
    competitors_summary:
      'XState Stately Studio (developer-focused), FigJam/Miro (manual sticky notes), Notion checklists.',
    alternatives_summary:
      'Writing manual acceptance criteria in Jira/Linear or building throwaway prototypes.',
    market_gaps:
      'A designer-friendly browser tool that automatically generates exhaustive UI state matrices (empty, loading, partial, error, permission-gated) from a user flow description.',
    differentiation_potential:
      'Tailored specifically to UX architecture and design-to-engineering handoff rather than formal computer science statecharts.',
    dev_complexity: 'manageable',
    estimated_dev_days: 12,
    operational_cost_monthly_usd: 0,
    monetization_model: 'Freemium Browser Utility + $19 One-Time Export Pack / Pro Templates',
    acquisition_strategy:
      'Product Hunt, UX architecture articles, and free interactive checklist tool.',
    revenue_potential_notes:
      'Unverified until buyer willingness-to-pay is tested against free Notion/FigJam templates (Assumption).',
    main_risks:
      'Users may prefer free checklists inside Figma or Notion rather than paying for a separate browser utility.',
    required_capabilities: [
      'Product Design and UX Architecture',
      'Information Architecture and Complex Workflows',
      'Senior UX and UI Design',
      'AI Assisted Development'
    ],
    new_skills_needed: [],
    dimension_inputs: {
      problem_severity: 7.5,
      demand_evidence: 8.0, // Intentionally input high to prove the scoring engine caps it at 3.5 when verified_evidence = 0!
      audience_accessibility: 8.0,
      competition_intensity: 7.5,
      differentiation: 8.2,
      development_feasibility: 8.8,
      initial_investment: 10.0,
      monetization_potential: 6.5,
      time_to_first_revenue: 7.5,
      long_term_scalability: 7.5
    },
    evidence: [
      {
        claim_type: 'demand',
        statement:
          'Assumption that UX designers will pay $19 for a standalone state-matrix generator rather than using a free FigJam template.',
        evidence_tier: 'assumption',
        source_citation: 'Internal hypothesis — requires 5 practitioner interviews or landing page smoke test'
      }
    ]
  });

  // Opportunity 4: Rejected — Demonstrates Weak Idea Rejection & Institutional Memory ("Do not build just because AI can build it")
  const opp4 = opportunityEngine.createOpportunity({
    id: 'opp-generic-ai-writer',
    title: 'AutoBlog AI: Generic One-Click AI SEO Article & Social Post Wrapper',
    slug: 'autoblog-ai-generic-wrapper',
    category: 'AI Powered Tools',
    status: 'rejected',
    problem_statement:
      'Small business owners want automated blog posts and social media captions generated with one click.',
    target_audience:
      'General small businesses and bloggers.',
    demand_summary:
      'Crowded commodity market with high churn and declining buyer trust in unedited AI text.',
    competitors_summary:
      'ChatGPT, Claude, Jasper, Copy.ai, plus hundreds of identical low-cost OpenAI wrappers.',
    alternatives_summary:
      'Using free ChatGPT/Claude directly or native CMS AI assistants.',
    market_gaps:
      'None — severe oversupply of generic text-generation wrappers.',
    differentiation_potential:
      'Near zero without proprietary domain data or deep workflow lock-in.',
    dev_complexity: 'low',
    estimated_dev_days: 5,
    operational_cost_monthly_usd: 45,
    monetization_model: '$19/mo SaaS subscription',
    acquisition_strategy:
      'Paid ads and cold outreach in a saturated category.',
    revenue_potential_notes:
      'Negative expected ROI due to high CAC, LLM API variable costs, and rapid churn.',
    main_risks:
      'Classic "build because AI can build it" trap: zero moat, saturated competitors, and negative unit economics.',
    required_capabilities: ['AI Assisted Development', 'HTML and CSS'],
    new_skills_needed: [],
    rejection_reason:
      'Violates STRAW Rule 5 ("Do not recommend building something simply because AI can build it"). Hyper-saturated commodity wrapper with zero verified differentiation and recurring API cost risk.',
    invalidation_conditions:
      'Do not reconsider generic AI writing wrappers unless paired with a proprietary offline/domain-specific dataset and verified enterprise workflow lock-in.',
    dimension_inputs: {
      problem_severity: 3.0,
      demand_evidence: 3.0,
      audience_accessibility: 4.0,
      competition_intensity: 1.5,
      differentiation: 2.0,
      development_feasibility: 9.0,
      initial_investment: 6.0,
      monetization_potential: 2.5,
      time_to_first_revenue: 4.0,
      long_term_scalability: 2.0
    },
    evidence: [
      {
        claim_type: 'competitor',
        statement:
          'Direct LLM interfaces (ChatGPT, Claude, Gemini) already bundle general writing and social drafting at $0–$20/mo, commoditizing thin wrappers.',
        evidence_tier: 'verified_evidence',
        source_citation: 'Market competitive saturation audit 2026'
      }
    ]
  });

  opportunityEngine.updateOpportunityStatus(opp4.opportunity.id, {
    status: 'rejected',
    rejection_reason:
      'Violates STRAW Rule 5 ("Do not recommend building something simply because AI can build it"). Hyper-saturated commodity wrapper with zero differentiation.',
    invalidation_conditions:
      'Only reconsider if anchored in a specialized, verified non-commodity compliance or industry-specific workflow.'
  });

  // 4. Promote Approved Opportunity 1 into an Active 15-Stage Product Project
  const prod1 = executionEngine.promoteOpportunityToProduct(opp1.opportunity.id, {
    id: 'prod-sentinel-a11y',
    name: 'Sentinel A11y Kit & Inspector',
    tagline: 'WCAG 2.2 Form Label Inspector + Dual-Appearance (Light/Dark) Figma & CSS Token System'
  });

  // Mark Stages 1–6 as completed with real logged hours, Stage 7 as in_progress
  for (const task of prod1.tasks) {
    if (task.stage_number <= 6) {
      executionEngine.updateTask(task.id, {
        status: 'done',
        actual_hours: task.estimated_hours
      });
    } else if (task.stage_number === 7) {
      executionEngine.updateTask(task.id, {
        status: 'in_progress',
        actual_hours: 2
      });
    }
  }

  // 5. Seed Growth Channels for Product 1 (including one Organic and one Paid that triggers a Pending Approval Gate!)
  growthEngine.addGrowthChannel(prod1.id, {
    channel_name: 'Figma Community Free Starter File ("WCAG 2.2 Label-in-Name Checklist & Tokens")',
    channel_category: 'product_directories',
    fit_score: 9,
    estimated_monthly_cost_usd: 0,
    expected_return_rationale:
      'Designers actively search Figma Community for WCAG 2.2 and EAA accessibility templates; free starter kit acts as a zero-CAC product-led funnel to the full system.',
    execution_playbook:
      'Publish an inspectable 4-frame Light/Dark WCAG 2.2 form control spec in Figma Community with embedded documentation linking to the full commercial bundle.'
  });

  growthEngine.addGrowthChannel(prod1.id, {
    channel_name: 'Interactive Browser WCAG 2.5.3 Label-in-Name Live Checker Utility',
    channel_category: 'search_intent',
    fit_score: 9,
    estimated_monthly_cost_usd: 0,
    expected_return_rationale:
      'Captures high-intent search traffic from developers and QA engineers auditing WCAG 2.5.3 and 3.3.2 compliance.',
    execution_playbook:
      'Host a free client-side HTML snippet auditor that flags mismatched visible labels and programmatic accessible names.'
  });

  growthEngine.addGrowthChannel(prod1.id, {
    channel_name: 'Sponsored Issue in Design Systems Weekly Newsletter',
    channel_category: 'paid_advertising',
    fit_score: 7,
    estimated_monthly_cost_usd: 150,
    expected_return_rationale:
      'Reaches 12,000+ targeted design system leads; requires 2+ team license conversions ($249) to break even.',
    execution_playbook:
      'HOLD until organic conversion rate on Figma Community funnel is verified. Requires explicit Owner Financial Approval Gate ($150).'
  });

  // 6. Seed Honest Baseline Telemetry Note for Product 1
  growthEngine.recordPerformanceMetric(prod1.id, {
    period_label: 'Pre-Launch Baseline (Stage 7 In-Progress)',
    visitors: null,
    acquisition_sources_note: 'Pre-launch build phase — no public traffic or checkout live yet.',
    conversion_rate_pct: null,
    active_users: null,
    retention_rate_pct: null,
    revenue_usd: 0,
    operating_cost_usd: 0,
    cac_usd: null,
    ltv_usd: null,
    data_provenance: 'no_data_yet',
    notes: 'Honest pre-launch ledger: $0 spent, $0 revenue. Traffic and conversion metrics will be logged only after Stage 14 Launch Gate is approved.'
  });

  // 7. Seed Phase 2 Competitor Matrix Records & Phase 4 Search Intent Clusters
  opportunityEngine.addCompetitor(opp1.opportunity.id, {
    competitor_name: 'Stark for Figma',
    pricing_model: '$15–$25/mo recurring SaaS',
    strengths: 'Automated contrast checker plugin inside Figma.',
    weaknesses_and_gaps: 'Recurring subscription fatigue; does not ship a pre-built WCAG 2.2 dual-mode Light/Dark component architecture.',
    threat_level: 'moderate',
    evidence_tier: 'verified_evidence',
    source_ref: 'Stark public pricing & Figma Community reviews'
  });

  opportunityEngine.addCompetitor(opp1.opportunity.id, {
    competitor_name: 'Generic Figma UI Kits (Untitled UI / Cabana)',
    pricing_model: '$99–$299 one-time license',
    strengths: 'Large component counts and marketing polish.',
    weaknesses_and_gaps: 'Mechanical dark-mode inversion and missing WCAG 2.5.3 Label-in-Name programmatic specifications.',
    threat_level: 'low',
    evidence_tier: 'practitioner_observation',
    source_ref: 'Design system competitive audit'
  });

  growthEngine.addSearchIntentCluster(prod1.id, {
    topic_cluster: 'WCAG 2.5.3 Label in Name & 3.3.2 Form Accessibility Checklists',
    intent_type: 'compliance_checklist',
    target_query_pattern: 'wcag 2.2 label in name examples / accessible form design system figma',
    conversion_asset: 'Free Interactive Browser WCAG Label Auditor + Starter Figma File',
    demand_evidence_tier: 'verified_evidence',
    status: 'drafting'
  });

  return { seeded: true };
}
