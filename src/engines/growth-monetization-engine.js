import crypto from 'node:crypto';

export const MONETIZATION_MODELS = [
  {
    model: 'One-Time Purchase / Digital License',
    best_for: ['Figma Resources and Design Systems', 'Digital Templates', 'WordPress Themes and Plugins', 'Downloadable Guides and Resources', 'Browser Games'],
    pros: 'Immediate cash flow, zero recurring churn anxiety, high buyer conversion for creator/designer assets.',
    cons: 'Requires continuous new customer acquisition or V2 upgrade packs for compounding revenue.',
    recommended_price_band: '$29 – $149 one-time'
  },
  {
    model: 'Micro-SaaS Subscription (Monthly / Annual)',
    best_for: ['Micro SaaS Products', 'AI Powered Tools', 'Automation Products', 'Industry Specific Software'],
    pros: 'Predictable compounding MRR and high asset valuation multiple.',
    cons: 'Higher buyer friction ("subscription fatigue"); requires ongoing uptime and support.',
    recommended_price_band: '$12 – $49 / month'
  },
  {
    model: 'Freemium + Pro Upgrade / Pay-Per-Export',
    best_for: ['Browser Based Utilities', 'Interactive Web Applications', 'Creative Production Systems'],
    pros: 'Free tier drives strong organic word-of-mouth, SEO backlinks, and zero-CAC user acquisition.',
    cons: 'Free users must have near-$0 marginal compute cost so they do not drain budget.',
    recommended_price_band: 'Free core + $9–$29 Pro pass'
  },
  {
    model: 'Programmatic / Niche Sponsorship + Affiliate + Display',
    best_for: ['Niche Websites', 'Educational Products', 'Browser Based Utilities'],
    pros: 'Zero payment barrier for end users; scales directly with search and directory traffic.',
    cons: 'Requires meaningful traffic volume before generating substantial monthly cash flow.',
    recommended_price_band: 'Sponsored slots ($150–$500/mo) + curated affiliate commissions'
  },
  {
    model: 'Productized Design / Automation System + Commercial License',
    best_for: ['Creative Production Systems', 'Figma Resources and Design Systems', 'Emerging Digital Business Models'],
    pros: 'High ticket value ($199–$999) combining reusable product assets with clear commercial ROI.',
    cons: 'Must keep scope strictly standardized to avoid turning into custom client freelancing.',
    recommended_price_band: '$199 – $799 team license'
  }
];

export const ACQUISITION_CHANNEL_CATALOG = [
  {
    category: 'search_intent',
    name: 'High-Intent Problem/Tool Search (Programmatic & Utility SEO)',
    cost_type: 'organic',
    description: 'Target specific Bottom-of-Funnel utility and template queries where users actively seek an immediate solution or calculator.'
  },
  {
    category: 'product_directories',
    name: 'Ecosystem Marketplaces & Directories (Figma Community, WordPress Repo, Product Hunt, AlternativeTo)',
    cost_type: 'organic',
    description: 'Distribute directly inside platforms where target buyers already search for tools, plugins, and design systems.'
  },
  {
    category: 'community_distribution',
    name: 'Practitioner Communities (Reddit, Designer/Founder Forums, Niche Discord/Slack)',
    cost_type: 'organic',
    description: 'Share genuinely useful problem-solving artifacts, teardowns, and free utilities before pitching the paid upgrade.'
  },
  {
    category: 'content_marketing',
    name: 'Evidence-Backed Teardowns & Playbooks',
    cost_type: 'organic',
    description: 'Publish authoritative UX/product teardowns and workflow benchmarks that attract high-trust organic readers.'
  },
  {
    category: 'email_marketing',
    name: 'Lead-Magnet Utility to Owned Email List',
    cost_type: 'organic',
    description: 'Capture emails via a free checklist, audit tool, or starter Figma file and convert via structured educational sequences.'
  },
  {
    category: 'partnerships',
    name: 'Creator & Newsletter Cross-Promotions / Affiliates',
    cost_type: 'revenue_share',
    description: 'Offer 25–35% affiliate revenue share to niche newsletter operators and educators with established audience trust.'
  },
  {
    category: 'paid_advertising',
    name: 'Targeted Search / Sponsorship Ads (Requires Explicit Owner Financial Approval Gate)',
    cost_type: 'paid',
    description: 'Paid acquisition only after organic conversion rate and LTV are verified. Hard-gated by STRAW financial controls.'
  }
];

