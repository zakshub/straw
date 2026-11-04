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

  getRequestById(id) {
    if (!id) return null;
    return this.db.prepare('SELECT * FROM approval_requests WHERE id = ?').get(id) || null;
  }

  createRequest({
    entity_type,
    entity_id,
    action_category,
    title,
    description,
    financial_commitment_usd = 0,
    is_public_action = true,
    authorized_provider_id = '',
    authorization_scope = '',
    expires_at = null
  }) {
    const id = `appr-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    this.db
      .prepare(`
        INSERT INTO approval_requests (
          id, entity_type, entity_id, action_category, title, description,
          financial_commitment_usd, is_public_action, status, owner_decision_notes,
          requested_at, authorized_provider_id, authorization_scope, expires_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', ?, ?, ?, ?)
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
        now,
        String(authorized_provider_id || '').trim(),
        String(authorization_scope || '').trim(),
        expires_at || null
      );

    return this.getRequestById(id);
  }

  decideRequest(id, { decision, owner_decision_notes = '', expires_at }) {
    if (!['approved', 'rejected'].includes(decision)) {
      throw new Error("Decision must be 'approved' or 'rejected'.");
    }

    const existing = this.getRequestById(id);
    if (!existing) {
      throw new Error(`Approval request ${id} not found.`);
    }

    const now = new Date().toISOString();
    const nextExpiresAt = expires_at !== undefined ? expires_at : existing.expires_at;

    this.db
      .prepare(`
        UPDATE approval_requests
        SET status = ?, owner_decision_notes = ?, decided_at = ?, expires_at = ?
        WHERE id = ?
      `)
      .run(decision, owner_decision_notes.trim(), now, nextExpiresAt, id);

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

    return this.getRequestById(id);
  }

  /**
   * Milestone 1: Server-side Financial Authorization Verification.
   * Never trusts client-supplied approval booleans or statuses.
   * Validates existence, status === 'approved', non-expiration, action category,
   * provider identity, authorization scope, and spending limit.
   */
  verifyFinancialAuthorization({
    approvalRequestId,
    requiredProviderIds = [],
    requiredScope = 'paid_research_execution',
    requiredActionCategories = ['spend_money', 'purchase_service'],
    requestedCostUsd = 0,
    now = new Date()
  }) {
    if (!approvalRequestId || typeof approvalRequestId !== 'string' || !approvalRequestId.trim()) {
      return {
        authorized: false,
        code: 'MISSING_APPROVAL',
        reason: 'Missing approval_request_id. Paid API execution requires a verified server-side financial approval record.'
      };
    }

    const record = this.getRequestById(approvalRequestId.trim());
    if (!record) {
      return {
        authorized: false,
        code: 'MISSING_APPROVAL',
        reason: `Authorization record "${approvalRequestId}" does not exist in approval_requests.`
      };
    }

    if (record.status === 'pending') {
      return {
        authorized: false,
        code: 'PENDING_APPROVAL',
        reason: `Authorization record "${record.id}" is still pending owner review and has not been approved.`
      };
    }

    if (record.status !== 'approved') {
      return {
        authorized: false,
        code: 'REJECTED_APPROVAL',
        reason: `Authorization record "${record.id}" has status "${record.status}" and cannot authorize paid execution.`
      };
    }

    if (record.expires_at) {
      const expMs = Date.parse(record.expires_at);
      if (Number.isNaN(expMs) || expMs <= now.getTime()) {
        return {
          authorized: false,
          code: 'EXPIRED_APPROVAL',
          reason: `Authorization record "${record.id}" expired at ${record.expires_at}.`
        };
      }
    }

    if (!requiredActionCategories.includes(record.action_category)) {
      return {
        authorized: false,
        code: 'MISMATCHED_SCOPE_OR_PROVIDER',
        reason: `Authorization action_category "${record.action_category}" does not match required financial categories (${requiredActionCategories.join(', ')}).`
      };
    }

    if (requiredScope && record.authorization_scope !== requiredScope) {
      return {
        authorized: false,
        code: 'MISMATCHED_SCOPE_OR_PROVIDER',
        reason: `Authorization scope "${record.authorization_scope || 'none'}" does not match required scope "${requiredScope}".`
      };
    }

    const approvedProviders = (record.authorized_provider_id || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const reqProv of requiredProviderIds) {
      if (!approvedProviders.includes(reqProv)) {
        return {
          authorized: false,
          code: 'MISMATCHED_SCOPE_OR_PROVIDER',
          reason: `Authorization record "${record.id}" is scoped to provider(s) [${approvedProviders.join(', ') || 'none'}], which does not authorize requested provider "${reqProv}".`
        };
      }
    }

    const approvedLimit = Number(record.financial_commitment_usd) || 0;
    const requestedSpend = Number(requestedCostUsd) || 0;
    if (requestedSpend <= 0 || requestedSpend > approvedLimit) {
      return {
        authorized: false,
        code: 'EXCEEDED_SPENDING_LIMIT',
        reason: `Requested spend ($${requestedSpend} USD) exceeds approved financial limit ($${approvedLimit} USD) on authorization "${record.id}".`
      };
    }

    return {
      authorized: true,
      code: 'AUTHORIZED',
      authorization_ref: record.id,
      approvalRecord: record,
      reason: `Verified server-side financial approval "${record.id}" for provider(s) [${requiredProviderIds.join(', ')}] within $${approvedLimit} limit.`
    };
  }
}
