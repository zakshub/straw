/**
 * STRAW — Replaceable AI Orchestration Layer (Phase 7)
 *
 * Supports local deterministic operation by default and configurable external
 * LLM providers (Gemini, OpenAI, Anthropic) without hardcoding credentials.
 *
 * CRITICAL RULES:
 * 1. LLM-generated conclusions must ALWAYS remain distinguishable from source evidence
 *    and can NEVER count as verified_evidence.
 * 2. Paid external API calls require explicit owner approval before execution.
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
      paid_api_guardrail: 'ENABLED — External paid LLM calls require explicit owner approval.',
      epistemic_boundary: 'AI outputs are tagged as AI_GENERATED_SYNTHESIS_NOT_SOURCE_EVIDENCE and never count as verified market evidence.'
    };
  }

  /**
   * Summarizes discussions, extracts recurring problems, categorizes audiences,
   * identifies competitor weaknesses, generates research hypotheses, and synthesizes evidence.
   * Always keeps AI conclusions strictly separated from source evidence.
   */
  synthesizeResearchFindings({
    query_topic = 'Unspecified Topic',
    target_category = 'Browser Based Utilities',
    findings = [],
    competitors = []
  }) {
    const verifiedFindings = findings.filter(
      (f) => f.evidence_tier === 'verified_evidence' && f.verification_status === 'verified'
    );
    const practitionerFindings = findings.filter((f) => f.evidence_tier === 'practitioner_observation');
    const contradictingFindings = findings.filter((f) => f.stance === 'contradicting');

    const recurringProblems =
      findings.length > 0
        ? findings
            .slice(0, 4)
            .map((f) => `Observed in ${f.source_name || 'source'}: ${String(f.statement || '').slice(0, 140)}`)
        : [`No attributed source findings recorded yet for "${query_topic}".`];

    const audienceCategories = [
      `Primary practitioners seeking solutions in ${target_category}`,
      'Operators experiencing workflow friction or compliance risk with manual alternatives'
    ];

    const competitorWeaknesses =
      competitors.length > 0
        ? competitors.map((c) => `${c.competitor_name} (${c.pricing_model}): ${c.weaknesses_and_gaps}`)
        : ['No structured competitor rows inspected yet; inspect 2–3 direct pricing/product pages.'];

    const researchHypotheses = [
      `[UNVERIFIED HYPOTHESIS]: Buyers in ${target_category} may prefer a focused, zero-bloat workflow or one-time license over recurring SaaS subscriptions.`,
      `[VALIDATION TEST REQUIRED]: Verify whether target users actively search for "${query_topic}" tools or rely on free bundled workarounds.`
    ];

    let synthesisSummary = '';
    if (verifiedFindings.length === 0) {
      synthesisSummary = `[INSUFFICIENT VERIFIED EVIDENCE]: "${query_topic}" has 0 active verified source records (${practitionerFindings.length} practitioner observation(s)). Do not treat AI synthesis as market demand proof.`;
    } else if (contradictingFindings.length > 0) {
      synthesisSummary = `[CONFLICTING EVIDENCE]: "${query_topic}" has ${verifiedFindings.length} verified supporting finding(s) but also ${contradictingFindings.length} contradicting finding(s). Investigate counter-evidence before committing build time.`;
    } else {
      synthesisSummary = `[EVIDENCE-GROUNDED SYNTHESIS]: "${query_topic}" is supported by ${verifiedFindings.length} verified finding(s) and ${practitionerFindings.length} practitioner observation(s).`;
    }

    return {
      epistemic_label: 'AI_GENERATED_SYNTHESIS_NOT_SOURCE_EVIDENCE',
      can_count_as_verified_evidence: false,
      provider_used: 'local-deterministic-synthesizer',
      paid_api_invoked: false,
      synthesized_at: new Date().toISOString(),
      query_topic,
      target_category,
      discussion_summary: synthesisSummary,
      extracted_recurring_problems: recurringProblems,
      categorized_audiences: audienceCategories,
      identified_competitor_weaknesses: competitorWeaknesses,
      generated_research_hypotheses: researchHypotheses
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
      epistemic_label: 'AI_GENERATED_SYNTHESIS_NOT_SOURCE_EVIDENCE',
      can_count_as_verified_evidence: false,
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
