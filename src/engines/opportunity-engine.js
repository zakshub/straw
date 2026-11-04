import crypto from 'node:crypto';
import { scoreOpportunity } from './scoring-engine.js';
import {
  verifyAndClassifyEvidence,
  computeEvidenceFingerprint,
  analyzeOpportunityEvidenceQuality
} from './research-engine.js';

export const OPPORTUNITY_CATEGORIES = [
  'Micro SaaS Products',
  'Niche Websites',
  'AI Powered Tools',
  'Browser Based Utilities',
  'Interactive Web Applications',
  'Browser Games',
  'Digital Templates',
  'Figma Resources and Design Systems',
  'WordPress Themes and Plugins',
  'Educational Products',
  'Downloadable Guides and Resources',
  'Creative Production Systems',
  'Automation Products',
  'Industry Specific Software',
  'Emerging Digital Business Models'
];

export class OpportunityEngine {
  constructor(db, capabilityEngine, intelligenceEngine, approvalEngine) {
    this.db = db;
    this.capabilityEngine = capabilityEngine;
    this.intelligenceEngine = intelligenceEngine;
    this.approvalEngine = approvalEngine;
  }

  listOpportunities({ category, status } = {}) {
    let sql = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    sql += ' ORDER BY overall_score DESC, updated_at DESC';

    const rows = this.db.prepare(sql).all(...params);
    return rows.map((row) => this.hydrateOpportunity(row));
  }

  getOpportunityById(id) {
    const row = this.db.prepare('SELECT * FROM opportunities WHERE id = ?').get(id);
    if (!row) return null;
    return this.hydrateOpportunity(row);
  }

  hydrateOpportunity(row) {
    const evidence = this.db
      .prepare('SELECT * FROM market_evidence WHERE opportunity_id = ? ORDER BY observed_at DESC')
      .all(row.id);

    const competitors = this.db
      .prepare('SELECT * FROM opportunity_competitors WHERE opportunity_id = ? ORDER BY created_at ASC')
      .all(row.id);

    const requiredCapabilities = JSON.parse(row.required_capabilities_json || '[]');
    const newSkillsNeeded = JSON.parse(row.new_skills_needed_json || '[]');
    const dimensionInputs = JSON.parse(row.dimension_inputs_json || '{}');
    const scoreBreakdown = JSON.parse(row.score_breakdown_json || '{}');

    const capabilityFit = this.capabilityEngine.evaluateCapabilityFit({
      requiredCapabilities,
      newSkillsNeeded,
      devComplexity: row.dev_complexity
    });

    const evidenceQuality = analyzeOpportunityEvidenceQuality(evidence);

    return {
      ...row,
      required_capabilities: requiredCapabilities,
      new_skills_needed: newSkillsNeeded,
      dimension_inputs: dimensionInputs,
      score_breakdown: scoreBreakdown,
      capability_fit_detail: capabilityFit,
      evidence_quality_summary: evidenceQuality,
      evidence,
      competitors
    };
  }

