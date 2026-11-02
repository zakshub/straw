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
      `[UNVERIFIED SOURCE DOWNGRADED]: ${eq.downgraded_unverified_count} finding(s) claimed verified status without a real public http/https URL and supporting excerpt and were automatically downgraded.`
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
  }

  // Conflicting evidence penalty
  if (eq.has_conflicting_evidence) {
    effectiveDemandScore = Math.max(1.5, Math.min(effectiveDemandScore - 2.5, 5.5));
    warnings.push(
      `[CONFLICTING EVIDENCE DETECTED]: ${eq.contradicting_count} contradicting/counter-evidence finding(s) conflict with supporting demand claims. Demand score penalized to ${effectiveDemandScore}/10 pending conflict resolution.`
    );
  }

  rawScores.demand_evidence = effectiveDemandScore;

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

  // Compute weighted score (0 to 100 scale)
  let weightedSum = 0;
  const dimensionBreakdown = SCORING_DIMENSIONS.map((dim) => {
    const score = Number(rawScores[dim.key].toFixed(1));
    const weightedContribution = Number((score * dim.weight * 10).toFixed(2));
    weightedSum += weightedContribution;
    return {
      key: dim.key,
      label: dim.label,
      weight_pct: Math.round(dim.weight * 100),
      score_out_of_10: score,
      weighted_points: weightedContribution,
      description: dim.description
    };
  });

  const overallScore = Number(weightedSum.toFixed(1));

  // Determine transparent recommendation
  let recommendation = 'NEEDS_EVIDENCE';
  let decisionRationale = '';

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
    decisionRationale = `STRONG CANDIDATE (${overallScore}/100): Backed by ${verifiedCount} active verified evidence record(s) across ${eq.independent_verified_origins_count} origin(s) (Confidence: ${Math.round(
      eq.average_confidence_score * 100
    )}%), strong alignment with owner UX/Product/AI-assisted capabilities (${rawScores.owner_capability_fit}/10), and clear monetization path.`;
  } else {
    recommendation = 'HOLD';
    decisionRationale = `MODERATE CANDIDATE (${overallScore}/100): Viable concept with ${verifiedCount} verified evidence record(s), but requires sharper differentiation or tighter scope before committing development cycles.`;
  }

  return {
    overall_score: overallScore,
    recommendation,
    decision_rationale: decisionRationale,
    evidence_summary: {
      verified_count: verifiedCount,
      independent_origins_count: eq.independent_verified_origins_count,
      practitioner_observation_count: observationCount,
      assumption_count: assumptionCount,
      stale_count: eq.stale_count,
      downgraded_unverified_count: eq.downgraded_unverified_count,
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
