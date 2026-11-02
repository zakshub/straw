import test from 'node:test';
import assert from 'node:assert/strict';
import { createStrawContext } from '../src/context.js';
import { createAppServer } from '../src/server.js';

test('1. Owner Profile & Capability Engine loads 10 core capabilities and computes capability fit & learning cost', () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });
  const { profile, capabilities } = ctx.capabilityEngine.getOwnerProfile();

  assert.ok(profile.primary_direction.includes('Product Entrepreneurship'));
  assert.equal(capabilities.length, 10);

  // High fit: uses Senior UX/UI + Figma + HTML/CSS
  const highFit = ctx.capabilityEngine.evaluateCapabilityFit({
    requiredCapabilities: ['Senior UX and UI Design', 'Figma and Design Systems', 'HTML and CSS'],
    newSkillsNeeded: [],
    devComplexity: 'low'
  });
  assert.ok(highFit.fit_score >= 9.0, `Expected fit_score >= 9.0, got ${highFit.fit_score}`);
  assert.equal(highFit.new_skills_required.length, 0);

  // High friction: extreme complexity + 3 unfamiliar engineering skills
  const lowFit = ctx.capabilityEngine.evaluateCapabilityFit({
    requiredCapabilities: ['Rust Kernel Driver', 'Custom CUDA Shaders', 'Distributed Consensus'],
    newSkillsNeeded: ['Rust', 'CUDA', 'Raft'],
    devComplexity: 'extreme'
  });
  assert.ok(lowFit.fit_score <= 3.0, `Expected low fit_score <= 3.0, got ${lowFit.fit_score}`);
  assert.ok(lowFit.execution_difficulty.includes('High Risk'));
});

test('2. Phase 7 Epistemic Guardrail: Arbitrary user labels cannot bypass verification; valid URL + excerpt uncaps Demand Score', () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  const { opportunity } = ctx.opportunityEngine.createOpportunity({
    title: 'Unverified Designer Utility Hypothesis',
    category: 'Browser Based Utilities',
    problem_statement: 'Designers might want a browser color-harmony generator.',
    target_audience: 'Web designers',
    demand_summary: 'Internal guess only',
    competitors_summary: 'Adobe Color, Coolors',
    alternatives_summary: 'Built-in Figma plugins',
    market_gaps: 'Faster export',
    differentiation_potential: 'Clean UI',
    dev_complexity: 'low',
    estimated_dev_days: 7,
    operational_cost_monthly_usd: 0,
    monetization_model: '$9 Pro export',
    acquisition_strategy: 'Organic search',
    revenue_potential_notes: 'Unverified',
    main_risks: 'Free alternatives',
    required_capabilities: ['Senior UX and UI Design', 'HTML and CSS'],
    dimension_inputs: {
      problem_severity: 7.5,
      demand_evidence: 9.5, // Intentionally inflated without verified evidence
      audience_accessibility: 8.0,
      competition_intensity: 7.0,
      differentiation: 8.0,
      development_feasibility: 9.0,
      initial_investment: 10.0,
      monetization_potential: 7.5,
      time_to_first_revenue: 8.0,
      long_term_scalability: 7.5
    },
    evidence: [
      {
        claim_type: 'demand',
        statement: 'I assume people will pay $9 for this.',
        evidence_tier: 'assumption',
        source_citation: 'Personal assumption'
      }
    ]
  });

  const demandDimBefore = opportunity.score_breakdown.dimensions.find((d) => d.key === 'demand_evidence');
  assert.equal(demandDimBefore.score_out_of_10, 3.5, 'Demand score must be capped at 3.5 when verified_evidence = 0');
  assert.equal(opportunity.recommendation, 'NEEDS_EVIDENCE');

  // Attempt to bypass verification by supplying evidence_tier: 'verified_evidence' with an arbitrary string (NO valid URL)
  const fakeVerified = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Someone told me there are 50,000 buyers ready.',
    evidence_tier: 'verified_evidence',
    source_citation: 'Arbitrary unverified label without URL'
  });

  assert.equal(fakeVerified.requested_evidence_tier, 'verified_evidence');
  assert.equal(fakeVerified.evidence_tier, 'assumption', 'Arbitrary string without URL must be downgraded to assumption');
  assert.equal(fakeVerified.verification_status, 'downgraded_unverified');

  const afterFake = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  const demandDimAfterFake = afterFake.score_breakdown.dimensions.find((d) => d.key === 'demand_evidence');
  assert.equal(demandDimAfterFake.score_out_of_10, 3.5, 'Unsupported demand claim must NOT uncap demand score');
  assert.equal(afterFake.recommendation, 'NEEDS_EVIDENCE');

  // Now attach a real, attributable verified_evidence record with a valid public https:// URL and supporting excerpt
  const realVerified = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Verified Chrome Web Store listing shows 20,000+ active users for paid WCAG color contrast inspector extensions.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://chromewebstore.google.com/detail/wcag-color-contrast-checker',
    source_name: 'Chrome Web Store Public Listing',
    supporting_excerpt:
      'Extension listing displays 20,000+ weekly active users and 140+ user reviews requesting exportable CSS design tokens.',
    published_at: '2026-10-12T00:00:00Z',
    research_methodology: 'direct_url_inspection'
  });

  assert.equal(realVerified.evidence_tier, 'verified_evidence');
  assert.equal(realVerified.verification_status, 'verified');
  assert.ok(realVerified.confidence_score >= 0.8);

  const updated = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  const demandDimAfter = updated.score_breakdown.dimensions.find((d) => d.key === 'demand_evidence');
  assert.equal(demandDimAfter.score_out_of_10, 9.5);
  assert.equal(updated.recommendation, 'APPROVE_FOR_VALIDATION');
  assert.ok(updated.overall_score > opportunity.overall_score);
});

