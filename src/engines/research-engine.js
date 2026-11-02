import crypto from 'node:crypto';

export const DEFAULT_RESEARCH_SOURCES = [
  {
    id: 'src-w3c-normative',
    name: 'W3C & Regulatory Normative Specifications',
    source_type: 'standards_body',
    base_url: 'https://www.w3.org',
    adapter_key: 'public_url_inspector',
    base_reliability_score: 0.95,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 30,
    terms_and_robots_note: 'Public normative technical standards; cite exact document URI and section.',
    enabled: 1
  },
  {
    id: 'src-wp-plugin-api',
    name: 'WordPress.org Official Plugin Directory API',
    source_type: 'product_directory',
    base_url: 'https://api.wordpress.org/plugins/info/1.2/',
    adapter_key: 'wordpress_plugins_api',
    base_reliability_score: 0.9,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 30,
    terms_and_robots_note: 'Official public JSON endpoint for plugin metadata, ratings, and active install counts.',
    enabled: 1
  },
  {
    id: 'src-hn-algolia',
    name: 'Hacker News Algolia Public Discussion API',
    source_type: 'public_forum',
    base_url: 'https://hn.algolia.com/api/v1/search',
    adapter_key: 'hn_algolia_api',
    base_reliability_score: 0.78,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 60,
    terms_and_robots_note: 'Public Algolia REST API for practitioner problem discussions and Show HN launches.',
    enabled: 1
  },
  {
    id: 'src-github-public',
    name: 'GitHub Public Repositories & Issues API',
    source_type: 'code_repository',
    base_url: 'https://api.github.com/search/repositories',
    adapter_key: 'github_repos_api',
    base_reliability_score: 0.85,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 10,
    terms_and_robots_note: 'Unauthenticated rate limit 10 req/min; respects GitHub API Acceptable Use Policies.',
    enabled: 1
  },
  {
    id: 'src-reddit-public',
    name: 'Reddit Public Discussions JSON Feed',
    source_type: 'public_forum',
    base_url: 'https://www.reddit.com/search.json',
    adapter_key: 'reddit_public_json',
    base_reliability_score: 0.7,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 10,
    terms_and_robots_note: 'Public read-only JSON with descriptive User-Agent; never scrape private/gated communities.',
    enabled: 1
  },
  {
    id: 'src-public-pricing-web',
    name: 'Public Competitor Website & Pricing Page Inspector',
    source_type: 'competitor_pricing',
    base_url: 'https://',
    adapter_key: 'public_url_inspector',
    base_reliability_score: 0.84,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 20,
    terms_and_robots_note: 'Direct inspection of publicly accessible pricing and product landing pages.',
    enabled: 1
  },
  {
    id: 'src-ecosystem-marketplaces',
    name: 'Public Ecosystem Marketplaces (Chrome Web Store / Figma Community / Product Hunt)',
    source_type: 'customer_reviews',
    base_url: 'https://',
    adapter_key: 'public_url_inspector',
    base_reliability_score: 0.86,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 20,
    terms_and_robots_note: 'Publicly listed extension, plugin, and design resource pages.',
    enabled: 1
  },
  {
    id: 'src-paid-keyword-api',
    name: 'Commercial Search Trend & Keyword Volume API (DataForSEO / Brave Paid)',
    source_type: 'search_provider',
    base_url: 'https://api.dataforseo.com',
    adapter_key: 'paid_search_provider',
    base_reliability_score: 0.9,
    requires_api_key: 1,
    is_paid_service: 1,
    rate_limit_rpm: 30,
    terms_and_robots_note: 'Paid external API. HARD-LOCKED: Cannot execute without Owner Financial Approval Gate and API credentials.',
    enabled: 0
  }
];

const DISALLOWED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'example.com',
  'www.example.com',
  'example.org',
  'test.invalid',
  'placeholder.com',
  'fake.url'
]);

