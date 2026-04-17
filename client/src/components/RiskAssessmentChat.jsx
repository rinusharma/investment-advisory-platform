import { useEffect, useRef, useState } from 'react';
import { useWorkflow } from '../context/WorkflowContext.jsx';

// ─── Question definitions ────────────────────────────────────────────────────

export const QUESTIONS = [
  {
    id: 'timeline',
    text: 'What is your investment timeline? How long do you plan to keep your money invested?',
    options: ['Less than 1 year', '1–3 years', '3–7 years', '7–15 years', '15+ years'],
  },
  {
    id: 'riskTolerance',
    text: 'How would you describe your risk tolerance?',
    options: [
      'Conservative — preserve capital above all',
      'Moderate — balanced growth and risk',
      'Aggressive — maximise long-term returns',
    ],
  },
  {
    id: 'incomeRequirements',
    text: 'Do you need this investment to generate regular income?',
    options: [
      'No — fully reinvest all returns',
      'Some income distributions preferred',
      'Regular income is essential to me',
    ],
  },
  {
    id: 'liquidityNeeds',
    text: 'How quickly might you need to access these funds in an emergency?',
    options: [
      'Immediately — high liquidity required',
      'Within 6–12 months if needed',
      'After 3+ years — I can stay invested',
    ],
  },
  {
    id: 'taxConsiderations',
    text: 'How important are tax-efficient investment strategies to you?',
    options: [
      'Not a priority right now',
      'Somewhat important',
      'Critical — I am in a high tax bracket',
    ],
  },
];

const INTRO_TEXT =
  "Hello! I'm your investment advisor. To build your personalised risk profile I'll ask you five short questions. Take your time — there are no wrong answers.";

const COMPLETION_TEXT =
  "Thank you! I now have everything I need to begin assessing your risk profile. You can proceed to the next stage whenever you're ready.";

// ─── Sub-components ──────────────────────────────────────────────────────────

function AdvisorBubble({ content, isActive }) {
  return (
    <div className="flex items-end gap-2.5 chat-msg">
      {/* Avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
        AI
      </div>
      {/* Bubble */}
      <div
        className={[
          'max-w-[78%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed shadow-sm transition-all',
          isActive
            ? 'bg-white border border-indigo-300 text-gray-800 ring-2 ring-indigo-100'
            : 'bg-white border border-gray-100 text-gray-700',
        ].join(' ')}
      >
        {content}
      </div>
    </div>
  );
}

function UserBubble({ content }) {
  return (
    <div className="flex justify-end chat-msg">
      <div className="max-w-[68%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
        {content}
      </div>
    </div>
  );
}

