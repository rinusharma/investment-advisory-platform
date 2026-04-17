import { useEffect, useRef, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext.jsx';
import { buildDecisionSummary } from '../scoring/decisionEngine.js';

// ─── Animated counter hook ────────────────────────────────────────────────────

function useCountUp(target, duration = 1400, delay = 0) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let id;
    const startTimer = setTimeout(() => {
      const startTime = Date.now();
      id = setInterval(() => {
        const t = Math.min((Date.now() - startTime) / duration, 1);
        const eased = 1 - (1 - t) * (1 - t); // ease-out quadratic
        setValue(Math.round(target * eased));
        if (t >= 1) clearInterval(id);
      }, 30);
    }, delay);
    return () => { clearTimeout(startTimer); clearInterval(id); };
  }, [target, duration, delay]);
  return value;
}

// ─── Score colour helpers ──────────────────────────────────────────────────────

function scoreColor(score) {
  if (score >= 75) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}

const COLOR_STROKE  = { green: '#22c55e', amber: '#f59e0b', red: '#ef4444' };
const COLOR_TEXT    = { green: 'text-green-600', amber: 'text-amber-600', red: 'text-red-600' };
const COLOR_BG      = { green: 'bg-green-50 border-green-200', amber: 'bg-amber-50 border-amber-200', red: 'bg-red-50 border-red-200' };
const DECISION_BG   = { green: 'bg-green-500', amber: 'bg-amber-500', red: 'bg-red-500' };
const DECISION_RING = { green: 'ring-green-200', amber: 'ring-amber-200', red: 'ring-red-200' };

// ─── Circular score ring ──────────────────────────────────────────────────────

const RING_R = 44;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

function ScoreRing({ score, animatedScore, color }) {
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
      {/* Track */}
      <circle
        cx="60" cy="60" r={RING_R}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="10"
      />
      {/* Fill — CSS transition handles the grow animation */}
      <circle
        cx="60" cy="60" r={RING_R}
        fill="none"
        stroke={COLOR_STROKE[color]}
        strokeWidth="10"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      {/* Centre text — rendered via foreignObject for easy flexbox centring */}
      <foreignObject x="0" y="0" width="120" height="120">
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '1.875rem', fontWeight: 800, lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
              color: COLOR_STROKE[color],
            }}
          >
            {animatedScore}
          </span>
          <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 2 }}>/100</span>
        </div>
      </foreignObject>
    </svg>
  );
}

// ─── Score card ───────────────────────────────────────────────────────────────

function ScoreCard({ label, description, score, animDelay = 0 }) {
  const color = scoreColor(score);
  const animatedScore = useCountUp(score, 1400, animDelay);

  // Trigger ring animation after a short paint delay
  const [ringActive, setRingActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRingActive(true), animDelay + 80);
    return () => clearTimeout(t);
  }, [animDelay]);

  return (
    <div className={`rounded-2xl border p-5 ${COLOR_BG[color]} results-reveal`}>
      <div className="flex flex-col items-center">
        <ScoreRing
          score={ringActive ? score : 0}
          animatedScore={animatedScore}
          color={color}
        />
        <h3 className={`mt-3 text-sm font-bold uppercase tracking-wide ${COLOR_TEXT[color]}`}>
          {label}
        </h3>
        <p className="mt-1 text-center text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ─── Metric tile ──────────────────────────────────────────────────────────────

function MetricTile({ icon, label, primary, secondary }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold text-gray-900">{primary}</p>
      {secondary && <p className="text-xs text-gray-400">{secondary}</p>}
    </div>
  );
}

// ─── Allocation bar ───────────────────────────────────────────────────────────

const ALLOC_COLORS = {
  Equities:       'bg-indigo-500',
  'Fixed Income': 'bg-sky-400',
  'Real Estate':  'bg-teal-400',
  Commodities:    'bg-amber-400',
  Cash:           'bg-gray-300',
};

