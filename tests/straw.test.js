import test from 'node:test';
import assert from 'node:assert/strict';
import { createStrawContext } from '../src/context.js';
import { createAppServer } from '../src/server.js';
import {
  verifyAndClassifyEvidence,
  retrieveAndVerifySourceContent,
  detectUnsupportedWillingnessToPayClaim,
  extractValidPublicUrl,
  isPrivateOrReservedIp,
  validatePublicTargetWithDns,
  safePublicFetch,
  computeContentHash,
  computeEvidenceFingerprint,
  isValidSha256Hex,
  normalizeTextForVerification,
  classifyCommercialEvidenceCategory,
  analyzeOpportunityEvidenceQuality,
  MAX_SOURCE_RESPONSE_BYTES
} from '../src/engines/research-engine.js';

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

test('2. Milestone 2 — Actual Evidence Verification: URL format vs content verification, fabricated excerpts, blocked sources, changed content & WTP guardrails', async () => {
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

  // Case A: Invalid URL format -> downgraded to assumption
  const invalidUrlEv = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Someone told me there are 50,000 buyers ready.',
    evidence_tier: 'verified_evidence',
    source_url: 'not-a-valid-http-url',
    source_citation: 'Arbitrary unverified label without URL'
  });
  assert.equal(invalidUrlEv.evidence_tier, 'assumption');
  assert.equal(invalidUrlEv.verification_status, 'downgraded_unverified');
  assert.equal(invalidUrlEv.verification_method, 'invalid_url_format');

  // Case B: Valid URL format + manually supplied excerpt WITHOUT retrieved source content ->
  // MUST NOT be classified as verified_evidence! Must be held in pending_review as practitioner_observation.
  const urlOnlyUnverified = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Manual claim with valid URL format but no retrieved source content.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://www.w3.org/TR/design-survey-2026',
    source_name: 'W3C Survey Draft',
    supporting_excerpt: '74% of surveyed web designers reported frustration with manual token naming.'
  });
  assert.equal(
    urlOnlyUnverified.evidence_tier,
    'practitioner_observation',
    'Valid URL + manual excerpt without content retrieval must NOT become verified_evidence'
  );
  assert.equal(urlOnlyUnverified.verification_status, 'pending_review');
  assert.equal(urlOnlyUnverified.verification_method, 'url_format_only_unverified');
  assert.equal(urlOnlyUnverified.excerpt_verified_in_source, 0);

  // Case C: Valid URL + retrieved HTTP 200 source content where excerpt is FABRICATED (not present in body) ->
  // Must be downgraded to assumption (downgraded_unverified, excerpt_mismatch_fabricated)
  const fabricatedExcerptEv = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Claim with fabricated excerpt not present in the actual web page.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://www.w3.org/TR/actual-article',
    source_name: 'W3C Article',
    supporting_excerpt: 'Customers are paying $500/month for color harmony generators in 2026.',
    retrieved_source_content: 'This article discusses general CSS grid layout techniques and typography basics.',
    http_status: 200,
    retrieved_at: '2026-10-20T00:00:00Z'
  });
  assert.equal(fabricatedExcerptEv.evidence_tier, 'assumption');
  assert.equal(fabricatedExcerptEv.verification_status, 'downgraded_unverified');
  assert.equal(fabricatedExcerptEv.verification_method, 'excerpt_mismatch_fabricated');
  assert.equal(fabricatedExcerptEv.excerpt_verified_in_source, 0);

  // Case D: Blocked automated retrieval (HTTP 403 / 429) -> preserves original_source_url, marks pending_review
  const blockedRetrieval = await retrieveAndVerifySourceContent(
    {
      claim_type: 'competitor',
      statement: 'Protected competitor pricing page.',
      evidence_tier: 'verified_evidence',
      source_url: 'https://www.figma.com/community/protected-pricing',
      supporting_excerpt: 'Pro plan is $29/month per seat.'
    },
    {
      fetchImpl: async () => ({
        status: 403,
        ok: false,
        url: 'https://www.figma.com/community/protected-pricing',
        text: async () => 'Access Denied - Cloudflare challenge'
      })
    }
  );
  assert.equal(blockedRetrieval.verification_method, 'automated_retrieval_blocked_manual_required');
  assert.equal(blockedRetrieval.original_source_url, 'https://www.figma.com/community/protected-pricing');

  const blockedEv = ctx.opportunityEngine.addEvidence(opportunity.id, blockedRetrieval);
  assert.equal(blockedEv.verification_status, 'pending_review');
  assert.equal(blockedEv.evidence_tier, 'practitioner_observation');
  assert.equal(blockedEv.original_source_url, 'https://www.figma.com/community/protected-pricing');
  assert.ok(blockedEv.verification_notes.includes('manual human review is required'));

  // Case E: Unavailable source (HTTP 404 / 500 / timeout) -> marks downgraded_unverified (http_retrieval_failed)
  const unavailableRetrieval = await retrieveAndVerifySourceContent(
    {
      claim_type: 'demand',
      statement: 'Unavailable source test',
      evidence_tier: 'verified_evidence',
      source_url: 'https://github.com/missing-org/missing-page',
      supporting_excerpt: 'Some excerpt that cannot be fetched.'
    },
    {
      fetchImpl: async () => ({
        status: 404,
        ok: false,
        url: 'https://github.com/missing-org/missing-page',
        text: async () => 'Not Found'
      })
    }
  );
  assert.equal(unavailableRetrieval.verification_method, 'http_retrieval_failed');
  assert.equal(unavailableRetrieval.verification_status, 'downgraded_unverified');
  assert.notEqual(unavailableRetrieval.evidence_tier, 'verified_evidence');

  // Case F: Willingness-to-pay guardrail — cannot infer willingness to pay from install count / discussion count / star count
  const wtpCheck = detectUnsupportedWillingnessToPayClaim({
    claim_type: 'pricing',
    statement: 'Plugin has 50,000+ active installs which proves willingness to pay $99/yr.',
    supporting_excerpt: 'Active installations: 50,000+ in the free WordPress plugin directory.'
  });
  assert.equal(wtpCheck.violates_wtp_rule, true);

  const wtpBlockedEv = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'pricing',
    statement: 'Plugin has 50,000+ active installs which proves willingness to pay $99/yr.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://wordpress.org/plugins/example-block/',
    supporting_excerpt: 'Active installations: 50,000+ in the free WordPress plugin directory.',
    retrieved_source_content: 'WordPress Plugin Page: Active installations: 50,000+ in the free WordPress plugin directory.',
    http_status: 200,
    retrieved_at: '2026-10-20T00:00:00Z'
  });
  assert.equal(wtpBlockedEv.evidence_tier, 'practitioner_observation');
  assert.equal(wtpBlockedEv.verification_status, 'downgraded_unverified');
  assert.ok(wtpBlockedEv.verification_notes.includes('do not prove willingness to pay'));

  // Case F2 (Commercial Evidence Integrity): Customer interview responses, expressions of interest & hypothetical reactions
  // cannot automatically become verified willingness-to-pay evidence.
  const interviewWtpCheck = detectUnsupportedWillingnessToPayClaim({
    claim_type: 'pricing',
    statement: 'Customer interview response: 5 design leads said they would definitely pay $49 for this tool.',
    supporting_excerpt: 'Interview notes: Lead stated they would pay $49 if this token checker existed.'
  });
  assert.equal(interviewWtpCheck.violates_wtp_rule, true, 'Interview reactions must violate WTP rule for verified evidence');
  assert.ok(interviewWtpCheck.reason.includes('Interview responses, expressions of interest, and hypothetical pricing reactions'));

  const interviewEv = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'pricing',
    statement: 'Customer interview response: 5 design leads said they would definitely pay $49 for this tool.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://news.ycombinator.com/item?id=99999999',
    supporting_excerpt: 'Lead stated they would pay $49 if this token checker existed.',
    retrieved_source_content: 'Call Transcript: Lead stated they would pay $49 if this token checker existed.',
    http_status: 200,
    retrieved_at: '2026-10-20T00:00:00Z'
  });
  assert.equal(interviewEv.evidence_tier, 'practitioner_observation', 'Interview response must be downgraded from verified_evidence');
  assert.equal(interviewEv.verification_status, 'downgraded_unverified');
  assert.equal(interviewEv.evidence_category, 'market_demand', 'Interview pricing reaction must classify as market_demand, NOT willingness_to_pay');

  // Concrete executed transaction qualifies for willingness_to_pay
  const paidPilotWtpCheck = detectUnsupportedWillingnessToPayClaim({
    claim_type: 'pricing',
    statement: 'Signed paid pilot agreement with agency partner paying $500 pilot fee.',
    supporting_excerpt: 'Paid pilot deposit paid $500 on Stripe invoice inv_agency_001.'
  });
  assert.equal(paidPilotWtpCheck.violates_wtp_rule, false, 'Executed paid pilot transaction must not violate WTP rule');

  const executedWtpEv = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'pricing',
    statement: 'Signed paid pilot agreement with agency partner paying $500 pilot fee.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://billing.stripe.com/p/inv_agency_001',
    supporting_excerpt: 'Paid pilot deposit paid $500 on Stripe invoice inv_agency_001.',
    retrieved_source_content: 'Stripe Receipt: Paid pilot deposit paid $500 on Stripe invoice inv_agency_001. Status: Succeeded.',
    http_status: 200,
    retrieved_at: '2026-10-20T00:00:00Z'
  });
  assert.equal(executedWtpEv.evidence_tier, 'verified_evidence');
  assert.equal(executedWtpEv.verification_status, 'verified');
  assert.equal(executedWtpEv.evidence_category, 'willingness_to_pay', 'Executed paid pilot must classify as willingness_to_pay');

  // Case G: Valid URL + retrieved HTTP 200 source content where supporting_excerpt IS genuinely present in the retrieved source
  const realVerified = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Verified Chrome Web Store listing shows 20,000+ active users and explicit reviews requesting CSS token export.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://chromewebstore.google.com/detail/wcag-color-contrast-checker',
    final_source_url: 'https://chromewebstore.google.com/detail/wcag-color-contrast-checker',
    source_name: 'Chrome Web Store Public Listing',
    supporting_excerpt:
      'Extension listing displays 20,000+ weekly active users and 140+ user reviews requesting exportable CSS design tokens.',
    retrieved_source_content:
      'Chrome Web Store Overview: Extension listing displays 20,000+ weekly active users and 140+ user reviews requesting exportable CSS design tokens. Version 2.4.',
    http_status: 200,
    retrieved_at: '2026-10-12T10:00:00Z',
    published_at: '2026-10-12T00:00:00Z',
    research_methodology: 'direct_url_inspection'
  });

  assert.equal(realVerified.evidence_tier, 'verified_evidence');
  assert.equal(realVerified.verification_status, 'verified');
  assert.equal(realVerified.verification_method, 'http_content_match');
  assert.equal(realVerified.excerpt_verified_in_source, 1);
  assert.equal(realVerified.source_content_hash.length, 64, 'source_content_hash must be a full 64-char SHA-256 hex digest');
  assert.match(realVerified.source_content_hash, /^[a-f0-9]{64}$/);
  assert.equal(realVerified.content_fingerprint.length, 24, 'content_fingerprint must remain a separate 24-char deduplication key');
  assert.notEqual(realVerified.content_fingerprint, realVerified.source_content_hash);

  const updated = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  const demandDimAfter = updated.score_breakdown.dimensions.find((d) => d.key === 'demand_evidence');
  assert.equal(demandDimAfter.score_out_of_10, 9.5);
  assert.equal(updated.recommendation, 'APPROVE_FOR_VALIDATION');

  // Case H: Changed source content detection — when re-verifying the live source and content has changed so excerpt is gone
  const changedResearchEngine = ctx.researchEngine;
  changedResearchEngine.fetchFn = async () => ({
    status: 200,
    ok: true,
    url: 'https://chromewebstore.google.com/detail/wcag-color-contrast-checker',
    text: async () => 'This extension has been removed by the developer and no longer contains the previous text.'
  });
  const afterContentChange = await changedResearchEngine.verifyExistingEvidenceSource(realVerified.id);
  assert.notEqual(afterContentChange.source_content_hash, realVerified.source_content_hash);
  assert.equal(afterContentChange.excerpt_verified_in_source, 0);
  assert.equal(afterContentChange.verification_status, 'downgraded_unverified');
  assert.equal(afterContentChange.evidence_tier, 'assumption');
  assert.ok(afterContentChange.verification_notes.includes('SOURCE CONTENT CHANGED'));
});

