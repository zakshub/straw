import crypto from 'node:crypto';
import net from 'node:net';
import dns from 'node:dns';

export const MAX_SOURCE_RESPONSE_BYTES = 512 * 1024; // 512 KB hard cap
export const MAX_SAFE_REDIRECTS = 3;
export const DEFAULT_FETCH_TIMEOUT_MS = 5000;

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
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '::',
  'metadata',
  'metadata.google.internal',
  'instance-data',
  'example.com',
  'www.example.com',
  'example.org',
  'example.net',
  'test.invalid',
  'placeholder.com',
  'fake.url'
]);

const RESTRICTED_HOST_SUFFIXES = [
  '.localhost',
  '.local',
  '.localdomain',
  '.internal',
  '.intranet',
  '.corp',
  '.home',
  '.lan',
  '.arpa',
  '.invalid',
  '.test',
  '.example'
];

/**
 * Parses an IPv4 dotted-quad string strictly (no leading zeros/octal, exactly 4 octets 0..255).
 */
function parseStrictIpv4Octets(ipStr) {
  const m = String(ipStr).match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const octets = [];
  for (let i = 1; i <= 4; i++) {
    const part = m[i];
    if (part.length > 1 && part.startsWith('0')) {
      return null; // Reject octal-like leading zeros
    }
    const val = Number(part);
    if (!Number.isInteger(val) || val < 0 || val > 255) return null;
    octets.push(val);
  }
  return octets;
}

/**
 * Expands a valid IPv6 string into 8 16-bit unsigned integers (words[0..7]).
 */
function expandIpv6Words(ipStr) {
  let addr = String(ipStr).toLowerCase().trim();
  if (addr.startsWith('[') && addr.endsWith(']')) {
    addr = addr.slice(1, -1);
  }
  if (!net.isIPv6(addr)) return null;

  // Handle embedded IPv4 at end of IPv6 (e.g. ::ffff:127.0.0.1)
  const lastColon = addr.lastIndexOf(':');
  const tail = addr.slice(lastColon + 1);
  if (tail.includes('.')) {
    const octets = parseStrictIpv4Octets(tail);
    if (!octets) return null;
    const highWord = ((octets[0] << 8) | octets[1]).toString(16);
    const lowWord = ((octets[2] << 8) | octets[3]).toString(16);
    addr = `${addr.slice(0, lastColon + 1)}${highWord}:${lowWord}`;
  }

  const halves = addr.split('::');
  if (halves.length > 2) return null;

  const leftParts = halves[0] ? halves[0].split(':').filter(Boolean) : [];
  const rightParts = halves.length === 2 && halves[1] ? halves[1].split(':').filter(Boolean) : [];
  const missing = 8 - (leftParts.length + rightParts.length);
  if (halves.length === 1 && missing !== 0) return null;
  if (halves.length === 2 && missing < 1) return null;

  const fullParts = [...leftParts, ...Array(Math.max(0, missing)).fill('0'), ...rightParts];
  if (fullParts.length !== 8) return null;

  return fullParts.map((hex) => parseInt(hex, 16));
}

/**
 * Phase 7.2 Requirement 1: Determines whether an IPv4 or IPv6 address is private,
 * loopback, link-local, CGNAT, multicast, broadcast, documentation, or otherwise reserved.
 */
export function isPrivateOrReservedIp(rawIp) {
  if (!rawIp || typeof rawIp !== 'string') {
    return { blocked: true, reason: 'Empty or invalid IP address.' };
  }

  let ip = rawIp.trim();
  if (ip.startsWith('[') && ip.endsWith(']')) {
    ip = ip.slice(1, -1);
  }

  if (ip.includes('%')) {
    return { blocked: true, reason: 'IPv6 zone identifiers are disallowed.' };
  }

  const octets = parseStrictIpv4Octets(ip);
  if (octets) {
    const [a, b, c] = octets;
    if (a === 0) return { blocked: true, reason: 'Unspecified/current network (0.0.0.0/8) is blocked.' };
    if (a === 10) return { blocked: true, reason: 'Private IPv4 range (10.0.0.0/8) is blocked.' };
    if (a === 100 && b >= 64 && b <= 127) {
      return { blocked: true, reason: 'Carrier-Grade NAT shared range (100.64.0.0/10) is blocked.' };
    }
    if (a === 127) return { blocked: true, reason: 'Loopback IPv4 range (127.0.0.0/8) is blocked.' };
    if (a === 169 && b === 254) {
      return { blocked: true, reason: 'Link-local / cloud metadata range (169.254.0.0/16) is blocked.' };
    }
    if (a === 172 && b >= 16 && b <= 31) {
      return { blocked: true, reason: 'Private IPv4 range (172.16.0.0/12) is blocked.' };
    }
    if (a === 192 && b === 0 && c === 0) {
      return { blocked: true, reason: 'IETF reserved range (192.0.0.0/24) is blocked.' };
    }
    if (a === 192 && b === 0 && c === 2) {
      return { blocked: true, reason: 'TEST-NET-1 documentation range (192.0.2.0/24) is blocked.' };
    }
    if (a === 192 && b === 88 && c === 99) {
      return { blocked: true, reason: '6to4 relay anycast range (192.88.99.0/24) is blocked.' };
    }
    if (a === 192 && b === 168) {
      return { blocked: true, reason: 'Private IPv4 range (192.168.0.0/16) is blocked.' };
    }
    if (a === 198 && (b === 18 || b === 19)) {
      return { blocked: true, reason: 'Benchmark testing range (198.18.0.0/15) is blocked.' };
    }
    if (a === 198 && b === 51 && c === 100) {
      return { blocked: true, reason: 'TEST-NET-2 documentation range (198.51.100.0/24) is blocked.' };
    }
    if (a === 203 && b === 0 && c === 113) {
      return { blocked: true, reason: 'TEST-NET-3 documentation range (203.0.113.0/24) is blocked.' };
    }
    if (a >= 224) {
      return { blocked: true, reason: 'Multicast / reserved / broadcast IPv4 range (224.0.0.0/3) is blocked.' };
    }
    return { blocked: false, reason: 'Public IPv4 address.' };
  }

  if (net.isIPv6(ip)) {
    const w = expandIpv6Words(ip);
    if (!w) {
      return { blocked: true, reason: 'Malformed IPv6 address.' };
    }

    const allZero = w.every((word) => word === 0);
    if (allZero) {
      return { blocked: true, reason: 'Unspecified IPv6 address (::) is blocked.' };
    }

    const isLoopback = w.slice(0, 7).every((word) => word === 0) && w[7] === 1;
    if (isLoopback) {
      return { blocked: true, reason: 'Loopback IPv6 address (::1) is blocked.' };
    }

    // IPv4-mapped (::ffff:0:0/96) or IPv4-compatible (::/96)
    const isIpv4Mapped = w.slice(0, 5).every((word) => word === 0) && w[5] === 0xffff;
    const isIpv4Compatible = w.slice(0, 6).every((word) => word === 0);
    const isNat64 = w[0] === 0x0064 && w[1] === 0xff9b;

    if (isIpv4Mapped || isIpv4Compatible || isNat64) {
      const embeddedIpv4 = `${(w[6] >> 8) & 0xff}.${w[6] & 0xff}.${(w[7] >> 8) & 0xff}.${w[7] & 0xff}`;
      const v4Check = isPrivateOrReservedIp(embeddedIpv4);
      if (v4Check.blocked) {
        return { blocked: true, reason: `Embedded IPv4 in IPv6 (${embeddedIpv4}) is blocked: ${v4Check.reason}` };
      }
      return { blocked: false, reason: 'Public IPv4-mapped IPv6 address.' };
    }

    // 6to4 (2002::/16) embeds IPv4 in words[1] and words[2]
    if (w[0] === 0x2002) {
      const embedded6to4 = `${(w[1] >> 8) & 0xff}.${w[1] & 0xff}.${(w[2] >> 8) & 0xff}.${w[2] & 0xff}`;
      const v4Check = isPrivateOrReservedIp(embedded6to4);
      if (v4Check.blocked) {
        return { blocked: true, reason: `6to4 embedded IPv4 (${embedded6to4}) is blocked: ${v4Check.reason}` };
      }
    }

    // Unique Local IPv6 (fc00::/7 -> fc00::/8 and fd00::/8)
    if ((w[0] & 0xfe00) === 0xfc00) {
      return { blocked: true, reason: 'Unique Local IPv6 address (fc00::/7) is blocked.' };
    }

    // Link-Local IPv6 (fe80::/10)
    if ((w[0] & 0xffc0) === 0xfe80) {
      return { blocked: true, reason: 'Link-local IPv6 address (fe80::/10) is blocked.' };
    }

    // Site-Local IPv6 (fec0::/10)
    if ((w[0] & 0xffc0) === 0xfec0) {
      return { blocked: true, reason: 'Site-local IPv6 address (fec0::/10) is blocked.' };
    }

    // Multicast IPv6 (ff00::/8)
    if ((w[0] & 0xff00) === 0xff00) {
      return { blocked: true, reason: 'Multicast IPv6 address (ff00::/8) is blocked.' };
    }

    // Documentation IPv6 (2001:db8::/32)
    if (w[0] === 0x2001 && w[1] === 0x0db8) {
      return { blocked: true, reason: 'Documentation IPv6 address (2001:db8::/32) is blocked.' };
    }

    // Teredo (2001:0000::/32) & Benchmarking (2001:0002::/48)
    if (w[0] === 0x2001 && (w[1] === 0x0000 || (w[1] === 0x0002 && w[2] === 0x0000))) {
      return { blocked: true, reason: 'Reserved Teredo/Benchmarking IPv6 range is blocked.' };
    }

    return { blocked: false, reason: 'Public IPv6 address.' };
  }

  return { blocked: true, reason: 'Unrecognized IP literal format.' };
}

