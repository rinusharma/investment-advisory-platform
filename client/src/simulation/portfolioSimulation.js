// ─── Portfolio Simulation ─────────────────────────────────────────────────────
// Generates portfolio data for Stage 5 dashboard.
// Returns an array: [realClient, ...8 simulated clients]

const RAW_CLIENTS = [
  {
    id: 'sim-001',
    name: 'Raj Patel',
    riskLevel: 'Conservative',
    feasibilityScore: 84,
    impactScore: 80,
    projectedReturn: { low: 3.0, base: 5.2, high: 7.5 },
    allocation: { Equities: 25, 'Fixed Income': 50, 'Real Estate': 10, Commodities: 8, Cash: 7 },
    suggestions: [
      { ticker: 'BND',  action: 'buy',  reason: 'Increase bond ladder for capital preservation' },
      { ticker: 'VTI',  action: 'hold', reason: 'Broad equity at target weight' },
      { ticker: 'CASH', action: 'sell', reason: 'Reduce excess cash to improve yield' },
    ],
    reasoning: [
      'Strong liquidity position enables full rebalancing without forced selling.',
      'Conservative profile well-matched to low-volatility fixed income tilt.',
      'High tax efficiency reduces net implementation cost significantly.',
    ],
  },
  {
    id: 'sim-002',
    name: 'Sofia Martinez',
    riskLevel: 'Aggressive',
    feasibilityScore: 78,
    impactScore: 88,
    projectedReturn: { low: 7.5, base: 12.0, high: 19.0 },
    allocation: { Equities: 75, 'Fixed Income': 8, 'Real Estate': 8, Commodities: 6, Cash: 3 },
    suggestions: [
      { ticker: 'QQQ',  action: 'buy',  reason: 'Tech-heavy growth exposure for aggressive target' },
      { ticker: 'AMZN', action: 'buy',  reason: 'Strong compounding thesis confirmed' },
      { ticker: 'AGG',  action: 'sell', reason: 'Over-allocated to bonds vs. risk appetite' },
    ],
    reasoning: [
      'Aggressive risk profile yields highest projected return band.',
      'Long 10+ year horizon absorbs near-term volatility comfortably.',
      'Tax considerations limited — standard treatment, no specialised strategies.',
    ],
  },
  {
    id: 'sim-003',
    name: 'David Kim',
    riskLevel: 'Moderate',
    feasibilityScore: 71,
    impactScore: 69,
    projectedReturn: { low: 5.0, base: 8.5, high: 12.0 },
    allocation: { Equities: 50, 'Fixed Income': 30, 'Real Estate': 10, Commodities: 5, Cash: 5 },
    suggestions: [
      { ticker: 'VTI',  action: 'buy',  reason: 'Diversified equity core at target weight' },
      { ticker: 'VNQ',  action: 'hold', reason: 'Real estate allocation within range' },
      { ticker: 'IAU',  action: 'buy',  reason: 'Commodities boost for inflation hedge' },
    ],
    reasoning: [
      'Balanced moderate strategy provides consistent risk-adjusted returns.',
      'Semi-annual rebalancing keeps allocation drift within 5% threshold.',
      'Moderate tax optimisation opportunities exist near year-end.',
    ],
  },
  {
    id: 'sim-004',
    name: 'Emma Thompson',
    riskLevel: 'Moderate',
    feasibilityScore: 62,
    impactScore: 72,
    projectedReturn: { low: 4.5, base: 7.8, high: 11.5 },
    allocation: { Equities: 48, 'Fixed Income': 32, 'Real Estate': 12, Commodities: 4, Cash: 4 },
    suggestions: [
      { ticker: 'MSFT', action: 'hold', reason: 'Fundamentals strong; within target band' },
      { ticker: 'BND',  action: 'buy',  reason: 'Increase fixed income to reduce volatility' },
      { ticker: 'AAPL', action: 'sell', reason: 'Trim overweight tech position' },
    ],
    reasoning: [
      'Moderate liquidity — phased implementation over 60 days recommended.',
      'Slight equity overweight requires rebalancing toward bonds.',
      'Income requirements satisfied by current dividend yield.',
    ],
  },
  {
    id: 'sim-005',
    name: 'Marcus Johnson',
    riskLevel: 'Conservative',
    feasibilityScore: 55,
    impactScore: 52,
    projectedReturn: { low: 2.0, base: 4.2, high: 6.0 },
    allocation: { Equities: 22, 'Fixed Income': 52, 'Real Estate': 8, Commodities: 4, Cash: 14 },
    suggestions: [
      { ticker: 'CASH', action: 'sell', reason: 'High cash drag — deploy gradually into bonds' },
      { ticker: 'BND',  action: 'buy',  reason: 'Core fixed income aligned with preservation goal' },
    ],
    reasoning: [
      'High cash allocation creates drag on projected returns.',
      'Conservative profile limits upside but protects capital adequately.',
      'Liquidity needs within 12 months constrain rebalancing options.',
    ],
  },
  {
    id: 'sim-006',
    name: 'Priya Sharma',
    riskLevel: 'Moderate',
    feasibilityScore: 48,
    impactScore: 57,
    projectedReturn: { low: 3.5, base: 6.5, high: 9.0 },
    allocation: { Equities: 45, 'Fixed Income': 30, 'Real Estate': 12, Commodities: 6, Cash: 7 },
    suggestions: [
      { ticker: 'VTI',  action: 'hold', reason: 'Core equity allocation on target' },
      { ticker: 'VNQ',  action: 'sell', reason: 'Real estate overweight — trim to reduce concentration' },
    ],
    reasoning: [
      'Concentration risk in real estate sector above acceptable threshold.',
      'Limited tax efficiency options reduce net impact of rebalancing.',
      'Moderate timeline allows gradual portfolio optimisation.',
    ],
  },
  {
    id: 'sim-007',
    name: 'Lucas Weber',
    riskLevel: 'Aggressive',
    feasibilityScore: 38,
    impactScore: 44,
    projectedReturn: { low: 5.0, base: 8.0, high: 13.0 },
    allocation: { Equities: 68, 'Fixed Income': 12, 'Real Estate': 8, Commodities: 7, Cash: 5 },
    suggestions: [
      { ticker: 'AMZN', action: 'sell', reason: 'Significant concentration in single name' },
      { ticker: 'BND',  action: 'buy',  reason: 'Increase fixed income to reduce drawdown risk' },
    ],
    reasoning: [
      'High concentration risk in single equities reduces portfolio resilience.',
      'Aggressive risk score misaligned with current return band.',
      'Immediate liquidity needs limit large rebalancing moves.',
    ],
  },
  {
    id: 'sim-008',
    name: 'Aiko Tanaka',
    riskLevel: 'Conservative',
    feasibilityScore: 30,
    impactScore: 35,
    projectedReturn: { low: 1.5, base: 3.2, high: 5.0 },
    allocation: { Equities: 18, 'Fixed Income': 42, 'Real Estate': 8, Commodities: 2, Cash: 30 },
    suggestions: [
      { ticker: 'CASH', action: 'sell', reason: 'Extreme cash position undermines returns' },
      { ticker: 'AGG',  action: 'buy',  reason: 'Shift excess cash to short-duration bonds' },
    ],
    reasoning: [
      'Excessive cash holdings (30%) severely limiting return potential.',
      'High immediate liquidity needs prevent meaningful rebalancing.',
      'Current allocation unlikely to meet long-term wealth preservation goals.',
    ],
  },
];