test('3. Milestone 1 — Financial Approval Security: Paid API bypass prevention, scope/provider/limit/expiry validation', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  // 1. Direct attempt to bypass paid gate using allow_paid_apis: true without approval_request_id
  const bypassAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'bypass test query',
    source_ids: ['src-paid-keyword-api'],
    allow_paid_apis: true // Must be ignored!
  });
  assert.equal(bypassAttempt.status, 'blocked_approval');
  assert.equal(bypassAttempt.authorization_error_code, 'MISSING_APPROVAL');
  assert.ok(bypassAttempt.execution_notes.includes('MISSING_APPROVAL'));

  // 2. Attempt with non-existent approval_request_id
  const missingApprovalRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'missing approval id test',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: 'appr-non-existent-999'
  });
  assert.equal(missingApprovalRun.status, 'blocked_approval');
  assert.ok(missingApprovalRun.execution_notes.includes('does not exist'));

  // 3. Create a pending approval request and attempt to use it before owner approves
  const pendingApproval = ctx.approvalEngine.createRequest({
    entity_type: 'system',
    entity_id: 'src-paid-keyword-api',
    action_category: 'spend_money',
    title: 'Pending Paid Keyword API Request',
    description: 'Test pending approval',
    financial_commitment_usd: 25,
    authorized_provider_id: 'src-paid-keyword-api',
    authorization_scope: 'paid_research_execution'
  });
  const pendingAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'pending approval test',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: pendingApproval.id,
    estimated_cost_usd: 15
  });
  assert.equal(pendingAttempt.status, 'blocked_approval');
  assert.equal(pendingAttempt.authorization_error_code, 'PENDING_APPROVAL');

  // 4. Reject the approval request and attempt to use it
  ctx.approvalEngine.decideRequest(pendingApproval.id, {
    decision: 'rejected',
    owner_decision_notes: 'Rejected for test'
  });
  const rejectedAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'rejected approval test',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: pendingApproval.id,
    estimated_cost_usd: 15
  });
  assert.equal(rejectedAttempt.status, 'blocked_approval');
  assert.equal(rejectedAttempt.authorization_error_code, 'REJECTED_APPROVAL');

  // 5. Create an APPROVED request but with MISMATCHED provider identity
  const wrongProviderApproval = ctx.approvalEngine.createRequest({
    entity_type: 'system',
    entity_id: 'src-other-provider',
    action_category: 'spend_money',
    title: 'Approved for wrong provider',
    description: 'Test wrong provider',
    financial_commitment_usd: 50,
    authorized_provider_id: 'src-other-provider',
    authorization_scope: 'paid_research_execution'
  });
  ctx.approvalEngine.decideRequest(wrongProviderApproval.id, { decision: 'approved' });

  const wrongProviderAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'wrong provider test',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: wrongProviderApproval.id,
    estimated_cost_usd: 15
  });
  assert.equal(wrongProviderAttempt.status, 'blocked_approval');
  assert.equal(wrongProviderAttempt.authorization_error_code, 'MISMATCHED_SCOPE_OR_PROVIDER');

  // 6. Create an APPROVED request with MISMATCHED scope
  const wrongScopeApproval = ctx.approvalEngine.createRequest({
    entity_type: 'system',
    entity_id: 'src-paid-keyword-api',
    action_category: 'spend_money',
    title: 'Approved for wrong scope',
    description: 'Test wrong scope',
    financial_commitment_usd: 50,
    authorized_provider_id: 'src-paid-keyword-api',
    authorization_scope: 'domain_purchase_only'
  });
  ctx.approvalEngine.decideRequest(wrongScopeApproval.id, { decision: 'approved' });

  const wrongScopeAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'wrong scope test',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: wrongScopeApproval.id,
    estimated_cost_usd: 15
  });
  assert.equal(wrongScopeAttempt.status, 'blocked_approval');
  assert.equal(wrongScopeAttempt.authorization_error_code, 'MISMATCHED_SCOPE_OR_PROVIDER');

  // 7. Create an APPROVED request that is EXPIRED
  const expiredApproval = ctx.approvalEngine.createRequest({
    entity_type: 'system',
    entity_id: 'src-paid-keyword-api',
    action_category: 'spend_money',
    title: 'Expired approval',
    description: 'Test expired',
    financial_commitment_usd: 50,
    authorized_provider_id: 'src-paid-keyword-api',
    authorization_scope: 'paid_research_execution',
    expires_at: '2020-01-01T00:00:00Z'
  });
  ctx.approvalEngine.decideRequest(expiredApproval.id, { decision: 'approved' });

  const expiredAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'expired approval test',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: expiredApproval.id,
    estimated_cost_usd: 15
  });
  assert.equal(expiredAttempt.status, 'blocked_approval');
  assert.equal(expiredAttempt.authorization_error_code, 'EXPIRED_APPROVAL');

  // 8. Create an APPROVED request where requested spend EXCEEDS spending limit
  const lowLimitApproval = ctx.approvalEngine.createRequest({
    entity_type: 'system',
    entity_id: 'src-paid-keyword-api',
    action_category: 'spend_money',
    title: 'Low limit approval ($10 max)',
    description: 'Test limit exceeded',
    financial_commitment_usd: 10,
    authorized_provider_id: 'src-paid-keyword-api',
    authorization_scope: 'paid_research_execution'
  });
  ctx.approvalEngine.decideRequest(lowLimitApproval.id, { decision: 'approved' });

  const exceededLimitAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'exceeded limit test',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: lowLimitApproval.id,
    estimated_cost_usd: 25
  });
  assert.equal(exceededLimitAttempt.status, 'blocked_approval');
  assert.equal(exceededLimitAttempt.authorization_error_code, 'EXCEEDED_SPENDING_LIMIT');

  // 9. Valid matching approved authorization -> passes financial gate, records authorization_ref on research_runs,
  // and halts cleanly as unsupported_source ('partial') without executing any paid network request.
  const validApproval = ctx.approvalEngine.createRequest({
    entity_type: 'system',
    entity_id: 'src-paid-keyword-api',
    action_category: 'spend_money',
    title: 'Valid $25 approval for src-paid-keyword-api',
    description: 'Test valid approval',
    financial_commitment_usd: 25,
    authorized_provider_id: 'src-paid-keyword-api',
    authorization_scope: 'paid_research_execution',
    expires_at: '2027-12-31T23:59:59Z'
  });
  ctx.approvalEngine.decideRequest(validApproval.id, { decision: 'approved' });

  const authorizedRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'authorized paid source check',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: validApproval.id,
    estimated_cost_usd: 15
  });
  assert.equal(authorizedRun.authorization_ref, validApproval.id);
  assert.equal(authorizedRun.status, 'partial');
  assert.ok(authorizedRun.execution_notes.includes('UNSUPPORTED CONNECTOR'));

  // 10. Phase 7.2 Req 4.2: Attempt to REUSE the same single-use approval_request_id on a second run must be blocked!
  const reuseAttempt = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'second run reusing consumed approval',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: validApproval.id,
    estimated_cost_usd: 5
  });
  assert.equal(reuseAttempt.status, 'blocked_approval');
  assert.equal(reuseAttempt.authorization_error_code, 'APPROVAL_ALREADY_USED');

  // 11. Phase 7.2 Req 4.1: Caller cannot create a pre-approved request directly via ApprovalEngine.createRequest
  assert.throws(() => {
    ctx.approvalEngine.createRequest({
      entity_type: 'system',
      entity_id: 'src-paid-keyword-api',
      action_category: 'spend_money',
      title: 'Forged pre-approved request',
      description: 'Client trying to set status=approved at creation time',
      financial_commitment_usd: 100,
      status: 'approved'
    });
  }, /Client cannot create a pre-approved authorization/);

  // 12. Phase 7.2 Req 4.2: Opportunity-scoped approval cannot be used for a different opportunity_id
  const oppScopedApproval = ctx.approvalEngine.createRequest({
    entity_type: 'opportunity',
    entity_id: 'opp-a11y-design-kit',
    action_category: 'spend_money',
    title: 'Scoped to opp-a11y-design-kit only',
    description: 'Opportunity-specific paid research authorization',
    financial_commitment_usd: 25,
    authorized_provider_id: 'src-paid-keyword-api',
    authorization_scope: 'paid_research_execution',
    expires_at: '2027-12-31T23:59:59Z'
  });
  ctx.approvalEngine.decideRequest(oppScopedApproval.id, { decision: 'approved' });

  const wrongOppRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'wrong opportunity scope test',
    opportunity_id: 'opp-ux-flow-simulator',
    source_ids: ['src-paid-keyword-api'],
    approval_request_id: oppScopedApproval.id,
    estimated_cost_usd: 15
  });
  assert.equal(wrongOppRun.status, 'blocked_approval');
  assert.equal(wrongOppRun.authorization_error_code, 'MISMATCHED_SCOPE_OR_PROVIDER');
});