/**
 * Detects obfuscated IP hostnames such as decimal integers (2130706433),
 * hex literals (0x7f000001), octal octets (0177.0.0.1), or shorthand IPv4 (127.1).
 */
function isObfuscatedNumericHost(host) {
  if (/^\d+$/.test(host)) return true;
  if (/^0x[0-9a-f]+$/i.test(host)) return true;
  if (/^[0-9a-fx.]+$/i.test(host) && !host.includes(':')) {
    const parts = host.split('.');
    if (parts.every((p) => /^(0x[0-9a-f]+|\d+)$/i.test(p))) {
      return parseStrictIpv4Octets(host) === null;
    }
  }
  return false;
}

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
 * Strips HTML tags, decodes common HTML entities, preserves JSON-LD (<script type="application/ld+json">)
 * structured metadata descriptions while stripping executable <script> and <style> blocks,
 * and normalizes whitespace for content matching.
 */
export function normalizeTextForVerification(rawText) {
  if (!rawText) return '';
  return String(rawText)
    .replace(/<script(?![^>]*application\/ld\+json)[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/')
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Phase 7.2 Requirement 2: Computes the complete 64-character SHA-256 hexadecimal digest
 * of retrieved source content. Kept strictly separate from 24-character evidence fingerprints.
 */
export function computeContentHash(content) {
  if (!content) return '';
  return crypto.createHash('sha256').update(String(content)).digest('hex');
}

export function isValidSha256Hex(hash) {
  return typeof hash === 'string' && /^[a-f0-9]{64}$/i.test(hash);
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
export function detectUnsupportedWillingnessToPayClaim({
  statement = '',
  claim_type = 'demand',
  supporting_excerpt = '',
  source_url = '',
  commercial_commitment_status = '',
  transaction_reference = ''
}) {
  // Strip explicit negative disclaimers (e.g. "not willingness to pay", "does not prove willingness to pay") before checking
  const sanitizedStatement = `${statement}`
    .toLowerCase()
    .replace(/(?:not|never|no|does\s+not\s+prove|not\s+commercial)\s+willing(?:ness)?\s+to\s+pay/gi, '');
  const excerptLower = `${supporting_excerpt}`.toLowerCase();
  const urlLower = `${source_url}`.toLowerCase();
  const combined = `${sanitizedStatement} ${excerptLower} ${urlLower}`;

  const claimsWtpOrPricing =
    claim_type === 'pricing' ||
    /willing(ness)?\s+to\s+pay|will\s+pay|paid\s+demand|proven\s+revenue|paying\s+customers|commercial\s+demand|commercial\s+commitment/i.test(
      sanitizedStatement
    );

  // 1. Competitor published pricing is competitor activity, NEVER proof of buyer willingness to pay for our product!
  const isCompetitorPricingOrDirectory =
    urlLower.includes('/pricing') ||
    urlLower.includes('getstark.co') ||
    urlLower.includes('github.com/') ||
    urlLower.includes('wordpress.org/plugins/') ||
    /\b(competitor|competitor's|incumbent|existing\s+product|open-source|plugin\s+listing|pro\s+plan\s+is|team\s+plan\s+is|they\s+charge|competitor\s+charges)\b/i.test(
      combined
    );

  if (claimsWtpOrPricing && isCompetitorPricingOrDirectory) {
    return {
      violates_wtp_rule: true,
      reason:
        'Published competitor pricing, directories, and repository listings reflect competitor activity in the market, not verified buyer willingness to pay, and do not prove willingness to pay or commercial commitment for our proposed product.'
    };
  }

  const hasExplicitPriceOrPaymentEvidence =
    /\$\d+|\d+\s*(usd|eur|gbp)|\/mo(nth)?|\/yr|\/year|paid\s+plan|paid\s+tier|pro\s+tier|annual\s+license|purchased|subscription\s+fee|paid\s+extension/i.test(
      excerptLower
    );

  const isOnlyPopularityOrInstallCount =
    /active\s+install(ation)?s|stars|stargazers|forks|upvotes|points|comments|discussion\s+volume|product\s+listing|free\s+plugin|open\s+source/i.test(
      excerptLower
    ) && !hasExplicitPriceOrPaymentEvidence;

  // Also check if claim_type === 'demand' or pricing claim relies solely on free install count or discussion count without payment text
  if (claimsWtpOrPricing && !hasExplicitPriceOrPaymentEvidence && !transaction_reference) {
    return {
      violates_wtp_rule: true,
      reason:
        'Willingness-to-pay / pricing claim is not supported by explicit payment or pricing evidence in the source excerpt (install counts, listings, or discussion volume do not prove willingness to pay).'
    };
  }

  // 2. Interview responses, verbal interest, pricing reactions, and hypothetical statements check
  const isHypotheticalOrInterviewOnly =
    commercial_commitment_status === 'verbal_interest' ||
    commercial_commitment_status === 'pricing_reaction' ||
    commercial_commitment_status === 'proposal_requested' ||
    /(?:interview|interviewee|interview\s+response|survey\s+response|call\s+notes?|verbal\s+quote|expressed\s+interest|hypothetical|would\s+pay|would\s+buy|willing\s+to\s+consider|said\s+they\s+would|might\s+buy|might\s+pay|stated\s+interest|pricing\s+reaction|price\s+reaction|verbal\s+interest)\b/i.test(
      `${sanitizedStatement} ${excerptLower}`
    );

  const hasExecutedCommercialTransaction =
    commercial_commitment_status === 'contract_signed' ||
    commercial_commitment_status === 'purchase_order_confirmed' ||
    commercial_commitment_status === 'payment_received' ||
    (Boolean(transaction_reference) &&
      /(?:paid\s+pilot\s+(?:deposit|contract|invoice|agreement)|invoice\s+#?\d+|stripe\s+invoice|deposit\s+paid|pre-?order\s+deposit|receipt|billed\s+and\s+paid|commercial\s+license\s+purchased|active\s+paid\s+contract)\b/i.test(
        `${sanitizedStatement} ${excerptLower}`
      ));

  if (claimsWtpOrPricing && isHypotheticalOrInterviewOnly && !hasExecutedCommercialTransaction) {
    return {
      violates_wtp_rule: true,
      reason:
        'Interview responses, expressions of interest, and hypothetical pricing reactions cannot qualify as verified willingness to pay. Only concrete and independently verifiable commercial commitments (paid pilot deposits, executed invoices, or transaction receipts) qualify.'
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
 * Extracts and validates an HTTP/HTTPS URL format from a string or explicit URL field,
 * blocking SSRF targets (localhost, private IPv4/IPv6, link-local, obfuscated IPs, internal suffixes).
 * Note: This validates URL syntax and literal IP/hostname safety — DNS resolution is checked in validatePublicTargetWithDns().
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

  if (!urlStr) {
    return {
      valid: false,
      ssrf_blocked: false,
      originalUrl: '',
      normalizedUrl: '',
      hostname: '',
      reason: 'Missing source URL.'
    };
  }

  try {
    // Reject raw IPv4 octal/hex/short notations before WHATWG URL canonicalizes them into 127.0.0.1!
    const rawHostMatch = urlStr.match(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/([^/?#]+)/);
    if (rawHostMatch) {
      const rawAuthorityHost = rawHostMatch[1].replace(/^.*@/, '').replace(/:\d+$/, '').toLowerCase();
      if (isObfuscatedNumericHost(rawAuthorityHost)) {
        return {
          valid: false,
          ssrf_blocked: true,
          originalUrl: urlStr,
          normalizedUrl: '',
          hostname: rawAuthorityHost,
          reason: 'Blocked by SSRF policy: Obfuscated octal/hex/integer IP literal is disallowed.'
        };
      }
    }

    const parsed = new URL(urlStr);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return {
        valid: false,
        ssrf_blocked: true,
        originalUrl: urlStr,
        normalizedUrl: '',
        hostname: '',
        reason: 'URL must use http or https protocol.'
      };
    }

    if (parsed.username || parsed.password) {
      return {
        valid: false,
        ssrf_blocked: true,
        originalUrl: urlStr,
        normalizedUrl: '',
        hostname: '',
        reason: 'Blocked by SSRF policy: Embedded URL credentials are disallowed.'
      };
    }

    const rawHost = parsed.hostname.toLowerCase().replace(/\.$/, '');
    const unbracketedHost =
      rawHost.startsWith('[') && rawHost.endsWith(']') ? rawHost.slice(1, -1) : rawHost;

    if (
      !unbracketedHost ||
      DISALLOWED_HOSTNAMES.has(rawHost) ||
      DISALLOWED_HOSTNAMES.has(unbracketedHost) ||
      RESTRICTED_HOST_SUFFIXES.some((suffix) => unbracketedHost.endsWith(suffix))
    ) {
      return {
        valid: false,
        ssrf_blocked: true,
        originalUrl: urlStr,
        normalizedUrl: '',
        hostname: rawHost,
        reason: 'Blocked by SSRF policy: Localhost, internal, or placeholder hostname is disallowed.'
      };
    }

    if (isObfuscatedNumericHost(unbracketedHost)) {
      return {
        valid: false,
        ssrf_blocked: true,
        originalUrl: urlStr,
        normalizedUrl: '',
        hostname: rawHost,
        reason: 'Blocked by SSRF policy: Obfuscated numeric IP notation is disallowed.'
      };
    }

    // Check if hostname is an IPv4 or IPv6 literal
    const isIpv6Literal = rawHost.startsWith('[') || unbracketedHost.includes(':');
    const isIpv4Literal = parseStrictIpv4Octets(unbracketedHost) !== null;

    if (isIpv4Literal || isIpv6Literal) {
      const ipCheck = isPrivateOrReservedIp(unbracketedHost);
      if (ipCheck.blocked) {
        return {
          valid: false,
          ssrf_blocked: true,
          originalUrl: urlStr,
          normalizedUrl: '',
          hostname: rawHost,
          reason: `Blocked by SSRF policy: ${ipCheck.reason}`
        };
      }
    } else if (!unbracketedHost.includes('.')) {
      return {
        valid: false,
        ssrf_blocked: true,
        originalUrl: urlStr,
        normalizedUrl: '',
        hostname: rawHost,
        reason: 'Blocked by SSRF policy: Single-label unqualified internal hostname is disallowed.'
      };
    }

    parsed.hash = '';
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((p) =>
      parsed.searchParams.delete(p)
    );
    // Preserve trailing slashes on non-root paths (e.g. /TR/WCAG22/ or /plugins/slug/)
    // so canonical directory URLs do not trigger 301 redirect loops.
    const serialized = parsed.toString();
    const normalized =
      parsed.pathname === '/' && !parsed.search && !urlStr.trim().endsWith('/')
        ? serialized.replace(/\/$/, '')
        : serialized;
    return {
      valid: true,
      ssrf_blocked: false,
      originalUrl: urlStr,
      normalizedUrl: normalized,
      hostname: rawHost,
      unbracketedHost,
      isIpLiteral: isIpv4Literal || isIpv6Literal,
      reason: 'Valid public URL format.'
    };
  } catch {
    return {
      valid: false,
      ssrf_blocked: false,
      originalUrl: urlStr,
      normalizedUrl: '',
      hostname: '',
      reason: 'Malformed URL syntax.'
    };
  }
}

/**
 * Phase 7.2 Requirement 1.2 & 1.3: Validates DNS resolution before connecting
 * and performs two-phase resolution to detect and block DNS rebinding attacks.
 */
export async function validatePublicTargetWithDns(urlStr, { dnsLookup } = {}) {
  const urlCheck = extractValidPublicUrl(urlStr);
  if (!urlCheck.valid) {
    const err = new Error(urlCheck.reason);
    err.code = urlCheck.ssrf_blocked ? 'ERR_SSRF_BLOCKED' : 'ERR_INVALID_URL';
    throw err;
  }

  if (urlCheck.isIpLiteral) {
    return {
      normalizedUrl: urlCheck.normalizedUrl,
      hostname: urlCheck.hostname,
      resolvedAddress: urlCheck.unbracketedHost
    };
  }

  const lookupFn = dnsLookup || dns.promises.lookup;

  // Phase 1 Pre-flight DNS Lookup
  let recordsPhase1;
  try {
    recordsPhase1 = await lookupFn(urlCheck.unbracketedHost, { all: true, verbatim: true });
  } catch {
    const err = new Error('DNS resolution failed for target hostname.');
    err.code = 'ERR_DNS_LOOKUP_FAILED';
    throw err;
  }

  const list1 = Array.isArray(recordsPhase1)
    ? recordsPhase1
    : recordsPhase1 && recordsPhase1.address
      ? [recordsPhase1]
      : [];

  if (list1.length === 0) {
    const err = new Error('DNS resolution returned zero addresses.');
    err.code = 'ERR_DNS_LOOKUP_FAILED';
    throw err;
  }

  const publicSet1 = new Set();
  for (const rec of list1) {
    const ipCheck = isPrivateOrReservedIp(rec.address);
    if (ipCheck.blocked) {
      const err = new Error('Blocked by SSRF policy: Hostname resolved to a private or reserved IP address.');
      err.code = 'ERR_SSRF_BLOCKED';
      throw err;
    }
    publicSet1.add(rec.address);
  }

  // Phase 2 Connection-time DNS Rebinding Verification
  let recordsPhase2;
  try {
    recordsPhase2 = await lookupFn(urlCheck.unbracketedHost, { all: true, verbatim: true });
  } catch {
    const err = new Error('Connection-time DNS verification failed.');
    err.code = 'ERR_DNS_LOOKUP_FAILED';
    throw err;
  }

  const list2 = Array.isArray(recordsPhase2)
    ? recordsPhase2
    : recordsPhase2 && recordsPhase2.address
      ? [recordsPhase2]
      : [];

  if (list2.length === 0) {
    const err = new Error('Connection-time DNS resolution returned zero addresses.');
    err.code = 'ERR_DNS_LOOKUP_FAILED';
    throw err;
  }

  let hasOverlap = false;
  for (const rec of list2) {
    const ipCheck = isPrivateOrReservedIp(rec.address);
    if (ipCheck.blocked) {
      const err = new Error('Blocked by SSRF policy: DNS rebinding to private or reserved IP detected.');
      err.code = 'ERR_SSRF_DNS_REBINDING';
      throw err;
    }
    if (publicSet1.has(rec.address)) {
      hasOverlap = true;
    }
  }

  if (!hasOverlap) {
    const err = new Error('Blocked by SSRF policy: Unstable DNS resolution (potential DNS rebinding) detected.');
    err.code = 'ERR_SSRF_DNS_REBINDING';
    throw err;
  }

  return {
    normalizedUrl: urlCheck.normalizedUrl,
    hostname: urlCheck.hostname,
    resolvedAddress: list2[0].address
  };
}

/**
 * Reads response body up to `maxResponseBytes` and throws `ERR_RESPONSE_TOO_LARGE` if exceeded.
 */
async function readBodyWithSizeLimit(res, maxResponseBytes = MAX_SOURCE_RESPONSE_BYTES) {
  const contentLengthHeader =
    typeof res.headers?.get === 'function'
      ? res.headers.get('content-length')
      : res.headers?.['content-length'] || res.headers?.['Content-Length'];

  if (contentLengthHeader !== undefined && contentLengthHeader !== null) {
    const declaredBytes = Number(contentLengthHeader);
    if (Number.isFinite(declaredBytes) && declaredBytes > maxResponseBytes) {
      const err = new Error(`Response Content-Length (${declaredBytes} bytes) exceeds limit (${maxResponseBytes} bytes).`);
      err.code = 'ERR_RESPONSE_TOO_LARGE';
      throw err;
    }
  }

  if (res.body && typeof res.body.getReader === 'function') {
    const reader = res.body.getReader();
    const chunks = [];
    let totalBytes = 0;
    const decoder = new TextDecoder('utf-8');

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunkBytes = value ? value.byteLength : 0;
        totalBytes += chunkBytes;
        if (totalBytes > maxResponseBytes) {
          await reader.cancel().catch(() => {});
          const err = new Error(`Response stream exceeded maximum allowed size (${maxResponseBytes} bytes).`);
          err.code = 'ERR_RESPONSE_TOO_LARGE';
          throw err;
        }
        chunks.push(decoder.decode(value, { stream: true }));
      }
      chunks.push(decoder.decode());
      return chunks.join('');
    } finally {
      reader.releaseLock?.();
    }
  }

  const text = await res.text();
  const actualBytes = Buffer.byteLength(String(text || ''), 'utf8');
  if (actualBytes > maxResponseBytes) {
    const err = new Error(`Response body (${actualBytes} bytes) exceeded maximum allowed size (${maxResponseBytes} bytes).`);
    err.code = 'ERR_RESPONSE_TOO_LARGE';
    throw err;
  }
  return text;
}

/**
 * Offline-safe fallback DNS resolver used ONLY when a unit test supplies a mocked fetchImpl
 * without a custom dnsLookup, ensuring `npm test` never depends on an internet connection.
 */
async function defaultMockFetchDnsLookup(hostname) {
  const check = isPrivateOrReservedIp(hostname);
  if (!check.blocked) {
    return [{ address: hostname, family: hostname.includes(':') ? 6 : 4 }];
  }
  return [{ address: '93.184.216.34', family: 4 }];
}

/**
 * Phase 7.2 Requirement 1: SSRF-hardened HTTP/HTTPS fetcher.
 * - Enforces HTTP/HTTPS only
 * - Validates literal IPs and resolves DNS (with two-phase rebinding check) before every hop
 * - Disables automatic redirects (`redirect: 'manual'`) and validates every redirect target
 * - Enforces strict timeout (`timeoutMs`) and response size limit (`maxResponseBytes`)
 */
export async function safePublicFetch(
  initialUrl,
  {
    fetchImpl = globalThis.fetch,
    dnsLookup,
    headers = {},
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
    maxRedirects = MAX_SAFE_REDIRECTS,
    maxResponseBytes = MAX_SOURCE_RESPONSE_BYTES
  } = {}
) {
  const effectiveDnsLookup =
    dnsLookup || (fetchImpl === globalThis.fetch ? dns.promises.lookup : defaultMockFetchDnsLookup);

  let currentUrl = initialUrl;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const validated = await validatePublicTargetWithDns(currentUrl, {
      dnsLookup: effectiveDnsLookup
    });

    const res = await fetchImpl(validated.normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'STRAW-Research-Engine/0.7.2 (+https://github.com/zakshub/straw)',
        Accept: 'text/html,application/xhtml+xml,application/json,text/plain;q=0.9,*/*;q=0.8',
        ...headers
      },
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs)
    });

    const status = res.status;
    if (status === 301 || status === 302 || status === 303 || status === 307 || status === 308) {
      if (hop >= maxRedirects) {
        const err = new Error(`Exceeded maximum redirect limit (${maxRedirects}).`);
        err.code = 'ERR_TOO_MANY_REDIRECTS';
        throw err;
      }

      const locationHeader =
        typeof res.headers?.get === 'function'
          ? res.headers.get('location')
          : res.headers?.location || res.headers?.Location;

      if (!locationHeader) {
        const err = new Error('Redirect response missing Location header.');
        err.code = 'ERR_INVALID_REDIRECT';
        throw err;
      }

      let resolvedNextUrl;
      try {
        resolvedNextUrl = new URL(locationHeader, validated.normalizedUrl).toString();
      } catch {
        const err = new Error('Malformed redirect Location URL.');
        err.code = 'ERR_INVALID_REDIRECT';
        throw err;
      }

      // Validate redirect destination immediately (will throw ERR_SSRF_BLOCKED if private/internal/non-http)
      await validatePublicTargetWithDns(resolvedNextUrl, {
        dnsLookup: effectiveDnsLookup
      });

      currentUrl = resolvedNextUrl;
      continue;
    }

    const bodyText = await readBodyWithSizeLimit(res, maxResponseBytes);
    const ok = res.ok !== undefined ? res.ok : status >= 200 && status < 300;
    return {
      status,
      ok,
      finalUrl: validated.normalizedUrl,
      text: bodyText
    };
  }

  const err = new Error('Redirect resolution failed.');
  err.code = 'ERR_TOO_MANY_REDIRECTS';
  throw err;
}

export function computeEvidenceFingerprint({ opportunityId, normalizedUrl, statement, claimType }) {
  const cleanStatement = String(statement || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const canonicalDedupUrl = normalizedUrl ? String(normalizedUrl).toLowerCase().replace(/\/$/, '') : '';
  const basis = canonicalDedupUrl
    ? `${opportunityId}::${claimType}::${canonicalDedupUrl}::${cleanStatement.slice(0, 120)}`
    : `${opportunityId}::${claimType}::no-url::${cleanStatement}`;

  return crypto.createHash('sha256').update(basis).digest('hex').slice(0, 24);
}

export const COMMERCIAL_EVIDENCE_CATEGORIES = {
  problem_existence: 'Problem Existence',
  market_demand: 'Market Demand',
  competitor_activity: 'Competitor Activity',
  unverified_willingness_to_pay: 'Unverified Buyer Willingness to Pay',
  verified_commercial_commitment: 'Verified Buyer Commercial Commitment',
  willingness_to_pay: 'Verified Buyer Commercial Commitment' // backwards compatibility alias
};

export const COMMERCIAL_COMMITMENT_STATUSES = {
  NONE: '',
  VERBAL_INTEREST: 'verbal_interest',
  PRICING_REACTION: 'pricing_reaction',
  PROPOSAL_REQUESTED: 'proposal_requested',
  CONTRACT_SIGNED: 'contract_signed',
  PURCHASE_ORDER_CONFIRMED: 'purchase_order_confirmed',
  PAYMENT_RECEIVED: 'payment_received'
};

/**
 * Classifies an evidence record into one of the five distinct commercial validation categories:
 * 1. `problem_existence` — Normative specifications, regulatory mandates, accessibility friction, audit failures.
 * 2. `market_demand` — Active buyer search, problem discussions, or practitioner solution requests.
 * 3. `competitor_activity` — Existing tools, plugins, open-source repos, AND published competitor pricing models.
 * 4. `unverified_willingness_to_pay` — Expressions of interest, verbal interview quotes, survey price reactions.
 * 5. `verified_commercial_commitment` — Binding contracts, confirmed POs, paid pilots, verified customer invoices.
 */
export function classifyCommercialEvidenceCategory(ev = {}) {
  const claimType = String(ev.claim_type || 'demand').toLowerCase();
  const statement = String(ev.statement || '');
  const excerpt = String(ev.supporting_excerpt || '');
  const sourceUrl = String(ev.source_url || ev.original_source_url || '').toLowerCase();
  const commitmentStatus = String(ev.commercial_commitment_status || '').toLowerCase();
  const txRef = String(ev.transaction_reference || '').trim();
  const combined = `${statement} ${excerpt} ${sourceUrl}`;

  // Negation check (e.g. "does not prove willingness to pay")
  const hasExplicitNegation =
    /(?:not|never|no|does\s+not\s+prove|not\s+commercial)\s+willing(?:ness)?\s+to\s+pay|100%\s*free|free\s+open-?source|free\s+directory\s+plugin/i.test(
      combined
    );

  // 1. COMPETITOR ACTIVITY (MUST ALWAYS INCLUDE COMPETITOR PRICING PAGES & MODELS):
  // Published competitor pricing pages, plans, open-source repos, plugins, or competitor claim types
  const isCompetitorPricingOrActivity =
    claimType === 'competitor' ||
    sourceUrl.includes('github.com/') ||
    sourceUrl.includes('wordpress.org/plugins/') ||
    sourceUrl.includes('/pricing') ||
    sourceUrl.includes('getstark.co') ||
    /\b(competitor|competitor's|existing\s+product|open-source\s+github|existing\s+wordpress\.org|incumbent|pro\s+plan\s+is\s+\$\d+|team\s+plan\s+is\s+\$\d+|pricing\s+page)\b/i.test(
      combined
    );

  if (isCompetitorPricingOrActivity) {
    return 'competitor_activity';
  }

  // 2. PROBLEM EXISTENCE:
  // Normative specifications, regulatory directives, accessibility friction, bug reports, audit failures
  if (
    claimType === 'technical' ||
    claimType === 'risk' ||
    sourceUrl.includes('w3.org/') ||
    sourceUrl.includes('europa.eu/') ||
    sourceUrl.includes('ftc.gov/') ||
    /\b(wcag|normative|specification|ftc\s+orders|misleading\s+claims|regulation|directive|struggle|fail\s+wcag|manual(ly)?\s+fixing|undocumented|missing\s+edge-case)\b/i.test(
      combined
    )
  ) {
    return 'problem_existence';
  }

  // 3. VERIFIED BUYER COMMERCIAL COMMITMENT:
  // Explicitly requires executed commercial transaction for OUR product (not competitors, not verbal promises):
  // - contract_signed
  // - purchase_order_confirmed
  // - payment_received
  // - or explicit verifiable transaction text with reference
  const isVerifiedCommercialCommitment =
    commitmentStatus === 'contract_signed' ||
    commitmentStatus === 'purchase_order_confirmed' ||
    commitmentStatus === 'payment_received' ||
    (!hasExplicitNegation &&
      Boolean(txRef || /inv_|po-|stripe|receipt|deposit\s+paid/i.test(combined)) &&
      /\b(paid\s+pilot\s+deposit|paid\s+customer\s+invoice|pre-?order\s+deposit\s+paid|signed\s+(?:annual\s+)?license\s+contract|confirmed\s+purchase\s+order)\b/i.test(
        combined
      ));

  if (isVerifiedCommercialCommitment) {
    return 'verified_commercial_commitment';
  }

  // 4. UNVERIFIED BUYER WILLINGNESS TO PAY:
  // Verbal expressions of interest, survey pricing reactions, interview quotes ("would pay $49"), proposal requests
  const isUnverifiedWtp =
    commitmentStatus === 'verbal_interest' ||
    commitmentStatus === 'pricing_reaction' ||
    commitmentStatus === 'proposal_requested' ||
    (!hasExplicitNegation &&
      /\b(interview|interviewee|interview\s+response|survey\s+response|call\s+notes?|verbal\s+quote|expressed\s+interest|hypothetical|would\s+pay|would\s+buy|willing\s+to\s+consider|said\s+they\s+would|might\s+buy|might\s+pay|stated\s+interest|pricing\s+reaction|price\s+reaction|proposal\s+requested|verbal\s+interest)\b/i.test(
        combined
      ));

  if (isUnverifiedWtp) {
    return 'unverified_willingness_to_pay';
  }

  // 5. DEFAULT TO MARKET DEMAND
  return 'market_demand';
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

  const commitmentStatus = String(input.commercial_commitment_status || '').trim();
  const financialCommitmentUsd = Number(input.financial_commitment_usd) || 0;
  const transactionReference = String(input.transaction_reference || '').trim();

  const wtpCheck = detectUnsupportedWillingnessToPayClaim({
    statement,
    claim_type: input.claim_type || 'demand',
    supporting_excerpt: supportingExcerpt,
    source_url: urlCheck.normalizedUrl || originalSourceUrl,
    commercial_commitment_status: commitmentStatus,
    transaction_reference: transactionReference
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
    if (urlCheck.ssrf_blocked) {
      finalTier = 'assumption';
      verificationStatus = 'downgraded_unverified';
      verificationMethod = 'ssrf_blocked';
      notes.push(`Security block (SSRF protection): ${urlCheck.reason}`);
    } else if (requestedTier === 'verified_evidence' || requestedTier === 'practitioner_observation') {
      finalTier = 'assumption';
      verificationStatus = 'downgraded_unverified';
      verificationMethod = 'invalid_url_format';
      notes.push(`Downgraded from ${requestedTier} to assumption: ${urlCheck.reason}`);
    } else {
      verificationStatus = isStale ? 'stale' : 'pending_review';
      notes.push(`Recorded as ${finalTier} without public URL.`);
    }
  } else if (
    verificationMethod === 'ssrf_blocked' ||
    verificationMethod === 'ssrf_redirect_blocked' ||
    verificationMethod === 'ssrf_dns_rebinding_blocked'
  ) {
    finalTier = 'assumption';
    verificationStatus = 'downgraded_unverified';
    notes.push(
      `Security block (${verificationMethod}): Target resolved or redirected to a restricted/internal network address.`
    );
  } else if (verificationMethod === 'response_too_large') {
    finalTier = 'assumption';
    verificationStatus = 'downgraded_unverified';
    notes.push(
      `Source response exceeded the maximum allowed safety limit (${MAX_SOURCE_RESPONSE_BYTES} bytes) and was aborted.`
    );
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
    // Milestone 2 Requirement 5 + Phase 7.2 Requirement 2:
    // Must have excerptVerifiedInSource === 1, a full 64-character SHA-256 hex digest in sourceContentHash, and httpStatus === 200
    if (
      excerptVerifiedInSource === 1 &&
      isValidSha256Hex(sourceContentHash) &&
      (httpStatus === 200 || httpStatus === null)
    ) {
      if (sourceReliability < 0.5) {
        finalTier = 'practitioner_observation';
        verificationStatus = 'downgraded_unverified';
        notes.push(`Source reliability (${sourceReliability}) is below the 0.50 threshold for verified_evidence.`);
      } else {
        finalTier = 'verified_evidence';
        verificationStatus = 'verified';
        notes.push(
          `Verified against retrieved source content (${detectedSourceName}, sha256: ${sourceContentHash.slice(0, 12)}...) with confirmed supporting excerpt.`
        );
      }
    } else {
      // Valid URL format + manually supplied excerpt, but source content has NOT been retrieved/confirmed with a valid 64-char SHA-256 digest!
      finalTier = 'practitioner_observation';
      verificationStatus = 'pending_review';
      verificationMethod = 'url_format_only_unverified';
      notes.push(
        'URL format is valid and excerpt was supplied manually, but source content has not been retrieved (or lacks a valid 64-character SHA-256 content hash) to confirm the excerpt. Held as practitioner_observation (pending_review) until source retrieval confirms content.'
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

  const evidenceCategory = classifyCommercialEvidenceCategory({
    claim_type: input.claim_type || 'demand',
    statement,
    supporting_excerpt: supportingExcerpt,
    source_url: urlCheck.normalizedUrl || originalSourceUrl,
    commercial_commitment_status: commitmentStatus,
    financial_commitment_usd: financialCommitmentUsd,
    transaction_reference: transactionReference
  });

  return {
    statement,
    claim_type: input.claim_type || 'demand',
    evidence_category: evidenceCategory,
    commercial_commitment_status: commitmentStatus,
    financial_commitment_usd: financialCommitmentUsd,
    transaction_reference: transactionReference,
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

function sanitizeNetworkErrorForOutput(err) {
  const raw = String(err?.message || 'External source retrieval error.');
  return raw
    .replace(/\b(?:127\.\d+\.\d+\.\d+|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[0-1])\.\d+\.\d+|169\.254\.\d+\.\d+)\b/g, '[redacted-internal-ip]')
    .replace(/\b(?:ECONNREFUSED|EHOSTUNREACH|ENETUNREACH|EADDRNOTAVAIL)\b[^.]*/gi, 'External connection failed');
}

/**
 * Milestone 2 + Phase 7.2 SSRF-hardened source retrieval:
 * Retrieves a public source URL via HTTP/HTTPS and verifies whether
 * the supporting excerpt actually exists in the retrieved content.
 * - Rejects localhost, private IPv4/IPv6, link-local, loopback, reserved, and obfuscated IPs.
 * - Validates DNS resolution before connecting and prevents DNS rebinding.
 * - Manually validates every redirect hop and blocks redirects to internal/private targets.
 * - Enforces response size limits (MAX_SOURCE_RESPONSE_BYTES) and strict request timeouts.
 * - Never exposes raw internal network errors.
 */
export async function retrieveAndVerifySourceContent(
  input,
  {
    fetchImpl = globalThis.fetch,
    dnsLookup,
    timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
    maxRedirects = MAX_SAFE_REDIRECTS,
    maxResponseBytes = MAX_SOURCE_RESPONSE_BYTES,
    nowDate = new Date()
  } = {}
) {
  const urlCheck = extractValidPublicUrl(input.original_source_url || input.source_url, input.source_citation);
  if (!urlCheck.valid) {
    return verifyAndClassifyEvidence(
      {
        ...input,
        verification_method: urlCheck.ssrf_blocked ? 'ssrf_blocked' : 'invalid_url_format',
        excerpt_verified_in_source: 0
      },
      nowDate
    );
  }

  const retrievedAt = nowDate.toISOString();

  try {
    const safeRes = await safePublicFetch(urlCheck.normalizedUrl, {
      fetchImpl,
      dnsLookup,
      timeoutMs,
      maxRedirects,
      maxResponseBytes
    });

    const httpStatus = safeRes.status;
    const finalUrl = safeRes.finalUrl || urlCheck.normalizedUrl;

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

    if (!safeRes.ok) {
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

    const bodyText = safeRes.text;
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
    let method = 'http_retrieval_failed';
    if (err.code === 'ERR_SSRF_DNS_REBINDING') {
      method = 'ssrf_dns_rebinding_blocked';
    } else if (err.code === 'ERR_SSRF_BLOCKED' || err.ssrf_blocked) {
      method = 'ssrf_blocked';
    } else if (err.code === 'ERR_RESPONSE_TOO_LARGE') {
      method = 'response_too_large';
    }

    const safeMessage = sanitizeNetworkErrorForOutput(err);
    return verifyAndClassifyEvidence(
      {
        ...input,
        original_source_url: urlCheck.originalUrl,
        final_source_url: urlCheck.normalizedUrl,
        retrieved_at: retrievedAt,
        http_status: 0,
        excerpt_verified_in_source: 0,
        verification_method: method,
        source_citation: `${input.source_citation || urlCheck.normalizedUrl} (${safeMessage})`
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

  const categoryCounts = {
    problem_existence: { label: 'Problem Existence', verified: 0, total: 0 },
    market_demand: { label: 'Market Demand', verified: 0, total: 0 },
    competitor_activity: { label: 'Competitor Activity', verified: 0, total: 0 },
    unverified_willingness_to_pay: { label: 'Unverified Buyer WTP', verified: 0, total: 0 },
    verified_commercial_commitment: { label: 'Verified Commercial Commitment', verified: 0, total: 0 }
  };

  for (const ev of evidenceRecords) {
    const isStale = Boolean(ev.is_stale) || ev.verification_status === 'stale';
    let catKey = classifyCommercialEvidenceCategory(ev);
    if (catKey === 'willingness_to_pay') {
      catKey = 'verified_commercial_commitment';
    }
    if (categoryCounts[catKey]) {
      categoryCounts[catKey].total += 1;
    }

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
      if (categoryCounts[catKey]) {
        categoryCounts[catKey].verified += 1;
      }
      const urlInfo = extractValidPublicUrl(ev.source_url, ev.source_citation);
      if (urlInfo.valid) {
        verifiedOrigins.add(urlInfo.hostname);
      } else {
        verifiedOrigins.add(ev.source_name || ev.id);
      }
    }
  }

  // Alias for backwards compatibility
  categoryCounts.willingness_to_pay = categoryCounts.verified_commercial_commitment;

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

  const revenueReceivedCount = activeVerified.filter((e) => e.commercial_commitment_status === 'payment_received').length;
  const signedCommitmentCount = activeVerified.filter(
    (e) => e.commercial_commitment_status === 'contract_signed' || e.commercial_commitment_status === 'purchase_order_confirmed'
  ).length;

  return {
    total_records: evidenceRecords.length,
    active_verified_count: activeVerified.length,
    independent_verified_origins_count: verifiedOrigins.size,
    independent_origins: [...verifiedOrigins],
    verified_problem_count: categoryCounts.problem_existence.verified,
    verified_demand_count: categoryCounts.market_demand.verified,
    verified_competitor_count: categoryCounts.competitor_activity.verified,
    unverified_willingness_to_pay_count: categoryCounts.unverified_willingness_to_pay.total,
    verified_commercial_commitment_count: categoryCounts.verified_commercial_commitment.verified,
    verified_willingness_to_pay_count: categoryCounts.verified_commercial_commitment.verified,
    revenue_received_count: revenueReceivedCount,
    signed_commitment_count: signedCommitmentCount,
    total_committed_revenue_usd: activeVerified
      .filter((e) => e.commercial_commitment_status === 'payment_received')
      .reduce((sum, e) => sum + (Number(e.financial_commitment_usd) || 0), 0),
    total_signed_contract_value_usd: activeVerified
      .filter(
        (e) => e.commercial_commitment_status === 'contract_signed' || e.commercial_commitment_status === 'purchase_order_confirmed'
      )
      .reduce((sum, e) => sum + (Number(e.financial_commitment_usd) || 0), 0),
    evidence_categories: categoryCounts,
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

  async retrieveSourceForVerification(url, supportingExcerpt = '', { fetchImpl, dnsLookup } = {}) {
    const activeFetch = fetchImpl || this.fetchFn || globalThis.fetch;
    const activeDns = dnsLookup || this.dnsLookup;
    return retrieveAndVerifySourceContent(
      {
        source_url: url,
        supporting_excerpt: supportingExcerpt,
        evidence_tier: 'verified_evidence'
      },
      { fetchImpl: activeFetch, dnsLookup: activeDns }
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
    return this.db
      .prepare(sql)
      .all(...params)
      .map((r) => ({
        ...r,
        evidence_category: classifyCommercialEvidenceCategory(r)
      }));
  }

  /**
   * Retrieves the live source URL for an existing evidence record and verifies
   * whether the supporting excerpt actually exists in the retrieved content.
   */
  async verifyExistingEvidenceSource(evidenceId, { fetchImpl, dnsLookup } = {}) {
    const activeFetch = fetchImpl || this.fetchFn || globalThis.fetch;
    const activeDns = dnsLookup || this.dnsLookup;
    const existing = this.db.prepare('SELECT * FROM market_evidence WHERE id = ?').get(evidenceId);
    if (!existing) throw new Error(`Evidence record ${evidenceId} not found.`);

    const verified = await retrieveAndVerifySourceContent(
      {
        ...existing,
        evidence_tier: existing.requested_evidence_tier || existing.evidence_tier,
        previous_content_hash: existing.source_content_hash || ''
      },
      { fetchImpl: activeFetch, dnsLookup: activeDns }
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
    { fetchImpl, dnsLookup } = {}
  ) {
    const activeFetch = fetchImpl || this.fetchFn || globalThis.fetch;
    const activeDns = dnsLookup || this.dnsLookup;
    this.ensureDefaultSources();
    const runId = `run-${crypto.randomUUID().slice(0, 8)}`;
    const startedAt = new Date().toISOString();

    const allSources = this.listSources();
    const sources = allSources.filter((s) => source_ids.includes(s.id));

    // Milestone 1 + Phase 7.2 Req 4: Server-side Financial Approval Security Check for Paid Sources
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
            requestedCostUsd: requestedCost,
            requestedOpportunityId: opportunity_id
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
            await this.collectFromHackerNewsAlgolia(
              query_topic,
              startedAt,
              collectedRawFindings,
              networkNotes,
              activeFetch,
              activeDns
            );
          } else if (src.adapter_key === 'wordpress_plugins_api') {
            await this.collectFromWordPressPluginApi(
              query_topic,
              startedAt,
              collectedRawFindings,
              networkNotes,
              activeFetch,
              activeDns
            );
          } else if (src.adapter_key === 'github_repos_api') {
            await this.collectFromGitHubPublicApi(
              query_topic,
              startedAt,
              collectedRawFindings,
              networkNotes,
              activeFetch,
              activeDns
            );
          } else if (src.adapter_key === 'reddit_public_json') {
            await this.collectFromRedditPublicJson(
              query_topic,
              startedAt,
              collectedRawFindings,
              networkNotes,
              activeFetch,
              activeDns
            );
          } else if (src.adapter_key === 'public_url_inspector') {
            const urlToInspect = target_url || (query_topic.startsWith('http') ? query_topic : null);
            if (!urlToInspect) {
              networkNotes.push(`${src.name} requires a valid target_url parameter to inspect.`);
            } else {
              await this.collectFromPublicUrlInspector(
                urlToInspect,
                startedAt,
                collectedRawFindings,
                networkNotes,
                activeFetch,
                activeDns
              );
            }
          }
        } catch (err) {
          networkNotes.push(
            `${src.name} connector error (${sanitizeNetworkErrorForOutput(err)}); zero fabricated results.`
          );
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
  async collectFromHackerNewsAlgolia(
    queryTopic,
    retrievedAt,
    collectedRawFindings,
    networkNotes,
    fetchImpl,
    dnsLookup
  ) {
    const commentUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(queryTopic)}&tags=comment&hitsPerPage=4`;
    const commentRes = await safePublicFetch(commentUrl, {
      fetchImpl,
      dnsLookup,
      timeoutMs: DEFAULT_FETCH_TIMEOUT_MS
    });

    if (commentRes.status === 429) {
      networkNotes.push('Hacker News Algolia API rate-limited (HTTP 429).');
      return;
    }

    let commentsCaptured = 0;
    if (commentRes.ok) {
      const rawText = commentRes.text;
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
      const storyRes = await safePublicFetch(storyUrl, {
        fetchImpl,
        dnsLookup,
        timeoutMs: DEFAULT_FETCH_TIMEOUT_MS
      });

      if (!storyRes.ok) {
        networkNotes.push(`Hacker News Algolia story endpoint returned HTTP ${storyRes.status}.`);
        return;
      }

      const rawStoryText = storyRes.text;
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
  async collectFromWordPressPluginApi(
    queryTopic,
    retrievedAt,
    collectedRawFindings,
    networkNotes,
    fetchImpl,
    dnsLookup
  ) {
    const url = `https://api.wordpress.org/plugins/info/1.2/?action=query_plugins&request[search]=${encodeURIComponent(queryTopic)}&request[per_page]=3`;
    const res = await safePublicFetch(url, {
      fetchImpl,
      dnsLookup,
      timeoutMs: DEFAULT_FETCH_TIMEOUT_MS
    });

    if (!res.ok) {
      networkNotes.push(`WordPress.org Plugin API returned HTTP ${res.status}.`);
      return;
    }

    const rawText = res.text;
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
        const itemSourceContent = JSON.stringify({
          slug: pl.slug,
          name: pl.name,
          version: pl.version || null,
          active_installs: pl.active_installs || 0,
          rating: pl.rating || 0,
          num_ratings: pl.num_ratings || 0,
          last_updated: pl.last_updated || null,
          short_description: pl.short_description || pl.name,
          canonical_url: pluginUrl
        });

        collectedRawFindings.push({
          claim_type: 'competitor',
          statement: `Existing WordPress.org plugin "${pl.name}" (${pl.active_installs || 0}+ active installs, rating ${pl.rating || 0}/100 across ${pl.num_ratings || 0} ratings; free install count indicates existing alternative, not willingness to pay).`,
          evidence_tier: 'verified_evidence',
          original_source_url: pluginUrl,
          source_url: pluginUrl,
          final_source_url: pluginUrl,
          source_name: 'WordPress.org Official Plugin Directory API',
          supporting_excerpt: verbatimExcerpt,
          retrieved_source_content: itemSourceContent,
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
  async collectFromGitHubPublicApi(
    queryTopic,
    retrievedAt,
    collectedRawFindings,
    networkNotes,
    fetchImpl,
    dnsLookup
  ) {
    const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(queryTopic)}&per_page=3`;
    const res = await safePublicFetch(url, {
      fetchImpl,
      dnsLookup,
      timeoutMs: DEFAULT_FETCH_TIMEOUT_MS,
      headers: { Accept: 'application/vnd.github+json' }
    });

    if (res.status === 403 || res.status === 429) {
      networkNotes.push(`GitHub Public API rate-limited (HTTP ${res.status}).`);
      return;
    }
    if (!res.ok) {
      networkNotes.push(`GitHub Public API returned HTTP ${res.status}.`);
      return;
    }

    const rawText = res.text;
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
        const itemSourceContent = JSON.stringify({
          id: repo.id || repo.full_name,
          full_name: repo.full_name,
          html_url: repo.html_url,
          description: repo.description || repo.full_name,
          stargazers_count: repo.stargazers_count || 0,
          open_issues_count: repo.open_issues_count || 0,
          updated_at: repo.updated_at || null
        });
        collectedRawFindings.push({
          claim_type: 'competitor',
          statement: `Open-source GitHub repository "${repo.full_name}" (${repo.stargazers_count || 0} stars, ${repo.open_issues_count || 0} open issues; indicates technical alternative, not commercial willingness to pay).`,
          evidence_tier: 'verified_evidence',
          original_source_url: repo.html_url,
          source_url: repo.html_url,
          final_source_url: repo.html_url,
          source_name: 'GitHub Public Repositories API',
          supporting_excerpt: excerpt,
          retrieved_source_content: itemSourceContent,
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
  async collectFromRedditPublicJson(
    queryTopic,
    retrievedAt,
    collectedRawFindings,
    networkNotes,
    fetchImpl,
    dnsLookup
  ) {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(queryTopic)}&limit=3`;
    const res = await safePublicFetch(url, {
      fetchImpl,
      dnsLookup,
      timeoutMs: DEFAULT_FETCH_TIMEOUT_MS
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

    const rawText = res.text;
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
   * Milestone 3 + Phase 7.2 SSRF-hardened: Public Competitor & Pricing Page URL Inspector.
   */
  async collectFromPublicUrlInspector(
    targetUrl,
    retrievedAt,
    collectedRawFindings,
    networkNotes,
    fetchImpl,
    dnsLookup
  ) {
    let safeRes;
    try {
      safeRes = await safePublicFetch(targetUrl, {
        fetchImpl,
        dnsLookup,
        timeoutMs: DEFAULT_FETCH_TIMEOUT_MS
      });
    } catch (err) {
      const safeMsg = sanitizeNetworkErrorForOutput(err);
      const isSsrf =
        err.code === 'ERR_SSRF_BLOCKED' ||
        err.code === 'ERR_SSRF_DNS_REBINDING' ||
        err.ssrf_blocked;
      const isTooLarge = err.code === 'ERR_RESPONSE_TOO_LARGE';
      const method =
        err.code === 'ERR_SSRF_DNS_REBINDING'
          ? 'ssrf_dns_rebinding_blocked'
          : isSsrf
            ? 'ssrf_blocked'
            : isTooLarge
              ? 'response_too_large'
              : 'http_retrieval_failed';

      collectedRawFindings.push({
        claim_type: 'competitor',
        statement: `Public URL inspection blocked/failed for ${targetUrl}: ${safeMsg}`,
        evidence_tier: 'assumption',
        original_source_url: targetUrl,
        source_url: targetUrl,
        final_source_url: targetUrl,
        supporting_excerpt: '',
        retrieved_at: retrievedAt,
        http_status: 0,
        verification_method: method,
        research_methodology: 'direct_url_inspection',
        stance: 'neutral'
      });
      networkNotes.push(`Public URL Inspector blocked/failed (${safeMsg}).`);
      return;
    }

    const httpStatus = safeRes.status;
    const finalUrl = safeRes.finalUrl || targetUrl;

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

    if (!safeRes.ok) {
      networkNotes.push(`Public URL Inspector: Target ${targetUrl} returned HTTP ${httpStatus}.`);
      return;
    }

    const rawHtml = safeRes.text;
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
