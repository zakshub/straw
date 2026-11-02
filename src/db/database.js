import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

let defaultDbInstance = null;

/**
 * Opens and initializes a STRAW SQLite database instance.
 * @param {string} [customPath] - Optional custom path or ':memory:' for isolated testing.
 * @returns {DatabaseSync}
 */
export function createDatabase(customPath) {
  const dbPath = customPath || process.env.STRAW_DB_PATH || path.resolve(process.cwd(), 'data', 'straw.sqlite');

  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');

  runMigrations(db);
  return db;
}

export function getDatabase() {
  if (!defaultDbInstance) {
    defaultDbInstance = createDatabase();
  }
  return defaultDbInstance;
}

export function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS owner_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      owner_name TEXT NOT NULL,
      primary_direction TEXT NOT NULL,
      secondary_options_json TEXT NOT NULL,
      engineering_constraint_summary TEXT NOT NULL,
      execution_preference_summary TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS owner_capabilities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      proficiency_level INTEGER NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
      execution_leverage TEXT NOT NULL,
      notes TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('discovered', 'evaluating', 'approved', 'rejected', 'archived')),
      problem_statement TEXT NOT NULL,
      target_audience TEXT NOT NULL,
      demand_summary TEXT NOT NULL,
      competitors_summary TEXT NOT NULL,
      alternatives_summary TEXT NOT NULL,
      market_gaps TEXT NOT NULL,
      differentiation_potential TEXT NOT NULL,
      dev_complexity TEXT NOT NULL CHECK (dev_complexity IN ('low', 'manageable', 'moderate', 'high', 'extreme')),
      estimated_dev_days INTEGER NOT NULL,
      operational_cost_monthly_usd REAL NOT NULL DEFAULT 0,
      monetization_model TEXT NOT NULL,
      acquisition_strategy TEXT NOT NULL,
      revenue_potential_notes TEXT NOT NULL,
      main_risks TEXT NOT NULL,
      required_capabilities_json TEXT NOT NULL DEFAULT '[]',
      new_skills_needed_json TEXT NOT NULL DEFAULT '[]',
      learning_cost_notes TEXT NOT NULL DEFAULT '',
      dimension_inputs_json TEXT NOT NULL,
      overall_score REAL NOT NULL DEFAULT 0,
      recommendation TEXT NOT NULL,
      score_breakdown_json TEXT NOT NULL,
      decision_rationale TEXT NOT NULL,
      rejection_reason TEXT NOT NULL DEFAULT '',
      invalidation_conditions TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS market_evidence (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL,
      claim_type TEXT NOT NULL CHECK (claim_type IN ('demand', 'competitor', 'pricing', 'audience', 'technical', 'risk')),
      statement TEXT NOT NULL,
      evidence_tier TEXT NOT NULL CHECK (evidence_tier IN ('verified_evidence', 'practitioner_observation', 'estimate', 'assumption')),
      source_citation TEXT NOT NULL,
      observed_at TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL,
      category TEXT NOT NULL,
      current_stage_number INTEGER NOT NULL CHECK (current_stage_number BETWEEN 1 AND 15),
      current_stage_name TEXT NOT NULL,
      problem_definition TEXT NOT NULL,
      positioning TEXT NOT NULL,
      ux_architecture_notes TEXT NOT NULL,
      tech_stack TEXT NOT NULL,
      monetization_model TEXT NOT NULL,
      monetization_tradeoffs TEXT NOT NULL,
      primary_acquisition_channel TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('planning', 'in_development', 'testing', 'launch_gated', 'launched', 'paused')),
      completion_pct REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id)
    );

    CREATE TABLE IF NOT EXISTS product_tasks (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      stage_number INTEGER NOT NULL CHECK (stage_number BETWEEN 1 AND 15),
      stage_name TEXT NOT NULL,
      phase_name TEXT NOT NULL,
      milestone_name TEXT NOT NULL,
      title TEXT NOT NULL,
      estimated_hours REAL NOT NULL DEFAULT 2,
      actual_hours REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'blocked', 'done')),
      dependencies TEXT NOT NULL DEFAULT 'None',
      risks TEXT NOT NULL DEFAULT 'None',
      acceptance_criteria TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS growth_channels (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      channel_name TEXT NOT NULL,
      channel_category TEXT NOT NULL CHECK (channel_category IN (
        'seo', 'content_marketing', 'search_intent', 'social_media',
        'community_distribution', 'email_marketing', 'partnerships',
        'product_directories', 'organic_acquisition', 'paid_advertising'
      )),
      fit_score INTEGER NOT NULL CHECK (fit_score BETWEEN 1 AND 10),
      estimated_monthly_cost_usd REAL NOT NULL DEFAULT 0,
      expected_return_rationale TEXT NOT NULL,
      requires_financial_approval INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL CHECK (status IN ('recommended', 'active', 'gated_approval', 'paused', 'rejected')),
      execution_playbook TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS performance_metrics (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      period_label TEXT NOT NULL,
      visitors INTEGER,
      acquisition_sources_note TEXT NOT NULL,
      conversion_rate_pct REAL,
      active_users INTEGER,
      retention_rate_pct REAL,
      revenue_usd REAL,
      operating_cost_usd REAL,
      cac_usd REAL,
      ltv_usd REAL,
      data_provenance TEXT NOT NULL CHECK (data_provenance IN ('verified_integration', 'manual_ledger', 'no_data_yet')),
      notes TEXT NOT NULL,
      recorded_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS approval_requests (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL CHECK (entity_type IN ('opportunity', 'product', 'growth_channel', 'system')),
      entity_id TEXT NOT NULL,
      action_category TEXT NOT NULL CHECK (action_category IN (
        'spend_money', 'purchase_service', 'publish_content', 'launch_product',
        'run_ads', 'contact_customers', 'send_communications', 'production_change'
      )),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      financial_commitment_usd REAL NOT NULL DEFAULT 0,
      is_public_action INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
      owner_decision_notes TEXT NOT NULL DEFAULT '',
      requested_at TEXT NOT NULL,
      decided_at TEXT
    );

    CREATE TABLE IF NOT EXISTS business_intelligence_log (
      id TEXT PRIMARY KEY,
      entry_type TEXT NOT NULL CHECK (entry_type IN (
        'business_decision', 'lesson_learned', 'market_observation', 'research_finding', 'rejection_memory'
      )),
      related_opportunity_id TEXT,
      related_product_id TEXT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      evidence_tier TEXT NOT NULL CHECK (evidence_tier IN ('verified_evidence', 'practitioner_observation', 'estimate', 'assumption')),
      future_implication TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}
