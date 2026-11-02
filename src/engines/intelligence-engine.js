import crypto from 'node:crypto';

export class IntelligenceEngine {
  constructor(db) {
    this.db = db;
  }

  listEntries({ entryType } = {}) {
    if (entryType) {
      return this.db
        .prepare('SELECT * FROM business_intelligence_log WHERE entry_type = ? ORDER BY created_at DESC')
        .all(entryType);
    }
    return this.db
      .prepare('SELECT * FROM business_intelligence_log ORDER BY created_at DESC')
      .all();
  }

  recordEntry({
    entry_type,
    related_opportunity_id = null,
    related_product_id = null,
    title,
    summary,
    evidence_tier = 'practitioner_observation',
    future_implication
  }) {
    const id = `bi-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO business_intelligence_log (
          id, entry_type, related_opportunity_id, related_product_id,
          title, summary, evidence_tier, future_implication, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        entry_type,
        related_opportunity_id,
        related_product_id,
        title.trim(),
        summary.trim(),
        evidence_tier,
        future_implication.trim(),
        now
      );

    return this.db.prepare('SELECT * FROM business_intelligence_log WHERE id = ?').get(id);
  }

  /**
   * Checks whether a candidate opportunity repeats an already-rejected opportunity
   * without supplying new verified evidence.
   */
  checkRejectedIdeaOverlap({ title, category, problem_statement, hasNewVerifiedEvidence = false }) {
    const rejectedList = this.db
      .prepare("SELECT * FROM opportunities WHERE status = 'rejected'")
      .all();

    const candidateTokens = new Set(
      `${title} ${problem_statement}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 4)
    );

    const matches = [];
    for (const rej of rejectedList) {
      const rejTokens = `${rej.title} ${rej.problem_statement}`
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 4);

      const shared = rejTokens.filter((t) => candidateTokens.has(t));
      const uniqueShared = [...new Set(shared)];

      if (uniqueShared.length >= 2 || (rej.category === category && uniqueShared.length >= 1)) {
        matches.push({
          rejected_id: rej.id,
          rejected_title: rej.title,
          category: rej.category,
          rejection_reason: rej.rejection_reason,
          invalidation_conditions: rej.invalidation_conditions,
          shared_terms: uniqueShared
        });
      }
    }

    return {
      has_overlap: matches.length > 0,
      blocked_by_prior_rejection: matches.length > 0 && !hasNewVerifiedEvidence,
      overlapping_rejections: matches
    };
  }

  /**
   * Phase 5: Proactive Cross-Project Business Intelligence Synthesizer.
   * Analyzes capability leverage, evidence gaps, rejected patterns, and unexplored high-fit categories.
   */
  generateProactivePortfolioIntelligence({ capabilities = [], opportunities = [], products = [], pendingApprovals = [] }) {
    const topCapabilities = capabilities.filter((c) => c.proficiency_level >= 5).map((c) => c.name);
    const exploredCategories = new Set(opportunities.map((o) => o.category));

    const needsEvidenceOpps = opportunities.filter(
      (o) => o.recommendation === 'NEEDS_EVIDENCE' && o.status !== 'rejected'
    );
    const rejectedOpps = opportunities.filter((o) => o.status === 'rejected');

    const proactiveActions = [];

    for (const opp of needsEvidenceOpps) {
      proactiveActions.push({
        type: 'VALIDATION_UNLOCK',
        priority: 'HIGH',
        target: opp.title,
        recommendation: `"${opp.title}" has strong capability fit (${opp.capability_fit_detail?.fit_score ?? 8}/10) but is capped at ${opp.overall_score}/100 because it has 0 verified external evidence records. Log 1–2 verified competitor pricing or buyer search signals to unlock full scoring.`
      });
    }

    for (const prod of products) {
      if (prod.dependency_diagnostics?.next_critical_task) {
        const nextTask = prod.dependency_diagnostics.next_critical_task;
        proactiveActions.push({
          type: 'EXECUTION_NEXT_STEP',
          priority: 'HIGH',
          target: prod.name,
          recommendation: `Advance "${prod.name}" (${prod.completion_pct}% complete) by completing Stage ${nextTask.stage_number} (${nextTask.stage_name}): "${nextTask.title}" (${nextTask.estimated_hours}h estimated effort).`
        });
      }
    }

    if (pendingApprovals.length > 0) {
      proactiveActions.push({
        type: 'GOVERNANCE_CHECKPOINT',
        priority: 'URGENT',
        target: `${pendingApprovals.length} Pending Gate(s)`,
        recommendation: `Review ${pendingApprovals.length} pending human approval checkpoint(s) before committing funds or public releases.`
      });
    }

    const highFitUnexploredIdeas = [
      {
        category: 'Creative Production Systems',
        concept: 'Photographic & Anti-AI Realism Prompt + QC Blueprint System for Brand Studios',
        why_it_fits:
          'Directly monetizes your Level-5 Creative AI Production & Visual Workflows + Information Architecture strengths with $0 marginal hosting cost.'
      },
      {
        category: 'Digital Templates',
        concept: 'Interactive Product Discovery & 11-Dimension Venture Scoring Kit for Solo Founders',
        why_it_fits:
          'Productizes internal UX architecture and product strategy frameworks into a high-margin downloadable system.'
      },
      {
        category: 'Interactive Web Applications',
        concept: 'Visual Design System Token Contrast & Light/Dark Perceptual Pairing Calculator',
        why_it_fits:
          'Combines Senior UX/UI Design, HTML/CSS, and AI-Assisted Development into an organic search-intent magnet.'
      }
    ].filter((idea) => !exploredCategories.has(idea.category));

    return {
      generated_at: new Date().toISOString(),
      core_unfair_advantages: topCapabilities,
      anti_repeat_guardrails: rejectedOpps.map((r) => ({
        rejected_title: r.title,
        category: r.category,
        rule: r.rejection_reason || 'Avoid commodity wrappers without verified differentiation.'
      })),
      proactive_action_queue: proactiveActions,
      unexplored_high_fit_categories: highFitUnexploredIdeas
    };
  }
}