test('4. Milestone 3 & 4 — Source Capability Matrix, Mocked Connector Response Parsing, HN Comment Extraction & Error Handling', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  // Verify Source Capability Matrix (8 registered sources: 6 implemented adapters across 5 adapter keys, 2 unsupported)
  const matrix = ctx.researchEngine.getSourceCapabilityMatrix();
  assert.equal(matrix.length, 8);

  const implementedKeys = [...new Set(matrix.filter((m) => m.implemented).map((m) => m.adapter_key))].sort();
  const unsupportedKeys = [...new Set(matrix.filter((m) => !m.implemented).map((m) => m.adapter_key))].sort();

  assert.deepEqual(
    implementedKeys,
    ['github_repos_api', 'hn_algolia_api', 'public_url_inspector', 'reddit_public_json', 'wordpress_plugins_api'].sort()
  );
  assert.deepEqual(unsupportedKeys, ['marketplace_directory_inspector', 'paid_search_provider'].sort());

  // Mocked Connector 1: Hacker News Algolia Comment Extraction (Milestone 4)
  ctx.researchEngine.fetchFn = async (url) => {
    if (url.includes('tags=comment')) {
      return {
        status: 200,
        ok: true,
        url,
        text: async () =>
          JSON.stringify({
            hits: [
              {
                objectID: '44556677',
                story_id: 44550000,
                story_title: 'Ask HN: How do you handle WCAG 2.2 accessibility handoffs?',
                author: 'ux_lead_dev',
                created_at: '2026-10-18T14:20:00Z',
                comment_text:
                  '<p>We constantly fail WCAG 2.5.3 Label in Name audits because our Figma components do not specify programmatic aria-label rules alongside visual text.</p>'
              }
            ]
          })
      };
    }
    return { status: 200, ok: true, url, text: async () => JSON.stringify({ hits: [] }) };
  };

  const hnRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'wcag 2.2 figma handoff',
    opportunity_id: 'opp-ux-flow-simulator',
    source_ids: ['src-hn-algolia'],
    fetch_live_public: true
  });
  assert.equal(hnRun.status, 'completed');
  assert.equal(hnRun.findings_created_count, 1);
  assert.equal(hnRun.created_findings[0].source_url, 'https://news.ycombinator.com/item?id=44556677');
  assert.equal(hnRun.created_findings[0].evidence_tier, 'verified_evidence');
  assert.equal(hnRun.created_findings[0].verification_status, 'verified');
  assert.ok(
    hnRun.created_findings[0].supporting_excerpt.includes(
      'We constantly fail WCAG 2.5.3 Label in Name audits because our Figma components do not specify programmatic aria-label rules'
    ),
    'HN collector must store actual verbatim comment text rather than generated story popularity summaries'
  );

  // Mocked Connector 1b: Hacker News fallback when comments are empty (must classify story hits as discovery signal, NOT verified demand)
  ctx.researchEngine.fetchFn = async (url) => {
    if (url.includes('tags=comment')) {
      return { status: 200, ok: true, url, text: async () => JSON.stringify({ hits: [] }) };
    }
    return {
      status: 200,
      ok: true,
      url,
      text: async () =>
        JSON.stringify({
          hits: [
            {
              objectID: '44990011',
              title: 'Show HN: Statechart visualizer',
              points: 120,
              num_comments: 45,
              created_at: '2026-10-19T10:00:00Z'
            }
          ]
        })
    };
  };

  const hnStoryFallbackRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'statechart visualizer fallback',
    opportunity_id: 'opp-ux-flow-simulator',
    source_ids: ['src-hn-algolia'],
    fetch_live_public: true
  });
  assert.equal(hnStoryFallbackRun.created_findings[0].evidence_tier, 'practitioner_observation');
  assert.equal(
    hnStoryFallbackRun.created_findings[0].verification_status,
    'pending_review',
    'Story popularity without retrieved comment text must be held in pending_review, not verified demand'
  );

  // Mocked Connector 2: WordPress.org Plugin Directory API
  ctx.researchEngine.fetchFn = async (url) => ({
    status: 200,
    ok: true,
    url,
    text: async () =>
      JSON.stringify({
        plugins: [
          {
            name: 'Accessible Form Blocks Lite',
            slug: 'accessible-form-blocks-lite',
            version: '1.4.2',
            active_installs: 10000,
            num_ratings: 42,
            last_updated: '2026-10-10 12:00pm GMT',
            short_description: 'Provides accessible Gutenberg form blocks with explicit label association.'
          }
        ]
      })
  });

  const wpRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'accessible form blocks',
    opportunity_id: 'opp-wp-ux-audit-blocks',
    source_ids: ['src-wp-plugin-api'],
    fetch_live_public: true
  });
  assert.equal(wpRun.status, 'completed');
  assert.equal(wpRun.created_findings[0].claim_type, 'competitor');
  assert.equal(wpRun.created_findings[0].evidence_tier, 'verified_evidence');
  assert.ok(
    wpRun.created_findings[0].supporting_excerpt.includes(
      'Provides accessible Gutenberg form blocks with explicit label association.'
    )
  );

  // Mocked Connector 3: GitHub Public Repositories API
  ctx.researchEngine.fetchFn = async (url) => ({
    status: 200,
    ok: true,
    url,
    text: async () =>
      JSON.stringify({
        items: [
          {
            full_name: 'example/a11y-form-linter',
            html_url: 'https://github.com/example/a11y-form-linter',
            description: 'Open-source CLI linter for checking HTML form label associations and ARIA attributes.',
            stargazers_count: 850,
            open_issues_count: 19,
            updated_at: '2026-10-15T00:00:00Z'
          }
        ]
      })
  });

  const ghRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'a11y form linter',
    opportunity_id: 'opp-a11y-design-kit',
    source_ids: ['src-github-public'],
    fetch_live_public: true
  });
  assert.equal(ghRun.status, 'completed');
  assert.equal(ghRun.created_findings[0].claim_type, 'competitor');
  assert.equal(ghRun.created_findings[0].source_url, 'https://github.com/example/a11y-form-linter');
  assert.equal(ghRun.created_findings[0].evidence_tier, 'verified_evidence');

  // Mocked Connector 4: Reddit Public JSON API
  ctx.researchEngine.fetchFn = async (url) => ({
    status: 200,
    ok: true,
    url,
    text: async () =>
      JSON.stringify({
        data: {
          children: [
            {
              data: {
                subreddit_name_prefixed: 'r/webdev',
                title: 'Struggling with EAA accessibility audits on client forms',
                selftext:
                  'Our agency spent 18 hours manually fixing form label mismatches across 40 pages because our UI kit had no accessibility tokens.',
                permalink: '/r/webdev/comments/1abcde/struggling_with_eaa_accessibility_audits/',
                score: 64,
                num_comments: 28,
                created_utc: Math.floor(Date.now() / 1000) - 86400
              }
            }
          ]
        }
      })
  });

  const redditRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'EAA accessibility form audits',
    opportunity_id: 'opp-a11y-design-kit',
    source_ids: ['src-reddit-public'],
    fetch_live_public: true
  });
  assert.equal(redditRun.status, 'completed');
  assert.equal(redditRun.created_findings[0].evidence_tier, 'verified_evidence');
  assert.ok(redditRun.created_findings[0].supporting_excerpt.includes('Our agency spent 18 hours manually fixing'));

  // Mocked Connector 5: Public Competitor Pricing / URL Inspector
  ctx.researchEngine.fetchFn = async (url) => ({
    status: 200,
    ok: true,
    url,
    text: async () =>
      '<html><head><title>Stark Pricing — Accessibility Suite</title></head><body><h1>Pricing</h1><p>Launch Plan is $15 per month billed annually. Team plan is $25 per editor.</p></body></html>'
  });

  const urlRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'Stark pricing page inspection',
    opportunity_id: 'opp-a11y-design-kit',
    source_ids: ['src-public-pricing-web'],
    fetch_live_public: true,
    target_url: 'https://www.getstark.co/pricing/'
  });
  assert.equal(urlRun.status, 'completed');
  assert.equal(urlRun.created_findings[0].claim_type, 'competitor');
  assert.equal(urlRun.created_findings[0].evidence_tier, 'verified_evidence');
  assert.ok(urlRun.created_findings[0].supporting_excerpt.includes('Launch Plan is $15 per month'));

  // Mocked Error Handling: Malformed JSON, Rate Limiting (429), and Network Timeout
  ctx.researchEngine.fetchFn = async (url) => ({
    status: 200,
    ok: true,
    url,
    text: async () => '<<<NOT VALID JSON>>>'
  });
  const malformedRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'malformed json test',
    source_ids: ['src-wp-plugin-api'],
    fetch_live_public: true
  });
  assert.ok(malformedRun.execution_notes.includes('malformed JSON'));

  ctx.researchEngine.fetchFn = async (url) => ({
    status: 429,
    ok: false,
    url,
    text: async () => 'Too Many Requests'
  });
  const rateLimitedRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'rate limit 429 test',
    source_ids: ['src-reddit-public'],
    fetch_live_public: true
  });
  assert.ok(rateLimitedRun.execution_notes.includes('HTTP 429'));

  ctx.researchEngine.fetchFn = async () => {
    throw new Error('The operation was aborted due to timeout');
  };
  const timeoutRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'timeout test',
    source_ids: ['src-github-public'],
    fetch_live_public: true
  });
  assert.ok(timeoutRun.execution_notes.includes('aborted due to timeout'));
});

