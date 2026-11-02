/**
 * STRAW — Replaceable AI Orchestration Layer
 *
 * Provides deterministic, zero-cost local opportunity critique and synthesis by default,
 * while supporting pluggable external LLM providers (Gemini, OpenAI, Anthropic) when
 * API keys are configured in the environment. Never fabricates market data.
 */

export class AIOrchestrator {
  constructor(capabilityEngine, intelligenceEngine) {
    this.capabilityEngine = capabilityEngine;
    this.intelligenceEngine = intelligenceEngine;
  }

  getProviderStatus() {
    const configuredProvider = process.env.AI_PROVIDER || 'local';
    const hasGemini = Boolean(process.env.GEMINI_API_KEY);
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY);
    const hasAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);

    return {
      active_mode: configuredProvider,
      deterministic_engine_ready: true,
      external_providers_configured: {
        gemini: hasGemini,
        openai: hasOpenAI,
        anthropic: hasAnthropic
      },
      policy_note:
        'All scoring, epistemic evidence checks, and approval gates are enforced deterministically. External LLM synthesis is optional and replaceable.'
    };
  }

  /**
   * Generates a structured strategic critique of an opportunity or concept brief,
   * grounded in the owner's actual capabilities and prior business intelligence memory.
   */
  evaluateConceptBrief(brief) {
    const {
      title = 'Untitled Concept',
      category = 'Micro SaaS Products',
      problem_statement = '',
      target_audience = '',
      proposed_monetization = 'One-Time Purchase',
      dev_complexity = 'manageable',
      required_capabilities = ['Senior UX and UI Design', 'AI Assisted Development'],
      new_skills_needed = [],
      has_verified_evidence = false
    } = brief;

    const capAssessment = this.capabilityEngine.evaluateCapabilityFit({
      requiredCapabilities: required_capabilities,
      newSkillsNeeded: new_skills_needed,
      devComplexity: dev_complexity
    });

    const overlapCheck = this.intelligenceEngine.checkRejectedIdeaOverlap({
      title,
      category,
      problem_statement,
      hasNewVerifiedEvidence: Boolean(has_verified_evidence)
    });

    const critiquePoints = [];
    const nextValidationSteps = [];

    if (!has_verified_evidence) {
      critiquePoints.push(
        '[EPISTEMIC WARNING] Concept currently rests on assumptions. Do not invest engineering cycles until at least 2 independent demand signals (competitor pricing/reviews, search intent volume, or active buyer threads) are logged.'
      );
      nextValidationSteps.push(
        'Document 3 existing alternatives/competitors and identify the specific workflow or UX gap users complain about.'
      );
    } else {
      critiquePoints.push(
        '[EVIDENCE GROUNDED] Concept includes verified market evidence; verify whether willingness-to-pay matches the proposed monetization model.'
      );
    }

    if (dev_complexity === 'high' || dev_complexity === 'extreme') {
      critiquePoints.push(
        `[CAPABILITY FRICTION] Development complexity ("${dev_complexity}") creates technical debt risk for a solo UX/Product founder. De-scope into a focused browser utility, Figma system, WordPress plugin, or single-workflow Micro-SaaS.`
      );
      nextValidationSteps.push(
        'Strip backend infrastructure requirements down to a V1 wedge that can be shipped in <= 14 days via AI-assisted development.'
      );
    } else {
      critiquePoints.push(
        `[CAPABILITY LEVERAGE] Strong execution fit (${capAssessment.fit_score}/10). Directly leverages owner strengths in ${
          capAssessment.matched_capabilities.map((c) => c.name).join(', ') || 'UX & AI-assisted building'
        }.`
      );
    }

    if (overlapCheck.has_overlap) {
      critiquePoints.push(
        `[INSTITUTIONAL MEMORY ALERT] Overlaps with previously rejected opportunity "${overlapCheck.overlapping_rejections[0].rejected_title}" (Prior rejection reason: ${overlapCheck.overlapping_rejections[0].rejection_reason}).`
      );
    }

    nextValidationSteps.push(
      `Confirm primary organic acquisition channel for "${target_audience || 'target segment'}" before writing application code.`
    );

    return {
      provider: 'straw-deterministic-strategist-v1',
      evaluated_at: new Date().toISOString(),
      title,
      category,
      capability_assessment: capAssessment,
      prior_rejection_overlap: overlapCheck,
      strategic_critique: critiquePoints,
      recommended_validation_steps: nextValidationSteps,
      proposed_monetization_note: `Evaluate "${proposed_monetization}" against time-to-first-revenue and ongoing support burden.`
    };
  }
}
