import crypto from 'node:crypto';

export const DEFAULT_OWNER_CAPABILITIES = [
  {
    id: 'cap-ux-ui',
    name: 'Senior UX and UI Design',
    category: 'Design & Experience',
    proficiency_level: 5,
    execution_leverage: 'Direct Unfair Advantage',
    notes: 'Deep expertise in interaction design, visual hierarchy, accessibility (WCAG 2.2), and commercial product polish.'
  },
  {
    id: 'cap-product-arch',
    name: 'Product Design and UX Architecture',
    category: 'Product & Strategy',
    proficiency_level: 5,
    execution_leverage: 'Direct Unfair Advantage',
    notes: 'End-to-end system modeling, feature scoping, user journeys, and translating business problems into intuitive product flows.'
  },
  {
    id: 'cap-figma-ds',
    name: 'Figma and Design Systems',
    category: 'Design & Experience',
    proficiency_level: 5,
    execution_leverage: 'Direct Asset Creation',
    notes: 'Tokenized multi-mode (Light/Dark) component libraries, UI kits, and commercial design system architectures.'
  },
  {
    id: 'cap-ia-workflows',
    name: 'Information Architecture and Complex Workflows',
    category: 'Product & Strategy',
    proficiency_level: 5,
    execution_leverage: 'Direct Unfair Advantage',
    notes: 'Structuring dense operational dashboards, decision engines, taxonomies, and multi-stage state machines.'
  },
  {
    id: 'cap-wordpress',
    name: 'WordPress and Website Development',
    category: 'Web & Platforms',
    proficiency_level: 4,
    execution_leverage: 'Rapid Commercial Deployment',
    notes: 'Building content sites, niche directories, custom themes, landing pages, and WooCommerce/membership sites.'
  },
  {
    id: 'cap-html-css',
    name: 'HTML and CSS',
    category: 'Engineering & Implementation',
    proficiency_level: 4,
    execution_leverage: 'Direct Implementation',
    notes: 'Semantic markup, responsive layouts, custom CSS design tokens, and fidelity control without framework bloat.'
  },
  {
    id: 'cap-basic-js',
    name: 'Basic JavaScript and Programming Knowledge',
    category: 'Engineering & Implementation',
    proficiency_level: 3,
    execution_leverage: 'AI-Augmented Execution',
    notes: 'Can read, inspect, wire, and debug JavaScript/Node scripts; relies on AI-assisted workflows for full-stack architecture.'
  },
  {
    id: 'cap-ai-dev',
    name: 'AI Assisted Development',
    category: 'AI & Automation',
    proficiency_level: 5,
    execution_leverage: 'Force Multiplier',
    notes: 'Orchestrating coding agents, modular specifications, automated tests, and build validation to ship working web software.'
  },
  {
    id: 'cap-creative-ai',
    name: 'Creative AI Production and Visual Workflows',
    category: 'AI & Automation',
    proficiency_level: 5,
    execution_leverage: 'Direct Asset Creation',
    notes: 'Photographic realism, art direction, visual storytelling, and forensic quality control (Studio protocol).'
  },
  {
    id: 'cap-product-strategy',
    name: 'Product Strategy and Business Thinking',
    category: 'Product & Strategy',
    proficiency_level: 5,
    execution_leverage: 'Core Venture Direction',
    notes: 'Positioning, audience analysis, value proposition design, and pragmatic scope management.'
  }
];

export class CapabilityEngine {
  constructor(db) {
    this.db = db;
  }

  getOwnerProfile() {
    const profile = this.db.prepare('SELECT * FROM owner_profile WHERE id = 1').get();
    const capabilities = this.db
      .prepare('SELECT * FROM owner_capabilities ORDER BY proficiency_level DESC, name ASC')
      .all();

    return {
      profile: profile
        ? {
            ...profile,
            secondary_options: JSON.parse(profile.secondary_options_json || '[]')
          }
        : null,
      capabilities
    };
  }