function AllocationBars({ allocation }) {
  return (
    <div className="space-y-2">
      {Object.entries(allocation).map(([asset, pct]) => (
        <div key={asset} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-xs text-gray-500">{asset}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full ${ALLOC_COLORS[asset] ?? 'bg-gray-400'}`}
              style={{ width: `${pct}%`, transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </div>
          <span className="w-8 text-right text-xs font-semibold tabular-nums text-gray-700">
            {pct}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Decision badge ───────────────────────────────────────────────────────────

function DecisionBadge({ decision, combinedScore }) {
  const animatedCombined = useCountUp(combinedScore, 1200, 200);
  const color = decision.color;

  return (
    <div className="flex flex-col items-center gap-3 py-2 results-reveal">
      <div
        className={`inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-white shadow-lg ${DECISION_BG[color]} ring-4 ${DECISION_RING[color]}`}
      >
        <DecisionIcon label={decision.label} />
        <span className="text-xl font-black tracking-wider">{decision.label}</span>
      </div>

      <p className="text-sm text-gray-500">{decision.tagline}</p>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-gray-400">Combined score:</span>
        <span className={`text-sm font-bold tabular-nums ${COLOR_TEXT[color]}`}>
          {animatedCombined}
          <span className="font-normal text-gray-400">/100</span>
        </span>
      </div>
    </div>
  );
}

function DecisionIcon({ label }) {
  if (label === 'STRONG BUY') {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
      </svg>
    );
  }
  if (label === 'BUY') {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
      </svg>
    );
  }
  if (label === 'HOLD') {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
      </svg>
    );
  }
  // AVOID
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <svg className="h-8 w-8 animate-spin text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="text-sm">Computing scores…</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Stage4ScoringDashboard({ onBack, onNext, onRestart }) {
  const {
    stage3Analysis,
    riskProfile,
    stage4Decision,
    setStage4Decision,
  } = useWorkflow();

  const [summary, setSummary] = useState(null);
  const computedRef = useRef(false);

  useEffect(() => {
    // Returning user — restore immediately
    if (stage4Decision) {
      setSummary(stage4Decision);
      return;
    }

    // Guard against StrictMode double-invoke
    if (computedRef.current) return;
    computedRef.current = true;

    if (!stage3Analysis) return;

    const result = buildDecisionSummary(stage3Analysis, riskProfile);
    setSummary(result);
    setStage4Decision(result);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!summary) return <LoadingSkeleton />;

  const { feasibilityScore, impactScore, decision, metrics, reasoning, allocation, suggestions } = summary;

  const formatCurrency = (n) =>
    n === 0 ? '$0' : `$${n.toLocaleString('en-US')}`;

  const buySuggestions  = suggestions.filter((s) => s.action === 'buy');
  const sellSuggestions = suggestions.filter((s) => s.action === 'sell');
  const holdSuggestions = suggestions.filter((s) => s.action === 'hold');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 shrink-0 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Stage stepper */}
          <div className="flex flex-1 items-center gap-2">
            <StepDot state="done" />
            <StepConnector filled />
            <StepDot state="done" />
            <StepConnector filled />
            <StepDot state="done" />
            <StepConnector filled />
            <StepDot index={4} state="active" />
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Stage 4 of 4
            </p>
            <p className="text-xs text-gray-400">Scoring & Decision</p>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recommendation Scoring</h1>
            <p className="mt-1 text-sm text-gray-500">
              Rule-based decision engine evaluating feasibility and expected impact of the AI-generated recommendations.
            </p>
          </div>

          {/* Decision badge */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <DecisionBadge decision={decision} combinedScore={decision.combined} />
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-2 gap-4">
            <ScoreCard
              label="Feasibility"
              description="How practical and achievable the recommendations are given your portfolio and liquidity."
              score={feasibilityScore}
              animDelay={0}
            />
            <ScoreCard
              label="Impact"
              description="The expected benefit and return improvement from following the recommendations."
              score={impactScore}
              animDelay={150}
            />
          </div>

          {/* Financial metrics */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Financial Projections
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <MetricTile
                icon={<ReturnIcon />}
                label="Projected Annual Return"
                primary={`${metrics.projectedAnnualReturn}%`}
                secondary={`Range: ${metrics.projectedReturnRange.low}%–${metrics.projectedReturnRange.high}%`}
              />
              <MetricTile
                icon={<ValueIcon />}
                label="3-Year Portfolio Value"
                primary={formatCurrency(metrics.threeYearValue)}
                secondary="On $100k reference portfolio"
              />
              <MetricTile
                icon={<TaxIcon />}
                label="Est. Annual Tax Savings"
                primary={formatCurrency(metrics.annualTaxSavings)}
                secondary={metrics.annualTaxSavings > 0 ? 'vs. unoptimised baseline' : 'Standard tax treatment'}
              />
              <MetricTile
                icon={<CostIcon />}
                label="Implementation Cost"
                primary={formatCurrency(metrics.implementationCost)}
                secondary={`${suggestions.filter(s => s.action !== 'hold').length} trades × $20 flat fee`}
              />
            </div>
          </section>

          {/* Reasoning */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Decision Rationale
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
              {reasoning.map((bullet, i) => (
                <div key={i} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">{bullet}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended allocation */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Recommended Allocation
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <AllocWithDelay allocation={allocation} />
            </div>
          </section>

          {/* Action signals */}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Trade Signals
            </h2>
            <div className="rounded-2xl border border-gray-100 bg-white divide-y divide-gray-50">
              {[
                ...buySuggestions.map((s) => ({ ...s, badgeColor: 'bg-green-100 text-green-700' })),
                ...holdSuggestions.map((s) => ({ ...s, badgeColor: 'bg-gray-100 text-gray-500' })),
                ...sellSuggestions.map((s) => ({ ...s, badgeColor: 'bg-red-100 text-red-600' })),
              ].map((s) => (
                <div key={s.ticker} className="flex items-start gap-3 px-5 py-3">
                  <span className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold uppercase ${s.badgeColor}`}>
                    {s.action}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-gray-800">{s.ticker}</span>
                    <p className="text-xs text-gray-400 leading-relaxed">{s.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 shrink-0 border-t border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            Decision based on {reasoning.length} scoring factors
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
            >
              New Analysis
            </button>
            {onNext && (
              <button
                type="button"
                onClick={onNext}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
              >
                View Dashboard
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19l-7-7 7-7M22 12H3" transform="scale(-1,1) translate(-24,0)" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Allocation bars with mount-triggered animation ───────────────────────────

function AllocWithDelay({ allocation }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), 120);
    return () => clearTimeout(t);
  }, []);
  return <AllocationBars allocation={active ? allocation : Object.fromEntries(Object.keys(allocation).map((k) => [k, 0]))} />;
}

// ─── Stepper helpers ──────────────────────────────────────────────────────────

function StepDot({ index, state }) {
  const base = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold';
  const cls = {
    done:   `${base} bg-green-500 text-white`,
    active: `${base} bg-indigo-600 text-white ring-2 ring-indigo-200`,
    future: `${base} bg-gray-100 text-gray-400`,
  };
  return (
    <div className={cls[state]}>
      {state === 'done' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (index ?? '●')}
    </div>
  );
}

function StepConnector({ filled }) {
  return <div className={`h-px flex-1 ${filled ? 'bg-green-400' : 'bg-gray-200'}`} />;
}

// ─── Metric icons ─────────────────────────────────────────────────────────────

function ReturnIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  );
}
function ValueIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
}
function TaxIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  );
}
function CostIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  );
}
