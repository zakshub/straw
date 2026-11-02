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
}
