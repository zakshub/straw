import test from 'node:test';
import assert from 'node:assert/strict';
import { createStrawContext } from '../src/context.js';
import { createAppServer } from '../src/server.js';
import {
  verifyAndClassifyEvidence,
  retrieveAndVerifySourceContent,
  detectUnsupportedWillingnessToPayClaim
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
  assert.ok(realVerified.source_content_hash.length === 32);

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

test('7. [CONTROLLED LIVE PUBLIC ENDPOINT TEST] Hacker News Algolia Free Public API live comment retrieval & content verification', async () => {
  const ctx = createStrawContext({ dbPath: ':memory:' });

  // Execute ONE controlled live request against the free public Hacker News Algolia comment search API
  const liveRun = await ctx.researchEngine.executeDiscoveryRun({
    query_topic: 'wcag accessibility',
    opportunity_id: 'opp-a11y-design-kit',
    source_ids: ['src-hn-algolia'],
    fetch_live_public: true
  });

  assert.equal(liveRun.status, 'completed');
  assert.ok(
    liveRun.findings_created_count >= 1,
    `Expected at least 1 live finding from HN Algolia API, got ${liveRun.findings_created_count}. Notes: ${liveRun.execution_notes}`
  );

  const firstFinding = liveRun.created_findings[0];
  assert.ok(firstFinding.source_url.startsWith('https://news.ycombinator.com/item?id='));
  assert.equal(firstFinding.http_status, 200);
  assert.ok(firstFinding.retrieved_at, 'Live finding must record retrieved_at timestamp');
  assert.ok(firstFinding.source_content_hash && firstFinding.source_content_hash.length === 32, 'Live finding must record SHA-256 source_content_hash');
  assert.ok(firstFinding.supporting_excerpt.length >= 15, 'Live finding must contain actual retrieved excerpt');
});
