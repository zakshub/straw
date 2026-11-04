// Operational Smoke Test Script for STRAW V1.0
import assert from 'node:assert/strict';

const BASE_URL = 'http://127.0.0.1:4310';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  let body;
  if (contentType.includes('application/json')) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  return { status: res.status, headers: res.headers, body };
}

async function runSmokeTest() {
  console.log('=== STARTING STRAW V1.0 OPERATIONAL SMOKE TEST ===\n');
  const results = {};

  // Task 3: Start/Health Check
  console.log('[Check 1] Server Health & AI Orchestrator Boundary...');
  const health = await request('/api/health');
  assert.equal(health.status, 200, 'Health check must return 200');
  assert.equal(health.body.status, 'ok');
  assert.equal(health.body.service, 'straw-business-os');
  assert.equal(health.body.ai_orchestrator.active_mode, 'local');
  results.health = 'PASSED';
  console.log('  -> Health check PASSED\n');

  // Task 4: Inspect all four workspace views in HTML and Dashboard
  console.log('[Check 2] Inspecting 4 Consolidated Workspace Views (DOM & Structure)...');
  const indexRes = await request('/');
  assert.equal(indexRes.status, 200);
  const html = indexRes.body;

  // View 1 check: Discover & Research
  assert.ok(html.includes('id="tab-research"'), 'View 1 (#tab-research) must exist');
  assert.ok(html.includes('data-tab="research"'), 'Nav tab for research must exist');
  assert.ok(html.includes('id="form-discovery-run"'), 'Discovery Run form must exist in View 1');
  assert.ok(html.includes('id="research-sources-table"'), 'Research Sources Table must exist in View 1');
  assert.ok(html.includes('id="central-evidence-library-table"'), 'Central Evidence Library Table must exist in View 1');

  // View 2 check: Evaluate & Compare
  assert.ok(html.includes('id="tab-opportunities"'), 'View 2 (#tab-opportunities) must exist');
  assert.ok(html.includes('data-tab="opportunities"'), 'Nav tab for opportunities must exist');
  assert.ok(html.includes('id="overview-opportunities-table"'), 'Comparison matrix table must exist in View 2');
  assert.ok(html.includes('id="form-new-opportunity"'), 'New opportunity form must exist in View 2');
  assert.ok(html.includes('class="advanced-assumptions-accordion"'), 'Collapsible accordion for advanced fields must exist');
  assert.ok(html.includes('id="opportunity-detail-pane"'), 'Opportunity detail pane must exist in View 2');

  // View 3 check: Select & Plan MVP
  assert.ok(html.includes('id="tab-execution"'), 'View 3 (#tab-execution) must exist');
  assert.ok(html.includes('data-tab="execution"'), 'Nav tab for execution must exist');
  assert.ok(html.includes('id="select-active-product"'), 'Product select dropdown must exist in View 3');
  assert.ok(html.includes('id="product-execution-container"'), 'Product execution container must exist in View 3');

  // View 4 check: Approvals & Capabilities
  assert.ok(html.includes('id="tab-approvals"'), 'View 4 (#tab-approvals) must exist');
  assert.ok(html.includes('data-tab="approvals"'), 'Nav tab for approvals must exist');
  assert.ok(html.includes('id="approvals-queue-list"'), 'Approvals queue list must exist in View 4');
  assert.ok(html.includes('id="form-new-approval"'), 'New approval form must exist in View 4');
  assert.ok(html.includes('id="owner-profile-card"'), 'Owner profile card must exist in View 4');
  assert.ok(html.includes('id="capabilities-matrix-table"'), 'Capabilities matrix table must exist in View 4');
  assert.ok(html.includes('id="intelligence-memory-list"'), 'Intelligence memory list must exist in View 4');

  // Premature V3 tab check
  assert.ok(!html.includes('data-tab="growth"'), 'Premature V3 Growth tab must be hidden from V1 navigation');
  results.workspace_views = 'PASSED';
  console.log('  -> All 4 consolidated workspace views PASSED\n');

  // Task 5: Run one free public discovery workflow
  console.log('[Check 3] Running Free Public Discovery Workflow (Hacker News Algolia)...');
  const runPayload = {
    query_topic: 'accessible color contrast tool',
    target_category: 'Browser Based Utilities',
    opportunity_id: 'opp-oklch-contrast-inspector',
    source_ids: ['src-hn-algolia'],
    fetch_live_public: true
  };
  const runRes = await request('/api/research/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(runPayload)
  });
  assert.equal(runRes.status, 201, 'Discovery run must return 201');
  const runData = runRes.body.run;
  console.log(`  -> Discovery Run ID: ${runData.id}`);
  console.log(`  -> Run Status: ${runData.status}`);
  console.log(`  -> Findings Created: ${runData.findings_created_count}`);
  console.log(`  -> Duplicates Skipped: ${runData.duplicates_skipped_count}`);
  console.log(`  -> Execution Notes: ${runData.execution_notes}`);
  assert.ok(runData.id.startsWith('run-'), 'Run ID must start with run-');
  results.discovery_run = {
    run_id: runData.id,
    status: runData.status,
    findings_count: runData.findings_created_count,
    notes: runData.execution_notes
  };
  console.log('  -> Free Public Discovery Workflow PASSED\n');

  // Task 6 & 7: Open an opportunity and inspect evidence classifications & dual sub-scores
  console.log('[Check 4] Inspecting Opportunity Evidence Classifications & Dual Sub-Scores...');
  const oppRes = await request('/api/opportunities/opp-oklch-contrast-inspector');
  assert.equal(oppRes.status, 200);
  const opp = oppRes.body.opportunity;

  console.log(`  -> Opportunity Title: "${opp.title}"`);
  console.log(`  -> Priority Index: ${opp.overall_score}/100`);
  console.log(`  -> Commercial Readiness Score: ${opp.commercial_readiness_score}/100`);
  console.log(`  -> Technical Feasibility Score: ${opp.technical_feasibility_score}/100`);
  console.log(`  -> Commercial Validation Status: ${opp.commercial_validation_status}`);
  console.log(`  -> Score Disclaimer: "${opp.score_disclaimer}"`);

  assert.equal(typeof opp.commercial_readiness_score, 'number');
  assert.equal(typeof opp.technical_feasibility_score, 'number');
  assert.notEqual(opp.commercial_readiness_score, opp.technical_feasibility_score, 'Sub-scores must be distinct');
  assert.ok(opp.score_disclaimer.includes('NOT a probability of commercial success'), 'Disclaimer must be present');

  const eq = opp.evidence_quality_summary;
  console.log('  -> 4-Way Evidence Counts:', {
    problem_existence: eq.verified_problem_count,
    market_demand: eq.verified_demand_count,
    competitor_activity: eq.verified_competitor_count,
    willingness_to_pay: eq.verified_willingness_to_pay_count
  });

  // Verify each evidence item has evidence_category and valid SHA-256
  for (const ev of opp.evidence) {
    assert.ok(
      ['problem_existence', 'market_demand', 'competitor_activity', 'willingness_to_pay'].includes(ev.evidence_category),
      `Evidence ${ev.id} must have a valid commercial evidence category`
    );
    if (ev.source_content_hash) {
      assert.match(ev.source_content_hash, /^[a-f0-9]{64}$/i, 'source_content_hash must be a 64-character hex SHA-256');
    }
  }
  results.evidence_and_scoring = 'PASSED';
  console.log('  -> Evidence Classification & Dual Sub-Scores PASSED\n');

  // Task 8: Create a new opportunity using the simplified intake form
  console.log('[Check 5] Creating New Opportunity using Simplified Intake Form (4 Core Fields)...');
  const newOppPayload = {
    title: 'PaletteContrast CLI: Headless CI/CD Design Token Checker',
    category: 'Browser Based Utilities',
    problem_statement: 'Frontend teams lack an automated CI/CD pipeline step to catch inaccessible color token commits before production build.',
    target_audience: 'Design systems engineers and frontend leads at B2B web companies',
    // Leave other fields to defaults
    demand_summary: 'Observed repeated designer-developer handoff issues regarding color token contrast failures.',
    competitors_summary: 'Manual browser extensions and ad-hoc Figma inspection plugins.',
    alternatives_summary: 'Manual spreadsheet checks during QA audits.',
    market_gaps: 'Headless CI/CD gate with zero browser overhead and exportable PR diffs.',
    differentiation_potential: 'Direct integration with GitHub Actions and OKLCH perceptual contrast validation.',
    estimated_dev_days: 10,
    operational_cost_monthly_usd: 0,
    monetization_model: '$49/repo one-time developer license',
    acquisition_strategy: 'GitHub Marketplace + high-intent accessibility documentation links',
    revenue_potential_notes: 'Unverified commercial assumption pending developer smoke test',
    main_risks: 'Developers may rely on basic free linters unless PR diff output is superior.'
  };

  const createRes = await request('/api/opportunities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newOppPayload)
  });
  assert.equal(createRes.status, 201, 'Opportunity creation must return 201');
  const createdOpp = createRes.body.opportunity;
  console.log(`  -> Created Opportunity ID: ${createdOpp.id}`);
  console.log(`  -> Priority Index: ${createdOpp.overall_score}/100`);
  console.log(`  -> Commercial Readiness: ${createdOpp.commercial_readiness_score}/100`);
  console.log(`  -> Technical Feasibility: ${createdOpp.technical_feasibility_score}/100`);
  console.log(`  -> Recommendation: ${createdOpp.recommendation}`);
  results.create_opportunity = {
    id: createdOpp.id,
    title: createdOpp.title,
    index: createdOpp.overall_score,
    commercial: createdOpp.commercial_readiness_score,
    technical: createdOpp.technical_feasibility_score
  };
  console.log('  -> Opportunity Creation PASSED\n');

  // Task 9: Promote an opportunity into an MVP plan
  console.log('[Check 6] Promoting Opportunity to Selected MVP Plan...');
  const promoteRes = await request(`/api/opportunities/${encodeURIComponent(createdOpp.id)}/promote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  });
  assert.equal(promoteRes.status, 201, 'Promotion must return 201');
  const product = promoteRes.body.product;
  console.log(`  -> Created Product ID: ${product.id}`);
  console.log(`  -> Product Name: "${product.name}"`);
  console.log(`  -> Target Audience: "${product.target_audience}"`);
  console.log(`  -> Must-Have V1 Features: "${product.mvp_must_have_features}"`);
  console.log(`  -> Excluded Non-Goals: "${product.mvp_excluded_scope}"`);
  console.log(`  -> Pricing Hypothesis: "${product.pricing_hypothesis}"`);
  console.log(`  -> Buyer Validation Criteria: "${product.buyer_validation_criteria}"`);

  assert.ok(product.mvp_must_have_features.length > 15, 'Must have V1 features must be defined');
  assert.ok(product.mvp_excluded_scope.includes('Excluded from V1'), 'Excluded non-goals must be defined');
  assert.ok(product.buyer_validation_criteria.includes('BUILD IF:'), 'Validation criteria must include BUILD IF');
  results.promote_mvp = {
    product_id: product.id,
    name: product.name,
    status: product.status
  };
  console.log('  -> Promotion to MVP Plan PASSED\n');

  // Task 10: Edit and save the MVP plan
  console.log('[Check 7] Editing and Saving MVP Plan (PATCH /api/products/:id)...');
  const patchPayload = {
    target_audience: 'Design systems engineers at mid-market SaaS companies (10-100 engineers)',
    mvp_must_have_features: '1. Fast CLI binary that reads JSON/CSS tokens. 2. OKLCH perceptual contrast validation matrix. 3. Markdown summary output for GitHub Actions.',
    mvp_excluded_scope: 'Excluded from V1: Cloud SaaS dashboard, user accounts, Figma live bidirectional sync, and team billing before first 10 paying licenses.',
    pricing_hypothesis: '$49 one-time per-repository developer license (unverified until 5 pre-orders confirmed).',
    buyer_validation_criteria: 'BUILD IF: >= 5 engineering leads pre-order or commit to test within 14 days. PIVOT IF: Leads demand a browser extension instead. ABANDON IF: Fewer than 2 leads engage.'
  };

  const patchRes = await request(`/api/products/${encodeURIComponent(product.id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patchPayload)
  });
  assert.equal(patchRes.status, 200, 'PATCH must return 200');
  const updatedProd = patchRes.body.product;
  console.log(`  -> Updated Target Audience: "${updatedProd.target_audience}"`);
  console.log(`  -> Updated Must-Have: "${updatedProd.mvp_must_have_features}"`);
  console.log(`  -> Updated Excluded: "${updatedProd.mvp_excluded_scope}"`);
  console.log(`  -> Updated Pricing Hyp: "${updatedProd.pricing_hypothesis}"`);
  console.log(`  -> Updated Validation Criteria: "${updatedProd.buyer_validation_criteria}"`);

  assert.equal(updatedProd.target_audience, patchPayload.target_audience);
  assert.equal(updatedProd.mvp_must_have_features, patchPayload.mvp_must_have_features);
  assert.equal(updatedProd.mvp_excluded_scope, patchPayload.mvp_excluded_scope);
  assert.equal(updatedProd.pricing_hypothesis, patchPayload.pricing_hypothesis);
  assert.equal(updatedProd.buyer_validation_criteria, patchPayload.buyer_validation_criteria);
  results.edit_mvp = 'PASSED';
  console.log('  -> Edit & Save MVP Plan PASSED\n');

  // Task 11: Export an opportunity dossier
  console.log('[Check 8] Exporting Opportunity Markdown Dossier...');
  const expRes = await request(`/api/opportunities/${encodeURIComponent(createdOpp.id)}/export?format=markdown`);
  assert.equal(expRes.status, 200);
  assert.ok(expRes.headers.get('content-type').includes('text/markdown'));
  const md = expRes.body;

  assert.ok(md.includes('SCORE DISCLAIMER:'), 'Dossier must include Score Disclaimer');
  assert.ok(md.includes('NOT a probability of commercial success'), 'Dossier must state index is not probability of success');
  assert.ok(md.includes('Commercial Readiness Score:'), 'Dossier must display Commercial Readiness Score');
  assert.ok(md.includes('Technical & Capability Feasibility Score:'), 'Dossier must display Feasibility Score');
  assert.ok(md.includes('Four-Category Commercial Evidence Classification'), 'Dossier must display 4-category evidence table');
  assert.ok(md.includes('## 7. Selected Opportunity MVP Plan'), 'Dossier must include Section 7 MVP Plan');
  assert.ok(md.includes('Fast CLI binary that reads JSON/CSS tokens'), 'Dossier must include edited must-have features');
  assert.ok(md.includes('BUILD IF: >= 5 engineering leads pre-order'), 'Dossier must include buyer validation criteria');

  console.log('  -> Exported Markdown length:', md.length, 'bytes');
  console.log('  -> Key Sections Verified: Disclaimer, Dual Scores, 4-Way Evidence, Assumptions, MVP Blueprint');
  results.export_dossier = 'PASSED';
  console.log('  -> Opportunity Dossier Export PASSED\n');

  // Task 12: Inspect the approval workflow without creating any real financial commitment
  console.log('[Check 9] Inspecting Human Approval & Financial Governance System...');
  const apprRes = await request('/api/approvals');
  assert.equal(apprRes.status, 200);
  const approvals = apprRes.body.approvals;
  console.log(`  -> Total Approval Records in Ledger: ${approvals.length}`);
  for (const a of approvals) {
    console.log(`     - [${a.status.toUpperCase()}] Category: ${a.action_category} ($${a.financial_commitment_usd} USD) — "${a.title}"`);
  }

  // Verify unauthorized paid execution block (Milestone 1 security verification)
  const paidAttemptRes = await request('/api/research/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query_topic: 'unauthorized paid test',
      source_ids: ['src-paid-keyword-api'],
      approval_request_id: null
    })
  });
  assert.equal(paidAttemptRes.status, 201);
  const blockedRun = paidAttemptRes.body.run;
  assert.equal(blockedRun.status, 'blocked_approval');
  assert.equal(blockedRun.authorization_error_code, 'MISSING_APPROVAL');
  console.log(`  -> Paid API Security Lock Verified: Status=${blockedRun.status}, ErrorCode=${blockedRun.authorization_error_code}`);
  results.approvals = 'PASSED';
  console.log('  -> Approval Workflow Inspection & Security Lock PASSED\n');

  console.log('=== ALL 9 SMOKE TEST WORKFLOW CHECKS PASSED SUCCESSFULLY ===');
  return results;
}

runSmokeTest().catch((err) => {
  console.error('\nSMOKE TEST FAILED:', err);
  process.exit(1);
});
