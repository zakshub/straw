#!/usr/bin/env node
/**
 * STRAW Phase 7.2 — Controlled Live External API Test Runner (`npm run test:live`)
 *
 * Requirements (Phase 7.2 Section 2 & 3):
 * 1. Separated from `npm test` so standard tests never depend on an internet connection.
 * 2. Executes a single controlled live request against the free public Hacker News Algolia API.
 * 3. Validates that `source_content_hash` is a full 64-character SHA-256 hexadecimal digest
 *    (`/^[a-f0-9]{64}$/i`) and is distinct from the 24-character `content_fingerprint`.
 * 4. If network access is unavailable, clearly reports that the live test was SKIPPED (NOT PASSED)
 *    and exits with non-zero code 2 so a skipped live test is never reported as passed.
 */

import assert from 'node:assert/strict';
import dns from 'node:dns';
import { createStrawContext } from '../src/context.js';
import { isValidSha256Hex } from '../src/engines/research-engine.js';

async function checkLiveNetworkReachability() {
  if (process.env.STRAW_SIMULATE_OFFLINE === '1') {
    return {
      reachable: false,
      reason: 'Simulated offline environment (STRAW_SIMULATE_OFFLINE=1)'
    };
  }
  try {
    await dns.promises.lookup('hn.algolia.com');
    return { reachable: true };
  } catch (err) {
    return {
      reachable: false,
      reason: `DNS resolution failed for hn.algolia.com (${err.code || err.message})`
    };
  }
}

async function main() {
  console.log('=== STRAW Live External Connector Test Suite (npm run test:live) ===');

  const netCheck = await checkLiveNetworkReachability();
  if (!netCheck.reachable) {
    console.error(
      `\n[LIVE TEST SKIPPED — NOT PASSED]: Network access is unavailable (${netCheck.reason}).`
    );
    console.error(
      'Status: SKIPPED (Exit Code 2 — skipped live tests are never reported as passed).'
    );
    process.exit(2);
  }

  const ctx = createStrawContext({ dbPath: ':memory:' });

  let liveRun;
  try {
    liveRun = await ctx.researchEngine.executeDiscoveryRun({
      query_topic: 'wcag accessibility',
      opportunity_id: 'opp-a11y-design-kit',
      source_ids: ['src-hn-algolia'],
      fetch_live_public: true
    });
  } catch (err) {
    console.error(
      `\n[LIVE TEST SKIPPED — NOT PASSED]: Live request threw network error (${err.message}).`
    );
    process.exit(2);
  }

  if (liveRun.status === 'failed_network') {
    console.error(
      `\n[LIVE TEST SKIPPED — NOT PASSED]: External endpoint unreachable (${liveRun.execution_notes}).`
    );
    console.error(
      'Status: SKIPPED (Exit Code 2 — skipped live tests are never reported as passed).'
    );
    process.exit(2);
  }

  assert.equal(liveRun.status, 'completed', `Expected completed status, got ${liveRun.status}`);
  assert.ok(
    liveRun.findings_created_count >= 1,
    `Expected at least 1 live finding from HN Algolia API, got ${liveRun.findings_created_count}. Notes: ${liveRun.execution_notes}`
  );

  const firstFinding = liveRun.created_findings[0];
  assert.ok(
    firstFinding.source_url.startsWith('https://news.ycombinator.com/item?id='),
    `Expected HN item URL, got ${firstFinding.source_url}`
  );
  assert.equal(firstFinding.http_status, 200);
  assert.ok(firstFinding.retrieved_at, 'Live finding must record retrieved_at timestamp');

  // Phase 7.2 Requirement 2: Enforce full 64-character hexadecimal SHA-256 digest
  assert.ok(
    isValidSha256Hex(firstFinding.source_content_hash),
    `Expected 64-char hex SHA-256 source_content_hash, got "${firstFinding.source_content_hash}" (length: ${firstFinding.source_content_hash?.length})`
  );
  assert.match(firstFinding.source_content_hash, /^[a-f0-9]{64}$/);

  // Phase 7.2 Requirement 2.5: Keep evidence deduplication fingerprint (24 chars) separate from source_content_hash (64 chars)
  assert.equal(firstFinding.content_fingerprint.length, 24);
  assert.notEqual(firstFinding.content_fingerprint, firstFinding.source_content_hash);

  assert.ok(
    firstFinding.supporting_excerpt.length >= 25,
    'Live finding must contain actual verbatim comment excerpt (>= 25 chars)'
  );

  console.log('\n[LIVE TEST PASSED]:');
  console.log(`  - Run ID:              ${liveRun.id}`);
  console.log(`  - Findings Created:    ${liveRun.findings_created_count}`);
  console.log(`  - First Source URL:    ${firstFinding.source_url}`);
  console.log(`  - HTTP Status:         ${firstFinding.http_status}`);
  console.log(`  - Source SHA-256 (64): ${firstFinding.source_content_hash}`);
  console.log(`  - Evidence Fingerprint:${firstFinding.content_fingerprint} (24-char dedup key)`);
  console.log(`  - Excerpt Preview:     "${firstFinding.supporting_excerpt.slice(0, 90)}..."`);
}

main().catch((err) => {
  console.error('\n[LIVE TEST FAILED]:', err.stack || err.message);
  process.exit(1);
});
