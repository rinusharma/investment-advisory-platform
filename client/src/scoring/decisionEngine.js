// ─── Decision Engine ──────────────────────────────────────────────────────────
// Pure deterministic scoring — no React, no side effects.
//
// Inputs:
//   stage3Analysis  { portfolioResult, riskResult, recommendationResult }
//   riskProfile     { timeline, riskTolerance, incomeRequirements, liquidityNeeds, taxConsiderations }
//
// Primary export:
//   buildDecisionSummary(stage3Analysis, riskProfile) → DecisionSummary

// ─── Lookup tables ────────────────────────────────────────────────────────────

const LIQUIDITY_ADJ = {
  Low:    { feasibility: +15 },
  Medium: { feasibility:  +5 },
  High:   { feasibility: -15 },
};

const TAX_ADJ = {
  High:     { feasibility: +6, impact: +8 },
  Moderate: { feasibility: +2, impact: +3 },
  Standard: { feasibility: -4, impact:  0 },
};

const IMPACT_BASE_BY_RISK = {
  Conservative: 42,
  Moderate:     62,
  Aggressive:   78,
};

const TAX_SAVINGS_BY_EFFICIENCY = {
  High:      2800,
  Moderate:   900,
  Standard:     0,
};

// ─── Feasibility Score (0–100) ────────────────────────────────────────────────
// Measures how practical and achievable the recommendations are given the
// client's liquidity, portfolio quality, and tax situation.

export function computeFeasibilityScore(portfolioResult, riskResult, recommendationResult) {
  let score = 50; // neutral base

  // Liquidity risk factor
  const liqAdj = LIQUIDITY_ADJ[riskResult.liquidityRisk] ?? LIQUIDITY_ADJ.Medium;
  score += liqAdj.feasibility;

  // Diversification quality — maps 0–100 score to ±16 adjustment
  const divScore = portfolioResult.diversificationScore ?? 50;
  score += ((divScore - 50) / 50) * 16;

  // Concentration flags — any real flag signals implementation risk
  const hasConcernFlag = riskResult.concentrationFlags.some(
    (f) => !f.startsWith('No significant'),
  );
  score += hasConcernFlag ? -10 : +8;

  // Tax efficiency
  const taxAdj = TAX_ADJ[recommendationResult.taxEfficiency] ?? TAX_ADJ.Moderate;
  score += taxAdj.feasibility;

  // Actionable suggestion count — more clarity = easier to implement
  const actionCount = recommendationResult.suggestions.filter(
    (s) => s.action === 'buy' || s.action === 'sell',
  ).length;
  score += Math.min(actionCount * 2, 10);

  return Math.round(Math.min(100, Math.max(0, score)));
}

// ─── Impact Score (0–100) ─────────────────────────────────────────────────────
// Measures the expected benefit from following the recommendations relative
// to the client's current allocation and risk profile.

export function computeImpactScore(riskResult, recommendationResult) {
  let score = IMPACT_BASE_BY_RISK[riskResult.riskLevel] ?? 62;

  // Tax efficiency uplift
  const taxAdj = TAX_ADJ[recommendationResult.taxEfficiency] ?? TAX_ADJ.Moderate;
  score += taxAdj.impact;

  // Return spread quality — wide upside range signals high potential
  const { low, base, high } = recommendationResult.expectedReturn;
  const spread = high - low;
  if (spread < 5)  score -= 5;
  if (spread > 10) score += 5;

  // Buy signals — each buy recommendation adds expected return uplift
  const buyCount = recommendationResult.suggestions.filter((s) => s.action === 'buy').length;
  score += Math.min(buyCount * 3, 12);

  // Risk alignment — reward coherent risk/return pairing, penalise mismatch
  const { riskScore, riskLevel } = riskResult;
  if (riskLevel === 'Aggressive'   && riskScore >= 70) score += 6;
  if (riskLevel === 'Conservative' && riskScore <= 35) score += 4;
  if (riskLevel === 'Aggressive'   && riskScore <  50) score -= 8;

  return Math.round(Math.min(100, Math.max(0, score)));
}

// ─── Financial Metrics ────────────────────────────────────────────────────────
// Concrete dollar/percent figures derived from Stage 3 outputs.
// Assumes a $100,000 reference portfolio value for illustrative projections.

const REFERENCE_PORTFOLIO = 100_000;