test('3. Phase 7 Quality Controls: Duplicate detection, Stale evidence exclusion, Conflicting evidence penalty & AI hypothesis lock', () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  const { opportunity } = ctx.opportunityEngine.createOpportunity({
    title: 'Niche Invoice Formatter Utility',
    category: 'Browser Based Utilities',
    problem_statement: 'Freelancers need clean PDF invoices.',
    target_audience: 'Freelancers',
    demand_summary: 'Testing evidence quality controls',
    competitors_summary: 'Stripe Invoicing, Wave',
    alternatives_summary: 'Google Docs',
    market_gaps: 'Offline privacy',
    differentiation_potential: 'Zero signup',
    dev_complexity: 'low',
    estimated_dev_days: 5,
    operational_cost_monthly_usd: 0,
    monetization_model: '$15 one-time',
    acquisition_strategy: 'Organic search',
    revenue_potential_notes: 'Estimate',
    main_risks: 'Free incumbents',
    dimension_inputs: {
      problem_severity: 7.5,
      demand_evidence: 8.5,
      audience_accessibility: 8.0,
      competition_intensity: 7.0,
      differentiation: 7.5,
      development_feasibility: 9.0,
      initial_investment: 10.0,
      monetization_potential: 7.5,
      time_to_first_revenue: 8.0,
      long_term_scalability: 7.0
    },
    evidence: []
  });

  // A. Stale evidence (>365 days old) must be marked stale and excluded from active verified count
  const staleEv = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: '2021 thread asking for invoice templates.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://www.reddit.com/r/freelance/comments/old2021thread',
    source_name: 'Reddit Public Thread',
    supporting_excerpt: 'Historical 2021 discussion from 5 years ago about desktop invoice tools.',
    published_at: '2021-03-10T00:00:00Z'
  });
  assert.equal(staleEv.is_stale, 1);
  assert.equal(staleEv.verification_status, 'stale');
  assert.notEqual(staleEv.evidence_tier, 'verified_evidence');

  const afterStale = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  assert.equal(afterStale.evidence_quality_summary.active_verified_count, 0);
  assert.equal(afterStale.evidence_quality_summary.stale_count, 1);
  assert.equal(afterStale.recommendation, 'NEEDS_EVIDENCE');

  // B. AI-generated hypothesis can NEVER be stored as verified_evidence
  const aiHyp = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'LLM predicts 100,000 freelancers will buy this.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://news.ycombinator.com/item?id=999999',
    supporting_excerpt: 'Synthesized by an AI model guessing market demand.',
    research_methodology: 'ai_hypothesis_unverified'
  });
  assert.equal(aiHyp.evidence_tier, 'assumption');
  assert.equal(aiHyp.verification_status, 'downgraded_unverified');

  // C. Add valid fresh supporting verified evidence
  ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Active 2026 practitioner discussion confirming willingness to pay for offline invoice tools.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://news.ycombinator.com/item?id=41234567',
    source_name: 'Hacker News Discussion',
    supporting_excerpt: 'Multiple solo consultants state they paid $29 for local-first browser invoice generators.',
    published_at: '2026-10-01T00:00:00Z'
  });

  // D. Duplicate detection: submitting the exact same finding again must throw
  assert.throws(() => {
    ctx.opportunityEngine.addEvidence(opportunity.id, {
      claim_type: 'demand',
      statement: 'Active 2026 practitioner discussion confirming willingness to pay for offline invoice tools.',
      evidence_tier: 'verified_evidence',
      source_url: 'https://news.ycombinator.com/item?id=41234567',
      supporting_excerpt: 'Multiple solo consultants state they paid $29 for local-first browser invoice generators.'
    });
  }, /Duplicate research finding detected/);

  const afterValid = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  assert.equal(afterValid.recommendation, 'APPROVE_FOR_VALIDATION');

  // E. Conflicting evidence detection: add contradicting evidence showing free incumbents dominate
  ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'risk',
    statement: 'Wave and Stripe now bundle free unlimited PDF invoice generators with 0 transaction fee for basic use.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://www.waveapps.com/invoicing',
    source_name: 'Wave Public Pricing Page',
    supporting_excerpt: 'Wave Invoicing is 100% free with unlimited invoices and customizable templates.',
    published_at: '2026-10-15T00:00:00Z',
    stance: 'contradicting'
  });

  const afterConflict = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  assert.equal(afterConflict.evidence_quality_summary.has_conflicting_evidence, true);
  assert.equal(afterConflict.recommendation, 'HOLD_CONFLICTING_EVIDENCE');
  assert.ok(afterConflict.overall_score < afterValid.overall_score);
});

