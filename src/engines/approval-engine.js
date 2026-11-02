import crypto from 'node:crypto';

export const GATED_ACTION_CATEGORIES = [
  { key: 'spend_money', label: 'Spending Money' },
  { key: 'purchase_service', label: 'Purchasing Services / Subscriptions' },
  { key: 'publish_content', label: 'Publishing Public Content' },
  { key: 'launch_product', label: 'Launching Products Publicly' },
  { key: 'run_ads', label: 'Running Paid Advertisements' },
  { key: 'contact_customers', label: 'Contacting Customers' },
  { key: 'send_communications', label: 'Sending External Business Communications' },
  { key: 'production_change', label: 'Irreversible Production System Changes' }
];

export class ApprovalEngine {
  constructor(db, intelligenceEngine) {
    this.db = db;
    this.intelligenceEngine = intelligenceEngine;
  }

  listRequests({ status } = {}) {
    if (status) {
      return this.db
        .prepare('SELECT * FROM approval_requests WHERE status = ? ORDER BY requested_at DESC')
        .all(status);
    }
    return this.db
      .prepare('SELECT * FROM approval_requests ORDER BY requested_at DESC')
      .all();
  }

  createRequest({
    entity_type,
    entity_id,
    action_category,
    title,
    description,
    financial_commitment_usd = 0,
    is_public_action = true
  }) {
    const id = `appr-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO approval_requests (
          id, entity_type, entity_id, action_category, title, description,
          financial_commitment_usd, is_public_action, status, owner_decision_notes, requested_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', ?)
      `)
      .run(
        id,
        entity_type,
        entity_id,
        action_category,
        title.trim(),
        description.trim(),
        Number(financial_commitment_usd) || 0,
        is_public_action ? 1 : 0,
        now
      );

    return this.db.prepare('SELECT * FROM approval_requests WHERE id = ?').get(id);
  }

  decideRequest(id, { decision, owner_decision_notes = '' }) {
    if (!['approved', 'rejected'].includes(decision)) {
      throw new Error("Decision must be 'approved' or 'rejected'.");
    }

    const existing = this.db.prepare('SELECT * FROM approval_requests WHERE id = ?').get(id);
    if (!existing) {
      throw new Error(`Approval request ${id} not found.`);
    }

    const now = new Date().toISOString();
    this.db
      .prepare(`
        UPDATE approval_requests
        SET status = ?, owner_decision_notes = ?, decided_at = ?
        WHERE id = ?
      `)
      .run(decision, owner_decision_notes.trim(), now, id);

    // Side effects on linked entity when approved/rejected
    if (existing.entity_type === 'product' && existing.action_category === 'launch_product') {
      const nextStatus = decision === 'approved' ? 'launched' : 'testing';
      this.db
        .prepare('UPDATE products SET status = ?, updated_at = ? WHERE id = ?')
        .run(nextStatus, now, existing.entity_id);
    }

    if (existing.entity_type === 'growth_channel') {
      const nextStatus = decision === 'approved' ? 'active' : 'rejected';
      this.db
        .prepare('UPDATE growth_channels SET status = ?, updated_at = ? WHERE id = ?')
        .run(nextStatus, now, existing.entity_id);
    }

    if (this.intelligenceEngine) {
      this.intelligenceEngine.recordEntry({
        entry_type: 'business_decision',
        related_product_id: existing.entity_type === 'product' ? existing.entity_id : null,
        related_opportunity_id: existing.entity_type === 'opportunity' ? existing.entity_id : null,
        title: `Owner ${decision.toUpperCase()} Gate: ${existing.title}`,
        summary: `Action category: ${existing.action_category} ($${existing.financial_commitment_usd} financial impact). Notes: ${owner_decision_notes || 'No extra notes.'}`,
        evidence_tier: 'verified_evidence',
        future_implication:
          decision === 'approved'
            ? 'Authorized for controlled execution within approved budget and scope.'
            : 'Blocked from execution; preserve capital and public reputation.'
      });
    }

    return this.db.prepare('SELECT * FROM approval_requests WHERE id = ?').get(id);
  }
}