export function computeFinancialMetrics(riskResult, recommendationResult) {
  const { base, low, high } = recommendationResult.expectedReturn;

  const projectedAnnualReturn = base;
  const threeYearValue        = Math.round(REFERENCE_PORTFOLIO * (1 + base / 100) ** 3);
  const annualTaxSavings      = TAX_SAVINGS_BY_EFFICIENCY[recommendationResult.taxEfficiency] ?? 900;

  const tradeCount       = recommendationResult.suggestions.filter(
    (s) => s.action === 'buy' || s.action === 'sell',
  ).length;
  const implementationCost = tradeCount * 20; // $20 flat per trade (brokerage estimate)

  // Simplified risk-adjusted return: base return divided by a volatility proxy
  const volatilityProxy    = Math.max(1, riskResult.riskScore / 10);
  const riskAdjustedReturn = parseFloat((base / volatilityProxy).toFixed(2));

  return {
    projectedAnnualReturn,               // %
    projectedReturnRange: { low, high }, // %
    threeYearValue,                      // $
    annualTaxSavings,                    // $
    implementationCost,                  // $
    riskAdjustedReturn,                  // unitless ratio
  };
}

// ─── Decision Classification ──────────────────────────────────────────────────
// Combined score = feasibility × 0.4 + impact × 0.6

const DECISION_LEVELS = [
  { threshold: 80, label: 'STRONG BUY', color: 'green',  tagline: 'Highly favourable risk/reward — act with confidence' },
  { threshold: 65, label: 'BUY',        color: 'green',  tagline: 'Sound recommendation — proceed with standard due diligence' },
  { threshold: 50, label: 'HOLD',       color: 'amber',  tagline: 'Moderate outlook — review conditions before acting' },
  { threshold:  0, label: 'AVOID',      color: 'red',    tagline: 'Unfavourable conditions — revisit strategy before committing' },
];

export function classifyDecision(feasibilityScore, impactScore) {
  const combined = Math.round(feasibilityScore * 0.4 + impactScore * 0.6);
  const level = DECISION_LEVELS.find((d) => combined >= d.threshold) ?? DECISION_LEVELS.at(-1);
  return { combined, ...level };
}

// ─── Reasoning bullets ────────────────────────────────────────────────────────

export function buildReasoning(portfolioResult, riskResult, recommendationResult) {
  const bullets = [];

  // Liquidity
  switch (riskResult.liquidityRisk) {
    case 'Low':
      bullets.push('Strong liquidity position — portfolio can absorb full rebalancing without forced selling.');
      break;
    case 'Medium':
      bullets.push('Moderate liquidity headroom — phased implementation over 60–90 days is recommended.');
      break;
    case 'High':
      bullets.push('Limited liquidity — partial implementation advised; maintain ≥15% in cash equivalents.');
      break;
  }

  // Diversification
  const div = portfolioResult.diversificationScore;
  if (div >= 70) {
    bullets.push(`Diversification score of ${div}/100 — well-spread across asset classes, limiting single-sector risk.`);
  } else {
    bullets.push(`Diversification score of ${div}/100 — targeted allocation shifts will meaningfully improve spread.`);
  }

  // Tax efficiency
  switch (recommendationResult.taxEfficiency) {
    case 'High':
      bullets.push('Tax-loss harvesting and tax-advantaged account prioritisation can significantly offset trading costs.');
      break;
    case 'Moderate':
      bullets.push('Moderate tax optimisation opportunities exist — consider timing larger trades near the tax year-end.');
      break;
    case 'Standard':
      bullets.push('Standard tax treatment applies — no specialised tax strategies are applicable at this profile.');
      break;
  }

  // Concentration risk
  const badFlags = riskResult.concentrationFlags.filter((f) => !f.startsWith('No significant'));
  if (badFlags.length) {
    bullets.push(`Concentration risk flagged: ${badFlags[0]} — the recommended reallocation directly addresses this.`);
  } else {
    bullets.push('No concentration risk detected — current holdings are well-distributed across securities.');
  }

  // Expected return
  const { base } = recommendationResult.expectedReturn;
  bullets.push(
    `Base-case expected annual return of ${base}% is consistent with a ${riskResult.riskLevel.toLowerCase()} risk-adjusted strategy.`,
  );

  return bullets;
}

// ─── Master builder ───────────────────────────────────────────────────────────

export function buildDecisionSummary(stage3Analysis, riskProfile) {
  const { portfolioResult, riskResult, recommendationResult } = stage3Analysis;

  const feasibilityScore = computeFeasibilityScore(portfolioResult, riskResult, recommendationResult);
  const impactScore      = computeImpactScore(riskResult, recommendationResult);
  const decision         = classifyDecision(feasibilityScore, impactScore);
  const metrics          = computeFinancialMetrics(riskResult, recommendationResult);
  const reasoning        = buildReasoning(portfolioResult, riskResult, recommendationResult);

  return {
    feasibilityScore,
    impactScore,
    decision,     // { combined, label, color, tagline }
    metrics,
    reasoning,
    riskLevel:    riskResult.riskLevel,
    allocation:   recommendationResult.allocation,
    suggestions:  recommendationResult.suggestions,
  };
}
