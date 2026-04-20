import { useEffect, useRef, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext.jsx';
import {
  AGENT_CONFIGS,
  AGENT_STEPS,
  generatePortfolioResult,
  generateRiskResult,
  generateRecommendationResult,
} from '../simulation/agentSimulation.js';
import AgentCard from './AgentCard.jsx';

// ─── Agent state factories ────────────────────────────────────────────────────

const makeInitialAgents = () => ({
  portfolio:      { status: 'queued', progress: 0, currentMessage: 'Waiting to start…', result: null },
  risk:           { status: 'queued', progress: 0, currentMessage: 'Waiting to start…', result: null },
  recommendation: { status: 'queued', progress: 0, currentMessage: 'Waiting to start…', result: null },
});

function makeCompletedAgents({ portfolioResult, riskResult, recommendationResult }) {
  return {
    portfolio:      { status: 'complete', progress: 100, currentMessage: 'Analysis complete.', result: portfolioResult },
    risk:           { status: 'complete', progress: 100, currentMessage: 'Analysis complete.', result: riskResult },
    recommendation: { status: 'complete', progress: 100, currentMessage: 'Analysis complete.', result: recommendationResult },
  };
}

// ─── Animation helper ─────────────────────────────────────────────────────────
//
// Accepts a plain `timers` array (not a ref) so that each effect invocation
// owns its own array.  The effect's cleanup calls timers.forEach(clearTimeout)
// which kills only the timers belonging to that invocation.

function animateStep(agentId, step, fromProgress, setAgents, timers) {
  return new Promise((resolve) => {
    const startTime = Date.now();

    // Update the status message at the very start of this step
    setAgents((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], currentMessage: step.message },
    }));

    const id = setInterval(() => {
      const elapsed  = Date.now() - startTime;
      const t        = Math.min(elapsed / step.duration, 1);
      const eased    = 1 - (1 - t) * (1 - t); // ease-out quadratic
      const progress = fromProgress + (step.targetProgress - fromProgress) * eased;

      setAgents((prev) => ({
        ...prev,
        [agentId]: { ...prev[agentId], progress },
      }));

      if (t >= 1) {
        clearInterval(id);
        // Snap to the exact target to prevent floating-point drift
        setAgents((prev) => ({
          ...prev,
          [agentId]: { ...prev[agentId], progress: step.targetProgress },
        }));
        resolve();
      }
    }, 50); // ~20 fps

    timers.push(id);
  });
}

// ─── Portfolio Analysis — LLM fetch with mock fallback ───────────────────────
//
// Fires concurrently with the Agent 1 animation so the API round-trip is
// hidden behind the ~4.5 s progress bar.  On any error the mock result is
// returned unchanged, keeping all downstream agents (Risk, Recommendation)
// working exactly as before.
//
// NOTE: holdingsIdentified is kept as the mock ARRAY from generatePortfolioResult
// because generateRiskResult (Agent 2) iterates over it.  The LLM returns a
// count; we surface that via the separate diversificationScore / riskFlags fields.

async function fetchPortfolioAnalysis(stage1Data, fallback) {
  try {
    const notes     = stage1Data?.notes ?? '';
    const filesText = (stage1Data?.files ?? []).map((f) => f.name).join(', ');

    const res = await fetch('/api/portfolio-analysis', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ notes, filesText }),
    });

    if (!res.ok) return fallback;

    const json = await res.json();
    if (!json.success || !json.data) return fallback;

    const llm = json.data;

    // Merge LLM metrics into the mock structure; preserve holdingsIdentified array.
    return {
      ...fallback,
      documentsAnalyzed:    typeof llm.documentsAnalyzed    === 'number' ? llm.documentsAnalyzed    : fallback.documentsAnalyzed,
      diversificationScore: typeof llm.diversificationScore === 'number' ? llm.diversificationScore : fallback.diversificationScore,
      riskFlags:            Array.isArray(llm.riskFlags)                 ? llm.riskFlags             : [],
      summary:              typeof llm.summary              === 'string'  ? llm.summary              : '',
    };
  } catch {
    return fallback;
  }
}

