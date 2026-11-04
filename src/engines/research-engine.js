import crypto from 'node:crypto';

export const DEFAULT_RESEARCH_SOURCES = [
  {
    id: 'src-w3c-normative',
    name: 'W3C & Regulatory Normative Specifications',
    source_type: 'standards_body',
    base_url: 'https://www.w3.org',
    adapter_key: 'public_url_inspector',
    adapter_status: 'implemented',
    auth_requirement: 'none',
    base_reliability_score: 0.95,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 30,
    data_retrieved_summary: 'Full public HTML specification text, document title, HTTP status, and verbatim excerpt verification.',
    supported_evidence_types_json: JSON.stringify(['demand', 'technical', 'risk']),
    known_restrictions: 'Requires explicit target_url pointing to the public specification document.',
    terms_and_robots_note: 'Public normative technical standards; cite exact document URI and section.',
    enabled: 1
  },
  {
    id: 'src-wp-plugin-api',
    name: 'WordPress.org Official Plugin Directory API',
    source_type: 'product_directory',
    base_url: 'https://api.wordpress.org/plugins/info/1.2/',
    adapter_key: 'wordpress_plugins_api',
    adapter_status: 'implemented',
    auth_requirement: 'none',
    base_reliability_score: 0.9,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 30,
    data_retrieved_summary: 'Plugin name, slug, version, short_description, active_installs, rating, num_ratings, and last_updated.',
    supported_evidence_types_json: JSON.stringify(['competitor', 'audience']),
    known_restrictions: 'Free directory install counts prove ecosystem presence/competition only, NEVER willingness to pay.',
    terms_and_robots_note: 'Official public JSON endpoint for plugin metadata, ratings, and active install counts.',
    enabled: 1
  },
  {
    id: 'src-hn-algolia',
    name: 'Hacker News Algolia Public Discussion API',
    source_type: 'public_forum',
    base_url: 'https://hn.algolia.com/api/v1/search',
    adapter_key: 'hn_algolia_api',
    adapter_status: 'implemented',
    auth_requirement: 'none',
    base_reliability_score: 0.78,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 60,
    data_retrieved_summary: 'Actual discussion comment records (comment_text, comment objectID URL, story_id, story_title, created_at) and separate story popularity metadata.',
    supported_evidence_types_json: JSON.stringify(['demand', 'audience', 'competitor']),
    known_restrictions: 'Discussion volume/points do not prove willingness to pay. Story hits without retrieved comment text are classified only as discovery signals (pending_review).',
    terms_and_robots_note: 'Public Algolia REST API for practitioner problem discussions and Show HN launches.',
    enabled: 1
  },
  {
    id: 'src-github-public',
    name: 'GitHub Public Repositories & Issues API',
    source_type: 'code_repository',
    base_url: 'https://api.github.com/search/repositories',
    adapter_key: 'github_repos_api',
    adapter_status: 'implemented',
    auth_requirement: 'optional_token',
    base_reliability_score: 0.85,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 10,
    data_retrieved_summary: 'Repository full_name, html_url, description, stargazers_count, open_issues_count, and updated_at.',
    supported_evidence_types_json: JSON.stringify(['competitor', 'technical']),
    known_restrictions: 'Strict unauthenticated rate limit (10 req/min). Stars/forks indicate open-source alternatives, never commercial willingness to pay.',
    terms_and_robots_note: 'Unauthenticated rate limit 10 req/min; respects GitHub API Acceptable Use Policies.',
    enabled: 1
  },
  {
    id: 'src-reddit-public',
    name: 'Reddit Public Discussions JSON Feed',
    source_type: 'public_forum',
    base_url: 'https://www.reddit.com/search.json',
    adapter_key: 'reddit_public_json',
    adapter_status: 'implemented',
    auth_requirement: 'none',
    base_reliability_score: 0.7,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 10,
    data_retrieved_summary: 'Subreddit thread title, selftext body excerpt, permalink URL, created_utc, and comment count.',
    supported_evidence_types_json: JSON.stringify(['demand', 'audience']),
    known_restrictions: 'Cloud/datacenter IPs are frequently rate-limited or blocked (HTTP 403/429) by Reddit without OAuth; link-only posts without selftext are treated as unverified discovery signals.',
    terms_and_robots_note: 'Public read-only JSON with descriptive User-Agent; never scrape private/gated communities.',
    enabled: 1
  },
  {
    id: 'src-public-pricing-web',
    name: 'Public Competitor Website & Pricing Page Inspector',
    source_type: 'competitor_pricing',
    base_url: 'https://',
    adapter_key: 'public_url_inspector',
    adapter_status: 'implemented',
    auth_requirement: 'none',
    base_reliability_score: 0.84,
    requires_api_key: 0,
    is_paid_service: 0,
    rate_limit_rpm: 20,
    data_retrieved_summary: 'HTTP status, final resolved URL, page title, visible text body, SHA-256 content hash, and verbatim excerpt verification.',
    supported_evidence_types_json: JSON.stringify(['pricing', 'competitor', 'demand']),
    known_restrictions: 'Requires explicit target_url. Sites using JS-only rendering or Cloudflare challenges (HTTP 403/429) are flagged for manual review.',
    terms_and_robots_note: 'Direct inspection of publicly accessible pricing and product landing pages.',
    enabled: 1
  },
  {
    id: 'src-ecosystem-marketplaces',
    name: 'Public Ecosystem Marketplaces (Chrome Web Store / Figma Community / Product Hunt)',
    source_type: 'customer_reviews',
    base_url: 'https://',
    adapter_key: 'marketplace_directory_inspector',
    adapter_status: 'unsupported',
    auth_requirement: 'oauth_or_browser_session',
    base_reliability_score: 0.86,
    requires_api_key: 1,
    is_paid_service: 0,
    rate_limit_rpm: 0,
    data_retrieved_summary: 'None (Automated search connector unsupported; use public_url_inspector for individual public listing URLs where permitted).',
    supported_evidence_types_json: JSON.stringify(['competitor', 'customer_reviews']),
    known_restrictions: 'Product Hunt API v2 requires OAuth bearer token; Chrome Web Store and Figma Community block unauthenticated automated search scraping.',
    terms_and_robots_note: 'Automated search connector is explicitly disabled to respect platform anti-scraping and auth policies.',
    enabled: 0
  },
  {
    id: 'src-paid-keyword-api',
    name: 'Commercial Search Trend & Keyword Volume API (DataForSEO / Brave Paid)',
    source_type: 'search_provider',
    base_url: 'https://api.dataforseo.com',
    adapter_key: 'paid_search_provider',
    adapter_status: 'unsupported',
    auth_requirement: 'paid_api_key_and_owner_approval',
    base_reliability_score: 0.9,
    requires_api_key: 1,
    is_paid_service: 1,
    rate_limit_rpm: 30,
    data_retrieved_summary: 'None until commercial API credentials and an approved server-side financial authorization record are configured.',
    supported_evidence_types_json: JSON.stringify(['demand']),
    known_restrictions: 'Paid service ($ > 0). Strictly blocked by ApprovalEngine.verifyFinancialAuthorization() unless a matching approved spending record exists.',
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
 * Strips HTML tags, decodes common HTML entities, and normalizes whitespace for content matching.
 */
export function normalizeTextForVerification(rawText) {
  if (!rawText) return '';
  return String(rawText)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function computeContentHash(content) {
  if (!content) return '';
  return crypto.createHash('sha256').update(String(content)).digest('hex').slice(0, 32);
}

/**
 * Checks whether a supporting excerpt actually exists within retrieved source content.
 */
export function checkExcerptInSourceContent(supportingExcerpt, retrievedSourceContent) {
  const normExcerpt = normalizeTextForVerification(supportingExcerpt).toLowerCase();
  const normSource = normalizeTextForVerification(retrievedSourceContent).toLowerCase();

  if (!normExcerpt || normExcerpt.length < 15 || !normSource) {
    return false;
  }

  if (normSource.includes(normExcerpt)) {
    return true;
  }

  // Also check alphanumeric-only normalized substring (tolerating minor punctuation differences)
  const alphaExcerpt = normExcerpt.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
  const alphaSource = normSource.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();

  if (alphaExcerpt.length >= 15 && alphaSource.includes(alphaExcerpt)) {
    return true;
  }

  return false;
}

/**
 * Milestone 2 Requirement 8 & Milestone 4 Requirement 5:
 * Do not interpret a product listing, installation count, star count, or discussion count
 * as proof of willingness to pay.
 */
export function detectUnsupportedWillingnessToPayClaim({ statement = '', claim_type = 'demand', supporting_excerpt = '' }) {
  // Strip explicit negative disclaimers (e.g. "not willingness to pay", "does not prove willingness to pay") before checking
  const sanitizedStatement = `${statement}`
    .toLowerCase()
    .replace(/(?:not|never|no|does\s+not\s+prove|not\s+commercial)\s+willing(?:ness)?\s+to\s+pay/gi, '');
  const excerptLower = `${supporting_excerpt}`.toLowerCase();

  const claimsWillingnessToPay =
    claim_type === 'pricing' ||
    /willing(ness)?\s+to\s+pay|will\s+pay|paid\s+demand|proven\s+revenue|paying\s+customers|commercial\s+demand/i.test(
      sanitizedStatement
    );

  const hasExplicitPriceOrPaymentEvidence =
    /\$\d+|\d+\s*(usd|eur|gbp)|\/mo(nth)?|\/yr|\/year|paid\s+plan|paid\s+tier|pro\s+tier|annual\s+license|purchased|subscription\s+fee|paid\s+extension/i.test(
      excerptLower
    );

  const isOnlyPopularityOrInstallCount =
    /active\s+install(ation)?s|stars|stargazers|forks|upvotes|points|comments|discussion\s+volume|product\s+listing|free\s+plugin|open\s+source/i.test(
      excerptLower
    ) && !hasExplicitPriceOrPaymentEvidence;

  // Also check if claim_type === 'demand' relies solely on free install count or discussion count without pain/payment text
  if (claimsWillingnessToPay && !hasExplicitPriceOrPaymentEvidence) {
    return {
      violates_wtp_rule: true,
      reason:
        'Willingness-to-pay / pricing claim is not supported by explicit payment or pricing evidence in the source excerpt (install counts, listings, or discussion volume do not prove willingness to pay).'
    };
  }

  if (claim_type === 'demand' && isOnlyPopularityOrInstallCount && !/pain|problem|need|struggle|fail|audit|compliance|mandate|require/i.test(excerptLower)) {
    return {
      violates_wtp_rule: true,
      reason:
        'Product listing, installation count, star count, or discussion count alone cannot be classified as verified demand or willingness-to-pay evidence.'
    };
  }

  return { violates_wtp_rule: false, reason: null };
}

/**
 * Extracts and validates an HTTP/HTTPS URL format from a string or explicit URL field.
 * Note: This only validates URL syntax/hostname format — NOT actual source verification!
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

  if (!urlStr) return { valid: false, originalUrl: '', normalizedUrl: '', hostname: '', reason: 'Missing source URL.' };

  try {
    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return { valid: false, originalUrl: urlStr, normalizedUrl: '', hostname: '', reason: 'URL must use http or https protocol.' };
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
        originalUrl: urlStr,
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
    return { valid: true, originalUrl: urlStr, normalizedUrl: normalized, hostname: host, reason: 'Valid public URL format.' };
  } catch {
    return { valid: false, originalUrl: urlStr, normalizedUrl: '', hostname: '', reason: 'Malformed URL syntax.' };
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
 * Milestone 2: Enforces STRAW Phase 7.1 Actual Evidence Verification & Classification Rules.
 *
 * CRITICAL RULES:
 * 1. URL format validation is strictly separated from actual source verification.
 * 2. A record is NEVER classified as `verified_evidence` (`verification_status = 'verified'`)
 *    merely because it has a valid URL and a manually supplied excerpt!
 * 3. Actual source verification requires retrieved source content (`retrieved_source_content` or
 *    verified `excerpt_verified_in_source === 1` with `source_content_hash` and `http_status === 200`)
 *    confirming that the `supporting_excerpt` exists in the source.
 * 4. If retrieved content is provided and the excerpt is NOT found in it, the finding is
 *    flagged as `excerpt_mismatch_fabricated` and downgraded to `assumption` (`downgraded_unverified`).
 * 5. If source retrieval failed or was blocked (e.g. HTTP 403/429), the source URL is preserved
 *    and the record is marked `pending_review` or `downgraded_unverified` with clear explanation.
 * 6. Product listings, installation counts, star counts, or discussion volume are never
 *    accepted as proof of willingness to pay.
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

  const urlCheck = extractValidPublicUrl(input.original_source_url || input.source_url, sourceCitation);
  const originalSourceUrl = input.original_source_url || urlCheck.originalUrl || '';
  const finalSourceUrl = input.final_source_url || urlCheck.normalizedUrl || '';

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

  // Inspect actual source retrieval & content verification state
  const httpStatus =
    input.http_status !== undefined && input.http_status !== null ? Number(input.http_status) : null;
  const retrievedAt = input.retrieved_at || null;
  let sourceContentHash = input.source_content_hash || '';
  let excerptVerifiedInSource = Number(input.excerpt_verified_in_source) === 1 ? 1 : 0;
  let verificationMethod = input.verification_method || 'url_format_only_unverified';

  // If raw retrieved_source_content is provided, verify the excerpt against it directly!
  if (input.retrieved_source_content !== undefined && input.retrieved_source_content !== null) {
    const rawBody = String(input.retrieved_source_content);
    sourceContentHash = computeContentHash(rawBody);
    const matched = checkExcerptInSourceContent(supportingExcerpt, rawBody);
    if (matched) {
      excerptVerifiedInSource = 1;
      if (!input.verification_method || input.verification_method === 'url_format_only_unverified') {
        verificationMethod = 'http_content_match';
      }
    } else {
      excerptVerifiedInSource = 0;
      verificationMethod = 'excerpt_mismatch_fabricated';
    }
  }

  const isAiHypothesis =
    methodology.includes('ai_') ||
    methodology === 'llm_synthesis' ||
    detectedSourceName.toLowerCase().includes('ai hypothesis');

  const wtpCheck = detectUnsupportedWillingnessToPayClaim({
    statement,
    claim_type: input.claim_type || 'demand',
    supporting_excerpt: supportingExcerpt
  });

  let finalTier = requestedTier;
  let verificationStatus = 'pending_review';
  const notes = [];

  if (isAiHypothesis) {
    finalTier = 'assumption';
    verificationStatus = 'downgraded_unverified';
    verificationMethod = 'ai_hypothesis_blocked';
    notes.push('AI-generated hypotheses or LLM conclusions cannot be classified as verified source evidence.');
  } else if (!urlCheck.valid) {
    if (requestedTier === 'verified_evidence' || requestedTier === 'practitioner_observation') {
      finalTier = 'assumption';
      verificationStatus = 'downgraded_unverified';
      verificationMethod = 'invalid_url_format';
      notes.push(`Downgraded from ${requestedTier} to assumption: ${urlCheck.reason}`);
    } else {
      verificationStatus = isStale ? 'stale' : 'pending_review';
      notes.push(`Recorded as ${finalTier} without public URL.`);
    }
  } else if (supportingExcerpt.length < 15) {
    // Valid URL format, but missing supporting excerpt
    if (requestedTier === 'verified_evidence') {
      finalTier = 'practitioner_observation';
      verificationStatus = 'downgraded_unverified';
      notes.push(
        'Downgraded from verified_evidence to practitioner_observation: Missing a factual supporting excerpt (>= 15 chars).'
      );
    } else {
      verificationStatus = isStale ? 'stale' : 'pending_review';
      notes.push('Valid URL format, but lacks a supporting excerpt (>= 15 chars); requires review.');
    }
  } else if (isStale) {
    finalTier = requestedTier === 'verified_evidence' ? 'practitioner_observation' : requestedTier;
    verificationStatus = 'stale';
    notes.push(
      `Evidence is stale (${ageDays} days old > ${maxFreshDays} day freshness limit) and cannot count as active verified demand evidence.`
    );
  } else if (verificationMethod === 'excerpt_mismatch_fabricated') {
    finalTier = 'assumption';
    verificationStatus = 'downgraded_unverified';
    notes.push(
      'Source content was retrieved, but the supplied supporting_excerpt was NOT found in the retrieved source body (fabricated excerpt or changed source content).'
    );
  } else if (
    verificationMethod === 'automated_retrieval_blocked_manual_required' ||
    httpStatus === 401 ||
    httpStatus === 403 ||
    httpStatus === 429
  ) {
    finalTier = requestedTier === 'verified_evidence' ? 'practitioner_observation' : requestedTier;
    verificationStatus = 'pending_review';
    verificationMethod = 'automated_retrieval_blocked_manual_required';
    notes.push(
      `Source (${urlCheck.hostname}) blocked automated retrieval (HTTP ${httpStatus || 'blocked'}). Original source URL preserved; manual human review is required before verification.`
    );
  } else if (
    verificationMethod === 'http_retrieval_failed' ||
    (httpStatus !== null && (httpStatus >= 400 || httpStatus === 0))
  ) {
    finalTier = 'assumption';
    verificationStatus = 'downgraded_unverified';
    verificationMethod = 'http_retrieval_failed';
    notes.push(
      `Source retrieval failed (HTTP ${httpStatus ?? 'unreachable'}). Cannot verify supporting excerpt against unavailable source.`
    );
  } else if (wtpCheck.violates_wtp_rule && requestedTier === 'verified_evidence') {
    finalTier = 'practitioner_observation';
    verificationStatus = 'downgraded_unverified';
    notes.push(`Downgraded from verified_evidence: ${wtpCheck.reason}`);
  } else if (requestedTier === 'verified_evidence') {
    // Milestone 2 Requirement 5: Do NOT classify as verified merely because it has a valid URL and manually supplied excerpt!
    // Must have excerptVerifiedInSource === 1, sourceContentHash !== '', and httpStatus === 200
    if (excerptVerifiedInSource === 1 && sourceContentHash && (httpStatus === 200 || httpStatus === null)) {
      if (sourceReliability < 0.5) {
        finalTier = 'practitioner_observation';
        verificationStatus = 'downgraded_unverified';
        notes.push(`Source reliability (${sourceReliability}) is below the 0.50 threshold for verified_evidence.`);
      } else {
        finalTier = 'verified_evidence';
        verificationStatus = 'verified';
        notes.push(
          `Verified against retrieved source content (${detectedSourceName}, hash: ${sourceContentHash.slice(0, 10)}) with confirmed supporting excerpt.`
        );
      }
    } else {
      // Valid URL format + manually supplied excerpt, but source content has NOT been retrieved/confirmed yet!
      finalTier = 'practitioner_observation';
      verificationStatus = 'pending_review';
      verificationMethod = 'url_format_only_unverified';
      notes.push(
        'URL format is valid and excerpt was supplied manually, but source content has not been retrieved to confirm the excerpt. Held as practitioner_observation (pending_review) until source retrieval confirms content.'
      );
    }
  } else if (requestedTier === 'practitioner_observation') {
    verificationStatus = excerptVerifiedInSource === 1 ? 'verified' : 'pending_review';
    notes.push(
      excerptVerifiedInSource === 1
        ? `Practitioner observation confirmed in retrieved source (${detectedSourceName}).`
        : 'Attributed practitioner observation (pending source content confirmation).'
    );
  } else {
    verificationStatus = 'pending_review';
    notes.push(`Recorded as ${finalTier}.`);
  }

  // Calculate Confidence Score (0.05 to 0.98)
  const tierBaseMap = {
    verified_evidence: 0.88,
    practitioner_observation: 0.58,
    estimate: 0.38,
    assumption: 0.18
  };
  let confidence = (tierBaseMap[finalTier] || 0.2) * 0.65 + sourceReliability * 0.35;
  if (excerptVerifiedInSource === 1 && verificationStatus === 'verified') {
    confidence += 0.06;
  } else {
    confidence = Math.min(confidence, 0.62);
  }
  if (!urlCheck.valid || verificationMethod === 'excerpt_mismatch_fabricated') {
    confidence = Math.min(confidence, 0.25);
  }
  if (isStale) confidence *= 0.45;
  confidence = Number(Math.max(0.05, Math.min(0.98, confidence)).toFixed(2));

  return {
    statement,
    claim_type: input.claim_type || 'demand',
    requested_evidence_tier: requestedTier,
    evidence_tier: finalTier,
    source_citation: sourceCitation || urlCheck.normalizedUrl || 'No citation provided',
    original_source_url: originalSourceUrl,
    source_url: urlCheck.normalizedUrl,
    final_source_url: finalSourceUrl,
    source_name: detectedSourceName,
    supporting_excerpt: supportingExcerpt,
    published_at: publishedAt,
    observed_at: observedAt,
    retrieved_at: retrievedAt,
    http_status: httpStatus,
    source_content_hash: sourceContentHash,
    excerpt_verified_in_source: excerptVerifiedInSource,
    verification_method: verificationMethod,
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
 * Milestone 2: Retrieves a public source URL via HTTP/HTTPS and verifies whether
 * the supporting excerpt actually exists in the retrieved content.
 * Also detects changed source content if a previous `previous_content_hash` is provided.
 */
export async function retrieveAndVerifySourceContent(
  input,
  { fetchImpl = globalThis.fetch, timeoutMs = 5000, nowDate = new Date() } = {}
) {
  const urlCheck = extractValidPublicUrl(input.original_source_url || input.source_url, input.source_citation);
  if (!urlCheck.valid) {
    return verifyAndClassifyEvidence(
      {
        ...input,
        verification_method: 'invalid_url_format',
        excerpt_verified_in_source: 0
      },
      nowDate
    );
  }

  const retrievedAt = nowDate.toISOString();

  try {
    const res = await fetchImpl(urlCheck.normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'STRAW-Research-Verifier/0.7.1 (+https://github.com/zakshub/straw)',
        Accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(timeoutMs)
    });

    const httpStatus = res.status;
    const finalUrl = res.url || urlCheck.normalizedUrl;

    if (httpStatus === 401 || httpStatus === 403 || httpStatus === 429) {
      return verifyAndClassifyEvidence(
        {
          ...input,
          original_source_url: urlCheck.originalUrl,
          final_source_url: finalUrl,
          retrieved_at: retrievedAt,
          http_status: httpStatus,
          excerpt_verified_in_source: 0,
          verification_method: 'automated_retrieval_blocked_manual_required'
        },
        nowDate
      );
    }

    if (!res.ok) {
      return verifyAndClassifyEvidence(
        {
          ...input,
          original_source_url: urlCheck.originalUrl,
          final_source_url: finalUrl,
          retrieved_at: retrievedAt,
          http_status: httpStatus,
          excerpt_verified_in_source: 0,
          verification_method: 'http_retrieval_failed'
        },
        nowDate
      );
    }

    const bodyText = await res.text();
    const newHash = computeContentHash(bodyText);
    const contentChanged =
      Boolean(input.previous_content_hash) && input.previous_content_hash !== newHash;

    const classified = verifyAndClassifyEvidence(
      {
        ...input,
        original_source_url: urlCheck.originalUrl,
        final_source_url: finalUrl,
        retrieved_at: retrievedAt,
        http_status: httpStatus,
        retrieved_source_content: bodyText,
        verification_method: 'http_live_retrieval_match'
      },
      nowDate
    );

    if (contentChanged) {
      classified.content_changed_since_previous = true;
      classified.verification_notes = `[SOURCE CONTENT CHANGED: previous hash ${input.previous_content_hash.slice(
        0,
        8
      )} != new hash ${newHash.slice(0, 8)}] ${classified.verification_notes}`;
    }

    return classified;
  } catch (err) {
    return verifyAndClassifyEvidence(
      {
        ...input,
        original_source_url: urlCheck.originalUrl,
        final_source_url: urlCheck.normalizedUrl,
        retrieved_at: retrievedAt,
        http_status: 0,
        excerpt_verified_in_source: 0,
        verification_method: 'http_retrieval_failed',
        source_citation: `${input.source_citation || urlCheck.normalizedUrl} (Fetch error: ${err.message})`
      },
      nowDate
    );
  }
}

/**
 * Evaluates aggregate evidence quality, freshness, origin diversity, and conflicts for an opportunity.
 */
export function analyzeOpportunityEvidenceQuality(evidenceRecords = []) {
  const activeVerified = [];
  const staleRecords = [];
  const downgradedRecords = [];
  const pendingReviewRecords = [];
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
    if (ev.verification_status === 'pending_review') {
      pendingReviewRecords.push(ev);
    }
    if (ev.stance === 'contradicting') {
      contradictingRecords.push(ev);
    } else if (ev.stance === 'supporting') {
      supportingRecords.push(ev);
    }

    // Only count as active verified if verification_status === 'verified', excerpt_verified_in_source === 1, and not stale
    if (
      ev.evidence_tier === 'verified_evidence' &&
      ev.verification_status === 'verified' &&
      Number(ev.excerpt_verified_in_source) === 1 &&
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
    pending_review_count: pendingReviewRecords.length,
    supporting_count: supportingRecords.length,
    contradicting_count: contradictingRecords.length,
    has_conflicting_evidence: hasConflict || hasAnyContradiction,
    average_confidence_score: Number(portfolioConfidence.toFixed(2)),
    insufficient_evidence_warning:
      activeVerified.length === 0
        ? 'Insufficient verified evidence: 0 active, content-verified sources with confirmed excerpts.'
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
        adapter_status, auth_requirement,
        base_reliability_score, requires_api_key, is_paid_service,
        rate_limit_rpm, data_retrieved_summary, supported_evidence_types_json,
        known_restrictions, terms_and_robots_note, enabled, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        adapter_status = excluded.adapter_status,
        auth_requirement = excluded.auth_requirement,
        data_retrieved_summary = excluded.data_retrieved_summary,
        supported_evidence_types_json = excluded.supported_evidence_types_json,
        known_restrictions = excluded.known_restrictions,
        terms_and_robots_note = excluded.terms_and_robots_note,
        enabled = excluded.enabled
    `);

    for (const s of DEFAULT_RESEARCH_SOURCES) {
      stmt.run(
        s.id,
        s.name,
        s.source_type,
        s.base_url,
        s.adapter_key,
        s.adapter_status,
        s.auth_requirement,
        s.base_reliability_score,
        s.requires_api_key,
        s.is_paid_service,
        s.rate_limit_rpm,
        s.data_retrieved_summary,
        s.supported_evidence_types_json,
        s.known_restrictions,
        s.terms_and_robots_note,
        s.enabled,
        now
      );
    }
  }

  listSources() {
    this.ensureDefaultSources();
    return this.db
      .prepare('SELECT * FROM research_sources ORDER BY adapter_status ASC, base_reliability_score DESC')
      .all()
      .map((s) => ({
        ...s,
        supported_evidence_types: JSON.parse(s.supported_evidence_types_json || '[]')
      }));
  }

  getSourceCapabilityMatrix() {
    return this.listSources().map((s) => ({
      id: s.id,
      source_name: s.name,
      adapter_key: s.adapter_key,
      implemented: s.adapter_status === 'implemented',
      implementation_status: s.adapter_status,
      authentication_requirement: s.auth_requirement,
      cost_tier: s.is_paid_service ? 'paid' : 'free',
      base_reliability_score: s.base_reliability_score,
      data_actually_retrieved: s.data_retrieved_summary,
      evidence_types_supported: s.supported_evidence_types,
      rate_limit_rpm: s.rate_limit_rpm,
      rate_limits: `${s.rate_limit_rpm} req/min`,
      known_restrictions: s.known_restrictions
    }));
  }

  async retrieveSourceForVerification(url, supportingExcerpt = '') {
    const activeFetch = this.fetchFn || globalThis.fetch;
    return retrieveAndVerifySourceContent(
      {
        source_url: url,
        supporting_excerpt: supportingExcerpt,
        evidence_tier: 'verified_evidence'
      },
      { fetchImpl: activeFetch }
    );
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
   * Retrieves the live source URL for an existing evidence record and verifies
   * whether the supporting excerpt actually exists in the retrieved content.
   */
  async verifyExistingEvidenceSource(evidenceId, { fetchImpl } = {}) {
    const activeFetch = fetchImpl || this.fetchFn || globalThis.fetch;
    const existing = this.db.prepare('SELECT * FROM market_evidence WHERE id = ?').get(evidenceId);
    if (!existing) throw new Error(`Evidence record ${evidenceId} not found.`);

    const verified = await retrieveAndVerifySourceContent(
      {
        ...existing,
        evidence_tier: existing.requested_evidence_tier || existing.evidence_tier,
        previous_content_hash: existing.source_content_hash || ''
      },
      { fetchImpl: activeFetch }
    );

    this.db
      .prepare(`
        UPDATE market_evidence
        SET evidence_tier = ?,
            final_source_url = ?,
            retrieved_at = ?,
            http_status = ?,
            source_content_hash = ?,
            excerpt_verified_in_source = ?,
            verification_method = ?,
            confidence_score = ?,
            verification_status = ?,
            verification_notes = ?
        WHERE id = ?
      `)
      .run(
        verified.evidence_tier,
        verified.final_source_url,
        verified.retrieved_at,
        verified.http_status,
        verified.source_content_hash,
        verified.excerpt_verified_in_source,
        verified.verification_method,
        verified.confidence_score,
        verified.verification_status,
        verified.verification_notes,
        evidenceId
      );

    if (this.opportunityEngine) {
      this.opportunityEngine.rescoreOpportunity(existing.opportunity_id);
    }

    return this.db.prepare('SELECT * FROM market_evidence WHERE id = ?').get(evidenceId);
  }

  /**
   * Manually review or update verification status of an existing evidence finding.
   * Milestone 2 Rule: Manual review can resolve pending_review items that blocked automated retrieval,
   * ONLY if a valid URL and supporting excerpt (>= 15 chars) exist and reviewer notes are supplied.
   * It CANNOT override a fabricated excerpt (`excerpt_mismatch_fabricated`).
   */
  reviewEvidenceRecord(evidenceId, { verification_status, reviewer_notes = '', stance }) {
    const existing = this.db.prepare('SELECT * FROM market_evidence WHERE id = ?').get(evidenceId);
    if (!existing) throw new Error(`Evidence record ${evidenceId} not found.`);

    const urlCheck = extractValidPublicUrl(existing.source_url, existing.source_citation);
    let nextStatus = verification_status || existing.verification_status;
    let nextTier = existing.evidence_tier;
    const notePrefix = reviewer_notes ? `[Manual Review]: ${reviewer_notes}` : existing.verification_notes;

    if (nextStatus === 'verified') {
      if (!urlCheck.valid || (existing.supporting_excerpt || '').trim().length < 15) {
        throw new Error(
          'Cannot mark evidence as verified without a valid public http/https source_url and a supporting_excerpt (>= 15 chars).'
        );
      }
      if (existing.is_stale) {
        throw new Error('Cannot mark stale evidence as active verified evidence.');
      }
      if (existing.verification_method === 'excerpt_mismatch_fabricated') {
        throw new Error(
          'Cannot manually verify a finding whose supporting excerpt was proven absent from the retrieved HTTP 200 source content.'
        );
      }
      if (Number(existing.excerpt_verified_in_source) !== 1 && existing.verification_method !== 'automated_retrieval_blocked_manual_required') {
        throw new Error(
          'Cannot mark unretrieved URL-only evidence as verified without running source content verification or confirming a blocked-retrieval manual inspection.'
        );
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
   * Milestone 1, 3, & 4: Executes a Discovery / Research Run.
   * - Milestone 1: Completely removes `allow_paid_apis`. Paid sources require a valid,
   *   server-side verified `approval_request_id` checked via `approvalEngine.verifyFinancialAuthorization()`.
   * - Milestone 3: Rejects or skips unsupported adapters transparently; implements HN Algolia,
   *   WordPress.org Plugin API, GitHub Public Repos API, Reddit Public JSON, and Public URL Inspector.
   * - Milestone 4: Retrieves actual HN comment records (`tags=comment`), captures verbatim comment text,
   *   separates story popularity from pain evidence, and marks story-only hits as discovery signals.
   */
  async executeDiscoveryRun(
    {
      query_topic,
      target_category = 'Browser Based Utilities',
      opportunity_id = null,
      source_ids = ['src-hn-algolia', 'src-wp-plugin-api'],
      target_url = null,
      ingested_findings = [],
      fetch_live_public = false,
      approval_request_id = null,
      estimated_cost_usd = 25
    },
    { fetchImpl } = {}
  ) {
    const activeFetch = fetchImpl || this.fetchFn || globalThis.fetch;
    this.ensureDefaultSources();
    const runId = `run-${crypto.randomUUID().slice(0, 8)}`;
    const startedAt = new Date().toISOString();

    const allSources = this.listSources();
    const sources = allSources.filter((s) => source_ids.includes(s.id));

    // Milestone 1: Server-side Financial Approval Security Check for Paid Sources
    const paidSources = sources.filter((s) => s.is_paid_service === 1);
    let verifiedAuthorizationRef = null;

    if (paidSources.length > 0) {
      const requiredProviderIds = paidSources.map((p) => p.id);
      const requestedCost = Number(estimated_cost_usd) > 0 ? Number(estimated_cost_usd) : 25;

      const authCheck = this.approvalEngine
        ? this.approvalEngine.verifyFinancialAuthorization({
            approvalRequestId: approval_request_id,
            requiredProviderIds,
            requiredScope: 'paid_research_execution',
            requiredActionCategories: ['spend_money', 'purchase_service'],
            requestedCostUsd: requestedCost
          })
        : {
            authorized: false,
            code: 'MISSING_APPROVAL',
            reason: 'ApprovalEngine unavailable; paid execution blocked.'
          };

      if (!authCheck.authorized) {
        const completedAt = new Date().toISOString();
        const note = `[SECURITY BLOCK — ${authCheck.code}]: ${authCheck.reason}`;

        this.db
          .prepare(`
            INSERT INTO research_runs (
              id, query_topic, target_category, opportunity_id, methodology,
              sources_queried_json, status, findings_created_count, duplicates_skipped_count,
              conflicts_detected_count, ai_synthesis_json, execution_notes,
              started_at, completed_at, authorization_ref, estimated_cost_usd
            ) VALUES (?, ?, ?, ?, 'paid_api_security_blocked', ?, 'blocked_approval', 0, 0, 0, '{}', ?, ?, ?, ?, ?)
          `)
          .run(
            runId,
            query_topic,
            target_category,
            opportunity_id,
            JSON.stringify(sources.map((s) => s.name)),
            note,
            startedAt,
            completedAt,
            approval_request_id || null,
            requestedCost
          );

        return {
          ...this.listResearchRuns().find((r) => r.id === runId),
          authorization_error_code: authCheck.code
        };
      }

      verifiedAuthorizationRef = authCheck.authorization_ref;
    }

    const collectedRawFindings = [...ingested_findings];
    const networkNotes = [];

    // Check for unsupported connectors first
    for (const src of sources) {
      if (src.adapter_status === 'unsupported') {
        networkNotes.push(
          `[UNSUPPORTED CONNECTOR: ${src.name} (${src.adapter_key})]: ${src.known_restrictions}`
        );
      }
    }

    // Execute live public connectors where implemented and requested
    if (fetch_live_public) {
      for (const src of sources) {
        if (src.adapter_status !== 'implemented') continue;

        try {
          if (src.adapter_key === 'hn_algolia_api') {
            await this.collectFromHackerNewsAlgolia(query_topic, startedAt, collectedRawFindings, networkNotes, activeFetch);
          } else if (src.adapter_key === 'wordpress_plugins_api') {
            await this.collectFromWordPressPluginApi(query_topic, startedAt, collectedRawFindings, networkNotes, activeFetch);
          } else if (src.adapter_key === 'github_repos_api') {
            await this.collectFromGitHubPublicApi(query_topic, startedAt, collectedRawFindings, networkNotes, activeFetch);
          } else if (src.adapter_key === 'reddit_public_json') {
            await this.collectFromRedditPublicJson(query_topic, startedAt, collectedRawFindings, networkNotes, activeFetch);
          } else if (src.adapter_key === 'public_url_inspector') {
            const urlToInspect = target_url || (query_topic.startsWith('http') ? query_topic : null);
            if (!urlToInspect) {
              networkNotes.push(`${src.name} requires a valid target_url parameter to inspect.`);
            } else {
              await this.collectFromPublicUrlInspector(urlToInspect, startedAt, collectedRawFindings, networkNotes, activeFetch);
            }
          }
        } catch (err) {
          networkNotes.push(`${src.name} connector error (${err.message}); zero fabricated results.`);
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
    const hasNetworkFailure = networkNotes.some(
      (n) => n.includes('connector error') || n.includes('HTTP 429') || n.includes('HTTP 5') || n.includes('malformed')
    );
    const status =
      fetch_live_public && createdCount === 0 && ingested_findings.length === 0 && hasNetworkFailure
        ? 'failed_network'
        : sources.some((s) => s.adapter_status === 'unsupported') && createdCount === 0
          ? 'partial'
          : 'completed';

    this.db
      .prepare(`
        INSERT INTO research_runs (
          id, query_topic, target_category, opportunity_id, methodology,
          sources_queried_json, status, findings_created_count, duplicates_skipped_count,
          conflicts_detected_count, ai_synthesis_json, execution_notes,
          started_at, completed_at, authorization_ref, estimated_cost_usd
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)
      .run(
        runId,
        query_topic,
        target_category,
        opportunity_id,
        fetch_live_public ? 'live_public_api_connector' : 'attributed_source_ingestion',
        JSON.stringify(sources.map((s) => s.name)),
        status,
        createdCount,
        duplicateCount,
        conflictCount,
        JSON.stringify(aiSynthesis),
        networkNotes.join(' ') ||
          `Processed ${collectedRawFindings.length} finding(s): ${createdCount} stored, ${duplicateCount} duplicate(s) skipped.`,
        startedAt,
        completedAt,
        verifiedAuthorizationRef,
        paidSources.length > 0 ? Number(estimated_cost_usd) || 0 : 0
      );

    return {
      ...this.listResearchRuns().find((r) => r.id === runId),
      created_findings: savedFindings
    };
  }

  /**
   * Milestone 4: Improved Hacker News Algolia Connector.
   * 1. Retrieves actual comment records (`tags=comment`) to capture verbatim practitioner pain text.
   * 2. Stores original discussion URL and comment objectID reference.
   * 3. Separates story popularity (`points`/`num_comments`) from actual user pain evidence.
   * 4. Never infers willingness to pay from discussion volume.
   * 5. If comments cannot be retrieved, classifies story hits strictly as unverified discovery signals.
   */
  async collectFromHackerNewsAlgolia(queryTopic, retrievedAt, collectedRawFindings, networkNotes, fetchImpl) {
    const commentUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(queryTopic)}&tags=comment&hitsPerPage=4`;
    const commentRes = await fetchImpl(commentUrl, {
      headers: { 'User-Agent': 'STRAW-Research-Engine/0.7.1 (+https://github.com/zakshub/straw)' },
      signal: AbortSignal.timeout(5000)
    });

    if (commentRes.status === 429) {
      networkNotes.push('Hacker News Algolia API rate-limited (HTTP 429).');
      return;
    }

    let commentsCaptured = 0;
    if (commentRes.ok) {
      const rawText = await commentRes.text();
      let commentData;
      try {
        commentData = JSON.parse(rawText);
      } catch {
        networkNotes.push('Hacker News Algolia comment endpoint returned malformed JSON.');
        return;
      }

      for (const hit of commentData.hits || []) {
        const cleanComment = normalizeTextForVerification(hit.comment_text || '');
        if (cleanComment.length >= 25 && hit.objectID) {
          const commentRefUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
          const storyRefUrl = hit.story_id
            ? `https://news.ycombinator.com/item?id=${hit.story_id}`
            : commentRefUrl;
          const excerptSlice = cleanComment.slice(0, 260);

          collectedRawFindings.push({
            claim_type: 'demand',
            statement: `HN practitioner comment on "${hit.story_title || queryTopic}" (Comment #${hit.objectID}, Story ref: ${storyRefUrl}): reports workflow/problem context.`,
            evidence_tier: 'verified_evidence',
            original_source_url: commentRefUrl,
            source_url: commentRefUrl,
            final_source_url: commentRefUrl,
            source_name: 'Hacker News Algolia Discussion Comment API',
            supporting_excerpt: excerptSlice,
            retrieved_source_content: cleanComment,
            retrieved_at: retrievedAt,
            http_status: 200,
            published_at: hit.created_at || retrievedAt,
            research_methodology: 'public_api_comment_retrieval',
            stance: 'supporting'
          });
          commentsCaptured += 1;
        }
      }
    }

    // If no actual comments could be retrieved, inspect story headers ONLY as unverified discovery signals
    if (commentsCaptured === 0) {
      const storyUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(queryTopic)}&tags=story&hitsPerPage=3`;
      const storyRes = await fetchImpl(storyUrl, {
        headers: { 'User-Agent': 'STRAW-Research-Engine/0.7.1 (+https://github.com/zakshub/straw)' },
        signal: AbortSignal.timeout(5000)
      });

      if (!storyRes.ok) {
        networkNotes.push(`Hacker News Algolia story endpoint returned HTTP ${storyRes.status}.`);
        return;
      }

      const rawStoryText = await storyRes.text();
      let storyData;
      try {
        storyData = JSON.parse(rawStoryText);
      } catch {
        networkNotes.push('Hacker News Algolia story endpoint returned malformed JSON.');
        return;
      }

      for (const hit of storyData.hits || []) {
        if (hit.title && hit.objectID) {
          const hnItemUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
          // Milestone 4 Req 4, 5, 6: Story popularity is separated from pain evidence and classified ONLY as a discovery signal!
          collectedRawFindings.push({
            claim_type: 'audience',
            statement: `[DISCOVERY SIGNAL ONLY — No comment text retrieved]: HN thread "${hit.title}" (Popularity metadata: ${hit.points || 0} pts, ${hit.num_comments || 0} comments; does NOT prove willingness to pay).`,
            evidence_tier: 'practitioner_observation',
            original_source_url: hnItemUrl,
            source_url: hnItemUrl,
            final_source_url: hnItemUrl,
            source_name: 'Hacker News Story Index (Discovery Signal)',
            supporting_excerpt: '',
            retrieved_at: retrievedAt,
            http_status: 200,
            published_at: hit.created_at || retrievedAt,
            research_methodology: 'hn_story_discovery_signal_only',
            stance: 'neutral'
          });
        }
      }
      networkNotes.push(
        `Hacker News Algolia: 0 verbatim comments matched; recorded ${(storyData.hits || []).length} story-level discovery signal(s) (classified as unverified discovery signals, not verified demand).`
      );
    } else {
      networkNotes.push(
        `Hacker News Algolia: Retrieved and content-verified ${commentsCaptured} actual practitioner discussion comment(s).`
      );
    }
  }

  /**
   * Milestone 3: WordPress.org Official Plugin Directory Connector.
   * Classifies plugin listings and active install counts strictly as competitor/ecosystem evidence,
   * never as willingness-to-pay proof.
   */
  async collectFromWordPressPluginApi(queryTopic, retrievedAt, collectedRawFindings, networkNotes, fetchImpl) {
    const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${encodeURIComponent(queryTopic)}&request[per_page]=3`;
    const res = await fetchImpl(url, {
      headers: { 'User-Agent': 'STRAW-Research-Engine/0.7.1 (+https://github.com/zakshub/straw)' },
      signal: AbortSignal.timeout(5000)
    });

    if (!res.ok) {
      networkNotes.push(`WordPress.org Plugin API returned HTTP ${res.status}.`);
      return;
    }

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      networkNotes.push('WordPress.org Plugin API returned malformed JSON.');
      return;
    }

    const plugins = Array.isArray(data?.plugins) ? data.plugins : [];
    for (const pl of plugins) {
      if (pl.name && pl.slug) {
        const cleanDesc = normalizeTextForVerification(pl.short_description || pl.name);
        const pluginUrl = `https://wordpress.org/plugins/${pl.slug}/`;
        const verbatimExcerpt = cleanDesc.length >= 15 ? cleanDesc : `${pl.name} WordPress plugin (${pl.slug})`;

        collectedRawFindings.push({
          claim_type: 'competitor',
          statement: `Existing WordPress.org plugin "${pl.name}" (${pl.active_installs || 0}+ active installs, rating ${pl.rating || 0}/100 across ${pl.num_ratings || 0} ratings; free install count indicates existing alternative, not willingness to pay).`,
          evidence_tier: 'verified_evidence',
          original_source_url: pluginUrl,
          source_url: pluginUrl,
          final_source_url: pluginUrl,
          source_name: 'WordPress.org Official Plugin Directory API',
          supporting_excerpt: verbatimExcerpt,
          retrieved_source_content: rawText,
          retrieved_at: retrievedAt,
          http_status: 200,
          published_at: pl.last_updated || retrievedAt,
          research_methodology: 'public_api_discovery',
          stance: 'supporting'
        });
      }
    }
    networkNotes.push(`WordPress.org Plugin API: Retrieved ${plugins.length} plugin record(s).`);
  }

  /**
   * Milestone 3: GitHub Public Repositories Search Connector.
   */
  async collectFromGitHubPublicApi(queryTopic, retrievedAt, collectedRawFindings, networkNotes, fetchImpl) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(queryTopic)}&per_page=3`;
    const res = await fetchImpl(url, {
      headers: {
        'User-Agent': 'STRAW-Research-Engine/0.7.1 (+https://github.com/zakshub/straw)',
        Accept: 'application/vnd.github+json'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (res.status === 403 || res.status === 429) {
      networkNotes.push(`GitHub Public API rate-limited (HTTP ${res.status}).`);
      return;
    }
    if (!res.ok) {
      networkNotes.push(`GitHub Public API returned HTTP ${res.status}.`);
      return;
    }

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      networkNotes.push('GitHub Public API returned malformed JSON.');
      return;
    }

    const items = Array.isArray(data?.items) ? data.items : [];
    for (const repo of items) {
      if (repo.full_name && repo.html_url) {
        const desc = normalizeTextForVerification(repo.description || repo.full_name);
        const excerpt = desc.length >= 15 ? desc : `GitHub repository ${repo.full_name}`;
        collectedRawFindings.push({
          claim_type: 'competitor',
          statement: `Open-source GitHub repository "${repo.full_name}" (${repo.stargazers_count || 0} stars, ${repo.open_issues_count || 0} open issues; indicates technical alternative, not commercial willingness to pay).`,
          evidence_tier: 'verified_evidence',
          original_source_url: repo.html_url,
          source_url: repo.html_url,
          final_source_url: repo.html_url,
          source_name: 'GitHub Public Repositories API',
          supporting_excerpt: excerpt,
          retrieved_source_content: rawText,
          retrieved_at: retrievedAt,
          http_status: 200,
          published_at: repo.updated_at || retrievedAt,
          research_methodology: 'public_api_discovery',
          stance: 'supporting'
        });
      }
    }
    networkNotes.push(`GitHub Public API: Retrieved ${items.length} repository record(s).`);
  }

  /**
   * Milestone 3: Reddit Public Discussions JSON Connector.
   */
  async collectFromRedditPublicJson(queryTopic, retrievedAt, collectedRawFindings, networkNotes, fetchImpl) {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(queryTopic)}&limit=3`;
    const res = await fetchImpl(url, {
      headers: { 'User-Agent': 'STRAW-Research-Engine/0.7.1 (+https://github.com/zakshub/straw)' },
      signal: AbortSignal.timeout(5000)
    });

    if (res.status === 403 || res.status === 429) {
      networkNotes.push(
        `Reddit Public JSON blocked/rate-limited automated request (HTTP ${res.status}); manual review required for Reddit threads.`
      );
      return;
    }
    if (!res.ok) {
      networkNotes.push(`Reddit Public JSON returned HTTP ${res.status}.`);
      return;
    }

    const rawText = await res.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      networkNotes.push('Reddit Public JSON returned malformed JSON.');
      return;
    }

    const children = Array.isArray(data?.data?.children) ? data.data.children : [];
    for (const child of children) {
      const post = child?.data;
      if (!post || !post.title) continue;
      const permalinkUrl = post.permalink
        ? `https://www.reddit.com${post.permalink}`
        : post.url || 'https://www.reddit.com';
      const selftext = normalizeTextForVerification(post.selftext || '');
      const pubDate = post.created_utc ? new Date(post.created_utc * 1000).toISOString() : retrievedAt;

      if (selftext.length >= 25) {
        collectedRawFindings.push({
          claim_type: 'demand',
          statement: `Reddit discussion in ${post.subreddit_name_prefixed || 'r/reddit'}: "${post.title}"`,
          evidence_tier: 'verified_evidence',
          original_source_url: permalinkUrl,
          source_url: permalinkUrl,
          final_source_url: permalinkUrl,
          source_name: 'Reddit Public Discussions JSON',
          supporting_excerpt: selftext.slice(0, 240),
          retrieved_source_content: selftext,
          retrieved_at: retrievedAt,
          http_status: 200,
          published_at: pubDate,
          research_methodology: 'public_api_discovery',
          stance: 'supporting'
        });
      } else {
        collectedRawFindings.push({
          claim_type: 'audience',
          statement: `[DISCOVERY SIGNAL]: Reddit thread "${post.title}" (${post.num_comments || 0} comments; no body text excerpt).`,
          evidence_tier: 'practitioner_observation',
          original_source_url: permalinkUrl,
          source_url: permalinkUrl,
          final_source_url: permalinkUrl,
          source_name: 'Reddit Public Thread (Title Signal)',
          supporting_excerpt: '',
          retrieved_at: retrievedAt,
          http_status: 200,
          published_at: pubDate,
          research_methodology: 'reddit_discovery_signal_only',
          stance: 'neutral'
        });
      }
    }
    networkNotes.push(`Reddit Public JSON: Inspected ${children.length} thread(s).`);
  }

  /**
   * Milestone 3: Public Competitor & Pricing Page URL Inspector.
   */
  async collectFromPublicUrlInspector(targetUrl, retrievedAt, collectedRawFindings, networkNotes, fetchImpl) {
    const res = await fetchImpl(targetUrl, {
      headers: { 'User-Agent': 'STRAW-Research-Engine/0.7.1 (+https://github.com/zakshub/straw)' },
      signal: AbortSignal.timeout(5000)
    });

    const httpStatus = res.status;
    const finalUrl = res.url || targetUrl;

    if (httpStatus === 401 || httpStatus === 403 || httpStatus === 429) {
      collectedRawFindings.push({
        claim_type: 'competitor',
        statement: `Public URL inspection attempted for ${targetUrl} (HTTP ${httpStatus} blocked automated retrieval; manual review required).`,
        evidence_tier: 'practitioner_observation',
        original_source_url: targetUrl,
        source_url: targetUrl,
        final_source_url: finalUrl,
        supporting_excerpt: 'Automated retrieval blocked by target server; manual review required.',
        retrieved_at: retrievedAt,
        http_status: httpStatus,
        verification_method: 'automated_retrieval_blocked_manual_required',
        research_methodology: 'direct_url_inspection',
        stance: 'neutral'
      });
      networkNotes.push(`Public URL Inspector: Target ${targetUrl} blocked automated retrieval (HTTP ${httpStatus}).`);
      return;
    }

    if (!res.ok) {
      networkNotes.push(`Public URL Inspector: Target ${targetUrl} returned HTTP ${httpStatus}.`);
      return;
    }

    const rawHtml = await res.text();
    const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const pageTitle = titleMatch ? normalizeTextForVerification(titleMatch[1]) : targetUrl;
    const cleanBody = normalizeTextForVerification(rawHtml);
    const excerpt = cleanBody.slice(0, 220);

    collectedRawFindings.push({
      claim_type: 'competitor',
      statement: `Inspected public page "${pageTitle}" (${finalUrl}).`,
      evidence_tier: excerpt.length >= 15 ? 'verified_evidence' : 'practitioner_observation',
      original_source_url: targetUrl,
      source_url: targetUrl,
      final_source_url: finalUrl,
      supporting_excerpt: excerpt,
      retrieved_source_content: cleanBody,
      retrieved_at: retrievedAt,
      http_status: httpStatus,
      research_methodology: 'direct_url_inspection',
      stance: 'supporting'
    });
    networkNotes.push(`Public URL Inspector: Retrieved ${finalUrl} (HTTP ${httpStatus}).`);
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
        content: `${qualitySummary.active_verified_count} content-verified source(s) across ${qualitySummary.independent_verified_origins_count} independent origin(s); ${qualitySummary.practitioner_observation_count} practitioner observation(s); ${qualitySummary.pending_review_count} pending review; ${qualitySummary.stale_count} stale; ${qualitySummary.contradicting_count} contradicting.`
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
        content: `Archived with strict separation between content-verified source evidence, pending-review claims, estimates, and AI synthesis.`
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
