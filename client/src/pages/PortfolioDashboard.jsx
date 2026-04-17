import { useState, useMemo, useCallback, Fragment } from 'react';
import { useWorkflow } from '../context/WorkflowContext.jsx';
import { generateSimulatedPortfolio } from '../simulation/portfolioSimulation.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_COLOR = {
  'STRONG BUY': '#10b981',
  'BUY':        '#6366f1',
  'HOLD':       '#f59e0b',
  'AVOID':      '#ef4444',
};

const BADGE_STYLE = {
  'STRONG BUY': 'bg-emerald-100 text-emerald-700',
  'BUY':        'bg-indigo-100  text-indigo-700',
  'HOLD':       'bg-amber-100   text-amber-700',
  'AVOID':      'bg-red-100     text-red-700',
};

const RISK_STYLE = {
  Conservative: 'bg-sky-50    text-sky-700',
  Moderate:     'bg-violet-50 text-violet-700',
  Aggressive:   'bg-rose-50   text-rose-700',
};

const ALLOC_COLORS = {
  Equities:       'bg-indigo-500',
  'Fixed Income': 'bg-sky-400',
  'Real Estate':  'bg-teal-400',
  Commodities:    'bg-amber-400',
  Cash:           'bg-gray-300',
};

// ─── SVG scatter-plot constants ───────────────────────────────────────────────

const SVG_W  = 500;
const SVG_H  = 360;
const PAD_L  = 55;
const PAD_B  = 40;
const PAD_T  = 20;
const PAD_R  = 20;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const PLOT_H = SVG_H - PAD_T - PAD_B;

function xScale(v) { return PAD_L + (v / 100) * PLOT_W; }
function yScale(v) { return SVG_H - PAD_B - (v / 100) * PLOT_H; }

// ─── Quadrant tooltip data ────────────────────────────────────────────────────

const QUADRANT_DATA = {
  'quick-wins': {
    name: 'Quick Wins',
    description: 'High impact + high feasibility.',
    action: 'Prioritise immediate execution for maximum ROI with minimal complexity.',
    tx: 271, ty: 27, color: '#10b981',
  },
  'strategic': {
    name: 'Strategic',
    description: 'High impact + low feasibility.',
    action: 'Requires planning and phased execution but offers long-term portfolio upside.',
    tx: 58, ty: 27, color: '#6366f1',
  },
  'fill-ins': {
    name: 'Fill-ins',
    description: 'Low impact + high feasibility.',
    action: 'Easy to implement but limited upside; useful for diversification and balance.',
    tx: 271, ty: 212, color: '#f59e0b',
  },
  'low-priority': {
    name: 'Low Priority',
    description: 'Low impact + low feasibility.',
    action: 'Avoid or defer due to poor return on effort.',
    tx: 58, ty: 212, color: '#ef4444',
  },
};

// ─── ScatterPlot ──────────────────────────────────────────────────────────────