  addCompetitor(
    opportunityId,
    {
      competitor_name,
      pricing_model = 'Unknown / Unverified',
      strengths = '',
      weaknesses_and_gaps = '',
      threat_level = 'moderate',
      evidence_tier = 'practitioner_observation',
      source_ref = 'Direct inspection'
    }
  ) {
    const opp = this.db.prepare('SELECT id FROM opportunities WHERE id = ?').get(opportunityId);
    if (!opp) throw new Error(`Opportunity ${opportunityId} not found.`);

    const id = `comp-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO opportunity_competitors (
          id, opportunity_id, competitor_name, pricing_model,
          strengths, weaknesses_and_gaps, threat_level, evidence_tier, source_ref, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        opportunityId,
        competitor_name.trim(),
        pricing_model.trim(),
        strengths.trim(),
        weaknesses_and_gaps.trim(),
        threat_level,
        evidence_tier,
        source_ref.trim(),
        now
      );

    return this.db.prepare('SELECT * FROM opportunity_competitors WHERE id = ?').get(id);
  }

  /**
   * Non-destructively simulates how an opportunity's score and recommendation
   * would change under hypothetical evidence, complexity, or dimension adjustments.
   */
  simulateOpportunityScore(opportunityId, overrides = {}) {
    const current = this.getOpportunityById(opportunityId);
    if (!current) throw new Error(`Opportunity ${opportunityId} not found.`);

    const simulatedComplexity = overrides.dev_complexity || current.dev_complexity;
    const simulatedCost =
      overrides.operational_cost_monthly_usd !== undefined
        ? Number(overrides.operational_cost_monthly_usd)
        : current.operational_cost_monthly_usd;

    const simulatedDimensions = {
      ...current.dimension_inputs,
      ...(overrides.dimension_inputs || {})
    };

    const simulatedEvidence = [...current.evidence];
    if (overrides.simulate_verified_evidence) {
      simulatedEvidence.push(
        verifyAndClassifyEvidence({
          evidence_tier: 'verified_evidence',
          claim_type: 'demand',
          statement: 'Simulated verified demand evidence from external public source',
          source_url: 'https://www.w3.org/TR/simulated-validation/',
          source_name: 'Simulated Public Verification Source',
          supporting_excerpt:
            'Simulated factual excerpt >= 15 chars demonstrating verified external buyer demand for sensitivity analysis.',
          retrieved_source_content:
            'W3C Specification Document: Simulated factual excerpt >= 15 chars demonstrating verified external buyer demand for sensitivity analysis.',
          http_status: 200,
          retrieved_at: new Date().toISOString(),
          verification_method: 'http_source_content_match'
        })
      );
    }

    const simulatedCapAssessment = this.capabilityEngine.evaluateCapabilityFit({
      requiredCapabilities: overrides.required_capabilities || current.required_capabilities,
      newSkillsNeeded: overrides.new_skills_needed || current.new_skills_needed,
      devComplexity: simulatedComplexity
    });

    const simulatedScore = scoreOpportunity({
      dimensionInputs: simulatedDimensions,
      evidenceRecords: simulatedEvidence,
      capabilityAssessment: simulatedCapAssessment,
      devComplexity: simulatedComplexity,
      operationalCostMonthlyUsd: simulatedCost
    });

    return {
      opportunity_id: opportunityId,
      baseline_score: current.overall_score,
      baseline_recommendation: current.recommendation,
      simulated_score: simulatedScore.overall_score,
      score_delta: Number((simulatedScore.overall_score - current.overall_score).toFixed(1)),
      simulated_recommendation: simulatedScore.recommendation,
      simulated_breakdown: simulatedScore
    };
  }

  exportOpportunityDossierMarkdown(opportunityId) {
    const opp = this.getOpportunityById(opportunityId);
    if (!opp) throw new Error(`Opportunity ${opportunityId} not found.`);

    const eq = opp.evidence_quality_summary;

    const lines = [
      `# STRAW Opportunity & Market Research Dossier: ${opp.title}`,
      ``,
      `- **ID:** \`${opp.id}\``,
      `- **Category:** ${opp.category}`,
      `- **Status:** \`${opp.status.toUpperCase()}\``,
      `- **Overall Score:** **${opp.overall_score} / 100**`,
      `- **Evidence Confidence:** **${Math.round(eq.average_confidence_score * 100)}%** (${eq.active_verified_count} active verified across ${eq.independent_verified_origins_count} origin(s), ${eq.stale_count} stale, ${eq.contradicting_count} contradicting)`,
      `- **Decision Engine Recommendation:** \`${opp.recommendation}\``,
      `- **Rationale:** ${opp.decision_rationale}`,
      ``,
      `---`,
      ``,
      `## 1. 15-Point Opportunity Evaluation (Facts vs. Estimates Separated)`,
      `1. **Problem Addressed [FACT/OBSERVATION]:** ${opp.problem_statement}`,
      `2. **Target Audience [SEGMENT]:** ${opp.target_audience}`,
      `3. **Demand Summary [EVIDENCE-BOUND]:** ${opp.demand_summary}`,
      `4. **Existing Competitors [MARKET FACT]:** ${opp.competitors_summary}`,
      `5. **Current Alternatives [WORKFLOW FACT]:** ${opp.alternatives_summary}`,
      `6. **Market Gaps [ANALYSIS]:** ${opp.market_gaps}`,
      `7. **Differentiation Potential [STRATEGY]:** ${opp.differentiation_potential}`,
      `8. **Development Complexity [ESTIMATE]:** \`${opp.dev_complexity}\``,
      `9. **Estimated Development Time [ESTIMATE]:** ${opp.estimated_dev_days} days`,
      `10. **Operational Cost [ESTIMATE]:** $${opp.operational_cost_monthly_usd}/month`,
      `11. **Monetization Model [STRATEGY]:** ${opp.monetization_model}`,
      `12. **Customer Acquisition Strategy [STRATEGY]:** ${opp.acquisition_strategy}`,
      `13. **Revenue Potential [UNVERIFIED ESTIMATE]:** ${opp.revenue_potential_notes}`,
      `14. **Main Risks [RISK ANALYSIS]:** ${opp.main_risks}`,
      `15. **Owner Capability Fit [DETERMINISTIC FACT: ${opp.capability_fit_detail.fit_score}/10]:** ${opp.capability_fit_detail.summary}`,
      ``,
      `## 2. Transparent 11-Dimension Score Breakdown`,
      `| Dimension | Weight | Score (1-10) | Weighted Points |`,
      `| :--- | :--- | :--- | :--- |`,
      ...(opp.score_breakdown.dimensions || []).map(
        (d) => `| ${d.label} | ${d.weight_pct}% | ${d.score_out_of_10}/10 | +${d.weighted_points} |`
      ),
      ``,
      `## 3. Attributed Market Evidence Library (${opp.evidence.length} Records)`,
      ...opp.evidence.map(
        (e) =>
          `- **[${e.evidence_tier.toUpperCase()} | Status: ${e.verification_status} | Method: \`${
            e.verification_method || 'unverified'
          }\` | Conf: ${Math.round((e.confidence_score || 0.3) * 100)}% | Stance: ${e.stance}]** (${e.claim_type}): ${e.statement}\n  - *Original URL:* ${
            e.original_source_url || e.source_url || e.source_citation
          } | *Final URL:* ${e.final_source_url || e.source_url || 'N/A'} | *HTTP:* ${
            e.http_status || 'N/A'
          } | *Content Hash:* \`${e.source_content_hash || 'none'}\`\n  - *Source:* ${
            e.source_name
          } | *Methodology:* \`${e.research_methodology}\` | *Discovered:* ${e.observed_at.slice(0, 10)}${
            e.published_at ? ` | *Published:* ${e.published_at.slice(0, 10)}` : ''
          }\n  - *Excerpt / Verification Note:* ${e.supporting_excerpt || e.verification_notes}`
      ),
      ``,
      `## 4. Structured Competitor Matrix (${opp.competitors.length} Records)`,
      ...(opp.competitors.length === 0
        ? ['_No structured competitor rows logged yet._']
        : opp.competitors.map(
            (c) =>
              `- **${c.competitor_name}** (${c.pricing_model} | Threat: \`${c.threat_level}\` | Provenance: \`${c.evidence_tier}\`): Strengths: ${c.strengths}. Gaps: ${c.weaknesses_and_gaps}.`
          ))
    ];

