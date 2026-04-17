import { useWorkflow } from '../context/WorkflowContext.jsx';
import AgentPipeline from '../components/AgentPipeline.jsx';

export default function AIAnalysisStage({ onBack, onNext }) {
  const { stage3Analysis } = useWorkflow();
  const isComplete = stage3Analysis !== null;

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
            <StepDot index={1} state="done" />
            <StepConnector filled />
            <StepDot index={2} state="done" />
            <StepConnector filled />
            <StepDot index={3} state="active" />
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Stage 3 of 3
            </p>
            <p className="text-xs text-gray-400">AI-Powered Analysis</p>
          </div>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">AI Analysis Engine</h1>
            <p className="mt-1 text-sm text-gray-500">
              Three specialised agents are sequentially processing your financial profile to
              generate personalised investment recommendations.
            </p>
          </div>

          <AgentPipeline />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 shrink-0 border-t border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            {isComplete
              ? 'All agents completed successfully.'
              : 'Please wait while agents process your data…'}
          </p>

          <button
            type="button"
            disabled={!isComplete}
            onClick={onNext}
            className={[
              'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
              isComplete
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95'
                : 'cursor-not-allowed bg-gray-100 text-gray-300',
            ].join(' ')}
          >
            {isComplete ? (
              <>
                View Full Report
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              <>
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analysing…
              </>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Stepper helpers (local to this stage) ────────────────────────────────────

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
      ) : index}
    </div>
  );
}

function StepConnector({ filled }) {
  return <div className={`h-px flex-1 ${filled ? 'bg-green-400' : 'bg-gray-200'}`} />;
}