function ScatterPlot({ clients, highlightId, onHover, onLeave, onSelect }) {
  const [hoveredQuadrant, setHoveredQuadrant] = useState(null);
  const ticks = [0, 25, 50, 75, 100];
  const MID_X = xScale(50);
  const MID_Y = yScale(50);

  function handleMouseMove(e) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (SVG_W / rect.width);
    const svgY = (e.clientY - rect.top)  * (SVG_H / rect.height);

    if (svgX < PAD_L || svgX > SVG_W - PAD_R || svgY < PAD_T || svgY > SVG_H - PAD_B) {
      setHoveredQuadrant(null);
      return;
    }
    const right = svgX >= MID_X;
    const top   = svgY <= MID_Y;
    if      ( right &&  top) setHoveredQuadrant('quick-wins');
    else if (!right &&  top) setHoveredQuadrant('strategic');
    else if ( right && !top) setHoveredQuadrant('fill-ins');
    else                     setHoveredQuadrant('low-priority');
  }

  function handleMouseLeave(e) {
    setHoveredQuadrant(null);
    onLeave(e);
  }

  const tip = hoveredQuadrant ? QUADRANT_DATA[hoveredQuadrant] : null;

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full"
      style={{ fontFamily: 'inherit' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`@keyframes qtfade{from{opacity:0}to{opacity:1}}.qt-tip{animation:qtfade 0.18s ease forwards}`}</style>
      {/* Grid */}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={xScale(t)} y1={PAD_T} x2={xScale(t)} y2={SVG_H - PAD_B} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={PAD_L} y1={yScale(t)} x2={SVG_W - PAD_R} y2={yScale(t)} stroke="#f3f4f6" strokeWidth="1" />
        </g>
      ))}

      {/* Quadrant dividers */}
      <line x1={xScale(50)} y1={PAD_T} x2={xScale(50)} y2={SVG_H - PAD_B} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />
      <line x1={PAD_L} y1={yScale(50)} x2={SVG_W - PAD_R} y2={yScale(50)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4 3" />

      {/* Quadrant labels */}
      <text x={xScale(75)} y={PAD_T + 14} textAnchor="middle" fontSize="9" fill="#d1d5db" fontWeight="600">QUICK WINS</text>
      <text x={xScale(25)} y={PAD_T + 14} textAnchor="middle" fontSize="9" fill="#d1d5db" fontWeight="600">STRATEGIC</text>
      <text x={xScale(75)} y={yScale(4)}   textAnchor="middle" fontSize="9" fill="#d1d5db" fontWeight="600">FILL-INS</text>
      <text x={xScale(25)} y={yScale(4)}   textAnchor="middle" fontSize="9" fill="#d1d5db" fontWeight="600">LOW PRIORITY</text>

      {/* Axes */}
      <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={SVG_H - PAD_B} stroke="#e5e7eb" strokeWidth="1.5" />
      <line x1={PAD_L} y1={SVG_H - PAD_B} x2={SVG_W - PAD_R} y2={SVG_H - PAD_B} stroke="#e5e7eb" strokeWidth="1.5" />

      {/* Tick labels */}
      {ticks.map((t) => (
        <g key={t}>
          <text x={xScale(t)} y={SVG_H - PAD_B + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">{t}</text>
          {t > 0 && <text x={PAD_L - 6} y={yScale(t) + 3} textAnchor="end" fontSize="9" fill="#9ca3af">{t}</text>}
        </g>
      ))}

      {/* Axis labels */}
      <text x={PAD_L + PLOT_W / 2} y={SVG_H - 2} textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600">
        Impact Score →
      </text>
      <text
        x={12} y={PAD_T + PLOT_H / 2}
        textAnchor="middle" fontSize="10" fill="#6b7280" fontWeight="600"
        transform={`rotate(-90, 12, ${PAD_T + PLOT_H / 2})`}
      >
        Feasibility →
      </text>

      {/* Non-highlighted dots */}
      {clients.filter((c) => c.id !== highlightId).map((c) => (
        <circle
          key={c.id}
          cx={xScale(c.impactScore)}
          cy={yScale(c.feasibilityScore)}
          r={6}
          fill={DOT_COLOR[c.decisionLabel] ?? '#6b7280'}
          fillOpacity="0.75"
          stroke={DOT_COLOR[c.decisionLabel] ?? '#6b7280'}
          strokeWidth="1"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => onHover(c)}
          onClick={() => onSelect(c.id)}
        >
          <title>{`${c.name} — Feasibility: ${c.feasibilityScore}  Impact: ${c.impactScore} — ${c.decisionLabel}`}</title>
        </circle>
      ))}

      {/* Highlighted dot */}
      {clients.filter((c) => c.id === highlightId).map((c) => (
        <g key={c.id}>
          <circle
            cx={xScale(c.impactScore)} cy={yScale(c.feasibilityScore)}
            r={14} fill={DOT_COLOR[c.decisionLabel] ?? '#6366f1'} fillOpacity="0.12" stroke="none"
          />
          <circle
            cx={xScale(c.impactScore)} cy={yScale(c.feasibilityScore)}
            r={8}
            fill={DOT_COLOR[c.decisionLabel] ?? '#6366f1'}
            fillOpacity="0.9"
            stroke="white" strokeWidth="2"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => onHover(c)}
            onClick={() => onSelect(c.id)}
          >
            <title>{`${c.name} — Feasibility: ${c.feasibilityScore}  Impact: ${c.impactScore} — ${c.decisionLabel}`}</title>
          </circle>
          {c.isReal && (
            <text
              x={xScale(c.impactScore)} y={yScale(c.feasibilityScore) - 14}
              textAnchor="middle" fontSize="8.5" fontWeight="700"
              fill={DOT_COLOR[c.decisionLabel] ?? '#6366f1'}
            >
              YOU
            </text>
          )}
        </g>
      ))}

      {/* Quadrant tooltip */}
      {tip && (
        <foreignObject
          key={hoveredQuadrant}
          x={tip.tx} y={tip.ty} width="186" height="96"
          className="qt-tip"
          style={{ pointerEvents: 'none' }}
        >
          <div
            xmlns="http://www.w3.org/1999/xhtml"
            style={{
              width: '100%', height: '100%', boxSizing: 'border-box',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              borderLeft: `3px solid ${tip.color}`,
              boxShadow: '0 4px 14px rgba(0,0,0,0.09)',
              padding: '8px 10px',
              overflow: 'hidden',
            }}
          >
            <p style={{ margin: 0, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: tip.color }}>
              {tip.name}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '9.5px', fontWeight: 600, color: '#374151', lineHeight: 1.4 }}>
              {tip.description}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: '9px', color: '#6b7280', lineHeight: 1.4 }}>
              {tip.action}
            </p>
          </div>
        </foreignObject>
      )}
    </svg>
  );
}

