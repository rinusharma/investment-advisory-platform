// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = {
    queued:   { label: 'Queued',     cls: 'bg-gray-100 text-gray-500' },
    running:  { label: 'Running…',   cls: 'bg-indigo-50 text-indigo-600' },
    complete: { label: 'Complete',   cls: 'bg-green-50 text-green-600' },
  };
  const { label, cls } = cfg[status] ?? cfg.queued;

  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status === 'queued'   && <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />}
      {status === 'running'  && <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />}
      {status === 'complete' && (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </span>
  );
}

// ─── Agent icon ───────────────────────────────────────────────────────────────

function AgentIcon({ agentId, status }) {
  const colorCls =
    status === 'complete' ? 'bg-green-50 text-green-600' :
    status === 'running'  ? 'bg-indigo-50 text-indigo-600' :
    'bg-gray-50 text-gray-400';

  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${colorCls}`}>
      {agentId === 'portfolio' && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      )}
      {agentId === 'risk' && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )}
      {agentId === 'recommendation' && (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function AgentProgressBar({ progress, status }) {
  const fillCls =
    status === 'complete' ? 'bg-green-500' :
    status === 'running'  ? 'bg-indigo-500' :
    'bg-gray-200';
  const labelCls =
    status === 'complete' ? 'text-green-600' :
    status === 'running'  ? 'text-indigo-600' :
    'text-gray-300';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Progress</span>
        <span className={`text-xs font-bold tabular-nums ${labelCls}`}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        {/* transition-none: JS handles the easing; CSS transition would double-animate */}
        <div
          className={`h-full rounded-full transition-none ${fillCls}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

// ─── Result panels ────────────────────────────────────────────────────────────

function MetricTile({ label, value }) {
  return (
    <div className="rounded-lg bg-white border border-gray-100 px-3 py-2 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
}

function PortfolioResults({ result }) {
  const { documentsAnalyzed, holdingsIdentified, assetClasses, diversificationScore } = result;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <MetricTile label="Documents Analysed" value={documentsAnalyzed} />
        <MetricTile label="Holdings Identified" value={holdingsIdentified.length} />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Diversification Score</span>
          <span className="text-xs font-bold text-indigo-600">{diversificationScore} / 100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${diversificationScore}%` }} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">Asset Classes Detected</p>
        <div className="flex flex-wrap gap-1.5">
          {assetClasses.map((cls) => (
            <span key={cls} className="rounded-full border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600">
              {cls}
            </span>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">Top Holdings</p>
        <div className="space-y-1.5">
          {holdingsIdentified.slice(0, 5).map((h) => (
            <div key={h.ticker} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-10 shrink-0 font-semibold text-gray-700">{h.ticker}</span>
                <span className="truncate text-gray-400">{h.name}</span>
              </div>
              <span className="ml-2 shrink-0 font-medium text-gray-600">{h.weight}%</span>
            </div>
          ))}
          {holdingsIdentified.length > 5 && (
            <p className="text-xs text-gray-400">
              +{holdingsIdentified.length - 5} additional holdings
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RiskResults({ result }) {
  const { riskLevel, riskScore, liquidityRisk, concentrationFlags } = result;

  const riskStyle = {
    Conservative: { badge: 'border-green-200 bg-green-50 text-green-700', bar: 'bg-green-500' },
    Moderate:     { badge: 'border-amber-200 bg-amber-50 text-amber-700',  bar: 'bg-amber-500' },
    Aggressive:   { badge: 'border-red-200 bg-red-50 text-red-700',        bar: 'bg-red-500' },
  };
  const liquidityStyle = {
    Low:    'border-green-200 bg-green-50 text-green-700',
    Medium: 'border-amber-200 bg-amber-50 text-amber-700',
    High:   'border-red-200 bg-red-50 text-red-700',
  };

  const { badge, bar } = riskStyle[riskLevel] ?? riskStyle.Moderate;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-xs text-gray-500">Risk Level</p>
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge}`}>
            {riskLevel}
          </span>
        </div>
        <div>
          <p className="mb-1 text-xs text-gray-500">Liquidity Risk</p>
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${liquidityStyle[liquidityRisk] ?? liquidityStyle.Medium}`}>
            {liquidityRisk}
          </span>
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Risk Score</span>
          <span className="text-xs font-bold text-gray-700">{riskScore} / 100</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${riskScore}%` }} />
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-gray-500">Concentration Flags</p>
        <ul className="space-y-1">
          {concentrationFlags.map((flag, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {flag}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function RecommendationResults({ result }) {
  const { allocation, suggestions, expectedReturn, taxEfficiency, rebalancingSuggestion } = result;

  const actionStyle = {
    buy:  'border-green-200 bg-green-50 text-green-700',
    sell: 'border-red-200 bg-red-50 text-red-700',
    hold: 'border-amber-200 bg-amber-50 text-amber-700',
  };
  const taxStyle = {
    Standard: 'border-gray-200 bg-gray-50 text-gray-600',
    Moderate: 'border-blue-200 bg-blue-50 text-blue-700',
    High:     'border-indigo-200 bg-indigo-50 text-indigo-700',
  };

  return (
    <div className="space-y-4">
      {/* Allocation */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-600">Recommended Asset Allocation</p>
        <div className="space-y-1.5">
          {Object.entries(allocation).map(([cls, pct]) => (
            <div key={cls} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs text-gray-500">{cls}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-7 shrink-0 text-right text-xs font-semibold text-gray-700">{pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Expected returns */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-600">Expected Annual Return</p>
        <div className="grid grid-cols-3 gap-2">
          {[['Low', expectedReturn.low], ['Base', expectedReturn.base], ['High', expectedReturn.high]].map(([label, pct]) => (
            <div key={label} className="rounded-lg border border-gray-100 bg-white p-2 text-center">
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-sm font-bold ${label === 'Base' ? 'text-indigo-600' : 'text-gray-600'}`}>
                {pct}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div>
        <p className="mb-2 text-xs font-medium text-gray-600">Security Recommendations</p>
        <div className="space-y-1.5">
          {suggestions.map((s) => (
            <div key={s.ticker} className="flex items-start gap-2 text-xs">
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-bold uppercase ${actionStyle[s.action]}`}>
                {s.action}
              </span>
              <span className="w-10 shrink-0 font-semibold text-gray-700">{s.ticker}</span>
              <span className="text-gray-500 leading-relaxed">{s.reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tax + rebalancing */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <p className="text-xs text-gray-500">Tax Efficiency:</p>
          <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${taxStyle[taxEfficiency] ?? taxStyle.Standard}`}>
            {taxEfficiency}
          </span>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">Rebalancing Strategy</p>
          <p className="text-xs leading-relaxed text-gray-600">{rebalancingSuggestion}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Results dispatcher ───────────────────────────────────────────────────────

function ResultsPanel({ agentId, result }) {
  if (agentId === 'portfolio')      return <PortfolioResults result={result} />;
  if (agentId === 'risk')           return <RiskResults result={result} />;
  if (agentId === 'recommendation') return <RecommendationResults result={result} />;
  return null;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function AgentCard({ config, agentState }) {
  const { status, progress, currentMessage, result } = agentState;

  const cardCls = [
    'rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300',
    status === 'running'  ? 'border-indigo-300 shadow-md ring-2 ring-indigo-50'  : '',
    status === 'complete' ? 'border-green-200'                                    : '',
    status === 'queued'   ? 'border-gray-200 opacity-70'                          : '',
  ].join(' ');

  return (
    <div className={cardCls}>
      {/* Header row */}
      <div className="mb-4 flex items-center gap-3">
        <AgentIcon agentId={config.id} status={status} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-gray-800">{config.label}</p>
            <StatusBadge status={status} />
          </div>
          <p className="mt-0.5 text-xs text-gray-400">{config.subtitle}</p>
        </div>
      </div>

      {/* Progress */}
      <AgentProgressBar progress={progress} status={status} />

      {/* Status message */}
      <p className={[
        'mt-2 text-xs transition-colors',
        status === 'complete' ? 'text-green-600'                      : '',
        status === 'running'  ? 'text-indigo-500 animate-pulse'       : '',
        status === 'queued'   ? 'text-gray-300'                       : '',
      ].join(' ')}>
        {status === 'complete' && '✓ Analysis complete'}
        {status === 'running'  && currentMessage}
        {status === 'queued'   && 'Waiting to start…'}
      </p>

      {/* Results — animate in when complete */}
      {status === 'complete' && result && (
        <div className="mt-4 results-reveal rounded-xl border border-gray-100 bg-gray-50/80 p-4">
          <ResultsPanel agentId={config.id} result={result} />
        </div>
      )}
    </div>
  );
}