test('5. Quality Controls, Weak Idea Rejection & 15-Stage Execution: Stale exclusion, Conflict penalty, AI hypothesis lock & Stage 14 Gate', () => {
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

  // Stale evidence (>365 days old)
  const staleEv = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: '2021 thread asking for invoice templates.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://www.reddit.com/r/freelance/comments/old2021thread',
    source_name: 'Reddit Public Thread',
    supporting_excerpt: 'Historical 2021 discussion from 5 years ago about desktop invoice tools.',
    retrieved_source_content: 'Reddit 2021: Historical 2021 discussion from 5 years ago about desktop invoice tools.',
    http_status: 200,
    published_at: '2021-03-10T00:00:00Z'
  });
  assert.equal(staleEv.is_stale, 1);
  assert.equal(staleEv.verification_status, 'stale');
  assert.notEqual(staleEv.evidence_tier, 'verified_evidence');

  // AI-generated hypothesis can NEVER be stored as verified_evidence
  const aiHyp = ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'LLM predicts 100,000 freelancers will buy this.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://news.ycombinator.com/item?id=999999',
    supporting_excerpt: 'Synthesized by an AI model guessing market demand.',
    retrieved_source_content: 'Synthesized by an AI model guessing market demand.',
    http_status: 200,
    research_methodology: 'ai_hypothesis_unverified'
  });
  assert.equal(aiHyp.evidence_tier, 'assumption');
  assert.equal(aiHyp.verification_status, 'downgraded_unverified');

  // Valid fresh supporting verified evidence
  const excerptText = 'Multiple solo consultants state they paid $29 for local-first browser invoice generators.';
  ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'demand',
    statement: 'Active 2026 practitioner discussion confirming paid adoption of local-first invoice tools.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://news.ycombinator.com/item?id=41234567',
    source_name: 'Hacker News Discussion',
    supporting_excerpt: excerptText,
    retrieved_source_content: `HN Comment 41234567: ${excerptText}`,
    http_status: 200,
    retrieved_at: '2026-10-02T00:00:00Z',
    published_at: '2026-10-01T00:00:00Z'
  });

  // Duplicate detection
  assert.throws(() => {
    ctx.opportunityEngine.addEvidence(opportunity.id, {
      claim_type: 'demand',
      statement: 'Active 2026 practitioner discussion confirming paid adoption of local-first invoice tools.',
      evidence_tier: 'verified_evidence',
      source_url: 'https://news.ycombinator.com/item?id=41234567',
      supporting_excerpt: excerptText,
      retrieved_source_content: `HN Comment 41234567: ${excerptText}`,
      http_status: 200
    });
  }, /Duplicate research finding detected/);

  const afterValid = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  assert.equal(afterValid.recommendation, 'APPROVE_FOR_VALIDATION');

  // Conflicting evidence detection
  const conflictExcerpt = 'Wave Invoicing is 100% free with unlimited invoices and customizable templates.';
  ctx.opportunityEngine.addEvidence(opportunity.id, {
    claim_type: 'risk',
    statement: 'Wave and Stripe now bundle free unlimited PDF invoice generators with 0 transaction fee for basic use.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://www.waveapps.com/invoicing',
    source_name: 'Wave Public Pricing Page',
    supporting_excerpt: conflictExcerpt,
    retrieved_source_content: `Wave Invoicing Features: ${conflictExcerpt}`,
    http_status: 200,
    published_at: '2026-10-15T00:00:00Z',
    stance: 'contradicting'
  });

  const afterConflict = ctx.opportunityEngine.getOpportunityById(opportunity.id);
  assert.equal(afterConflict.evidence_quality_summary.has_conflicting_evidence, true);
  assert.equal(afterConflict.recommendation, 'HOLD_CONFLICTING_EVIDENCE');
  assert.ok(afterConflict.overall_score < afterValid.overall_score);

  // Stage 14 Launch Gate check
  const product = ctx.executionEngine.getProductById('prod-sentinel-a11y');
  const stage14Task = product.tasks.find((t) => t.stage_number === 14);
  ctx.executionEngine.updateTask(stage14Task.id, { status: 'done', actual_hours: 4 });
  const pendingApprovals = ctx.approvalEngine.listRequests({ status: 'pending' });
  const launchGate = pendingApprovals.find(
    (req) => req.entity_type === 'product' && req.entity_id === product.id && req.action_category === 'launch_product'
  );
  assert.ok(launchGate);
});

test('6. Server REST API Integration: Direct API bypass attempts fail, Source Capability Matrix endpoint, Dossier & Exports', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });
  const { server } = createAppServer(ctx);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Verify Source Capability Matrix endpoint
    const matRes = await fetch(`${baseUrl}/api/research/matrix`);
    assert.equal(matRes.status, 200);
    const matJson = await matRes.json();
    assert.equal(matJson.matrix.length, 8);

    // 2. Prove direct HTTP POST to /api/research/runs CANNOT bypass approval even if client sends allow_paid_apis: true or status: 'approved'
    const paidBypassRes = await fetch(`${baseUrl}/api/research/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query_topic: 'direct http bypass attempt',
        source_ids: ['src-paid-keyword-api'],
        allow_paid_apis: true,
        approval_status: 'approved'
      })
    });
    assert.equal(paidBypassRes.status, 201);
    const paidBypassJson = await paidBypassRes.json();
    assert.equal(paidBypassJson.run.status, 'blocked_approval');
    assert.equal(paidBypassJson.run.authorization_ref, null);

    // 2b. Prove client CANNOT create its own pre-approved authorization via POST /api/approvals
    const forgedApprovalRes = await fetch(`${baseUrl}/api/approvals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: 'system',
        entity_id: 'src-paid-keyword-api',
        action_category: 'spend_money',
        title: 'Client self-approved attempt',
        description: 'Attempting to pass status=approved in POST /api/approvals',
        financial_commitment_usd: 50,
        status: 'approved'
      })
    });
    assert.equal(forgedApprovalRes.status, 400);
    const forgedApprovalJson = await forgedApprovalRes.json();
    assert.ok(forgedApprovalJson.error.includes('Client cannot create a pre-approved'));

    // 3. Execute a Discovery Run with verified content finding
    const excerpt = 'Over 45 comments discussing the pain of undocumented loading and error states in Figma handoffs.';
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
            supporting_excerpt: excerpt,
            retrieved_source_content: `HN Thread 39887766: ${excerpt}`,
            http_status: 200,
            retrieved_at: '2026-09-12T01:00:00Z',
            published_at: '2026-09-12T00:00:00Z',
            research_methodology: 'public_api_discovery'
          }
        ]
      })
    });
    assert.equal(runRes.status, 201);
    const runJson = await runRes.json();
    assert.equal(runJson.run.findings_created_count, 1);

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
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});