// ─── Pipeline runner ──────────────────────────────────────────────────────────
//
// Pure async function — receives React setters and a local alive() closure.
// No refs, no hooks.  Safe to call multiple times (e.g. StrictMode double-invoke)
// because each call receives its own `timers` array and `alive` function.

async function runPipeline(stage1Data, riskProfile, setAgents, setStage3Analysis, timers, alive) {
  const sleep = (ms) =>
    new Promise((resolve) => {
      const id = setTimeout(resolve, ms);
      timers.push(id); // register for cleanup
    });

  // Runs one agent through all of its steps sequentially
  async function runAgent(agentId, steps) {
    if (!alive()) return;

    console.log(`[Pipeline] ${agentId} — running`);
    setAgents((prev) => ({
      ...prev,
      [agentId]: { ...prev[agentId], status: 'running' },
    }));

    let from = 0;
    for (const step of steps) {
      if (!alive()) return;
      await animateStep(agentId, step, from, setAgents, timers);
      from = step.targetProgress;
    }
  }

  // ── Sequential execution ──────────────────────────────────────────────────

  console.log('[Pipeline] Started');

  // Agent 1 — Portfolio Analysis (weight 25%)
  // Start the LLM call immediately so it runs concurrently with the animation.
  const portfolioFetch = fetchPortfolioAnalysis(stage1Data, generatePortfolioResult(stage1Data));
  await runAgent('portfolio', AGENT_STEPS.portfolio);
  if (!alive()) { console.log('[Pipeline] Cancelled — after Agent 1'); return; }

  const portfolioResult = await portfolioFetch;
  setAgents((prev) => ({
    ...prev,
    portfolio: { ...prev.portfolio, status: 'complete', progress: 100, result: portfolioResult },
  }));
  console.log('[Pipeline] Agent 1 complete — portfolioResult generated');

  await sleep(420);
  if (!alive()) return;

  // Agent 2 — Risk Assessment (weight 25%)
  await runAgent('risk', AGENT_STEPS.risk);
  if (!alive()) { console.log('[Pipeline] Cancelled — after Agent 2'); return; }

  const riskResult = generateRiskResult(riskProfile, portfolioResult);
  setAgents((prev) => ({
    ...prev,
    risk: { ...prev.risk, status: 'complete', progress: 100, result: riskResult },
  }));
  console.log('[Pipeline] Agent 2 complete — riskResult generated');

  await sleep(420);
  if (!alive()) return;

  // Agent 3 — Investment Recommendations (weight 50%)
  await runAgent('recommendation', AGENT_STEPS.recommendation);
  if (!alive()) { console.log('[Pipeline] Cancelled — after Agent 3'); return; }

  const recommendationResult = generateRecommendationResult(
    stage1Data, riskProfile, portfolioResult, riskResult,
  );
  setAgents((prev) => ({
    ...prev,
    recommendation: { ...prev.recommendation, status: 'complete', progress: 100, result: recommendationResult },
  }));
  console.log('[Pipeline] Agent 3 complete — recommendationResult generated');

  console.log('[Pipeline] All agents complete — persisting to WorkflowContext');
  setStage3Analysis({ portfolioResult, riskResult, recommendationResult });
}

// ─── Total progress bar ───────────────────────────────────────────────────────

