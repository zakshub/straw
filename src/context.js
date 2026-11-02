import { createDatabase, getDatabase } from './db/database.js';
import { ensureSeeded } from './db/seed.js';
import { CapabilityEngine } from './engines/capability-engine.js';
import { IntelligenceEngine } from './engines/intelligence-engine.js';
import { ApprovalEngine } from './engines/approval-engine.js';
import { OpportunityEngine, OPPORTUNITY_CATEGORIES } from './engines/opportunity-engine.js';
import { ExecutionEngine, PRODUCT_LIFECYCLE_STAGES } from './engines/execution-engine.js';
import { GrowthMonetizationEngine, MONETIZATION_MODELS, ACQUISITION_CHANNEL_CATALOG } from './engines/growth-monetization-engine.js';
import { AIOrchestrator } from './engines/ai-orchestrator.js';
import { SCORING_DIMENSIONS } from './engines/scoring-engine.js';

export function createStrawContext({ dbPath, skipSeed = false } = {}) {
  const db = dbPath ? createDatabase(dbPath) : getDatabase();

  const capabilityEngine = new CapabilityEngine(db);
  const intelligenceEngine = new IntelligenceEngine(db);
  const approvalEngine = new ApprovalEngine(db, intelligenceEngine);
  const opportunityEngine = new OpportunityEngine(db, capabilityEngine, intelligenceEngine, approvalEngine);
  const executionEngine = new ExecutionEngine(db, approvalEngine, intelligenceEngine);
  const growthEngine = new GrowthMonetizationEngine(db, approvalEngine);
  const aiOrchestrator = new AIOrchestrator(capabilityEngine, intelligenceEngine);

  const engines = {
    capabilityEngine,
    intelligenceEngine,
    approvalEngine,
    opportunityEngine,
    executionEngine,
    growthEngine,
    aiOrchestrator
  };

  if (!skipSeed) {
    ensureSeeded(db, engines);
  }

  function getDashboardOverview() {
    const owner = capabilityEngine.getOwnerProfile();
    const opportunities = opportunityEngine.listOpportunities();
    const products = executionEngine.listProducts();
    const pendingApprovals = approvalEngine.listRequests({ status: 'pending' });
    const allApprovals = approvalEngine.listRequests();
    const intelligenceEntries = intelligenceEngine.listEntries();

    const approvedOpps = opportunities.filter((o) => o.status === 'approved');
    const evaluatingOpps = opportunities.filter((o) => o.status === 'evaluating' || o.status === 'discovered');
    const rejectedOpps = opportunities.filter((o) => o.status === 'rejected');

    const proactiveIntelligence = intelligenceEngine.generateProactivePortfolioIntelligence({
      capabilities: owner.capabilities,
      opportunities,
      products,
      pendingApprovals
    });

    return {
      owner,
      summary_counts: {
        total_capabilities: owner.capabilities.length,
        total_opportunities: opportunities.length,
        approved_opportunities: approvedOpps.length,
        evaluating_opportunities: evaluatingOpps.length,
        rejected_opportunities: rejectedOpps.length,
        active_products: products.length,
        pending_approvals: pendingApprovals.length,
        intelligence_records: intelligenceEntries.length
      },
      catalogs: {
        opportunity_categories: OPPORTUNITY_CATEGORIES,
        scoring_dimensions: SCORING_DIMENSIONS,
        lifecycle_stages: PRODUCT_LIFECYCLE_STAGES,
        monetization_models: MONETIZATION_MODELS,
        acquisition_channels: ACQUISITION_CHANNEL_CATALOG
      },
      ai_status: aiOrchestrator.getProviderStatus(),
      proactive_intelligence: proactiveIntelligence,
      opportunities,
      products,
      pending_approvals: pendingApprovals,
      all_approvals: allApprovals,
      recent_intelligence: intelligenceEntries.slice(0, 15)
    };
  }

  return {
    db,
    ...engines,
    getDashboardOverview
  };
}
