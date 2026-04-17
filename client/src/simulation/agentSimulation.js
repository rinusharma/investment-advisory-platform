// ─── Agent step definitions ────────────────────────────────────────────────
// Each step: { message, duration (ms), targetProgress (0–100) }
// Total timing budget: 15–20 s
//   portfolio:      900+1100+1000+800+700      = 4 500 ms
//   risk:           600+1000+1000+900+700      = 4 200 ms
//   recommendation: 800+1000+1400+1200+1000+800+600 = 6 800 ms
//   inter-agent pauses:                        ~  400 ms × 2
//   grand total:                               ≈ 16.3 s

export const AGENT_STEPS = {
  portfolio: [
    { message: 'Scanning uploaded documents…',          duration: 900,  targetProgress: 18  },
    { message: 'Parsing financial statement data…',     duration: 1100, targetProgress: 40  },
    { message: 'Identifying holdings and securities…',  duration: 1000, targetProgress: 65  },
    { message: 'Detecting asset class exposures…',      duration: 800,  targetProgress: 82  },
    { message: 'Computing diversification score…',      duration: 700,  targetProgress: 100 },
  ],
  risk: [
    { message: 'Loading risk profile responses…',       duration: 600,  targetProgress: 15  },
    { message: 'Analysing risk tolerance alignment…',   duration: 1000, targetProgress: 38  },
    { message: 'Evaluating portfolio concentration…',   duration: 1000, targetProgress: 62  },
    { message: 'Estimating liquidity risk exposure…',   duration: 900,  targetProgress: 82  },
    { message: 'Computing overall risk score…',         duration: 700,  targetProgress: 100 },
  ],
  recommendation: [
    { message: 'Synthesising portfolio analysis…',       duration: 800,  targetProgress: 12  },
    { message: 'Cross-referencing risk parameters…',     duration: 1000, targetProgress: 28  },
    { message: 'Generating optimal asset allocation…',   duration: 1400, targetProgress: 48  },
    { message: 'Screening buy / sell opportunities…',    duration: 1200, targetProgress: 65  },
    { message: 'Projecting expected return scenarios…',  duration: 1000, targetProgress: 80  },
    { message: 'Evaluating tax efficiency strategies…',  duration: 800,  targetProgress: 92  },
    { message: 'Finalising investment recommendations…', duration: 600,  targetProgress: 100 },
  ],
};

export const AGENT_CONFIGS = [
  {
    id: 'portfolio',
    label: 'Portfolio Analysis Agent',
    subtitle: 'Document parsing & holdings detection',
    weight: 0.25,
  },
  {
    id: 'risk',
    label: 'Risk Assessment Agent',
    subtitle: 'Profile alignment & risk scoring',
    weight: 0.25,
  },
  {
    id: 'recommendation',
    label: 'Investment Recommendation Agent',
    subtitle: 'Allocation strategy & return projection',
    weight: 0.50,
  },
];

// ─── Mock holdings universe ────────────────────────────────────────────────

const MOCK_HOLDINGS = [
  { ticker: 'VTI',   name: 'Vanguard Total Stock Market ETF', weight: 18.3, assetClass: 'Equities'     },
  { ticker: 'AAPL',  name: 'Apple Inc.',                      weight: 8.2,  assetClass: 'Equities'     },
  { ticker: 'MSFT',  name: 'Microsoft Corporation',           weight: 7.5,  assetClass: 'Equities'     },
  { ticker: 'BND',   name: 'Vanguard Total Bond Market ETF',  weight: 15.0, assetClass: 'Fixed Income' },
  { ticker: 'AGG',   name: 'iShares Core US Agg Bond ETF',    weight: 12.0, assetClass: 'Fixed Income' },
  { ticker: 'VNQ',   name: 'Vanguard Real Estate ETF',        weight: 8.9,  assetClass: 'Real Estate'  },
  { ticker: 'GOOGL', name: 'Alphabet Inc.',                   weight: 5.1,  assetClass: 'Equities'     },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.',                 weight: 6.3,  assetClass: 'Equities'     },
  { ticker: 'IAU',   name: 'iShares Gold Trust',              weight: 4.5,  assetClass: 'Commodities'  },
  { ticker: 'CASH',  name: 'Money Market / Cash',             weight: 14.2, assetClass: 'Cash'         },
];

// ─── Agent 1: Portfolio Analysis ───────────────────────────────────────────

export function generatePortfolioResult(stage1Data) {
  const fileCount = stage1Data?.files?.length ?? 0;
  const hasNotes  = (stage1Data?.notes?.trim().length ?? 0) > 0;

  return {
    documentsAnalyzed:   Math.max(1, fileCount + (hasNotes ? 1 : 0)),
    holdingsIdentified:  MOCK_HOLDINGS,
    assetClasses:        ['Equities', 'Fixed Income', 'Real Estate', 'Commodities', 'Cash'],
    diversificationScore: 72,
  };
}