    return lines.join('\n');
  }

  createOpportunity(payload) {
    const now = new Date().toISOString();
    const id = payload.id || `opp-${crypto.randomUUID().slice(0, 8)}`;
    const slug =
      payload.slug ||
      payload.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
        '-' +
        id.slice(-4);

    const rawInitialEvidence = Array.isArray(payload.evidence) ? payload.evidence : [];
    const classifiedInitial = rawInitialEvidence.map((e) => verifyAndClassifyEvidence(e));
    const hasVerifiedEvidence = classifiedInitial.some(
      (e) => e.evidence_tier === 'verified_evidence' && e.verification_status === 'verified' && !e.is_stale
    );

    // Check against previously rejected opportunities
    const overlapCheck = this.intelligenceEngine.checkRejectedIdeaOverlap({
      title: payload.title,
      category: payload.category,
      problem_statement: payload.problem_statement,
      hasNewVerifiedEvidence: hasVerifiedEvidence
    });

    const requiredCapabilities = payload.required_capabilities || [];
    const newSkillsNeeded = payload.new_skills_needed || [];
    const devComplexity = payload.dev_complexity || 'manageable';

    const capabilityAssessment = this.capabilityEngine.evaluateCapabilityFit({
      requiredCapabilities,
      newSkillsNeeded,
      devComplexity
    });

    const dimensionInputs = payload.dimension_inputs || {};
    const scoringResult = scoreOpportunity({
      dimensionInputs,
      evidenceRecords: classifiedInitial,
      capabilityAssessment,
      devComplexity,
      operationalCostMonthlyUsd: Number(payload.operational_cost_monthly_usd) || 0
    });

    if (overlapCheck.blocked_by_prior_rejection) {
      scoringResult.warnings.unshift(
        `Previously Rejected Idea Overlap: Similar to "${overlapCheck.overlapping_rejections[0].rejected_title}" (Reason: ${overlapCheck.overlapping_rejections[0].rejection_reason}). New verified evidence is required before reconsidering.`
      );
    }

    const status = payload.status || (scoringResult.recommendation === 'REJECT_WEAK_IDEA' ? 'evaluating' : 'discovered');

    this.db
      .prepare(`
        INSERT INTO opportunities (
          id, title, slug, category, status,
          problem_statement, target_audience, demand_summary,
          competitors_summary, alternatives_summary, market_gaps,
          differentiation_potential, dev_complexity, estimated_dev_days,
          operational_cost_monthly_usd, monetization_model, acquisition_strategy,
          revenue_potential_notes, main_risks,
          required_capabilities_json, new_skills_needed_json, learning_cost_notes,
          dimension_inputs_json, overall_score, recommendation,
          score_breakdown_json, decision_rationale,
          rejection_reason, invalidation_conditions,
          created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?,
          ?, ?, ?,
          ?, ?, ?,
          ?, ?,
          ?, ?,
          ?, ?
        )
      `)
      .run(
        id,
        payload.title.trim(),
        slug,
        payload.category,
        status,
        payload.problem_statement.trim(),
        payload.target_audience.trim(),
        payload.demand_summary.trim(),
        payload.competitors_summary.trim(),
        payload.alternatives_summary.trim(),
        payload.market_gaps.trim(),
        payload.differentiation_potential.trim(),
        devComplexity,
        Number(payload.estimated_dev_days) || 14,
        Number(payload.operational_cost_monthly_usd) || 0,
        payload.monetization_model.trim(),
        payload.acquisition_strategy.trim(),
        payload.revenue_potential_notes.trim(),
        payload.main_risks.trim(),
        JSON.stringify(requiredCapabilities),
        JSON.stringify(newSkillsNeeded),
        capabilityAssessment.learning_cost_estimate,
        JSON.stringify(dimensionInputs),
        scoringResult.overall_score,
        scoringResult.recommendation,
        JSON.stringify(scoringResult),
        scoringResult.decision_rationale,
        payload.rejection_reason || '',
        payload.invalidation_conditions || '',
        now,
        now
      );

    for (const ev of rawInitialEvidence) {
      this.addEvidence(id, ev, { skipRescore: true, ignoreDuplicates: true });
    }

    this.rescoreOpportunity(id);
    return {
      opportunity: this.getOpportunityById(id),
      overlap_check: overlapCheck
    };
  }

  /**
   * Stores a research finding with strict source attribution, verification classification,
   * freshness check, and duplicate detection.
   */
  addEvidence(
    opportunityId,
    rawInput,
    { skipRescore = false, ignoreDuplicates = false } = {}
  ) {
    const classified = verifyAndClassifyEvidence(rawInput);
    const fingerprint = computeEvidenceFingerprint({
      opportunityId,
      normalizedUrl: classified.source_url,
      statement: classified.statement,
      claimType: classified.claim_type
    });

    // Check for duplicate finding on this opportunity
    const existingDup = this.db
      .prepare(
        `SELECT * FROM market_evidence
         WHERE opportunity_id = ?
           AND (content_fingerprint = ? OR (source_url != '' AND source_url = ? AND claim_type = ? AND statement = ?))`
      )
      .get(
        opportunityId,
        fingerprint,
        classified.source_url,
        classified.claim_type,
        classified.statement
      );

    if (existingDup) {
      if (ignoreDuplicates) {
        return { duplicate: true, existing: existingDup };
      }
      throw new Error(
        `Duplicate research finding detected: This claim or source URL is already recorded on opportunity ${opportunityId} (Existing ID: ${existingDup.id}).`
      );
    }

    const id = rawInput.id || `ev-${crypto.randomUUID().slice(0, 8)}`;

    this.db
      .prepare(`
        INSERT INTO market_evidence (
          id, opportunity_id, claim_type, statement,
          evidence_tier, requested_evidence_tier, source_citation,
          source_url, original_source_url, final_source_url,
          source_name, supporting_excerpt,
          published_at, observed_at, retrieved_at, http_status,
          source_content_hash, excerpt_verified_in_source, verification_method,
          confidence_score, source_reliability_score,
          verification_status, verification_notes,
          research_methodology, stance, is_stale, content_fingerprint, research_run_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        opportunityId,
        classified.claim_type,
        classified.statement,
        classified.evidence_tier,
        classified.requested_evidence_tier,
        classified.source_citation,
        classified.source_url,
        classified.original_source_url || classified.source_url,
        classified.final_source_url || classified.source_url,
        classified.source_name,
        classified.supporting_excerpt,
        classified.published_at,
        classified.observed_at,
        classified.retrieved_at || null,
        classified.http_status || null,
        classified.source_content_hash || '',
        classified.excerpt_verified_in_source ? 1 : 0,
        classified.verification_method || 'unverified',
        classified.confidence_score,
        classified.source_reliability_score,
        classified.verification_status,
        classified.verification_notes,
        classified.research_methodology,
        classified.stance,
        classified.is_stale,
        fingerprint,
        rawInput.research_run_id || null
      );

    if (!skipRescore) {
      this.rescoreOpportunity(opportunityId);
    }

    return this.db.prepare('SELECT * FROM market_evidence WHERE id = ?').get(id);
  }

  rescoreOpportunity(opportunityId) {
    const row = this.db.prepare('SELECT * FROM opportunities WHERE id = ?').get(opportunityId);
    if (!row) throw new Error(`Opportunity ${opportunityId} not found.`);

    const evidenceRecords = this.db
      .prepare('SELECT * FROM market_evidence WHERE opportunity_id = ?')
      .all(opportunityId);

    const requiredCapabilities = JSON.parse(row.required_capabilities_json || '[]');
    const newSkillsNeeded = JSON.parse(row.new_skills_needed_json || '[]');
    const dimensionInputs = JSON.parse(row.dimension_inputs_json || '{}');

    const capabilityAssessment = this.capabilityEngine.evaluateCapabilityFit({
      requiredCapabilities,
      newSkillsNeeded,
      devComplexity: row.dev_complexity
    });

    const scoringResult = scoreOpportunity({
      dimensionInputs,
      evidenceRecords,
      capabilityAssessment,
      devComplexity: row.dev_complexity,
      operationalCostMonthlyUsd: row.operational_cost_monthly_usd
    });

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE opportunities
        SET overall_score = ?,
            recommendation = ?,
            score_breakdown_json = ?,
            decision_rationale = ?,
            learning_cost_notes = ?,
            updated_at = ?
        WHERE id = ?
      `)
      .run(
        scoringResult.overall_score,
        scoringResult.recommendation,
        JSON.stringify(scoringResult),
        scoringResult.decision_rationale,
        capabilityAssessment.learning_cost_estimate,
        now,
        opportunityId
      );

    return this.getOpportunityById(opportunityId);
  }

  updateOpportunityStatus(opportunityId, { status, rejection_reason = '', invalidation_conditions = '', dimension_inputs }) {
    const row = this.db.prepare('SELECT * FROM opportunities WHERE id = ?').get(opportunityId);
    if (!row) throw new Error(`Opportunity ${opportunityId} not found.`);

    const now = new Date().toISOString();

    if (dimension_inputs) {
      this.db
        .prepare('UPDATE opportunities SET dimension_inputs_json = ?, updated_at = ? WHERE id = ?')
        .run(JSON.stringify(dimension_inputs), now, opportunityId);
      this.rescoreOpportunity(opportunityId);
    }

    if (status) {
      this.db
        .prepare(`
          UPDATE opportunities
          SET status = ?, rejection_reason = ?, invalidation_conditions = ?, updated_at = ?
          WHERE id = ?
        `)
        .run(
          status,
          rejection_reason || row.rejection_reason,
          invalidation_conditions || row.invalidation_conditions,
          now,
          opportunityId
        );

      if (status === 'rejected' && this.intelligenceEngine) {
        this.intelligenceEngine.recordEntry({
          entry_type: 'rejection_memory',
          related_opportunity_id: opportunityId,
          title: `Rejected Opportunity: ${row.title}`,
          summary: `Reason: ${rejection_reason || 'Weak demand evidence or low capability/ROI fit.'}`,
          evidence_tier: 'verified_evidence',
          future_implication: `Do not re-propose unless: ${invalidation_conditions || 'Verified buyer demand and clear differentiation emerge.'}`
        });
      } else if (status === 'approved' && this.intelligenceEngine) {
        this.intelligenceEngine.recordEntry({
          entry_type: 'business_decision',
          related_opportunity_id: opportunityId,
          title: `Approved Opportunity for Product Execution: ${row.title}`,
          summary: `Approved with score ${row.overall_score}/100 (${row.recommendation}).`,
          evidence_tier: 'verified_evidence',
          future_implication: 'Authorized to enter 15-stage product planning and execution workflow.'
        });
      }
    }

    return this.getOpportunityById(opportunityId);
  }
}