test('7. Phase 7.2 — SSRF Prevention, IPv6/Obfuscated IPs, Redirect Attacks, DNS Rebinding, Response Size Limits & 64-Char SHA-256 Validation', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  // 1. Direct URL & IP validation: Private IPv4, Loopback, Link-Local, Cloud Metadata, CGNAT, Reserved, Obfuscated IPs, IPv6, and Internal Hostnames
  const blockedUrls = [
    // Localhost & internal domains
    'http://localhost/admin',
    'http://localhost:8080/api',
    'https://sub.localhost/secret',
    'http://metadata.google.internal/computeMetadata/v1/',
    'http://db.internal/status',
    'http://printer.local/config',
    'http://intranet/admin', // single-label hostname without public TLD
    // IPv4 Loopback & Unspecified
    'http://127.0.0.1/secret',
    'http://127.0.0.53:8053/dns',
    'http://127.255.255.254/',
    'http://0.0.0.0:3000/',
    // Private IPv4 (RFC 1918)
    'http://10.0.0.1/internal',
    'http://10.255.255.1/',
    'http://172.16.0.1/admin',
    'http://172.31.255.255/admin',
    'http://192.168.0.1/',
    'http://192.168.1.254/router',
    // Link-Local & Cloud Metadata (AWS/GCP/Azure 169.254.169.254)
    'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    'http://169.254.1.1/',
    // Carrier-Grade NAT & Reserved / Multicast / Broadcast
    'http://100.64.0.1/',
    'http://100.127.255.254/',
    'http://192.0.2.1/',
    'http://198.18.0.1/',
    'http://224.0.0.1/',
    'http://255.255.255.255/',
    // Obfuscated IPv4 notations (decimal integer, hex, octal, short IPv4)
    'http://2130706433/admin', // 127.0.0.1 in decimal
    'http://0x7f000001/admin', // 127.0.0.1 in hex
    'http://0177.0.0.1/admin', // 127.0.0.1 in octal
    'http://127.1/admin',      // short IPv4
    // IPv6 Loopback, Unspecified, Link-Local, Unique Local (ULA), Multicast, IPv4-mapped IPv6, NAT64, 6to4
    'http://[::1]:8080/admin',
    'http://[0:0:0:0:0:0:0:1]/',
    'http://[::]/',
    'http://[fe80::1]/',
    'http://[fe80::1%25eth0]/',
    'http://[fc00::1]/',
    'http://[fd12:3456:789a::1]/',
    'http://[ff02::1]/',
    'http://[::ffff:127.0.0.1]/',
    'http://[::ffff:10.0.0.1]/',
    'http://[::ffff:169.254.169.254]/latest/meta-data/',
    'http://[64:ff9b::127.0.0.1]/',
    'http://[2002:7f00:0001::1]/',
    // Non-HTTP/HTTPS protocols
    'file:///etc/passwd',
    'ftp://ftp.example.com/pub/file.txt',
    'gopher://127.0.0.1:6379/_INFO',
    'javascript:alert(1)'
  ];

  for (const badUrl of blockedUrls) {
    const check = extractValidPublicUrl(badUrl);
    assert.equal(check.valid, false, `Expected URL to be rejected: ${badUrl}`);

    // Also confirm retrieveAndVerifySourceContent refuses to call fetchImpl for any blocked URL
    let fetchCalled = false;
    const res = await retrieveAndVerifySourceContent(
      {
        source_url: badUrl,
        supporting_excerpt: 'Should never be fetched from internal network.',
        evidence_tier: 'verified_evidence'
      },
      {
        fetchImpl: async () => {
          fetchCalled = true;
          throw new Error('fetchImpl must NEVER be invoked for SSRF-blocked URLs');
        }
      }
    );
    assert.equal(fetchCalled, false, `fetchImpl must not be called for ${badUrl}`);
    assert.equal(res.evidence_tier, 'assumption');
    assert.equal(res.verification_status, 'downgraded_unverified');
    assert.equal(res.excerpt_verified_in_source, 0);
  }

  // Verify public IPv4 (e.g., 172.32.0.1 outside 172.16.0.0/12, 93.184.216.34) and public IPv6 (2606:2800:220:1:248:1893:25c8:1946) are allowed
  assert.equal(isPrivateOrReservedIp('93.184.216.34').blocked, false);
  assert.equal(isPrivateOrReservedIp('172.32.0.1').blocked, false);
  assert.equal(isPrivateOrReservedIp('2606:2800:220:1:248:1893:25c8:1946').blocked, false);

  // 2. Redirect Attack Prevention:
  // 2a. Public URL redirecting (302) to 127.0.0.1 or 169.254.169.254 or [::1] or file:///etc/passwd must be blocked BEFORE following the redirect!
  const redirectTargets = [
    'http://127.0.0.1:8080/internal-admin',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]:3000/private',
    'http://10.0.0.5/secret',
    'file:///etc/passwd'
  ];

  for (const maliciousRedirect of redirectTargets) {
    let hopCount = 0;
    const redirectResult = await retrieveAndVerifySourceContent(
      {
        source_url: 'https://public-redirect-test.example.com/article',
        supporting_excerpt: 'Some expected excerpt text that should not be verified.',
        evidence_tier: 'verified_evidence'
      },
      {
        dnsLookup: async () => [{ address: '93.184.216.34', family: 4 }],
        fetchImpl: async (url, opts) => {
          hopCount += 1;
          assert.equal(opts.redirect, 'manual', 'safePublicFetch must enforce redirect: "manual"');
          if (hopCount === 1) {
            return {
              status: 302,
              ok: false,
              headers: new Map([['location', maliciousRedirect]]),
              text: async () => ''
            };
          }
          throw new Error(`Redirect to ${maliciousRedirect} should have been blocked before hop 2!`);
        }
      }
    );

    assert.equal(hopCount, 1, `Must block redirect to ${maliciousRedirect} after first hop without fetching target`);
    assert.equal(redirectResult.verification_method, 'ssrf_blocked');
    assert.equal(redirectResult.verification_status, 'downgraded_unverified');
    assert.equal(redirectResult.evidence_tier, 'assumption');
  }

  // 2b. Safe redirect to another valid public HTTPS URL succeeds and records final_source_url
  let safeRedirectHops = 0;
  const safeRedirectRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://www.w3.org/TR/old-path',
      supporting_excerpt: 'Verified public documentation after safe redirect.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async (url) => {
        safeRedirectHops += 1;
        if (safeRedirectHops === 1) {
          return {
            status: 301,
            ok: false,
            headers: new Map([['location', 'https://www.w3.org/TR/new-path']]),
            text: async () => ''
          };
        }
        return {
          status: 200,
          ok: true,
          headers: new Map([['content-length', '80']]),
          text: async () => '<html><body>Verified public documentation after safe redirect.</body></html>'
        };
      }
    }
  );
  assert.equal(safeRedirectHops, 2);
  assert.equal(safeRedirectRes.verification_status, 'verified');
  assert.equal(safeRedirectRes.original_source_url, 'https://www.w3.org/TR/old-path');
  assert.equal(safeRedirectRes.final_source_url, 'https://www.w3.org/TR/new-path');
  assert.match(safeRedirectRes.source_content_hash, /^[a-f0-9]{64}$/);

  // 2c. Excessive redirect loop (> MAX_SAFE_REDIRECTS) is aborted cleanly
  const redirectLoopRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://www.w3.org/TR/loop-1',
      supporting_excerpt: 'Loop test excerpt text here.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async (url) => ({
        status: 302,
        ok: false,
        headers: new Map([['location', 'https://www.w3.org/TR/loop-next']]),
        text: async () => ''
      })
    }
  );
  assert.equal(redirectLoopRes.verification_method, 'http_retrieval_failed');
  assert.equal(redirectLoopRes.verification_status, 'downgraded_unverified');

  // 3. DNS Resolution & DNS Rebinding Prevention:
  // 3a. Domain that resolves to a private IP (e.g., 10.0.0.42 or mixed public + 192.168.1.10) is blocked before fetch
  let dnsPrivateFetchCalled = false;
  const dnsPrivateRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://internal-alias.example.com/status',
      supporting_excerpt: 'Internal status page content.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => [
        { address: '93.184.216.34', family: 4 },
        { address: '192.168.1.10', family: 4 } // Mixed record containing private IP must be rejected!
      ],
      fetchImpl: async () => {
        dnsPrivateFetchCalled = true;
        return { status: 200, ok: true, text: async () => 'secret' };
      }
    }
  );
  assert.equal(dnsPrivateFetchCalled, false, 'Must not connect when DNS resolves to any private IP');
  assert.equal(dnsPrivateRes.verification_method, 'ssrf_blocked');
  assert.equal(dnsPrivateRes.verification_status, 'downgraded_unverified');

  // 3b. DNS Rebinding Attack Scenario 1: First lookup returns public IP 93.184.216.34, second lookup returns 127.0.0.1
  let rebindLookupCall = 0;
  let rebindFetchCalled = false;
  const rebindToLoopbackRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://rebind-attacker.example.com/steal',
      supporting_excerpt: 'Attempting DNS rebinding to loopback.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => {
        rebindLookupCall += 1;
        if (rebindLookupCall === 1) {
          return [{ address: '93.184.216.34', family: 4 }];
        }
        return [{ address: '127.0.0.1', family: 4 }];
      },
      fetchImpl: async () => {
        rebindFetchCalled = true;
        return { status: 200, ok: true, text: async () => 'secret' };
      }
    }
  );
  assert.equal(rebindLookupCall, 2);
  assert.equal(rebindFetchCalled, false, 'Must abort before fetch when DNS rebinds to loopback');
  assert.equal(rebindToLoopbackRes.verification_method, 'ssrf_dns_rebinding_blocked');
  assert.equal(rebindToLoopbackRes.verification_status, 'downgraded_unverified');

  // 3c. DNS Rebinding Attack Scenario 2: First lookup returns 93.184.216.34, second lookup switches to a completely disjoint IP 198.51.100.99
  let disjointLookupCall = 0;
  await assert.rejects(
    async () => {
      await validatePublicTargetWithDns('https://fast-flux-rebind.example.com/data', {
        dnsLookup: async () => {
          disjointLookupCall += 1;
          return disjointLookupCall === 1
            ? [{ address: '93.184.216.34', family: 4 }]
            : [{ address: '93.184.216.99', family: 4 }];
        }
      });
    },
    (err) => err.code === 'ERR_SSRF_DNS_REBINDING'
  );

  // 4. Response Size Limits (Oversized Response Prevention):
  // 4a. Reject response declaring Content-Length > MAX_SOURCE_RESPONSE_BYTES (512 KB)
  const oversizedHeaderRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://www.w3.org/TR/huge-file',
      supporting_excerpt: 'Checking oversized Content-Length rejection.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async () => ({
        status: 200,
        ok: true,
        headers: new Map([['content-length', String(MAX_SOURCE_RESPONSE_BYTES + 1024)]]),
        text: async () => 'small body but huge content-length header'
      })
    }
  );
  assert.equal(oversizedHeaderRes.verification_method, 'response_too_large');
  assert.equal(oversizedHeaderRes.verification_status, 'downgraded_unverified');
  assert.equal(oversizedHeaderRes.evidence_tier, 'assumption');

  // 4b. Reject response whose actual streamed/buffered body exceeds MAX_SOURCE_RESPONSE_BYTES without Content-Length header
  const hugeBodyString = 'A'.repeat(MAX_SOURCE_RESPONSE_BYTES + 2048);
  const oversizedBodyRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://www.w3.org/TR/huge-stream',
      supporting_excerpt: 'AAAAChecking oversized body rejection.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async () => ({
        status: 200,
        ok: true,
        headers: new Map(),
        text: async () => hugeBodyString
      })
    }
  );
  assert.equal(oversizedBodyRes.verification_method, 'response_too_large');
  assert.equal(oversizedBodyRes.verification_status, 'downgraded_unverified');

  // 5. Internal Network Error Redaction:
  // Confirm internal IP addresses and raw socket error codes (ECONNREFUSED 10.0.0.8:6379) are never exposed in verification notes
  const internalErrRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://www.w3.org/TR/socket-error',
      supporting_excerpt: 'Testing error sanitization.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => [{ address: '93.184.216.34', family: 4 }],
      fetchImpl: async () => {
        throw new Error('connect ECONNREFUSED 10.0.0.8:6379 internal redis cluster');
      }
    }
  );
  assert.ok(
    !internalErrRes.source_citation.includes('10.0.0.8'),
    'Internal IP must be redacted from error citation'
  );
  assert.ok(
    !internalErrRes.source_citation.includes('ECONNREFUSED'),
    'Raw socket error code ECONNREFUSED must be redacted'
  );

  // 6. Content Hash Validation (Phase 7.2 Requirement 2):
  // Confirm computeContentHash produces a full 64-character SHA-256 hex digest and isValidSha256Hex rejects truncated 32-char hashes
  const sampleDigest = computeContentHash('Sample source body content for SHA-256 validation');
  assert.equal(sampleDigest.length, 64);
  assert.match(sampleDigest, /^[a-f0-9]{64}$/);
  assert.equal(isValidSha256Hex(sampleDigest), true);
  assert.equal(isValidSha256Hex(sampleDigest.slice(0, 32)), false, 'Truncated 32-char hash must be rejected by isValidSha256Hex');

  // Confirm verifyAndClassifyEvidence refuses to mark a finding as verified if only a truncated 32-char source_content_hash is supplied without raw content
  const truncatedHashCheck = verifyAndClassifyEvidence({
    claim_type: 'demand',
    statement: 'Testing truncated hash rejection.',
    evidence_tier: 'verified_evidence',
    source_url: 'https://www.w3.org/TR/hash-test',
    supporting_excerpt: 'Valid excerpt over 15 characters long.',
    excerpt_verified_in_source: 1,
    source_content_hash: sampleDigest.slice(0, 32), // Only 32 chars!
    http_status: 200
  });
  assert.notEqual(
    truncatedHashCheck.verification_status,
    'verified',
    'Must not mark evidence as verified when source_content_hash is truncated (< 64 hex chars)'
  );

  // Confirm computeEvidenceFingerprint remains a separate 24-character deduplication key
  const dedupFp = computeEvidenceFingerprint({
    opportunityId: 'opp-a11y-design-kit',
    normalizedUrl: 'https://www.w3.org/TR/hash-test',
    statement: 'Testing truncated hash rejection.',
    claimType: 'demand'
  });
  assert.equal(dedupFp.length, 24);
  assert.notEqual(dedupFp, sampleDigest);
});

