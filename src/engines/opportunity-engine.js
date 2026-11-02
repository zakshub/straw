import crypto from 'node:crypto';
import { scoreOpportunity } from './scoring-engine.js';

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

    return {
      ...row,
      required_capabilities: requiredCapabilities,
      new_skills_needed: newSkillsNeeded,
      dimension_inputs: dimensionInputs,
      score_breakdown: scoreBreakdown,
      capability_fit_detail: capabilityFit,
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
      simulatedEvidence.push({
        evidence_tier: 'verified_evidence',
        claim_type: 'demand',
        statement: 'Simulated verified demand evidence'
      });
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

    const lines = [
      `# STRAW Opportunity Dossier: ${opp.title}`,
      ``,
      `- **ID:** \`${opp.id}\``,
      `- **Category:** ${opp.category}`,
      `- **Status:** \`${opp.status.toUpperCase()}\``,
      `- **Overall Score:** **${opp.overall_score} / 100**`,
      `- **Decision Engine Recommendation:** \`${opp.recommendation}\``,
      `- **Rationale:** ${opp.decision_rationale}`,
      ``,
      `---`,
      ``,
      `## 1. 15-Point Opportunity Evaluation`,
      `1. **Problem Addressed:** ${opp.problem_statement}`,
      `2. **Target Audience:** ${opp.target_audience}`,
      `3. **Demand Summary:** ${opp.demand_summary}`,
      `4. **Existing Competitors:** ${opp.competitors_summary}`,
      `5. **Current Alternatives:** ${opp.alternatives_summary}`,
      `6. **Market Gaps:** ${opp.market_gaps}`,
      `7. **Differentiation Potential:** ${opp.differentiation_potential}`,
      `8. **Development Complexity:** \`${opp.dev_complexity}\``,
      `9. **Estimated Development Time:** ${opp.estimated_dev_days} days`,
      `10. **Operational Cost:** $${opp.operational_cost_monthly_usd}/month`,
      `11. **Monetization Model:** ${opp.monetization_model}`,
      `12. **Customer Acquisition Strategy:** ${opp.acquisition_strategy}`,
      `13. **Revenue Potential (Honest Note):** ${opp.revenue_potential_notes}`,
      `14. **Main Risks:** ${opp.main_risks}`,
      `15. **Owner Capability Fit (${opp.capability_fit_detail.fit_score}/10):** ${opp.capability_fit_detail.summary}`,
      ``,
      `## 2. Transparent 11-Dimension Score Breakdown`,
      `| Dimension | Weight | Score (1-10) | Weighted Points |`,
      `| :--- | :--- | :--- | :--- |`,
      ...(opp.score_breakdown.dimensions || []).map(
        (d) => `| ${d.label} | ${d.weight_pct}% | ${d.score_out_of_10}/10 | +${d.weighted_points} |`
      ),
      ``,
      `## 3. Epistemic Market Evidence Ledger (${opp.evidence.length} Records)`,
      ...opp.evidence.map(
        (e) => `- **[${e.evidence_tier.toUpperCase()}] (${e.claim_type}):** ${e.statement} *(Source: ${e.source_citation})*`
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

    const initialEvidence = Array.isArray(payload.evidence) ? payload.evidence : [];
    const hasVerifiedEvidence = initialEvidence.some((e) => e.evidence_tier === 'verified_evidence');

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
      evidenceRecords: initialEvidence,
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

    for (const ev of initialEvidence) {
      this.addEvidence(id, ev, { skipRescore: true });
    }

    this.rescoreOpportunity(id);
    return {
      opportunity: this.getOpportunityById(id),
      overlap_check: overlapCheck
    };
  }

  addEvidence(opportunityId, { claim_type = 'demand', statement, evidence_tier = 'assumption', source_citation }, { skipRescore = false } = {}) {
    const id = `ev-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO market_evidence (
          id, opportunity_id, claim_type, statement, evidence_tier, source_citation, observed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(id, opportunityId, claim_type, statement.trim(), evidence_tier, source_citation.trim(), now);

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