test('4. Weak Idea Rejection & Anti-Repeat Memory detect "AI-Buildability Trap" and warn on repeated rejected ideas', () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  const { opportunity, overlap_check } = ctx.opportunityEngine.createOpportunity({
    title: 'QuickPost AI: One-Click AI Blog & Social Caption Wrapper',
    category: 'AI Powered Tools',
    problem_statement: 'Small business owners want automated blog posts and social media captions generated with one click.',
    target_audience: 'General small businesses',
    demand_summary: 'Saturated',
    competitors_summary: 'ChatGPT, Jasper',
    alternatives_summary: 'Free LLMs',
    market_gaps: 'None',
    differentiation_potential: 'None',
    dev_complexity: 'low',
    estimated_dev_days: 3,
    operational_cost_monthly_usd: 50,
    monetization_model: '$15/mo subscription',
    acquisition_strategy: 'Cold outreach',
    revenue_potential_notes: 'Low',
    main_risks: 'Zero moat',
    dimension_inputs: {
      problem_severity: 3.0,
      demand_evidence: 3.0,
      development_feasibility: 9.0
    },
    evidence: []
  });

  assert.equal(opportunity.recommendation, 'REJECT_WEAK_IDEA');
  assert.equal(overlap_check.has_overlap, true, 'Should detect overlap with previously rejected AI blog wrapper');
  assert.equal(overlap_check.blocked_by_prior_rejection, true);
});

test('5. 15-Stage Product Execution Engine calculates real completion percentage and triggers Launch Approval Gate on Stage 14', () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });
  const product = ctx.executionEngine.getProductById('prod-sentinel-a11y');
  assert.ok(product);
  assert.equal(product.tasks.length, 15);
  assert.ok(product.completion_pct > 0 && product.completion_pct < 100);

  const stage14Task = product.tasks.find((t) => t.stage_number === 14);
  assert.ok(stage14Task);

  const updatedProduct = ctx.executionEngine.updateTask(stage14Task.id, {
    status: 'done',
    actual_hours: 4
  });

  assert.ok(updatedProduct.completion_pct > product.completion_pct);

  const pendingApprovals = ctx.approvalEngine.listRequests({ status: 'pending' });
  const launchGate = pendingApprovals.find(
    (req) => req.entity_type === 'product' && req.entity_id === product.id && req.action_category === 'launch_product'
  );
  assert.ok(launchGate, 'Completing Stage 14 must create a mandatory Owner Launch Approval Gate');

  ctx.approvalEngine.decideRequest(launchGate.id, {
    decision: 'approved',
    owner_decision_notes: 'Verified QA and pricing; approved for public release.'
  });

  const launchedProduct = ctx.executionEngine.getProductById(product.id);
  assert.equal(launchedProduct.status, 'launched');
});