const HIGH_RELIABILITY_DOMAINS = [
  { domain: 'w3.org', score: 0.96, name: 'W3C Normative Standard' },
  { domain: 'europa.eu', score: 0.95, name: 'EU Official Directive / Regulation' },
  { domain: 'wordpress.org', score: 0.9, name: 'WordPress.org Directory' },
  { domain: 'w3techs.com', score: 0.88, name: 'W3Techs Web Technology Surveys' },
  { domain: 'chromewebstore.google.com', score: 0.88, name: 'Chrome Web Store Listing' },
  { domain: 'figma.com', score: 0.86, name: 'Figma Community / Platform' },
  { domain: 'github.com', score: 0.85, name: 'GitHub Public Repository' },
  { domain: 'producthunt.com', score: 0.8, name: 'Product Hunt Launch Listing' },
  { domain: 'news.ycombinator.com', score: 0.78, name: 'Hacker News Discussion' },
  { domain: 'hn.algolia.com', score: 0.78, name: 'Hacker News Algolia Archive' },
  { domain: 'reddit.com', score: 0.72, name: 'Reddit Public Thread' },
  { domain: 'g2.com', score: 0.82, name: 'G2 Public Software Reviews' }
];

/**
 * Extracts and validates an HTTP/HTTPS URL from a string or explicit URL field.
 */
export function extractValidPublicUrl(rawUrl, fallbackText = '') {
  const candidate = (rawUrl && String(rawUrl).trim()) || '';
  let urlStr = candidate;

  if (!urlStr && fallbackText) {
    const match = String(fallbackText).match(/https?:\/\/[^\s)>\]"']+/i);
    if (match) {
      urlStr = match[0];
    }
  }

  if (!urlStr) return { valid: false, normalizedUrl: '', hostname: '', reason: 'Missing source URL.' };

  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, normalizedUrl: '', hostname: '', reason: 'URL must use http or https protocol.' };
    }
    const host = parsed.hostname.toLowerCase();
    if (
      DISALLOWED_HOSTNAMES.has(host) ||
      !host.includes('.') ||
      host.endsWith('.local') ||
      host.endsWith('.invalid') ||
      host.endsWith('.test')
    ) {
      return {
        valid: false,
        normalizedUrl: '',
        hostname: host,
        reason: `Hostname "${host}" is a placeholder/local host, not a verifiable public source.`
      };
    }

    parsed.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((p) =>
      parsed.searchParams.delete(p)
    );
    const normalized = parsed.toString().replace(/\/$/, '');
    return { valid: true, normalizedUrl: normalized, hostname: host, reason: 'Valid public URL.' };
  } catch {
    return { valid: false, normalizedUrl: '', hostname: '', reason: 'Malformed URL syntax.' };
  }
}