// ─── Allocation bars ──────────────────────────────────────────────────────────

function AllocationBars({ allocation }) {
  return (
    <div className="space-y-1.5">
      {Object.entries(allocation).map(([asset, pct]) => (
        <div key={asset} className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-xs text-gray-500 truncate">{asset}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div className={`h-full rounded-full ${ALLOC_COLORS[asset] ?? 'bg-gray-400'}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="w-7 text-right text-xs font-semibold tabular-nums text-gray-700">{pct}%</span>
        </div>
      ))}
    </div>
  );
}

// ─── Expanded row detail ──────────────────────────────────────────────────────

function ExpandedDetail({ client }) {
  const buys  = client.suggestions.filter((s) => s.action === 'buy');
  const sells = client.suggestions.filter((s) => s.action === 'sell');
  const holds = client.suggestions.filter((s) => s.action === 'hold');
  const tagged = [
    ...buys.map( (s) => ({ ...s, style: 'bg-emerald-100 text-emerald-700' })),
    ...holds.map((s) => ({ ...s, style: 'bg-gray-100    text-gray-500'    })),
    ...sells.map((s) => ({ ...s, style: 'bg-red-100     text-red-600'     })),
  ];

  return (
    <div className="grid grid-cols-1 gap-4 bg-gray-50 px-6 py-4 sm:grid-cols-3">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Allocation</p>
        <AllocationBars allocation={client.allocation} />
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Trade Signals</p>
        <div className="space-y-1.5">
          {tagged.map((s) => (
            <div key={s.ticker} className="flex items-start gap-2">
              <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold uppercase ${s.style}`}>{s.action}</span>
              <span className="text-xs font-semibold text-gray-700">{s.ticker}</span>
              <span className="text-xs text-gray-400 leading-relaxed">{s.reason}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Rationale</p>
        <ul className="space-y-1.5">
          {client.reasoning.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
              <span className="text-xs text-gray-500 leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─── Sort indicator ───────────────────────────────────────────────────────────

function SortIcon({ field, sortField, sortDir }) {
  const active = field === sortField;
  return (
    <svg className={`inline h-3 w-3 ml-1 ${active ? 'text-indigo-600' : 'text-gray-300'}`} viewBox="0 0 10 14" fill="currentColor">
      <path d={active && sortDir === 'asc' ? 'M5 0L10 6H0Z' : 'M5 14L0 8H10Z'} />
    </svg>
  );
}

// ─── Export helpers ───────────────────────────────────────────────────────────

function triggerDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCSV(clients) {
  const header = 'Name,Risk Level,Decision,Feasibility,Impact,Combined,Proj Return Base %,Proj Return Low %,Proj Return High %';
  const rows = clients.map((c) =>
    [c.name, c.riskLevel, c.decisionLabel, c.feasibilityScore, c.impactScore, c.combined,
     c.projectedReturn.base, c.projectedReturn.low, c.projectedReturn.high].join(',')
  );
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' });
  triggerDownload(URL.createObjectURL(blob), 'portfolio-dashboard.csv');
}

function exportJSON(clients) {
  const payload = clients.map(({ id, name, riskLevel, decisionLabel, feasibilityScore, impactScore, combined, projectedReturn, allocation, suggestions, reasoning }) =>
    ({ id, name, riskLevel, decisionLabel, feasibilityScore, impactScore, combined, projectedReturn, allocation, suggestions, reasoning })
  );
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  triggerDownload(URL.createObjectURL(blob), 'portfolio-dashboard.json');
}

// ─── Stepper (matches Stage 4 style) ─────────────────────────────────────────

function StepDot({ state }) {
  const base = 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold';
  const cls  = { done: `${base} bg-green-500 text-white`, active: `${base} bg-indigo-600 text-white ring-2 ring-indigo-200` };
  return (
    <div className={cls[state]}>
      {state === 'done' ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : '5'}
    </div>
  );
}
function StepConnector() { return <div className="h-px flex-1 bg-green-400" />; }

// ─── Main component ───────────────────────────────────────────────────────────

export default function PortfolioDashboard({ onBack, onRestart }) {
  const { stage4Decision, stage3Analysis } = useWorkflow();

  const clients = useMemo(
    () => generateSimulatedPortfolio(stage4Decision, stage3Analysis),
    [stage4Decision, stage3Analysis],
  );

  const [sortField, setSortField]     = useState('combined');
  const [sortDir,   setSortDir]       = useState('desc');
  const [filterText, setFilterText]   = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set(['real']));
  const [highlightId, setHighlightId] = useState('real');
  const [hoveredClient, setHoveredClient] = useState(null);

  const handleSort = useCallback((field) => {
    setSortField((prev) => {
      if (prev === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      else setSortDir('desc');
      return field;
    });
  }, []);

  const toggleRow = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const handleDotHover  = useCallback((c) => { setHoveredClient(c); setHighlightId(c.id); }, []);
  const handlePlotLeave = useCallback(()  => { setHoveredClient(null); setHighlightId('real'); }, []);

  const handleDotSelect = useCallback((id) => {
    setExpandedIds((prev) => { const next = new Set(prev); next.add(id); return next; });
    document.getElementById(`row-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const displayClients = useMemo(() => {
    const lower = filterText.toLowerCase();
    const filtered = clients.filter(
      (c) => c.name.toLowerCase().includes(lower) || c.decisionLabel.toLowerCase().includes(lower) || c.riskLevel.toLowerCase().includes(lower),
    );
    return [...filtered].sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'name')           return mul * a.name.localeCompare(b.name);
      if (sortField === 'projectedReturn') return mul * (a.projectedReturn.base - b.projectedReturn.base);
      return mul * ((a[sortField] ?? 0) - (b[sortField] ?? 0));
    });
  }, [clients, filterText, sortField, sortDir]);

  const real = clients.find((c) => c.isReal);
  const countByDecision = useMemo(() => {
    const m = { 'STRONG BUY': 0, 'BUY': 0, 'HOLD': 0, 'AVOID': 0 };
    clients.forEach((c) => { if (c.decisionLabel in m) m[c.decisionLabel]++; });
    return m;
  }, [clients]);

  const ThS = ({ field, children }) => (
    <th className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-indigo-600" onClick={() => handleSort(field)}>
      {children}<SortIcon field={field} sortField={sortField} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 shrink-0 border-b border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4">
          <button type="button" onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-indigo-600 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <div className="flex flex-1 items-center gap-2">
            <StepDot state="done" /><StepConnector />
            <StepDot state="done" /><StepConnector />
            <StepDot state="done" /><StepConnector />
            <StepDot state="done" /><StepConnector />
            <StepDot state="active" />
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">Stage 5 of 5</p>
            <p className="text-xs text-gray-400">Portfolio Dashboard</p>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">

          {/* Title */}
          <div className="results-reveal">
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Full pipeline results across {clients.length} client profiles — visualise, compare, and export.</p>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 results-reveal">
            <KpiCard label="Your Decision"  value={real?.decisionLabel ?? '—'} sub={`Combined score: ${real?.combined ?? '—'}`}         color={DOT_COLOR[real?.decisionLabel] ?? '#6366f1'} />
            <KpiCard label="Feasibility"    value={`${real?.feasibilityScore ?? '—'}`}  sub="/ 100"                                      color="#6366f1" />
            <KpiCard label="Impact"         value={`${real?.impactScore ?? '—'}`}        sub="/ 100"                                      color="#6366f1" />
            <KpiCard label="Proj. Return"   value={`${real?.projectedReturn?.base ?? '—'}%`} sub={`${real?.projectedReturn?.low ?? '—'}% – ${real?.projectedReturn?.high ?? '—'}%`} color="#6366f1" />
          </div>

          {/* Chart + legend row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 results-reveal">
            <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-1 text-sm font-semibold text-gray-700">Feasibility vs Impact</h2>
              <p className="mb-3 text-xs text-gray-400">Hover a dot to inspect · click to expand its table row</p>
              <ScatterPlot clients={clients} highlightId={highlightId} onHover={handleDotHover} onLeave={handlePlotLeave} onSelect={handleDotSelect} />
            </div>

            <div className="flex flex-col gap-3">
              {/* Legend */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Legend</p>
                <div className="space-y-2.5">
                  {Object.entries(DOT_COLOR).map(([label, color]) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: color }} />
                      <span className="text-sm font-medium text-gray-700">{label}</span>
                      <span className="ml-auto tabular-nums text-xs text-gray-400">{countByDecision[label] ?? 0}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-gray-100 pt-3 space-y-1 text-xs text-gray-400">
                  <div className="flex justify-between"><span>Total clients</span><span className="font-semibold text-gray-600">{clients.length}</span></div>
                  <div className="flex justify-between"><span>Avg feasibility</span><span className="font-semibold text-gray-600">{Math.round(clients.reduce((s, c) => s + c.feasibilityScore, 0) / clients.length)}</span></div>
                  <div className="flex justify-between"><span>Avg impact</span><span className="font-semibold text-gray-600">{Math.round(clients.reduce((s, c) => s + c.impactScore, 0) / clients.length)}</span></div>
                </div>
              </div>

              {/* Hover info card */}
              <div className={`rounded-2xl border bg-white p-5 transition-colors duration-150 ${hoveredClient ? 'border-indigo-200 shadow-sm' : 'border-gray-100'}`}>
                {hoveredClient ? (
                  <>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-800">{hoveredClient.name}</span>
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${BADGE_STYLE[hoveredClient.decisionLabel]}`}>{hoveredClient.decisionLabel}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Stat label="Risk"         value={hoveredClient.riskLevel} />
                      <Stat label="Combined"     value={hoveredClient.combined} />
                      <Stat label="Feasibility"  value={hoveredClient.feasibilityScore} />
                      <Stat label="Impact"       value={hoveredClient.impactScore} />
                      <Stat label="Proj. Return" value={`${hoveredClient.projectedReturn.base}%`} />
                    </div>
                  </>
                ) : (
                  <p className="py-2 text-center text-xs text-gray-400">Hover a dot to inspect</p>
                )}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="results-reveal">
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Client Recommendations
                <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">{displayClients.length}</span>
              </h2>
              <div className="relative max-w-xs">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text" placeholder="Filter by name, decision, risk…"
                  value={filterText} onChange={(e) => setFilterText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-gray-50">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-4 py-3" />
                    <ThS field="name">Client</ThS>
                    <ThS field="riskLevel">Risk</ThS>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Decision</th>
                    <ThS field="feasibilityScore">Feasibility</ThS>
                    <ThS field="impactScore">Impact</ThS>
                    <ThS field="combined">Combined</ThS>
                    <ThS field="projectedReturn">Proj. Return</ThS>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {displayClients.map((client) => {
                    const expanded = expandedIds.has(client.id);
                    return (
                      <Fragment key={client.id}>
                        <tr
                          id={`row-${client.id}`}
                          className={`cursor-pointer transition-colors hover:bg-indigo-50/40 ${client.isReal ? 'bg-indigo-50/20' : ''} ${expanded ? 'bg-gray-50' : ''}`}
                          onClick={() => toggleRow(client.id)}
                        >
                          <td className="px-4 py-3 text-gray-300">
                            <svg className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: DOT_COLOR[client.decisionLabel] ?? '#6b7280' }} />
                              <span className="text-sm font-semibold text-gray-800">{client.name}</span>
                              {client.isReal && <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">YOU</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${RISK_STYLE[client.riskLevel] ?? 'bg-gray-100 text-gray-600'}`}>{client.riskLevel}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`rounded px-2 py-0.5 text-xs font-bold ${BADGE_STYLE[client.decisionLabel]}`}>{client.decisionLabel}</span>
                          </td>
                          <td className="px-4 py-3"><ScoreBar value={client.feasibilityScore} /></td>
                          <td className="px-4 py-3"><ScoreBar value={client.impactScore} /></td>
                          <td className="px-4 py-3 tabular-nums text-sm font-bold text-gray-700">{client.combined}</td>
                          <td className="px-4 py-3 tabular-nums text-sm text-gray-700">
                            {client.projectedReturn.base}%
                            <span className="ml-1 text-xs text-gray-400">({client.projectedReturn.low}–{client.projectedReturn.high}%)</span>
                          </td>
                        </tr>
                        {expanded && (
                          <tr>
                            <td colSpan={8} className="p-0"><ExpandedDetail client={client} /></td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              {displayClients.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">No clients match your filter.</div>
              )}
            </div>
          </div>

          {/* Export */}
          <div className="results-reveal rounded-2xl border border-gray-100 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Export Data</h2>
                <p className="text-xs text-gray-400">Download the full portfolio dataset for offline analysis.</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => exportCSV(clients)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95">
                  <CsvIcon /> Export CSV
                </button>
                <button type="button" onClick={() => exportJSON(clients)} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm transition hover:bg-indigo-100 active:scale-95">
                  <JsonIcon /> Export JSON
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="sticky bottom-0 shrink-0 border-t border-gray-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="text-xs text-gray-400">Advisory pipeline complete · {clients.length} profiles analysed</p>
          <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95">
            Start New Analysis
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
        </div>
      </footer>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function ScoreBar({ value }) {
  const color = value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="tabular-nums text-xs font-semibold text-gray-700">{value}</span>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-gray-400">{label}</p>
      <p className="font-semibold text-gray-700">{value}</p>
    </div>
  );
}

function CsvIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function JsonIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
    </svg>
  );
}