function TotalProgressBar({ progress, isComplete }) {
  return (
    <div className={[
      'rounded-2xl border p-4 transition-all duration-500',
      isComplete
        ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
        : 'border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50',
    ].join(' ')}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ) : (
            <span className="relative flex h-4 w-4 shrink-0 items-center justify-center">
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-indigo-400/50" />
              <span className="h-2 w-2 rounded-full bg-indigo-600" />
            </span>
          )}
          <p className={`text-sm font-semibold ${isComplete ? 'text-green-700' : 'text-indigo-700'}`}>
            {isComplete ? 'Analysis Pipeline Complete' : 'Running AI Analysis Pipeline…'}
          </p>
        </div>
        <span className={`tabular-nums text-sm font-bold ${isComplete ? 'text-green-600' : 'text-indigo-600'}`}>
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-2.5 overflow-hidden rounded-full bg-white/60">
        {/* transition-none: JS drives the animation; CSS easing would double-animate */}
        <div
          className={`h-full rounded-full transition-none ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className={`mt-2 text-xs ${isComplete ? 'text-green-600' : 'text-indigo-400'}`}>
        {isComplete
          ? 'All agents completed. Proceed to view the full report.'
          : 'Weighted: Portfolio 25% · Risk 25% · Recommendations 50%'}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AgentPipeline() {
  const { stage1Data, riskProfile, stage3Analysis, setStage3Analysis } = useWorkflow();

  const [agents, setAgents] = useState(makeInitialAgents);

  // Capture context values at mount so the effect closure is dep-free.
  // These refs never change — they're just a snapshot.
  const stage1Ref      = useRef(stage1Data);
  const riskProfileRef = useRef(riskProfile);
  const stage3Ref      = useRef(stage3Analysis);

  useEffect(() => {
    // ── Case 1: returning user (navigated back then forward again) ──────────
    if (stage3Ref.current) {
      console.log('[Pipeline] Restoring from completed context');
      setAgents(makeCompletedAgents(stage3Ref.current));
      return;
    }

    // ── Case 2: fresh run ────────────────────────────────────────────────────
    //
    // Reset to a clean state first.  This matters for React 18 StrictMode:
    // the first effect invocation may have partially updated `agents` before
    // its cleanup cancelled it; the second invocation starts from scratch.
    setAgents(makeInitialAgents());

    // Each invocation gets its own cancellation token and timer list.
    //
    // WHY THIS FIXES THE STRICTMODE BUG:
    //   StrictMode runs every effect TWICE: mount → cleanup → mount.
    //   Previously, a shared `isMountedRef` was set to `false` by the cleanup
    //   of a SEPARATE cleanup-effect, which killed the running pipeline AND
    //   prevented it from restarting (hasStartedRef guard).
    //
    //   Now, `cancelled` is LOCAL to this closure.  The cleanup belonging to
    //   the FIRST invocation sets its OWN `cancelled = true` — it has no
    //   effect on the SECOND invocation's fresh `cancelled = false`.
    //   The second invocation starts cleanly and runs to completion.
    let cancelled = false;
    const timers  = [];
    const alive   = () => !cancelled;

    runPipeline(
      stage1Ref.current,
      riskProfileRef.current,
      setAgents,
      setStage3Analysis,
      timers,
      alive,
    );

    // Cleanup: cancel this invocation's pipeline and clear its timers.
    // On true unmount this stops the pipeline immediately.
    // On StrictMode simulate-unmount this only affects the first invocation;
    // the second invocation (re-mount) creates a new token and runs cleanly.
    return () => {
      console.log('[Pipeline] Effect cleanup — cancelling');
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Weighted total progress: Agent1×0.25 + Agent2×0.25 + Agent3×0.50
  const totalProgress =
    agents.portfolio.progress      * 0.25 +
    agents.risk.progress           * 0.25 +
    agents.recommendation.progress * 0.50;

  const allComplete = AGENT_CONFIGS.every((c) => agents[c.id].status === 'complete');

  return (
    <div className="space-y-4">
      <TotalProgressBar progress={totalProgress} isComplete={allComplete} />

      {AGENT_CONFIGS.map((config) => (
        <AgentCard
          key={config.id}
          config={config}
          agentState={agents[config.id]}
        />
      ))}
    </div>
  );
}
