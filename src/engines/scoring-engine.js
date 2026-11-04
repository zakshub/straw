import {
  verifyAndClassifyEvidence,
  analyzeOpportunityEvidenceQuality
} from './research-engine.js';

/**
 * STRAW — Transparent 11-Dimension Opportunity Scoring & Decision Engine (Phase 7)
 *
 * Evaluates opportunities across 11 mandatory dimensions, enforces strict source
 * verification, freshness/staleness rules, duplicate origin deduplication, and
 * conflicting evidence penalties.
 */

export const SCORING_DIMENSIONS = [
  {
    key: 'problem_severity',
    label: '1. Problem Severity',
    weight: 0.11,
    description: 'Urgency, frequency, and financial or operational pain of the problem being solved.'
  },
  {
    key: 'demand_evidence',
    label: '2. Demand Evidence',
    weight: 0.14,
    description: 'Strength of verified, non-stale, attributable market evidence (capped if unverified, stale, or conflicting).'
  },
  {
    key: 'audience_accessibility',
    label: '3. Audience Accessibility',
    weight: 0.09,
    description: 'How clearly identifiable, reachable, and concentrated the target buyers are without expensive ad spend.'
  },
  {
    key: 'competition_intensity',
    label: '4. Competition Favorable Gap',
    weight: 0.08,
    description: 'Room to compete (10 = underserved gap with weak incumbents; 1 = entrenched monopoly with high switching costs).'
  },
  {
    key: 'differentiation',
    label: '5. Differentiation Potential',
    weight: 0.09,
    description: 'Ability to stand out via superior UX, workflow specialization, design quality, or domain intelligence.'
  },
  {
    key: 'development_feasibility',
    label: '6. Development Feasibility',
    weight: 0.10,
    description: 'Realism of building, maintaining, and supporting the product via AI-assisted development, low-code, or manageable stacks.'
  },
  {
    key: 'initial_investment',
    label: '7. Low Initial Investment',
    weight: 0.07,
    description: 'Capital efficiency (10 = near-$0 bootstrap cost; 1 = heavy upfront infrastructure or licensing spend).'
  },
  {
    key: 'monetization_potential',
    label: '8. Monetization Potential',
    weight: 0.10,
    description: 'Clarity of willingness to pay, pricing power, and margin structure.'
  },
  {
    key: 'time_to_first_revenue',
    label: '9. Time to First Revenue',
    weight: 0.07,
    description: 'Speed from initial build to first real customer transaction.'
  },
  {
    key: 'long_term_scalability',
    label: '10. Long-Term Scalability',
    weight: 0.05,
    description: 'Compounding asset value (reusable templates, organic distribution, recurring revenue, low marginal support).'
  },
  {
    key: 'owner_capability_fit',
    label: '11. Owner Capability Fit',
    weight: 0.10,
    description: 'Alignment with Senior UX/UI, Figma Systems, IA, WordPress, HTML/CSS, and AI-Assisted Development strengths.'
  }
];