export class GrowthMonetizationEngine {
  constructor(db, approvalEngine) {
    this.db = db;
    this.approvalEngine = approvalEngine;
  }

  getProductGrowthWorkspace(productId) {
    const product = this.db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) throw new Error(`Product ${productId} not found.`);

    const channels = this.db
      .prepare('SELECT * FROM growth_channels WHERE product_id = ? ORDER BY fit_score DESC')
      .all(productId);

    const metrics = this.db
      .prepare('SELECT * FROM performance_metrics WHERE product_id = ? ORDER BY recorded_at DESC')
      .all(productId);

    const monetizationRecommendations = MONETIZATION_MODELS.map((m) => ({
      ...m,
      is_category_match: m.best_for.includes(product.category)
    })).sort((a, b) => Number(b.is_category_match) - Number(a.is_category_match));

    return {
      product,
      channels,
      metrics,
      monetization_recommendations: monetizationRecommendations,
      honest_telemetry_status:
        metrics.length === 0
          ? 'NO_METRICS_RECORDED: No analytics integration or manual ledger entries exist yet. STRAW never fabricates traffic or revenue figures.'
          : `${metrics.length} verified/manual performance ledger period(s) recorded.`
    };
  }

  addGrowthChannel(productId, {
    channel_name,
    channel_category,
    fit_score = 8,
    estimated_monthly_cost_usd = 0,
    expected_return_rationale,
    execution_playbook
  }) {
    const id = `gc-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();
    const cost = Number(estimated_monthly_cost_usd) || 0;
    const requiresApproval = cost > 0 || channel_category === 'paid_advertising';
    const status = requiresApproval ? 'gated_approval' : 'recommended';

    this.db
      .prepare(`
        INSERT INTO growth_channels (
          id, product_id, channel_name, channel_category, fit_score,
          estimated_monthly_cost_usd, expected_return_rationale,
          requires_financial_approval, status, execution_playbook, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        productId,
        channel_name.trim(),
        channel_category,
        Math.max(1, Math.min(10, Number(fit_score) || 7)),
        cost,
        expected_return_rationale.trim(),
        requiresApproval ? 1 : 0,
        status,
        execution_playbook.trim(),
        now
      );

    if (requiresApproval && this.approvalEngine) {
      this.approvalEngine.createRequest({
        entity_type: 'growth_channel',
        entity_id: id,
        action_category: channel_category === 'paid_advertising' ? 'run_ads' : 'spend_money',
        title: `Growth Channel Budget Approval: ${channel_name}`,
        description: `Channel "${channel_name}" requires $${cost}/mo budget commitment. Rationale: ${expected_return_rationale}`,
        financial_commitment_usd: cost,
        is_public_action: true
      });
    }

    return this.db.prepare('SELECT * FROM growth_channels WHERE id = ?').get(id);
  }

  recordPerformanceMetric(productId, payload) {
    const id = `perf-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const parseNullableNumber = (v) => (v === null || v === undefined || v === '' ? null : Number(v));

    this.db
      .prepare(`
        INSERT INTO performance_metrics (
          id, product_id, period_label,
          visitors, acquisition_sources_note, conversion_rate_pct,
          active_users, retention_rate_pct, revenue_usd,
          operating_cost_usd, cac_usd, ltv_usd,
          data_provenance, notes, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        productId,
        payload.period_label.trim(),
        parseNullableNumber(payload.visitors),
        (payload.acquisition_sources_note || 'Not specified').trim(),
        parseNullableNumber(payload.conversion_rate_pct),
        parseNullableNumber(payload.active_users),
        parseNullableNumber(payload.retention_rate_pct),
        parseNullableNumber(payload.revenue_usd),
        parseNullableNumber(payload.operating_cost_usd),
        parseNullableNumber(payload.cac_usd),
        parseNullableNumber(payload.ltv_usd),
        payload.data_provenance || 'manual_ledger',
        (payload.notes || '').trim(),
        now
      );

    return this.db.prepare('SELECT * FROM performance_metrics WHERE id = ?').get(id);
  }
}
