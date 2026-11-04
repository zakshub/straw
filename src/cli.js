import fs from 'node:fs';
import path from 'node:path';
import { createStrawContext } from './context.js';

const cmd = process.argv[2] || 'status';
const ctx = createStrawContext();

if (cmd === 'status') {
  const overview = ctx.getDashboardOverview();
  console.log('=== STRAW — PERSONAL AI BUSINESS OPERATING SYSTEM STATUS ===');
  console.log(`Owner:                ${overview.owner.profile.owner_name}`);
  console.log(`Primary Direction:    ${overview.owner.profile.primary_direction}`);
  console.log(`Tracked Capabilities: ${overview.summary_counts.total_capabilities}`);
  console.log(
    `Opportunities:        ${overview.summary_counts.total_opportunities} (Approved: ${overview.summary_counts.approved_opportunities}, Evaluating/Discovered: ${overview.summary_counts.evaluating_opportunities}, Rejected: ${overview.summary_counts.rejected_opportunities})`
  );
  console.log(`Active Products:      ${overview.summary_counts.active_products}`);
  console.log(`Pending Approvals:    ${overview.summary_counts.pending_approvals}`);
  console.log(`Intelligence Memory:  ${overview.summary_counts.intelligence_records} entries`);

  console.log('\nTop Opportunities by Priority Index (Note: Heuristic index, NOT probability of commercial success):');
  for (const opp of overview.opportunities) {
    const eq = opp.evidence_quality_summary || {};
    console.log(
      `  - [Index: ${opp.overall_score}/100 | Comm: ${opp.commercial_readiness_score}/100 | Tech: ${opp.technical_feasibility_score}/100 | ${opp.recommendation} | ${opp.status.toUpperCase()}] ${opp.title} (${opp.category}) [Verified Ev: ${eq.active_verified_count || 0} (Prob:${eq.verified_problem_count || 0}, Dem:${eq.verified_demand_count || 0}, Comp:${eq.verified_competitor_count || 0}, WTP:${eq.verified_willingness_to_pay_count || 0})]`
    );
  }

  console.log('\nActive Products & Real Completion:');
  for (const prod of overview.products) {
    console.log(
      `  - [${prod.completion_pct}% Complete | Stage ${prod.current_stage_number}/15: ${prod.current_stage_name}] ${prod.name}`
    );
  }

  console.log('\nProactive AI Business Intelligence Queue:');
  for (const item of overview.proactive_intelligence.proactive_action_queue) {
    console.log(`  - [${item.priority} | ${item.type}] ${item.target}: ${item.recommendation}`);
  }

  console.log('\nResearch Source Capability Matrix (Phase 7.1):');
  for (const m of overview.source_capability_matrix) {
    console.log(
      `  - [${m.implementation_status.toUpperCase()} | ${m.cost_tier.toUpperCase()} | Auth: ${m.authentication_requirement}] ${m.source_name} (${m.adapter_key})`
    );
  }
} else if (cmd === 'matrix') {
  const matrix = ctx.researchEngine.getSourceCapabilityMatrix();
  console.log(JSON.stringify(matrix, null, 2));
} else if (cmd === 'export-report') {
  const overview = ctx.getDashboardOverview();
  const outDir = path.resolve(process.cwd(), 'data', 'exports');
  fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'straw-executive-snapshot.json');
  fs.writeFileSync(jsonPath, JSON.stringify(overview, null, 2), 'utf8');
  console.log(`Exported full STRAW executive snapshot to ${jsonPath}`);
} else {
  console.log(`Unknown CLI command: ${cmd}. Supported: status, matrix, export-report`);
  process.exitCode = 1;
}
