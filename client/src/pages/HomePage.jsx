import { useWorkflow } from '../context/WorkflowContext.jsx';

// ─── Feature card data ────────────────────────────────────────────────────────

const FEATURES = [
  {
    id: 'profile',
    title: 'Client Profile Ingestion',
    description: 'Upload financial statements and documents. The platform parses holdings, extracts asset classes, and scores portfolio diversification automatically.',
    icon: <ProfileIcon />,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    badge: 'Stage 1',
    badgeColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'risk',
    title: 'Risk & Goals Assessment',
    description: 'Chat-based questionnaire across five dimensions — timeline, risk tolerance, income needs, liquidity, and tax efficiency — to build a precise investor profile.',
    icon: <RiskIcon />,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    badge: 'Stage 2',
    badgeColor: 'bg-violet-100 text-violet-700',
  },
  {
    id: 'analysis',
    title: 'AI Agent Analysis',
    description: 'Three-agent simulation pipeline: portfolio analysis, risk scoring, and investment recommendation — each producing structured outputs for the decision engine.',
    icon: <AgentIcon />,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    badge: 'Stage 3',
    badgeColor: 'bg-sky-100 text-sky-700',
  },
  {
    id: 'dashboard',
    title: 'Decision Engine & Dashboard',
    description: 'Rule-based feasibility and impact scoring yields a STRONG BUY → AVOID rating. Portfolio analytics dashboard with scatter plot, table view, and export.',
    icon: <DashboardIcon />,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    badge: 'Stage 4–5',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
];

const PIPELINE_STEPS = ['Upload', 'Assess', 'Analyze', 'Score', 'Decide'];

// ─── Main component ───────────────────────────────────────────────────────────

export default function HomePage({ onStart }) {
  const { stage4Decision, setCurrentStage } = useWorkflow();
  const hasPriorRun = stage4Decision !== null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-800 tracking-tight">AdvisoryAI</span>
          <span className="ml-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">Beta</span>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        <div className="mx-auto w-full max-w-5xl space-y-14">

          {/* Hero */}
          <section className="text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-semibold text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              5-Stage Advisory Pipeline
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              AI-Powered Investment
              <span className="block text-indigo-600">Advisory Platform</span>
            </h1>

            <p className="mx-auto max-w-xl text-lg text-gray-500 leading-relaxed">
              Multi-stage portfolio analysis, risk profiling, and intelligent investment decisioning — from document upload to actionable recommendations.
            </p>

            {/* Pipeline strip */}
            <div className="mx-auto flex max-w-lg items-center justify-center gap-1 pt-1">
              {PIPELINE_STEPS.map((step, i) => (
                <span key={step} className="flex items-center gap-1">
                  <span className="rounded-full bg-white border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                    {step}
                  </span>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <svg className="h-3 w-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </span>
              ))}
            </div>
          </section>

          {/* Feature cards */}
          <section>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.id} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${f.iconBg} ${f.iconColor}`}>
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{f.title}</h3>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${f.badgeColor}`}>{f.badge}</span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed">{f.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
              >
                Start New Analysis
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {hasPriorRun && (
                <button
                  type="button"
                  onClick={() => setCurrentStage('dashboard')}
                  className="inline-flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-8 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
                >
                  View Dashboard
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                </button>
              )}
            </div>

            {hasPriorRun && (
              <p className="text-xs text-gray-400">
                A previous analysis is available — resume from the dashboard or start fresh.
              </p>
            )}
          </section>

        </div>
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="shrink-0 border-t border-gray-100 px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          AI-powered advisory simulation · All analysis is illustrative and not financial advice
        </p>
      </footer>

    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ProfileIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function RiskIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function AgentIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" />
    </svg>
  );
}

function DashboardIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
    </svg>
  );
}
