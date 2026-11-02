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

test('2. Epistemic Guardrail caps Demand Evidence when zero verified_evidence exists, and uncaps when verified evidence is added', () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  const { opportunity } = ctx.opportunityEngine.createOpportunity({
    title: 'Unverified Designer Utility Hypothesis',
    category: 'Browser Based Utilities',
    problem_statement: 'Designers might want a browser color-Harmony generator.',
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

  // Now attach a real verified_evidence record and confirm re-scoring uncaps demand_evidence
  ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Verified 14,000 monthly searches and 3 paid competitor Chrome extensions with 20,000+ paid users.',
    evidence_tier: 'verified_evidence',
    source_citation: 'Chrome Web Store & Search Audit'
  });

  const updated = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  const demandDimAfter = updated.score_breakdown.dimensions.find((d) => d.key === 'demand_evidence');
  assert.equal(demandDimAfter.score_out_of_10, 9.5);
  assert.equal(updated.recommendation, 'APPROVE_FOR_VALIDATION');
  assert.ok(updated.overall_score > opportunity.overall_score);
});

test('3. Weak Idea Rejection & Anti-Repeat Memory detect "AI-Buildability Trap" and warn on repeated rejected ideas', () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  // Attempt to create another generic AI blog writer wrapper similar to the rejected seed opportunity
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

test('4. 15-Stage Product Execution Engine calculates real completion percentage and triggers Launch Approval Gate on Stage 14', () => {
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

  // Verify that completing Stage 14 automatically created a pending launch_product approval gate
  const pendingApprovals = ctx.approvalEngine.listRequests({ status: 'pending' });
  const launchGate = pendingApprovals.find(
    (req) => req.entity_type === 'product' && req.entity_id === product.id && req.action_category === 'launch_product'
  );
  assert.ok(launchGate, 'Completing Stage 14 must create a mandatory Owner Launch Approval Gate');

  // Approve the launch gate and verify product status transitions to launched
  ctx.approvalEngine.decideRequest(launchGate.id, {
    decision: 'approved',
    owner_decision_notes: 'Verified QA and pricing; approved for public release.'
  });

  const launchedProduct = ctx.executionEngine.getProductById(product.id);
  assert.equal(launchedProduct.status, 'launched');
});

test('5. REST API Server serves dashboard, evaluates concepts, and serves WCAG-grounded workspace HTML', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });
  const { server } = createAppServer(ctx);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.equal(healthJson.status, 'ok');

    const dashRes = await fetch(`${baseUrl}/api/dashboard`);
    assert.equal(dashRes.status, 200);
    const dashJson = await dashRes.json();
    assert.equal(dashJson.summary_counts.total_capabilities, 10);
    assert.equal(dashJson.catalogs.opportunity_categories.length, 15);
    assert.equal(dashJson.catalogs.scoring_dimensions.length, 11);
    assert.equal(dashJson.catalogs.lifecycle_stages.length, 15);

    const evalRes = await fetch(`${baseUrl}/api/ai/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Figma Token Diff Viewer',
        category: 'Figma Resources and Design Systems',
        problem_statement: 'Designers struggle to review token diffs before PR handoff',
        dev_complexity: 'low',
        has_verified_evidence: false
      })
    });
    assert.equal(evalRes.status, 200);
    const evalJson = await evalRes.json();
    assert.ok(evalJson.evaluation.strategic_critique.some((c) => c.includes('[EPISTEMIC WARNING]')));

    const htmlRes = await fetch(`${baseUrl}/`);
    assert.equal(htmlRes.status, 200);
    const htmlText = await htmlRes.text();
    assert.ok(htmlText.includes('STRAW'));
    assert.ok(htmlText.includes('data-theme="light"'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('6. Phase 2–6 Capabilities: Competitor Matrix, Score Sensitivity Simulation, Markdown Export, Dependency Diagnostics, Search Clusters, Unit Economics & Proactive Intelligence', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });
  const { server } = createAppServer(ctx);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Phase 2: Simulate sensitivity on discovered opportunity (opp-ux-flow-simulator)
    const simRes = await fetch(`${baseUrl}/api/opportunities/opp-ux-flow-simulator/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulate_verified_evidence: true, dev_complexity: 'low' })
    });
    assert.equal(simRes.status, 200);
    assert.equal(simRes.headers.get('x-content-type-options'), 'nosniff');
    const simJson = await simRes.json();
    assert.ok(simJson.simulation.simulated_score > simJson.simulation.baseline_score);
    assert.equal(simJson.simulation.simulated_recommendation, 'APPROVE_FOR_VALIDATION');

    // Phase 2: Add competitor & export Markdown dossier
    const compRes = await fetch(`${baseUrl}/api/opportunities/opp-ux-flow-simulator/competitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        competitor_name: 'Stately Studio',
        pricing_model: 'Freemium + $30/mo Pro',
        threat_level: 'moderate',
        strengths: 'Formal XState visual editor',
        weaknesses_and_gaps: 'Too developer-heavy for UX architects needing UI state matrices'
      })
    });
    assert.equal(compRes.status, 201);

    const exportRes = await fetch(`${baseUrl}/api/opportunities/opp-ux-flow-simulator/export?format=markdown`);
    assert.equal(exportRes.status, 200);
    const mdText = await exportRes.text();
    assert.ok(mdText.includes('# STRAW Opportunity Dossier: StateCraft UX'));
    assert.ok(mdText.includes('Stately Studio'));

    // Phase 3: Dependency & Stage-Order Diagnostics
    const prod = ctx.executionEngine.getProductById('prod-sentinel-a11y');
    assert.ok(prod.dependency_diagnostics.next_critical_task);
    assert.equal(prod.dependency_diagnostics.next_critical_task.stage_number, 7);

    // Phase 4: Search Intent Clusters & Unit Economics
    const clusterRes = await fetch(`${baseUrl}/api/products/prod-sentinel-a11y/clusters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic_cluster: 'EAA 2026 SaaS Accessibility Readiness',
        intent_type: 'compliance_checklist',
        target_query_pattern: 'european accessibility act figma checklist',
        conversion_asset: 'Sentinel A11y Starter Kit',
        demand_evidence_tier: 'verified_evidence'
      })
    });
    assert.equal(clusterRes.status, 201);
    const clusterJson = await clusterRes.json();
    assert.ok(clusterJson.workspace.search_intent_clusters.length >= 2);
    assert.ok(clusterJson.workspace.unit_economics.ltv_cac_status.includes('INSUFFICIENT_VERIFIED_DATA'));

    // Phase 5: Proactive AI Business Intelligence Recommendations
    const biRes = await fetch(`${baseUrl}/api/intelligence/recommendations`);
    assert.equal(biRes.status, 200);
    const biJson = await biRes.json();
    assert.ok(biJson.proactive_intelligence.proactive_action_queue.length >= 2);
    assert.ok(biJson.proactive_intelligence.unexplored_high_fit_categories.length >= 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