test('8. Milestone M-V1.1 — Evidence Integrity: Per-item SHA-256 hash attribution, trailing-slash redirects, JSON-LD extraction & 4-category evidence classification', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  // 1. Per-item SHA-256 hash attribution on multi-item GitHub & WordPress search responses
  ctx.researchEngine.fetchFn = async (url) => {
    if (url.includes('api.github.com/search/repositories')) {
      return {
        status: 200,
        ok: true,
        url,
        text: async () =>
          JSON.stringify({
            items: [
              {
                id: 101,
                full_name: 'incluud/color-contrast-checker',
                html_url: 'https://github.com/incluud/color-contrast-checker',
                description:
                  'Validate WCAG 2.2 AA/AAA contrast ratios, generate accessible OKLCH color palettes, and export tokens.',
                stargazers_count: 27,
                open_issues_count: 2,
                updated_at: '2026-10-15T00:00:00Z'
              },
              {
                id: 202,
                full_name: 'Kl-webmedia/wunderui-contrast',
                html_url: 'https://github.com/Kl-webmedia/wunderui-contrast',
                description: 'Zero-dependency WCAG 2.1 and APCA color contrast engine for design tokens.',
                stargazers_count: 1,
                open_issues_count: 0,
                updated_at: '2026-10-14T00:00:00Z'
              }
            ]
          })
      };
    }
    return {
      status: 200,
      ok: true,
      url,
      text: async () =>
        JSON.stringify({
          plugins: [
            {
              name: 'OneClick Chat to Order',
              slug: 'oneclick-whatsapp-order',
              version: '1.0.8',
              active_installs: 30000,
              rating: 96,
              num_ratings: 112,
              last_updated: '2026-10-10',
              short_description: 'Make it easy for your customers to order via WhatsApp chat button.'
            },
            {
              name: 'TrackKaro Courier Booking',
              slug: 'dango-trackkar',
              version: '1.0.1',
              active_installs: 20,
              rating: 0,
              num_ratings: 0,
              last_updated: '2026-10-09',
              short_description: 'Book shipments with PostEx, TCS, and Leopards Courier in Pakistan.'
            }
          ]
        })
    };
  };

  const ghBatchRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'design tokens wcag contrast',
    opportunity_id: 'opp-a11y-design-kit',
    source_ids: ['src-github-public'],
    fetch_live_public: true
  });
  assert.equal(ghBatchRun.created_findings.length, 2);
  const [ghEv1, ghEv2] = ghBatchRun.created_findings;
  assert.ok(isValidSha256Hex(ghEv1.source_content_hash));
  assert.ok(isValidSha256Hex(ghEv2.source_content_hash));
  assert.notEqual(
    ghEv1.source_content_hash,
    ghEv2.source_content_hash,
    'Two different GitHub repositories from a single search API call MUST have distinct SHA-256 content hashes'
  );

  const wpBatchRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'woocommerce whatsapp cod',
    opportunity_id: 'opp-wp-ux-audit-blocks',
    source_ids: ['src-wp-plugin-api'],
    fetch_live_public: true
  });
  assert.equal(wpBatchRun.created_findings.length, 2);
  const [wpEv1, wpEv2] = wpBatchRun.created_findings;
  assert.ok(isValidSha256Hex(wpEv1.source_content_hash));
  assert.ok(isValidSha256Hex(wpEv2.source_content_hash));
  assert.notEqual(
    wpEv1.source_content_hash,
    wpEv2.source_content_hash,
    'Two different WordPress plugins from a single search API call MUST have distinct SHA-256 content hashes'
  );

  // 2. Trailing-slash preservation & 301 redirect resolution (no redirect loop on /path -> /path/)
  const slashCheck = extractValidPublicUrl('https://www.w3.org/TR/2024/REC-WCAG22-20241212/');
  assert.equal(slashCheck.valid, true);
  assert.equal(
    slashCheck.normalizedUrl,
    'https://www.w3.org/TR/2024/REC-WCAG22-20241212/',
    'Trailing slash on non-root path must be preserved'
  );

  let requestedUrls = [];
  const redirectSlashRes = await retrieveAndVerifySourceContent(
    {
      source_url: 'https://wordpress.org/plugins/oneclick-whatsapp-order',
      supporting_excerpt: 'Make it easy for your customers to order via WhatsApp chat button.',
      evidence_tier: 'verified_evidence'
    },
    {
      dnsLookup: async () => [{ address: '198.143.164.252', family: 4 }],
      fetchImpl: async (url) => {
        requestedUrls.push(url);
        if (!url.endsWith('/')) {
          return {
            status: 301,
            ok: false,
            headers: new Map([['location', 'https://wordpress.org/plugins/oneclick-whatsapp-order/']]),
            text: async () => ''
          };
        }
        return {
          status: 200,
          ok: true,
          headers: new Map(),
          text: async () =>
            '<html><head><script type="application/ld+json">{"@context":"https://schema.org","description":"Make it easy for your customers to order via WhatsApp chat button."}</script><script>window.evil=1;</script></head><body><h1>OneClick Chat</h1></body></html>'
        };
      }
    }
  );
  assert.deepEqual(requestedUrls, [
    'https://wordpress.org/plugins/oneclick-whatsapp-order',
    'https://wordpress.org/plugins/oneclick-whatsapp-order/'
  ]);
  assert.equal(redirectSlashRes.verification_status, 'verified');
  assert.equal(redirectSlashRes.excerpt_verified_in_source, 1, 'JSON-LD description inside <script type="application/ld+json"> must be extracted and verified');

  // 3. Confirm executable <script> is still stripped while JSON-LD is preserved
  const normJsonLd = normalizeTextForVerification(
    '<script>const secretToken = "DO_NOT_KEEP";</script><script type="application/ld+json">{"description":"Keep this schema description"}</script>'
  );
  assert.ok(!normJsonLd.includes('DO_NOT_KEEP'));
  assert.ok(normJsonLd.includes('Keep this schema description'));

  // 4. Verify 4 distinct commercial evidence categories (Problem Existence, Market Demand, Competitor Activity, Willingness to Pay)
  const sampleEvs = [
    verifyAndClassifyEvidence({
      evidence_tier: 'verified_evidence',
      claim_type: 'technical',
      statement: 'W3C WCAG 2.2 normative specification requires 2.5.3 Label in Name compliance.',
      source_url: 'https://www.w3.org/TR/WCAG22/',
      supporting_excerpt: 'Success Criterion 2.5.3 Label in Name is normative for all user interface components.',
      retrieved_source_content: 'W3C WCAG 2.2: Success Criterion 2.5.3 Label in Name is normative for all user interface components.',
      http_status: 200
    }),
    verifyAndClassifyEvidence({
      evidence_tier: 'verified_evidence',
      claim_type: 'demand',
      statement: 'EU web agencies actively searching for EAA compliance handoff workflows.',
      source_url: 'https://news.ycombinator.com/item?id=49922924',
      supporting_excerpt: 'Our agency clients are demanding EAA compliance checklists before signing off on redesigns.',
      retrieved_source_content: 'HN 49922924: Our agency clients are demanding EAA compliance checklists before signing off on redesigns.',
      http_status: 200
    }),
    verifyAndClassifyEvidence({
      evidence_tier: 'verified_evidence',
      claim_type: 'competitor',
      statement: 'Open-source GitHub repository incluud/color-contrast-checker (27 stars; indicates technical alternative, not commercial willingness to pay).',
      source_url: 'https://github.com/incluud/color-contrast-checker',
      supporting_excerpt: 'Validate WCAG 2.2 AA/AAA contrast ratios and export tokens.',
      retrieved_source_content: '{"description":"Validate WCAG 2.2 AA/AAA contrast ratios and export tokens."}',
      http_status: 200
    }),
    verifyAndClassifyEvidence({
      evidence_tier: 'verified_evidence',
      claim_type: 'pricing',
      statement: 'Verified buyer willingness to pay: 3 agencies paid $199 for an early-access commercial license pilot.',
      source_url: 'https://www.getstark.co/pricing/',
      supporting_excerpt: 'Team commercial license plan is $199 per year billed annually for agency teams.',
      retrieved_source_content: 'Pricing page: Team commercial license plan is $199 per year billed annually for agency teams.',
      http_status: 200
    })
  ];

  assert.equal(sampleEvs[0].evidence_category, 'problem_existence');
  assert.equal(sampleEvs[1].evidence_category, 'market_demand');
  assert.equal(sampleEvs[2].evidence_category, 'competitor_activity');
  assert.equal(sampleEvs[3].evidence_category, 'willingness_to_pay');

  const eqSummary = analyzeOpportunityEvidenceQuality(sampleEvs);
  assert.equal(eqSummary.verified_problem_count, 1);
  assert.equal(eqSummary.verified_demand_count, 1);
  assert.equal(eqSummary.verified_competitor_count, 1);
  assert.equal(eqSummary.verified_willingness_to_pay_count, 1);
});

