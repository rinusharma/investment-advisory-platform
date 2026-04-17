import { useWorkflow } from '../context/WorkflowContext.jsx';
import RiskAssessmentChat from '../components/RiskAssessmentChat.jsx';

export default function RiskAssessmentStage({ onBack, onNext }) {
  const { completionPercentage, riskProfile } = useWorkflow();
  const canProceed = completionPercentage >= 70;

  return (
    <div className="h-screen flex flex-col bg-gray-50">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex-1">
            {/* Stage stepper */}
            <div className="flex items-center gap-2">
              {/* Stage 1 — completed */}
              <StepDot index={1} state="done" />
              <StepConnector active />
              {/* Stage 2 — active */}
              <StepDot index={2} state="active" />
              <StepConnector active={false} />
              {/* Stage 3 — future */}
              <StepDot index={3} state="future" />
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Stage 2 of 3
            </p>
            <p className="text-xs text-gray-400">Risk &amp; Goals Assessment</p>
          </div>
        </div>
      </header>

      {/* ── Chat area ──────────────────────────────────────────────── */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full mx-auto max-w-2xl px-4 py-4 flex flex-col min-h-0">
          <RiskAssessmentChat />
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          {/* Summary of answers */}
          <div className="text-xs text-gray-400 hidden sm:block">
            {Object.entries(riskProfile)
              .filter(([, v]) => v)
              .map(([k]) => LABEL_MAP[k])
              .join(' · ') || 'No answers yet'}
          </div>

          <button
            type="button"
            disabled={!canProceed}
            onClick={onNext}
            title={canProceed ? '' : 'Answer at least 70% of questions to proceed'}
            className={[
              'ml-auto inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold transition-all',
              canProceed
                ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 active:scale-95'
                : 'cursor-not-allowed bg-gray-100 text-gray-300',
            ].join(' ')}
          >
            {canProceed ? (
              <>
                Next Step
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </>
            ) : (
              `${completionPercentage}% — need 70%`
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────

function StepDot({ index, state }) {
  const base = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold';
  const styles = {
    done: `${base} bg-green-500 text-white`,
    active: `${base} bg-indigo-600 text-white ring-2 ring-indigo-200`,
    future: `${base} bg-gray-100 text-gray-400`,
  };

  return (
    <div className={styles[state]}>
      {state === 'done' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        index
      )}
    </div>
  );
}

function StepConnector({ active }) {
  return (
    <div className={`h-px flex-1 ${active ? 'bg-indigo-300' : 'bg-gray-200'}`} />
  );
}

// Human-readable labels for the answer summary in the footer
const LABEL_MAP = {
  timeline: 'Timeline',
  riskTolerance: 'Risk',
  incomeRequirements: 'Income',
  liquidityNeeds: 'Liquidity',
  taxConsiderations: 'Tax',
};