export function computeEvidenceFingerprint({ opportunityId, normalizedUrl, statement, claimType }) {
  const cleanStatement = String(statement || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const basis = normalizedUrl
    ? `${opportunityId}::${claimType}::${normalizedUrl.toLowerCase()}::${cleanStatement.slice(0, 120)}`
    : `${opportunityId}::${claimType}::no-url::${cleanStatement}`;

  return crypto.createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

/**
 * Enforces STRAW Phase 7 Evidence Verification & Quality Rules.
 * A user-supplied label or arbitrary string NEVER automatically makes a claim verified_evidence.
 */
export function verifyAndClassifyEvidence(input, nowDate = new Date()) {
  const requestedTier = input.evidence_tier || 'assumption';
  const statement = String(input.statement || '').trim();
  const sourceCitation = String(input.source_citation || input.source_url || '').trim();
  const supportingExcerpt = String(input.supporting_excerpt || '').trim();
  const methodology = String(input.research_methodology || 'manual_entry').trim();
  const stance = ['supporting', 'contradicting', 'neutral'].includes(input.stance)
    ? input.stance
    : 'supporting';

  const urlCheck = extractValidPublicUrl(input.source_url, sourceCitation);

  // Determine source reliability and name from domain if available
  let sourceReliability = Number(input.source_reliability_score);
  let detectedSourceName = String(input.source_name || '').trim();

  if (urlCheck.valid) {
    const matchedDomain = HIGH_RELIABILITY_DOMAINS.find(
      (d) => urlCheck.hostname === d.domain || urlCheck.hostname.endsWith(`.${d.domain}`)
    );
    if (matchedDomain) {
      if (!Number.isFinite(sourceReliability)) sourceReliability = matchedDomain.score;
      if (!detectedSourceName || detectedSourceName === 'Unspecified Source') {
        detectedSourceName = matchedDomain.name;
      }
    } else {
      if (!Number.isFinite(sourceReliability)) sourceReliability = 0.72;
      if (!detectedSourceName || detectedSourceName === 'Unspecified Source') {
        detectedSourceName = urlCheck.hostname;
      }
    }
  } else {
    sourceReliability = Number.isFinite(sourceReliability) ? Math.min(sourceReliability, 0.35) : 0.25;
    if (!detectedSourceName) detectedSourceName = 'Unverified / No URL';
  }

  // Check freshness / staleness
  const publishedAt = input.published_at ? String(input.published_at).trim() : null;
  const observedAt = input.observed_at ? String(input.observed_at).trim() : nowDate.toISOString();

  let isStale = 0;
  let ageDays = 0;
  const refDateStr = publishedAt || observedAt;
  const parsedDate = Date.parse(refDateStr);

  // Normative standards (e.g., w3.org) remain valid longer (2000 days) than volatile market/pricing claims (365 days)
  const maxFreshDays =
    urlCheck.valid && (urlCheck.hostname === 'w3.org' || urlCheck.hostname.endsWith('.w3.org'))
      ? 2200
      : 365;

  if (!Number.isNaN(parsedDate)) {
    ageDays = Math.floor((nowDate.getTime() - parsedDate) / (1000 * 60 * 60 * 24));
    if (ageDays > maxFreshDays) {
      isStale = 1;
    }
  }

  const isAiHypothesis =
    methodology.includes('ai_') ||
    methodology === 'llm_synthesis' ||
    detectedSourceName.toLowerCase().includes('ai hypothesis');

  let finalTier = requestedTier;
  let verificationStatus = 'pending_review';
  const notes = [];

  if (isAiHypothesis) {
    finalTier = 'assumption';
    verificationStatus = 'downgraded_unverified';
    notes.push('AI-generated hypotheses or LLM conclusions cannot be classified as verified source evidence.');
  } else if (requestedTier === 'verified_evidence') {
    if (!urlCheck.valid) {
      finalTier = 'assumption';
      verificationStatus = 'downgraded_unverified';
      notes.push(
        `Downgraded from verified_evidence to assumption: ${urlCheck.reason} A real, accessible http/https URL is required.`
      );
    } else if (supportingExcerpt.length < 15) {
      finalTier = 'practitioner_observation';
      verificationStatus = 'downgraded_unverified';
      notes.push(
        'Downgraded from verified_evidence to practitioner_observation: Missing a factual supporting excerpt (>= 15 chars) from the source.'
      );
    } else if (isStale) {
      finalTier = 'practitioner_observation';
      verificationStatus = 'stale';
      notes.push(
        `Evidence is stale (${ageDays} days old > ${maxFreshDays} day freshness limit) and cannot count as active verified demand evidence.`
      );
    } else if (sourceReliability < 0.5) {
      finalTier = 'practitioner_observation';
      verificationStatus = 'downgraded_unverified';
      notes.push(`Source reliability (${sourceReliability}) is below the 0.50 threshold for verified_evidence.`);
    } else {
      finalTier = 'verified_evidence';
      verificationStatus = 'verified';
      notes.push(`Verified attributable source (${detectedSourceName}) with supporting excerpt and fresh timestamp.`);
    }
  } else if (requestedTier === 'practitioner_observation') {
    if (isStale) {
      verificationStatus = 'stale';
      notes.push(`Observation is stale (${ageDays} days old).`);
    } else if (urlCheck.valid) {
      verificationStatus = 'verified';
      notes.push('Attributed practitioner observation with valid source URL.');
    } else {
      verificationStatus = 'pending_review';
      notes.push('Unlinked practitioner observation; lacks external URL attribution.');
    }
  } else {
    verificationStatus = isStale ? 'stale' : 'pending_review';
    notes.push(`Recorded as ${finalTier}.`);
  }

  // Calculate Confidence Score (0.05 to 0.98)
  const tierBaseMap = {
    verified_evidence: 0.85,
    practitioner_observation: 0.6,
    estimate: 0.4,
    assumption: 0.2
  };
  let confidence = (tierBaseMap[finalTier] || 0.25) * 0.6 + sourceReliability * 0.4;
  if (supportingExcerpt.length >= 30) confidence += 0.05;
  if (!urlCheck.valid) confidence = Math.min(confidence, 0.35);
  if (isStale) confidence *= 0.5;
  confidence = Number(Math.max(0.05, Math.min(0.98, confidence)).toFixed(2));

  return {
    statement,
    claim_type: input.claim_type || 'demand',
    requested_evidence_tier: requestedTier,
    evidence_tier: finalTier,
    source_citation: sourceCitation || urlCheck.normalizedUrl || 'No citation provided',
    source_url: urlCheck.normalizedUrl,
    source_name: detectedSourceName,
    supporting_excerpt: supportingExcerpt,
    published_at: publishedAt,
    observed_at: observedAt,
    confidence_score: confidence,
    source_reliability_score: Number(sourceReliability.toFixed(2)),
    verification_status: verificationStatus,
    verification_notes: notes.join(' '),
    research_methodology: methodology,
    stance,
    is_stale: isStale,
    hostname: urlCheck.hostname
  };
}

/**
 * Evaluates aggregate evidence quality, freshness, origin diversity, and conflicts for an opportunity.
 */
export function analyzeOpportunityEvidenceQuality(evidenceRecords = []) {
  const activeVerified = [];
  const staleRecords = [];
  const downgradedRecords = [];
  const supportingRecords = [];
  const contradictingRecords = [];
  const verifiedOrigins = new Set();

  for (const ev of evidenceRecords) {
    const isStale = Boolean(ev.is_stale) || ev.verification_status === 'stale';
    if (isStale) {
      staleRecords.push(ev);
    }
    if (ev.verification_status === 'downgraded_unverified') {
      downgradedRecords.push(ev);
    }
    if (ev.stance === 'contradicting') {
      contradictingRecords.push(ev);
    } else if (ev.stance === 'supporting') {
      supportingRecords.push(ev);
    }

    if (
      ev.evidence_tier === 'verified_evidence' &&
      ev.verification_status === 'verified' &&
      !isStale &&
      ev.stance !== 'contradicting'
    ) {
      activeVerified.push(ev);
      const urlInfo = extractValidPublicUrl(ev.source_url, ev.source_citation);
      if (urlInfo.valid) {
        verifiedOrigins.add(urlInfo.hostname);
      } else {
        verifiedOrigins.add(ev.source_name || ev.id);
      }
    }
  }

  const hasConflict = contradictingRecords.length > 0 && supportingRecords.length > 0;
  const hasAnyContradiction = contradictingRecords.length > 0;

  const avgConfidence =
    evidenceRecords.length > 0
      ? Number(
          (
            evidenceRecords.reduce((sum, e) => sum + (Number(e.confidence_score) || 0.25), 0) /
            evidenceRecords.length
          ).toFixed(2)
        )
      : 0;

  // Adjust overall evidence confidence for origin independence and conflicts
  let portfolioConfidence = avgConfidence;
  if (verifiedOrigins.size >= 2) {
    portfolioConfidence = Math.min(0.98, portfolioConfidence + 0.08);
  } else if (activeVerified.length === 0) {
    portfolioConfidence = Math.min(portfolioConfidence, 0.45);
  }
  if (hasAnyContradiction) {
    portfolioConfidence = Number(Math.max(0.1, portfolioConfidence - 0.22).toFixed(2));
  }

  return {
    total_records: evidenceRecords.length,
    active_verified_count: activeVerified.length,
    independent_verified_origins_count: verifiedOrigins.size,
    independent_origins: [...verifiedOrigins],
    practitioner_observation_count: evidenceRecords.filter(
      (e) => e.evidence_tier === 'practitioner_observation' && !e.is_stale
    ).length,
    estimate_count: evidenceRecords.filter((e) => e.evidence_tier === 'estimate').length,
    assumption_count: evidenceRecords.filter((e) => e.evidence_tier === 'assumption').length,
    stale_count: staleRecords.length,
    downgraded_unverified_count: downgradedRecords.length,
    supporting_count: supportingRecords.length,
    contradicting_count: contradictingRecords.length,
    has_conflicting_evidence: hasConflict || hasAnyContradiction,
    average_confidence_score: Number(portfolioConfidence.toFixed(2)),
    insufficient_evidence_warning:
      activeVerified.length === 0
        ? 'Insufficient verified evidence: 0 active, non-stale verified sources with valid URLs and excerpts.'
        : verifiedOrigins.size < 2
          ? 'Single-origin verified evidence: Add a second independent public source to reach high validation confidence.'
          : null
  };
}

export class ResearchEngine {
  constructor(db, opportunityEngine, aiOrchestrator, approvalEngine) {
    this.db = db;
    this.opportunityEngine = opportunityEngine;
    this.aiOrchestrator = aiOrchestrator;
    this.approvalEngine = approvalEngine;
  }

  ensureDefaultSources() {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO research_sources (
        id, name, source_type, base_url, adapter_key,
        base_reliability_score, requires_api_key, is_paid_service,
        rate_limit_rpm, terms_and_robots_note, enabled, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING
    `);

    for (const s of DEFAULT_RESEARCH_SOURCES) {
      stmt.run(
        s.id,
        s.name,
        s.source_type,
        s.base_url,
        s.adapter_key,
        s.base_reliability_score,
        s.requires_api_key,
        s.is_paid_service,
        s.rate_limit_rpm,
        s.terms_and_robots_note,
        s.enabled,
        now
      );
    }
  }

  listSources() {
    this.ensureDefaultSources();
    return this.db.prepare('SELECT * FROM research_sources ORDER BY base_reliability_score DESC').all();
  }

  listResearchRuns({ opportunityId } = {}) {
    if (opportunityId) {
      return this.db
        .prepare('SELECT * FROM research_runs WHERE opportunity_id = ? ORDER BY started_at DESC')
        .all(opportunityId)
        .map((r) => ({
          ...r,
          sources_queried: JSON.parse(r.sources_queried_json || '[]'),
          ai_synthesis: JSON.parse(r.ai_synthesis_json || '{}')
        }));
    }
    return this.db
      .prepare('SELECT * FROM research_runs ORDER BY started_at DESC LIMIT 50')
      .all()
      .map((r) => ({
        ...r,
        sources_queried: JSON.parse(r.sources_queried_json || '[]'),
        ai_synthesis: JSON.parse(r.ai_synthesis_json || '{}')
      }));
  }

  listAllEvidence({ opportunityId, verificationStatus, evidenceTier } = {}) {
    let sql = `
      SELECT me.*, o.title AS opportunity_title, o.category AS opportunity_category
      FROM market_evidence me
      LEFT JOIN opportunities o ON o.id = me.opportunity_id
      WHERE 1=1
    `;
    const params = [];
    if (opportunityId) {
      sql += ' AND me.opportunity_id = ?';
      params.push(opportunityId);
    }
    if (verificationStatus) {
      sql += ' AND me.verification_status = ?';
      params.push(verificationStatus);
    }
    if (evidenceTier) {
      sql += ' AND me.evidence_tier = ?';
      params.push(evidenceTier);
    }
    sql += ' ORDER BY me.observed_at DESC';
    return this.db.prepare(sql).all(...params);
  }

  /**
   * Manually review or update verification status of an existing evidence finding.
   * Note: Even manual review cannot promote a record to verified_evidence if it lacks a valid public URL!
   */
  reviewEvidenceRecord(evidenceId, { verification_status, reviewer_notes = '', stance }) {
    const existing = this.db.prepare('SELECT * FROM market_evidence WHERE id = ?').get(evidenceId);
    if (!existing) throw new Error(`Evidence record ${evidenceId} not found.`);

    const urlCheck = extractValidPublicUrl(existing.source_url, existing.source_citation);
    let nextStatus = verification_status || existing.verification_status;
    let nextTier = existing.evidence_tier;
    let notePrefix = reviewer_notes ? `[Manual Review]: ${reviewer_notes}` : existing.verification_notes;

    if (nextStatus === 'verified') {
      if (!urlCheck.valid || (existing.supporting_excerpt || '').trim().length < 15) {
        throw new Error(
          'Cannot mark evidence as verified without a valid public http/https source_url and a supporting_excerpt (>= 15 chars).'
        );
      }
      if (existing.is_stale) {
        throw new Error('Cannot mark stale evidence as active verified evidence.');
      }
      if (existing.requested_evidence_tier === 'verified_evidence') {
        nextTier = 'verified_evidence';
      }
    } else if (nextStatus === 'rejected') {
      nextTier = 'assumption';
    }

    const nextStance = stance || existing.stance;

    this.db
      .prepare(`
        UPDATE market_evidence
        SET verification_status = ?,
            evidence_tier = ?,
            stance = ?,
            verification_notes = ?
        WHERE id = ?
      `)
      .run(nextStatus, nextTier, nextStance, notePrefix, evidenceId);

    if (this.opportunityEngine) {
      this.opportunityEngine.rescoreOpportunity(existing.opportunity_id);
    }

    return this.db.prepare('SELECT * FROM market_evidence WHERE id = ?').get(evidenceId);
  }

  /**
   * Executes a Discovery / Research Run.
   * Supports:
   * - Ingesting attributed source findings with duplicate & conflict detection
   * - Optional live public API collection (Hacker News Algolia, WordPress.org Plugin API, Public URL inspection)
   * - Hard-blocking paid API sources unless explicitly approved by owner
   */
  async executeDiscoveryRun({
    query_topic,
    target_category = 'Browser Based Utilities',
    opportunity_id = null,
    source_ids = ['src-hn-algolia', 'src-wp-plugin-api'],
    ingested_findings = [],
    fetch_live_public = false,
    allow_paid_apis = false
  }) {
    this.ensureDefaultSources();
    const runId = `run-${crypto.randomUUID().slice(0, 8)}`;
    const startedAt = new Date().toISOString();

    const sources = this.listSources().filter((s) => source_ids.includes(s.id));

    // Check if any requested source is a paid service
    const paidSources = sources.filter((s) => s.is_paid_service === 1);
    if (paidSources.length > 0 && !allow_paid_apis) {
      const completedAt = new Date().toISOString();
      const note = `Blocked execution of paid research source(s) (${paidSources.map((p) => p.name).join(', ')}). Explicit Owner Financial Approval Gate is required before making paid API calls.`;

      if (this.approvalEngine) {
        this.approvalEngine.createRequest({
          entity_type: 'system',
          entity_id: runId,
          action_category: 'spend_money',
          title: `Paid Market Research API Authorization: ${paidSources.map((p) => p.name).join(', ')}`,
          description: `Discovery run for "${query_topic}" requested paid research provider(s). Approve only if paid API spend is authorized.`,
          financial_commitment_usd: 25,
          is_public_action: false
        });
      }

      this.db
        .prepare(`
          INSERT INTO research_runs (
            id, query_topic, target_category, opportunity_id, methodology,
            sources_queried_json, status, findings_created_count, duplicates_skipped_count,
            conflicts_detected_count, ai_synthesis_json, execution_notes, started_at, completed_at
          ) VALUES (?, ?, ?, ?, ?, ?, 'blocked_approval', 0, 0, 0, '{}', ?, ?, ?)
        `)
        .run(
          runId,
          query_topic,
          target_category,
          opportunity_id,
          'paid_api_blocked',
          JSON.stringify(sources.map((s) => s.name)),
          note,
          startedAt,
          completedAt
        );

      return this.listResearchRuns().find((r) => r.id === runId);
    }

    const collectedRawFindings = [...ingested_findings];
    const networkNotes = [];

    // If live public collection is requested, query legitimate free public JSON APIs with strict timeout
    if (fetch_live_public) {
      for (const src of sources) {
        try {
          if (src.adapter_key === 'hn_algolia_api') {
            const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query_topic)}&tags=story&hitsPerPage=3`;
            const res = await fetch(url, {
              headers: { 'User-Agent': 'STRAW-Research-Engine/0.7 (+https://github.com/zakshub/straw)' },
              signal: AbortSignal.timeout(4500)
            });
            if (res.ok) {
              const data = await res.json();
              for (const hit of data.hits || []) {
                if (hit.title && (hit.url || hit.objectID)) {
                  const hnUrl = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
                  collectedRawFindings.push({
                    claim_type: 'demand',
                    statement: `Public practitioner discussion on Hacker News: "${hit.title}" (${hit.points || 0} points, ${hit.num_comments || 0} comments).`,
                    evidence_tier: 'practitioner_observation',
                    source_url: hnUrl,
                    source_name: 'Hacker News Algolia Public API',
                    supporting_excerpt: `HN Story ID ${hit.objectID}: "${hit.title}" — ${hit.points || 0} upvotes and ${hit.num_comments || 0} practitioner comments discussing this topic.`,
                    published_at: hit.created_at || startedAt,
                    research_methodology: 'public_api_discovery',
                    stance: 'supporting'
                  });
                }
              }
              networkNotes.push(`Queried ${src.name} (${(data.hits || []).length} public records inspected).`);
            } else {
              networkNotes.push(`${src.name} returned HTTP ${res.status}.`);
            }
          } else if (src.adapter_key === 'wordpress_plugins_api') {
            const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${encodeURIComponent(query_topic)}&request[per_page]=3`;
            const res = await fetch(url, {
              headers: { 'User-Agent': 'STRAW-Research-Engine/0.7 (+https://github.com/zakshub/straw)' },
              signal: AbortSignal.timeout(4500)
            });
            if (res.ok) {
              const data = await res.json();
              for (const pl of data.plugins || []) {
                if (pl.name && pl.slug) {
                  collectedRawFindings.push({
                    claim_type: 'competitor',
                    statement: `WordPress.org Directory listing "${pl.name}" has ${pl.active_installs || 0}+ active installs and rating ${pl.rating || 0}/100.`,
                    evidence_tier: 'verified_evidence',
                    source_url: `https://wordpress.org/plugins/${pl.slug}/`,
                    source_name: 'WordPress.org Official Plugin Directory API',
                    supporting_excerpt: `Plugin "${pl.name}" (v${pl.version || '1.0'}): ${pl.active_installs || 0}+ active installations, ${pl.num_ratings || 0} public user ratings. Short description: ${String(pl.short_description || '').slice(0, 140)}`,
                    published_at: pl.last_updated || startedAt,
                    research_methodology: 'public_api_discovery',
                    stance: 'supporting'
                  });
                }
              }
              networkNotes.push(`Queried ${src.name} (${(data.plugins || []).length} plugins inspected).`);
            } else {
              networkNotes.push(`${src.name} returned HTTP ${res.status}.`);
            }
          }
        } catch (err) {
          networkNotes.push(`${src.name} live fetch skipped/unreachable (${err.message}); zero fabricated results.`);
        }
      }
    }

    let createdCount = 0;
    let duplicateCount = 0;
    let conflictCount = 0;
    const savedFindings = [];

    if (opportunity_id && this.opportunityEngine) {
      for (const rawFinding of collectedRawFindings) {
        const res = this.opportunityEngine.addEvidence(
          opportunity_id,
          {
            ...rawFinding,
            research_run_id: runId
          },
          { skipRescore: true, ignoreDuplicates: true }
        );
        if (res.duplicate) {
          duplicateCount += 1;
        } else {
          createdCount += 1;
          savedFindings.push(res);
          if (res.stance === 'contradicting') {
            conflictCount += 1;
          }
        }
      }
      this.opportunityEngine.rescoreOpportunity(opportunity_id);
    }

    const aiSynthesis = this.aiOrchestrator
      ? this.aiOrchestrator.synthesizeResearchFindings({
          query_topic,
          target_category,
          findings: savedFindings.length > 0 ? savedFindings : collectedRawFindings
        })
      : {};

    const completedAt = new Date().toISOString();
    const status =
      fetch_live_public && createdCount === 0 && ingested_findings.length === 0 && networkNotes.some((n) => n.includes('unreachable'))
        ? 'failed_network'
        : 'completed';

    this.db
      .prepare(`
        INSERT INTO research_runs (
          id, query_topic, target_category, opportunity_id, methodology,
          sources_queried_json, status, findings_created_count, duplicates_skipped_count,
          conflicts_detected_count, ai_synthesis_json, execution_notes, started_at, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        runId,
        query_topic,
        target_category,
        opportunity_id,
        fetch_live_public ? 'live_public_api_and_attributed_ingestion' : 'attributed_source_ingestion',
        JSON.stringify(sources.map((s) => s.name)),
        status,
        createdCount,
        duplicateCount,
        conflictCount,
        JSON.stringify(aiSynthesis),
        networkNotes.join(' ') || `Processed ${collectedRawFindings.length} finding(s): ${createdCount} stored, ${duplicateCount} duplicate(s) skipped.`,
        startedAt,
        completedAt
      );

    return this.listResearchRuns().find((r) => r.id === runId);
  }

  /**
   * Builds and persists the complete 10-step Research & Discovery Dossier for an opportunity,
   * strictly separating verified facts from estimates and AI synthesis.
   */
  generateAndSaveResearchDossier(opportunityId) {
    const opp = this.opportunityEngine.getOpportunityById(opportunityId);
    if (!opp) throw new Error(`Opportunity ${opportunityId} not found.`);

    const qualitySummary = analyzeOpportunityEvidenceQuality(opp.evidence);
    const aiSynthesis = this.aiOrchestrator
      ? this.aiOrchestrator.synthesizeResearchFindings({
          query_topic: opp.title,
          target_category: opp.category,
          findings: opp.evidence,
          competitors: opp.competitors
        })
      : {};

    const pipelineSteps = [
      {
        step: 1,
        name: 'Customer Problem Discovery',
        classification: 'PROBLEM_DEFINITION',
        content: opp.problem_statement
      },
      {
        step: 2,
        name: 'Audience Identification',
        classification: 'TARGET_AUDIENCE',
        content: opp.target_audience
      },
      {
        step: 3,
        name: 'Supporting Discussions & Attributed Evidence',
        classification: 'SOURCE_EVIDENCE_LEDGER',
        content: `${qualitySummary.active_verified_count} active verified source(s) across ${qualitySummary.independent_verified_origins_count} independent origin(s); ${qualitySummary.practitioner_observation_count} practitioner observation(s); ${qualitySummary.stale_count} stale; ${qualitySummary.contradicting_count} contradicting.`
      },
      {
        step: 4,
        name: 'Existing Solutions & Alternatives',
        classification: 'MARKET_ALTERNATIVES',
        content: opp.alternatives_summary
      },
      {
        step: 5,
        name: 'Competitor & Pricing Matrix Analysis',
        classification: 'COMPETITOR_ANALYSIS',
        content:
          opp.competitors.length > 0
            ? opp.competitors
                .map((c) => `${c.competitor_name} (${c.pricing_model}) — Gaps: ${c.weaknesses_and_gaps}`)
                .join(' | ')
            : opp.competitors_summary
      },
      {
        step: 6,
        name: 'Market Gaps & Underserved Needs',
        classification: 'OPPORTUNITY_WEDGE',
        content: `${opp.market_gaps} — Differentiation: ${opp.differentiation_potential}`
      },
      {
        step: 7,
        name: 'Feasibility & Commercial Potential (Facts vs Estimates Separated)',
        classification: 'ESTIMATE_AND_FEASIBILITY',
        content: `[FACT: Capability Fit ${opp.capability_fit_detail.fit_score}/10, Complexity: ${opp.dev_complexity}] | [ESTIMATE: ${opp.estimated_dev_days} dev days, $${opp.operational_cost_monthly_usd}/mo op cost, Monetization: ${opp.monetization_model}, Revenue Note: ${opp.revenue_potential_notes}]`
      },
      {
        step: 8,
        name: 'Evidence-Weighted Opportunity Score',
        classification: 'SCORING_MODEL_OUTPUT',
        content: `Overall Score: ${opp.overall_score}/100 | Evidence Confidence: ${Math.round(
          qualitySummary.average_confidence_score * 100
        )}%`
      },
      {
        step: 9,
        name: 'Validation or Rejection Recommendation',
        classification: 'DECISION_RECOMMENDATION',
        content: `${opp.recommendation} — ${opp.decision_rationale}`
      },
      {
        step: 10,
        name: 'Complete Auditable Research Dossier',
        classification: 'DOSSIER_ARCHIVE',
        content: `Archived with strict separation between attributed source evidence and AI synthesis.`
      }
    ];

    const markdown = this.opportunityEngine.exportOpportunityDossierMarkdown(opportunityId);
    const id = `dos-${crypto.randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const prevCount = this.db
      .prepare('SELECT COUNT(*) AS cnt FROM research_dossiers WHERE opportunity_id = ?')
      .get(opportunityId).cnt;

    this.db
      .prepare(`
        INSERT INTO research_dossiers (
          id, opportunity_id, version, pipeline_steps_json,
          evidence_quality_summary_json, ai_synthesis_json, markdown_content, generated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        id,
        opportunityId,
        Number(prevCount) + 1,
        JSON.stringify(pipelineSteps),
        JSON.stringify(qualitySummary),
        JSON.stringify(aiSynthesis),
        markdown,
        now
      );

    return {
      id,
      opportunity_id: opportunityId,
      version: Number(prevCount) + 1,
      pipeline_steps: pipelineSteps,
      evidence_quality_summary: qualitySummary,
      ai_synthesis: aiSynthesis,
      markdown_content: markdown,
      generated_at: now
    };
  }
}