  upsertCapability({ id, name, category, proficiency_level, execution_leverage, notes }) {
    const now = new Date().toISOString();
    const capId = id || `cap-${crypto.randomUUID().slice(0, 8)}`;
    const level = Math.max(1, Math.min(5, Number(proficiency_level) || 3));

    this.db
      .prepare(`
        INSERT INTO owner_capabilities (id, name, category, proficiency_level, execution_leverage, notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(name) DO UPDATE SET
          category = excluded.category,
          proficiency_level = excluded.proficiency_level,
          execution_leverage = excluded.execution_leverage,
          notes = excluded.notes,
          updated_at = excluded.updated_at
      `)
      .run(capId, name.trim(), category.trim(), level, execution_leverage.trim(), notes.trim(), now);

    return this.db.prepare('SELECT * FROM owner_capabilities WHERE name = ?').get(name.trim());
  }

  /**
   * Evaluates how well an opportunity matches the owner's actual capabilities
   * and quantifies learning cost & execution difficulty for any new skills needed.
   */
  evaluateCapabilityFit({ requiredCapabilities = [], newSkillsNeeded = [], devComplexity = 'manageable' }) {
    const { capabilities } = this.getOwnerProfile();
    const capMap = new Map(capabilities.map((c) => [c.name.toLowerCase(), c]));

    const matched = [];
    const missingFromCore = [];

    for (const req of requiredCapabilities) {
      const normalized = String(req).trim().toLowerCase();
      let found = capMap.get(normalized);
      if (!found) {
        found = capabilities.find(
          (c) =>
            c.name.toLowerCase().includes(normalized) ||
            normalized.includes(c.name.toLowerCase().split(' ')[0])
        );
      }
      if (found) {
        matched.push({ name: found.name, proficiency_level: found.proficiency_level });
      } else {
        missingFromCore.push(req);
      }
    }

    const avgProficiency =
      matched.length > 0
        ? matched.reduce((sum, item) => sum + item.proficiency_level, 0) / matched.length
        : 3.5;

    const allNewSkills = [...new Set([...newSkillsNeeded, ...missingFromCore])];

    const complexityPenaltyMap = {
      low: 0,
      manageable: 0.4,
      moderate: 1.5,
      high: 3.5,
      extreme: 6.0
    };

    const complexityPenalty = complexityPenaltyMap[devComplexity] ?? 1.5;
    const newSkillPenalty = allNewSkills.length * 0.9;

    const rawScore = (avgProficiency / 5) * 10 - complexityPenalty - newSkillPenalty;
    const fitScore = Number(Math.max(1, Math.min(10, rawScore)).toFixed(1));

    let executionDifficulty = 'Low — Direct Execution via Existing Strengths';
    let learningCostEstimate = '0–2 days (No new core engineering stack required)';

    if (devComplexity === 'extreme' || allNewSkills.length >= 3) {
      executionDifficulty = 'High Risk — Exceeds pragmatic AI-assisted solo execution boundary';
      learningCostEstimate = '4–8+ weeks of specialized engineering study or external contractor dependency';
    } else if (devComplexity === 'high' || allNewSkills.length === 2) {
      executionDifficulty = 'Moderate-High — Requires structured learning and modular AI prototyping';
      learningCostEstimate = '1–3 weeks of focused prototyping and tool onboarding';
    } else if (devComplexity === 'moderate' || allNewSkills.length === 1) {
      executionDifficulty = 'Manageable — Learnable via AI-assisted workflows and existing platforms';
      learningCostEstimate = '3–5 days of targeted skill acquisition';
    }

    return {
      fit_score: fitScore,
      matched_capabilities: matched,
      new_skills_required: allNewSkills,
      execution_difficulty: executionDifficulty,
      learning_cost_estimate: learningCostEstimate,
      summary:
        matched.length > 0
          ? `Leverages ${matched.length} core capability area(s) (${matched.map((m) => m.name).join(', ')}). ${
              allNewSkills.length > 0
                ? `Requires acquiring ${allNewSkills.join(', ')} (${learningCostEstimate}).`
                : 'Zero unverified skill gaps.'
            }`
          : `Requires ${allNewSkills.join(', ') || 'general execution'} (${learningCostEstimate}).`
    };
  }
}