export function scoreOpportunity({
  dimensionInputs = {},
  evidenceRecords = [],
  capabilityAssessment = { fit_score: 7.0, execution_difficulty: '', learning_cost_estimate: '' },
  devComplexity = 'manageable',
  operationalCostMonthlyUsd = 0
}) {
  // Ensure every evidence record is evaluated by the Phase 7 verification classifier
  const normalizedEvidence = evidenceRecords.map((ev) =>
    ev.verification_status && ev.confidence_score !== undefined
      ? ev
      : verifyAndClassifyEvidence(ev)
  );

  const eq = analyzeOpportunityEvidenceQuality(normalizedEvidence);
  const verifiedCount = eq.active_verified_count;
  const observationCount = eq.practitioner_observation_count;
  const assumptionCount = eq.assumption_count;

  const rawScores = {};
  for (const dim of SCORING_DIMENSIONS) {
    const val = Number(dimensionInputs[dim.key]);
    rawScores[dim.key] = Number.isFinite(val) ? Math.max(1, Math.min(10, val)) : 5;
  }

  // Enforce dynamic capability fit from CapabilityEngine
  if (capabilityAssessment && Number.isFinite(capabilityAssessment.fit_score)) {
    rawScores.owner_capability_fit = capabilityAssessment.fit_score;
  }

  const warnings = [];
  const blockers = [];

  if (eq.downgraded_unverified_count > 0) {
    warnings.push(
      `[UNVERIFIED SOURCE DOWNGRADED]: ${eq.downgraded_unverified_count} finding(s) claimed verified status without a real public http/https URL or failed source content verification and were automatically downgraded.`
    );
  }

  if (eq.pending_review_count > 0) {
    warnings.push(
      `[SOURCE CONTENT PENDING VERIFICATION]: ${eq.pending_review_count} finding(s) have a valid URL format or blocked retrieval but have not yet been verified against retrieved source content.`
    );
  }

  if (eq.stale_count > 0) {
    warnings.push(
      `[STALE EVIDENCE EXCLUDED]: ${eq.stale_count} finding(s) exceeded the freshness threshold and cannot count as active verified demand.`
    );
  }

  // Epistemic guardrail on Demand Evidence:
  let effectiveDemandScore = rawScores.demand_evidence;
  if (verifiedCount === 0 && observationCount === 0) {
    effectiveDemandScore = Math.min(rawScores.demand_evidence, 3.5);
    warnings.push(
      'Zero active verified demand evidence or valid practitioner observations recorded. Demand Evidence score is capped at 3.5/10 until attributable market evidence is logged.'
    );
  } else if (verifiedCount === 0 && observationCount > 0) {
    effectiveDemandScore = Math.min(rawScores.demand_evidence, 6.0);
    warnings.push(
      'Demand rests on practitioner observations without active verified external evidence. Capped at 6.0/10.'
    );
  } else if (
    verifiedCount > 0 &&
    (eq.verified_demand_count || 0) === 0 &&
    (eq.verified_willingness_to_pay_count || 0) === 0
  ) {
    // Milestone M-V1.2: Problem existence or competitor activity alone cannot unlock high demand scores
    effectiveDemandScore = Math.min(rawScores.demand_evidence, 6.5);
    warnings.push(
      `[PROBLEM/COMPETITOR ONLY — NO VERIFIED DEMAND OR WTP]: Verified sources confirm problem existence (${eq.verified_problem_count || 0}) or competitor activity (${eq.verified_competitor_count || 0}), NOT customer demand (0) or willingness to pay (0). Demand Evidence is capped at 6.5/10.`
    );
  }

  // Conflicting evidence penalty
  if (eq.has_conflicting_evidence) {
    effectiveDemandScore = Math.max(1.5, Math.min(effectiveDemandScore - 2.5, 5.5));
    warnings.push(
      `[CONFLICTING EVIDENCE DETECTED]: ${eq.contradicting_count} contradicting/counter-evidence finding(s) conflict with supporting demand claims. Demand score penalized to ${effectiveDemandScore}/10 pending conflict resolution.`
    );
  }

  rawScores.demand_evidence = effectiveDemandScore;

  // Milestone M-V1.2: Willingness-to-Pay Gate on Monetization Potential
  if ((eq.verified_willingness_to_pay_count || 0) === 0) {
    const monetizationCap = verifiedCount === 0 ? 5.0 : 6.5;
    if (rawScores.monetization_potential > monetizationCap) {
      rawScores.monetization_potential = monetizationCap;
    }
    warnings.push(
      `[UNVERIFIED WILLINGNESS TO PAY]: 0 verified willingness-to-pay sources recorded. Problem existence, regulatory specs, free plugin installs, and GitHub stars do not prove customers will pay. Monetization Potential is capped at ${monetizationCap}/10 until buyer payment intent is validated.`
    );
  }

  // Guardrail against "Build simply because AI can build it"
  if (rawScores.development_feasibility >= 7 && rawScores.demand_evidence <= 4 && rawScores.problem_severity <= 4.5) {
    blockers.push(
      'AI-Buildability Trap Detected: High development feasibility paired with weak problem severity and unverified demand. Do not build simply because AI can generate the code.'
    );
  }

  // Complexity & Engineering Constraint Guardrail
  if (devComplexity === 'extreme') {
    rawScores.development_feasibility = Math.min(rawScores.development_feasibility, 2.5);
    blockers.push(
      'Extreme technical complexity exceeds sustainable solo AI-assisted execution and creates heavy maintenance risk.'
    );
  } else if (devComplexity === 'high') {
    rawScores.development_feasibility = Math.min(rawScores.development_feasibility, 5.0);
    warnings.push(
      'High engineering complexity requires significant learning or external support; scope should be reduced to a simpler wedge.'
    );
  }

  // Operational cost check
  if (operationalCostMonthlyUsd > 100) {
    rawScores.initial_investment = Math.min(rawScores.initial_investment, 4.0);
    warnings.push(`High recurring operational cost ($${operationalCostMonthlyUsd}/mo) increases burn risk prior to revenue.`);
  }

  // Compute weighted score (0 to 100 scale) and separate Commercial Readiness vs Technical Feasibility
  const commercialKeys = new Set([
    'problem_severity',
    'demand_evidence',
    'audience_accessibility',
    'competition_intensity',
    'monetization_potential',
    'time_to_first_revenue'
  ]);
  const technicalKeys = new Set([
    'differentiation',
    'development_feasibility',
    'initial_investment',
    'long_term_scalability',
    'owner_capability_fit'
  ]);

  let weightedSum = 0;
  let commercialWeightedPoints = 0;
  let commercialWeightTotal = 0;
  let technicalWeightedPoints = 0;
  let technicalWeightTotal = 0;

  const dimensionBreakdown = SCORING_DIMENSIONS.map((dim) => {
    const score = Number(rawScores[dim.key].toFixed(1));
    const weightedContribution = Number((score * dim.weight * 10).toFixed(2));
    weightedSum += weightedContribution;

    if (commercialKeys.has(dim.key)) {
      commercialWeightedPoints += score * dim.weight * 10;
      commercialWeightTotal += dim.weight;
    } else if (technicalKeys.has(dim.key)) {
      technicalWeightedPoints += score * dim.weight * 10;
      technicalWeightTotal += dim.weight;
    }

    return {
      key: dim.key,
      label: dim.label,
      dimension_group: commercialKeys.has(dim.key) ? 'commercial_readiness' : 'technical_feasibility',
      weight_pct: Math.round(dim.weight * 100),
      score_out_of_10: score,
      weighted_points: weightedContribution,
      description: dim.description
    };
  });

  const overallScore = Number(weightedSum.toFixed(1));
  let commercialReadinessScore = Number((commercialWeightedPoints / commercialWeightTotal).toFixed(1));
  const technicalFeasibilityScore = Number((technicalWeightedPoints / technicalWeightTotal).toFixed(1));

  // Milestone M-V1.2: Gate Commercial Readiness Score when Willingness to Pay is unverified
  let commercialValidationStatus = 'NO_VERIFIED_EVIDENCE';
  if (eq.has_conflicting_evidence) {
    commercialValidationStatus = 'CONFLICTING_COMMERCIAL_EVIDENCE';
    commercialReadinessScore = Math.min(commercialReadinessScore, 48.0);
  } else if (verifiedCount === 0) {
    commercialValidationStatus = 'NO_VERIFIED_EVIDENCE';
    commercialReadinessScore = Math.min(commercialReadinessScore, 45.0);
  } else if ((eq.verified_willingness_to_pay_count || 0) === 0) {
    commercialValidationStatus = 'UNVERIFIED_WILLINGNESS_TO_PAY';
    const commercialCap = (eq.verified_demand_count || 0) > 0 ? 68.0 : 58.0;
    commercialReadinessScore = Math.min(commercialReadinessScore, commercialCap);
  } else {
    commercialValidationStatus = 'VERIFIED_BUYER_WTP';
  }

  // Determine transparent recommendation
  let recommendation = 'NEEDS_EVIDENCE';
  let decisionRationale = '';

  const wtpNote =
    (eq.verified_willingness_to_pay_count || 0) > 0
      ? `Includes ${eq.verified_willingness_to_pay_count} verified willingness-to-pay signal(s).`
      : 'NOTE: 0 verified willingness-to-pay sources recorded — commercial payment intent must be validated with real buyers before full build commitment.';

  if (blockers.length > 0 || overallScore < 52 || rawScores.problem_severity <= 3.5) {
    recommendation = 'REJECT_WEAK_IDEA';
    const reasons =
      blockers.length > 0
        ? blockers.join(' ')
        : `Overall score (${overallScore}/100) and problem/demand fundamentals do not justify development time.`;
    decisionRationale = `RECOMMEND REJECTION: ${reasons}`;
  } else if (eq.has_conflicting_evidence) {
    recommendation = 'HOLD_CONFLICTING_EVIDENCE';
    decisionRationale = `HOLD — CONFLICTING EVIDENCE (${overallScore}/100): Contradicting market findings (${eq.contradicting_count}) conflict with supporting claims (${eq.supporting_count}). Resolve the evidence conflict before approving product development.`;
  } else if (verifiedCount === 0) {
    recommendation = 'NEEDS_EVIDENCE';
    decisionRationale = `HOLD FOR VALIDATION (${overallScore}/100): Promising capability alignment, but lacks active verified market evidence (${eq.stale_count} stale, ${eq.downgraded_unverified_count} unverified/downgraded). Collect at least 1–2 attributable verified sources with excerpts before approving development.`;
  } else if (overallScore >= 72 && rawScores.owner_capability_fit >= 6.5 && rawScores.demand_evidence >= 6.5) {
    recommendation = 'APPROVE_FOR_VALIDATION';
    decisionRationale = `STRONG CANDIDATE FOR VALIDATION (Index: ${overallScore}/100 | Commercial Readiness: ${commercialReadinessScore}/100 | Technical Feasibility: ${technicalFeasibilityScore}/100): Backed by ${verifiedCount} active verified evidence record(s) across ${eq.independent_verified_origins_count} origin(s) (Problem: ${eq.verified_problem_count || 0}, Demand: ${eq.verified_demand_count || 0}, Competitor: ${eq.verified_competitor_count || 0}, WTP: ${eq.verified_willingness_to_pay_count || 0}), strong owner capability fit (${rawScores.owner_capability_fit}/10). ${wtpNote}`;
  } else {
    recommendation = 'HOLD';
    decisionRationale = `MODERATE CANDIDATE — HOLD FOR COMMERCIAL VALIDATION (Index: ${overallScore}/100 | Commercial Readiness: ${commercialReadinessScore}/100 | Technical Feasibility: ${technicalFeasibilityScore}/100): Has ${verifiedCount} verified evidence record(s) (Problem: ${eq.verified_problem_count || 0}, Demand: ${eq.verified_demand_count || 0}, Competitor: ${eq.verified_competitor_count || 0}, WTP: ${eq.verified_willingness_to_pay_count || 0}), but requires stronger buyer demand or willingness-to-pay validation before committing development cycles. ${wtpNote}`;
  }

  return {
    overall_score: overallScore,
    commercial_readiness_score: commercialReadinessScore,
    technical_feasibility_score: technicalFeasibilityScore,
    commercial_validation_status: commercialValidationStatus,
    score_disclaimer:
      'Structured prioritization index (0-100) for comparing candidate opportunities — NOT a probability of commercial success or revenue guarantee.',
    recommendation,
    decision_rationale: decisionRationale,
    evidence_summary: {
      verified_count: verifiedCount,
      verified_problem_count: eq.verified_problem_count || 0,
      verified_demand_count: eq.verified_demand_count || 0,
      verified_competitor_count: eq.verified_competitor_count || 0,
      verified_willingness_to_pay_count: eq.verified_willingness_to_pay_count || 0,
      evidence_categories: eq.evidence_categories || {},
      independent_origins_count: eq.independent_verified_origins_count,
      practitioner_observation_count: observationCount,
      assumption_count: assumptionCount,
      stale_count: eq.stale_count,
      downgraded_unverified_count: eq.downgraded_unverified_count,
      pending_review_count: eq.pending_review_count || 0,
      contradicting_count: eq.contradicting_count,
      has_conflicting_evidence: eq.has_conflicting_evidence,
      average_confidence_score: eq.average_confidence_score,
      total_count: normalizedEvidence.length
    },
    warnings,
    blockers,
    dimensions: dimensionBreakdown
  };
}