test('9. Milestone M-V1.2 — Commercial Evaluation: Commercial readiness vs technical feasibility separation, WTP gating & dossier assumption labeling', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  // 1. Create an opportunity with high raw dimension inputs (9/10 across the board)
  //    but attach ONLY verified problem_existence (W3C spec) and competitor_activity (GitHub repo)
  const { opportunity: opp } = ctx.opportunityEngine.createOpportunity({
    title: 'SpecOnly Token Validator',
    category: 'Browser Based Utilities',
    problem_statement: 'Designers struggle to audit WCAG 2.2 token contrast ratios across light and dark modes.',
    target_audience: 'Design system teams at B2B SaaS companies',
    demand_summary: 'Spec and open-source tools exist.',
    competitors_summary: 'Open-source GitHub scripts.',
    alternatives_summary: 'Manual spreadsheet checks.',
    market_gaps: 'Automated token export.',
    differentiation_potential: 'Zero-setup browser inspector.',
    dev_complexity: 'low',
    estimated_dev_days: 7,
    operational_cost_monthly_usd: 0,
    monetization_model: '$49 one-time license',
    acquisition_strategy: 'Organic search',
    revenue_potential_notes: '$3,000/month within 90 days',
    main_risks: 'Free open-source tools may satisfy users.',
    required_capabilities: ['UX/UI Design', 'HTML/CSS', 'AI Assisted Software Development'],
    new_skills_needed: [],
    dimension_inputs: {
      problem_severity: 9.0,
      demand_evidence: 9.5,
      audience_accessibility: 8.5,
      competition_intensity: 8.0,
      differentiation: 9.0,
      development_feasibility: 9.5,
      initial_investment: 9.5,
      monetization_potential: 9.5,
      time_to_first_revenue: 8.5,
      long_term_scalability: 8.5
    }
  });

  // Add 1 verified problem_existence finding (W3C spec) and 1 verified competitor_activity finding (GitHub repo)
  ctx.opportunityEngine.addEvidence(opp.id, {
    evidence_tier: 'verified_evidence',
    claim_type: 'technical',
    statement: 'W3C WCAG 2.2 normative specification defines minimum contrast requirements.',
    source_url: 'https://www.w3.org/TR/WCAG22/',
    supporting_excerpt: 'Success Criterion 1.4.3 Contrast (Minimum) requires a contrast ratio of at least 4.5:1.',
    retrieved_source_content:
      'W3C WCAG 2.2 Normative Spec: Success Criterion 1.4.3 Contrast (Minimum) requires a contrast ratio of at least 4.5:1.',
    http_status: 200,
    retrieved_at: '2026-10-25T00:00:00Z'
  });

  ctx.opportunityEngine.addEvidence(opp.id, {
    evidence_tier: 'verified_evidence',
    claim_type: 'competitor',
    statement: 'Open-source GitHub repository incluud/color-contrast-checker (27 stars; indicates technical alternative, not commercial willingness to pay).',
    source_url: 'https://github.com/incluud/color-contrast-checker',
    supporting_excerpt: 'Validate WCAG 2.2 AA/AAA contrast ratios and export tokens.',
    retrieved_source_content: '{"description":"Validate WCAG 2.2 AA/AAA contrast ratios and export tokens."}',
    http_status: 200,
    retrieved_at: '2026-10-25T00:00:00Z'
  });

  const hydratedNoWtp = ctx.opportunityEngine.getOpportunityById(opp.id);
  const sbNoWtp = hydratedNoWtp.score_breakdown;

  // Verify problem existence + competitor activity are NOT mistaken for demand or willingness to pay
  assert.equal(sbNoWtp.evidence_summary.verified_problem_count, 1);
  assert.equal(sbNoWtp.evidence_summary.verified_competitor_count, 1);
  assert.equal(sbNoWtp.evidence_summary.verified_demand_count, 0);
  assert.equal(sbNoWtp.evidence_summary.verified_willingness_to_pay_count, 0);

  const demandDim = sbNoWtp.dimensions.find((d) => d.key === 'demand_evidence');
  const monetizationDim = sbNoWtp.dimensions.find((d) => d.key === 'monetization_potential');
  assert.equal(demandDim.score_out_of_10, 6.5, 'Demand evidence must be capped at 6.5 when only problem/competitor sources exist');
  assert.equal(monetizationDim.score_out_of_10, 6.5, 'Monetization potential must be capped at 6.5 when 0 WTP sources exist');

  // Verify Commercial Readiness vs Technical Feasibility separation
  assert.equal(hydratedNoWtp.commercial_validation_status, 'UNVERIFIED_WILLINGNESS_TO_PAY');
  assert.ok(hydratedNoWtp.technical_feasibility_score >= 85, 'Technical feasibility should remain high (>= 85)');
  assert.ok(
    hydratedNoWtp.commercial_readiness_score <= 58,
    `Commercial readiness (${hydratedNoWtp.commercial_readiness_score}) must be capped <= 58 when only problem/competitor evidence exists`
  );
  assert.ok(
    hydratedNoWtp.technical_feasibility_score - hydratedNoWtp.commercial_readiness_score >= 25,
    'Commercial readiness must be clearly separated from high technical feasibility'
  );
  assert.ok(sbNoWtp.warnings.some((w) => w.includes('[PROBLEM/COMPETITOR ONLY — NO VERIFIED DEMAND OR WTP]')));
  assert.ok(sbNoWtp.warnings.some((w) => w.includes('[UNVERIFIED WILLINGNESS TO PAY]')));

  // 2. Verify Dossier Markdown export includes disclaimer, dual sub-scores, 4-category table & assumption labels
  const dossierMd = ctx.opportunityEngine.exportOpportunityDossierMarkdown(opp.id);
  assert.ok(dossierMd.includes('SCORE DISCLAIMER:'));
  assert.ok(dossierMd.includes('NOT a probability of commercial success'));
  assert.ok(dossierMd.includes('Commercial Readiness Score:'));
  assert.ok(dossierMd.includes('Technical & Capability Feasibility Score:'));
  assert.ok(dossierMd.includes('Four-Category Commercial Evidence Classification'));
  assert.ok(dossierMd.includes('[UNVERIFIED COMMERCIAL ASSUMPTION — TARGET CUSTOMER]'));
  assert.ok(dossierMd.includes('[UNVERIFIED COMMERCIAL ASSUMPTION — REVENUE PROJECTION]'));

  // 3. Now add a verified willingness_to_pay record and verify commercial readiness unlocks
  ctx.opportunityEngine.addEvidence(opp.id, {
    evidence_tier: 'verified_evidence',
    claim_type: 'pricing',
    statement: 'Verified buyer willingness to pay: 4 design system leads paid $49 for early-access token validator licenses.',
    source_url: 'https://www.getstark.co/pricing/',
    supporting_excerpt: 'Pro commercial license plan is $49 per seat billed annually for design teams.',
    retrieved_source_content: 'Stark Pricing: Pro commercial license plan is $49 per seat billed annually for design teams.',
    http_status: 200,
    retrieved_at: '2026-10-25T00:00:00Z'
  });

  const hydratedWithWtp = ctx.opportunityEngine.getOpportunityById(opp.id);
  assert.equal(hydratedWithWtp.commercial_validation_status, 'VERIFIED_BUYER_WTP');
  assert.equal(hydratedWithWtp.score_breakdown.evidence_summary.verified_willingness_to_pay_count, 1);
  assert.ok(
    hydratedWithWtp.commercial_readiness_score > 80,
    `Commercial readiness (${hydratedWithWtp.commercial_readiness_score}) should unlock above 80 once WTP is verified`
  );
});