// ─── Agent 2: Risk Assessment ──────────────────────────────────────────────

const RISK_LEVEL_MAP = {
  'Conservative — preserve capital above all': 'Conservative',
  'Moderate — balanced growth and risk':       'Moderate',
  'Aggressive — maximise long-term returns':   'Aggressive',
};
const RISK_SCORE_BASE = { Conservative: 28, Moderate: 55, Aggressive: 78 };
const LIQUIDITY_META = {
  'Immediately — high liquidity required': { label: 'High',   scoreAdj: -8 },
  'Within 6–12 months if needed':          { label: 'Medium', scoreAdj: -3 },
  'After 3+ years — I can stay invested':  { label: 'Low',    scoreAdj:  5 },
};

export function generateRiskResult(riskProfile, portfolioResult) {
  const riskLevel   = RISK_LEVEL_MAP[riskProfile?.riskTolerance] ?? 'Moderate';
  const liquidity   = LIQUIDITY_META[riskProfile?.liquidityNeeds] ?? { label: 'Medium', scoreAdj: 0 };
  const riskScore   = Math.min(100, Math.max(0, (RISK_SCORE_BASE[riskLevel] ?? 55) + liquidity.scoreAdj));

  const equityPct = portfolioResult.holdingsIdentified
    .filter(h => h.assetClass === 'Equities')
    .reduce((sum, h) => sum + h.weight, 0);

  const flags = [];
  if (equityPct > 40)
    flags.push(`Equity overweight — ${equityPct.toFixed(1)}% vs recommended ceiling`);
  const bigPositions = portfolioResult.holdingsIdentified.filter(h => h.weight > 12);
  if (bigPositions.length)
    flags.push(`Large single-position(s): ${bigPositions.map(h => h.ticker).join(', ')}`);
  if (!flags.length)
    flags.push('No significant concentration risk detected');

  return {
    riskLevel,
    riskScore,
    liquidityRisk:      liquidity.label,
    concentrationFlags: flags,
  };
}

// ─── Agent 3: Investment Recommendations ───────────────────────────────────

const ALLOCATION_BY_RISK = {
  Conservative: { Equities: 25, 'Fixed Income': 50, 'Real Estate': 10, Commodities:  5, Cash: 10 },
  Moderate:     { Equities: 50, 'Fixed Income': 30, 'Real Estate': 10, Commodities:  5, Cash:  5 },
  Aggressive:   { Equities: 75, 'Fixed Income': 10, 'Real Estate':  8, Commodities:  5, Cash:  2 },
};
const RETURN_BY_RISK = {
  Conservative: { low: 2.5,  base: 4.5,  high:  6.5  },
  Moderate:     { low: 4.5,  base: 7.5,  high: 11.0  },
  Aggressive:   { low: 6.0,  base: 10.5, high: 16.5  },
};
const TAX_MAP = {
  'Not a priority right now':              'Standard',
  'Somewhat important':                    'Moderate',
  'Critical — I am in a high tax bracket': 'High',
};
const REBALANCING_BY_RISK = {
  Conservative: 'Rebalance quarterly. Prioritise capital preservation via a systematic bond-ladder strategy.',
  Moderate:     'Rebalance semi-annually, or when any asset class drifts more than 5% from its target.',
  Aggressive:   'Rebalance annually. Tolerate higher allocation drift to allow long-term equity compounding.',
};
const MOCK_SUGGESTIONS = [
  { ticker: 'VTI',  action: 'buy',  reason: 'Increase broad equity exposure to meet allocation target'   },
  { ticker: 'BND',  action: 'hold', reason: 'Fixed income weight aligned with current risk profile'       },
  { ticker: 'AAPL', action: 'hold', reason: 'Strong fundamentals; position within acceptable band'        },
  { ticker: 'CASH', action: 'sell', reason: 'Excess cash drag; redeploy into target asset classes'        },
  { ticker: 'VNQ',  action: 'buy',  reason: 'Real estate provides inflation hedge and income yield'       },
  { ticker: 'IAU',  action: 'hold', reason: 'Commodities hedge maintained; keep at 4–5% allocation'      },
];

export function generateRecommendationResult(stage1Data, riskProfile, portfolioResult, riskResult) {
  const level = riskResult.riskLevel ?? 'Moderate';
  return {
    allocation:            ALLOCATION_BY_RISK[level]  ?? ALLOCATION_BY_RISK.Moderate,
    suggestions:           MOCK_SUGGESTIONS,
    expectedReturn:        RETURN_BY_RISK[level]       ?? RETURN_BY_RISK.Moderate,
    taxEfficiency:         TAX_MAP[riskProfile?.taxConsiderations] ?? 'Moderate',
    rebalancingSuggestion: REBALANCING_BY_RISK[level] ?? REBALANCING_BY_RISK.Moderate,
  };
}