test('6. Phase 2–7 Full Integration: Research Engine, Paid API Gate, Discovery Runs, 10-Step Dossier, Competitor Matrix & REST Endpoints', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });
  const { server } = createAppServer(ctx);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Verify Research Sources Registry
    const srcRes = await fetch(`${baseUrl}/api/research/sources`);
    assert.equal(srcRes.status, 200);
    const srcJson = await srcRes.json();
    assert.ok(srcJson.sources.length >= 7);

    // 2. Verify Paid Research API is blocked without explicit approval and creates a financial gate
    const paidRunRes = await fetch(`${baseUrl}/api/research/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_topic: 'paid keyword volume test',
        source_ids: ['src-paid-keyword-api'],
        allow_paid_apis: false
      })
    });
    assert.equal(paidRunRes.status, 201);
    const paidRunJson = await paidRunRes.json();
    assert.equal(paidRunJson.run.status, 'blocked_approval');

    // 3. Execute a free Discovery Run with attributed findings and verify duplicate skipping
    const runRes = await fetch(`${baseUrl}/api/research/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_topic: 'UI state matrix generator',
        opportunity_id: 'opp-ux-flow-simulator',
        source_ids: ['src-hn-algolia'],
        fetch_live_public: false,
        ingested_findings: [
          {
            claim_type: 'demand',
            statement: 'Product designers on HN report missing edge-case states during handoff.',
            evidence_tier: 'verified_evidence',
            source_url: 'https://news.ycombinator.com/item?id=39887766',
            source_name: 'Hacker News Discussion',
            supporting_excerpt: 'Over 45 comments discussing the pain of undocumented loading and error states in Figma handoffs.',
            published_at: '2026-09-12T00:00:00Z',
            research_methodology: 'public_api_discovery'
          },
          // Intentional duplicate in same batch
          {
            claim_type: 'demand',
            statement: 'Product designers on HN report missing edge-case states during handoff.',
            evidence_tier: 'verified_evidence',
            source_url: 'https://news.ycombinator.com/item?id=39887766',
            source_name: 'Hacker News Discussion',
            supporting_excerpt: 'Over 45 comments discussing the pain of undocumented loading and error states in Figma handoffs.',
            published_at: '2026-09-12T00:00:00Z',
            research_methodology: 'public_api_discovery'
          }
        ]
      })
    });
    assert.equal(runRes.status, 201);
    const runJson = await runRes.json();
    assert.equal(runJson.run.findings_created_count, 1);
    assert.equal(runJson.run.duplicates_skipped_count, 1);
    assert.equal(runJson.run.ai_synthesis.epistemic_label, 'AI_GENERATED_SYNTHESIS_NOT_SOURCE_EVIDENCE');
    assert.equal(runJson.run.ai_synthesis.can_count_as_verified_evidence, false);

    // 4. Generate 10-step Research Dossier
    const dosRes = await fetch(`${baseUrl}/api/opportunities/opp-ux-flow-simulator/dossier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(dosRes.status, 201);
    const dosJson = await dosRes.json();
    assert.equal(dosJson.dossier.pipeline_steps.length, 10);
    assert.equal(dosJson.dossier.evidence_quality_summary.active_verified_count, 1);

    // 5. Verify Markdown Dossier Export
    const exportRes = await fetch(`${baseUrl}/api/opportunities/opp-ux-flow-simulator/export?format=markdown`);
    assert.equal(exportRes.status, 200);
    const mdText = await exportRes.text();
    assert.ok(mdText.includes('# STRAW Opportunity & Market Research Dossier: StateCraft UX'));
    assert.ok(mdText.includes('https://news.ycombinator.com/item?id=39887766'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