function AnswerOptions({ question, onSelect, disabled }) {
  return (
    <div className="flex flex-wrap justify-end gap-2 pl-10 chat-msg">
      {question.options.map((opt) => (
        <button
          key={opt}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(question.id, opt)}
          className="rounded-xl border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-700 transition-all hover:border-indigo-500 hover:bg-indigo-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ProgressBar({ percentage, answered, total }) {
  const canProceed = percentage >= 70;

  return (
    <div className="shrink-0 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-gray-500">
          {answered} of {total} questions answered
        </span>
        <span
          className={`text-xs font-bold ${
            canProceed ? 'text-green-600' : 'text-indigo-600'
          }`}
        >
          {percentage}%
          {canProceed && (
            <span className="ml-1.5 font-normal text-green-500">· Ready to proceed</span>
          )}
          {!canProceed && (
            <span className="ml-1.5 font-normal text-gray-400">· 70% needed to continue</span>
          )}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            canProceed ? 'bg-green-500' : 'bg-indigo-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function RiskAssessmentChat() {
  const { riskProfile, updateRiskProfile, completionPercentage, answeredCount, totalQuestions } =
    useWorkflow();

  const [messages, setMessages] = useState([]);
  const [activeQuestionId, setActiveQuestionId] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const bottomRef = useRef(null);
  // Capture profile snapshot at mount so the init effect is stable
  const initProfileRef = useRef(riskProfile);
  // Guard: prevents StrictMode's double-invoke from running init twice.
  // React 18 StrictMode fires effects twice in development (mount → cleanup → remount)
  // but preserves state between runs. Without this guard, two setTimeouts would both
  // fire and append the first question twice.
  const hasInitializedRef = useRef(false);

  // ── Initialise message history on mount ──────────────────────────────────
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const profile = initProfileRef.current;
    const msgs = [{ id: 'intro', type: 'advisor', content: INTRO_TEXT }];

    // Replay previously answered Q&A pairs
    QUESTIONS.forEach((q) => {
      if (profile[q.id]) {
        msgs.push({ id: `q-${q.id}`, type: 'advisor', content: q.text, questionId: q.id });
        msgs.push({ id: `a-${q.id}`, type: 'user', content: profile[q.id], questionId: q.id });
      }
    });

    const firstUnanswered = QUESTIONS.find((q) => !profile[q.id]);

    if (firstUnanswered) {
      // Stagger first question after intro
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${firstUnanswered.id}`,
            type: 'advisor',
            content: firstUnanswered.text,
            questionId: firstUnanswered.id,
          },
        ]);
        setActiveQuestionId(firstUnanswered.id);
      }, msgs.length === 1 ? 600 : 0); // only delay on fresh start
    } else {
      // All questions were already answered (returning user)
      msgs.push({ id: 'completion', type: 'advisor', content: COMPLETION_TEXT });
      setActiveQuestionId(null);
    }

    setMessages(msgs);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll whenever messages change ─────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Handle user selecting an answer ──────────────────────────────────────
  const handleSelect = (questionId, answer) => {
    if (isTransitioning || activeQuestionId !== questionId) return;

    setIsTransitioning(true);
    setActiveQuestionId(null);

    // Append user bubble
    setMessages((prev) => [
      ...prev,
      { id: `a-${questionId}`, type: 'user', content: answer, questionId },
    ]);

    // Persist to context
    updateRiskProfile(questionId, answer);

    const currentIndex = QUESTIONS.findIndex((q) => q.id === questionId);
    const nextQuestion = QUESTIONS[currentIndex + 1];

    setTimeout(() => {
      if (nextQuestion) {
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${nextQuestion.id}`,
            type: 'advisor',
            content: nextQuestion.text,
            questionId: nextQuestion.id,
          },
        ]);
        setActiveQuestionId(nextQuestion.id);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: 'completion', type: 'advisor', content: COMPLETION_TEXT },
        ]);
      }
      setIsTransitioning(false);
    }, 550);
  };

  // ─── Render ──────────────────────────────────────────────────────────────
  const activeQuestion = activeQuestionId
    ? QUESTIONS.find((q) => q.id === activeQuestionId)
    : null;

  return (
    <div className="flex flex-col h-full min-h-0 gap-3">
      {/* Progress bar */}
      <ProgressBar
        percentage={completionPercentage}
        answered={answeredCount}
        total={totalQuestions}
      />

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-4 py-2 pr-1 scroll-smooth">
        {messages.map((msg) =>
          msg.type === 'advisor' ? (
            <AdvisorBubble
              key={msg.id}
              content={msg.content}
              isActive={msg.questionId === activeQuestionId}
            />
          ) : (
            <UserBubble key={msg.id} content={msg.content} />
          )
        )}

        {/* Option buttons for active question */}
        {activeQuestion && (
          <AnswerOptions
            question={activeQuestion}
            onSelect={handleSelect}
            disabled={isTransitioning}
          />
        )}

        {/* Typing indicator while transitioning */}
        {isTransitioning && (
          <div className="flex items-end gap-2.5 chat-msg">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
              AI
            </div>
            <div className="flex gap-1 rounded-2xl rounded-bl-sm bg-white border border-gray-100 px-4 py-3.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-gray-300 animate-bounce" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