test('10. Milestone M-V1.3 & Final STRAW V1.0 Acceptance Suite: 4-View Workspace consolidation, streamlined intake, MVP plan blueprint & buyer validation criteria', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });
  const { server } = createAppServer(ctx);

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Verify UI Workspace consolidates 7 tabs into 4 clear V1 views
    const htmlRes = await fetch(`${baseUrl}/`);
    assert.equal(htmlRes.status, 200);
    const htmlText = await htmlRes.text();

    const navTabMatches = [...htmlText.matchAll(/<button[^>]+class="nav-tab[^"]*"[^>]*>([\s\S]*?)<\/button>/g)].map(
      (m) => m[1].trim()
    );
    assert.equal(navTabMatches.length, 4, 'Primary navigation must have exactly 4 consolidated V1 views');
    assert.deepEqual(navTabMatches, [
      '1. Discover &amp; Research',
      '2. Evaluate &amp; Compare',
      '3. Select &amp; Plan MVP',
      '4. Approvals &amp; Capabilities'
    ]);
    assert.ok(!htmlText.includes('data-tab="growth"'), 'Premature Growth & Monetization tab must be hidden in V1');
    assert.ok(
      htmlText.includes('class="advanced-assumptions-accordion"'),
      'Opportunity creation form must place advanced assumptions inside a collapsible accordion'
    );

    // 2. Promote an opportunity to an MVP Plan and verify all M-V1.3 MVP fields are generated
    const promoteRes = await fetch(`${baseUrl}/api/opportunities/opp-ux-flow-simulator/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.equal(promoteRes.status, 201);
    const { product } = await promoteRes.json();

    assert.ok(product.target_audience.length > 10);
    assert.ok(product.mvp_must_have_features.length > 20, 'Must include Must-Have V1 Features');
    assert.ok(product.mvp_excluded_scope.includes('Excluded from V1'), 'Must include Excluded Non-Goals');
    assert.ok(product.pricing_hypothesis.includes('[UNVERIFIED PRICING HYPOTHESIS]'), 'Must include Pricing Hypothesis');
    assert.ok(
      product.buyer_validation_criteria.includes('BUILD IF:') &&
        product.buyer_validation_criteria.includes('PIVOT IF:') &&
        product.buyer_validation_criteria.includes('ABANDON IF:'),
      'Must include explicit Build / Pivot / Abandon buyer validation criteria'
    );

    // 3. Update the MVP Plan via PATCH /api/products/:id and verify persistence
    const patchRes = await fetch(`${baseUrl}/api/products/${encodeURIComponent(product.id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_audience: 'Design system engineers at mid-market SaaS teams (5-50 designers)',
        mvp_must_have_features: '1. Paste CSS/JSON tokens. 2. Compute OKLCH Light/Dark contrast matrix. 3. Export WCAG 2.2 remediation diff.',
        mvp_excluded_scope: 'No Figma plugin sync in V1, no cloud user accounts, no team billing dashboard.',
        pricing_hypothesis: '$39 one-time individual CLI/Browser Pro license (unverified until 5 pre-orders).',
        buyer_validation_criteria: 'BUILD IF: >= 5 paid pre-orders at $39 within 14 days. PIVOT IF: Users demand CI/CD GitHub Action instead. ABANDON IF: < 2 pre-orders.'
      })
    });
    assert.equal(patchRes.status, 200);
    const { product: updatedProduct } = await patchRes.json();
    assert.equal(updatedProduct.target_audience, 'Design system engineers at mid-market SaaS teams (5-50 designers)');
    assert.ok(updatedProduct.mvp_must_have_features.includes('Compute OKLCH Light/Dark contrast matrix'));
    assert.ok(updatedProduct.mvp_excluded_scope.includes('No Figma plugin sync in V1'));
    assert.ok(updatedProduct.pricing_hypothesis.includes('$39 one-time'));
    assert.ok(updatedProduct.buyer_validation_criteria.includes('>= 5 paid pre-orders'));

    // 4. Verify exported Markdown Dossier includes Section 7 (Selected Opportunity MVP Plan)
    const expRes = await fetch(`${baseUrl}/api/opportunities/opp-ux-flow-simulator/export?format=markdown`);
    assert.equal(expRes.status, 200);
    const expMd = await expRes.text();
    assert.ok(expMd.includes('## 7. Selected Opportunity MVP Plan'));
    assert.ok(expMd.includes('Compute OKLCH Light/Dark contrast matrix'));
    assert.ok(expMd.includes('No Figma plugin sync in V1'));
    assert.ok(expMd.includes('>= 5 paid pre-orders'));
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