function getDecisionLabel(combined) {
  if (combined >= 80) return 'STRONG BUY';
  if (combined >= 65) return 'BUY';
  if (combined >= 50) return 'HOLD';
  return 'AVOID';
}

export function generateSimulatedPortfolio(stage4Decision, stage3Analysis) {
  const realCombined = stage4Decision?.decision?.combined ?? 65;

  const realClient = {
    id: 'real',
    name: 'Current Client',
    isReal: true,
    riskLevel:       stage4Decision?.riskLevel ?? 'Moderate',
    feasibilityScore: stage4Decision?.feasibilityScore ?? 65,
    impactScore:      stage4Decision?.impactScore      ?? 70,
    combined:         realCombined,
    decisionLabel:    stage4Decision?.decision?.label  ?? getDecisionLabel(realCombined),
    projectedReturn: {
      low:  stage3Analysis?.recommendationResult?.expectedReturn?.low  ?? 4.5,
      base: stage3Analysis?.recommendationResult?.expectedReturn?.base ?? 7.5,
      high: stage3Analysis?.recommendationResult?.expectedReturn?.high ?? 11.0,
    },
    allocation:  stage4Decision?.allocation  ?? {},
    suggestions: stage4Decision?.suggestions ?? [],
    reasoning:   stage4Decision?.reasoning   ?? [],
    metrics:     stage4Decision?.metrics     ?? null,
  };

  const simulated = RAW_CLIENTS.map((c) => {
    const combined = Math.round(c.feasibilityScore * 0.4 + c.impactScore * 0.6);
    return { ...c, combined, decisionLabel: getDecisionLabel(combined), isReal: false, metrics: null };
  });

  return [realClient, ...simulated];
}
