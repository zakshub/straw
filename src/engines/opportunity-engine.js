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
      evidence
    };
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
