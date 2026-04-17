import { createContext, useContext, useState } from 'react';

const WorkflowContext = createContext(null);

const TOTAL_QUESTIONS = 5;

const INITIAL_RISK_PROFILE = {
  timeline: null,
  riskTolerance: null,
  incomeRequirements: null,
  liquidityNeeds: null,
  taxConsiderations: null,
};

export function WorkflowProvider({ children }) {
  // Global stage navigation
  const [currentStage, setCurrentStage] = useState('home');

  // Stage 1 — persisted so Stage 2 can reference it later
  const [stage1Data, setStage1Data] = useState({
    files: [],
    notes: '',
    uploadResult: null,
  });

  // Stage 2 — risk profile answers
  const [riskProfile, setRiskProfile] = useState(INITIAL_RISK_PROFILE);

  // Stage 3 — aggregated AI analysis output
  const [stage3Analysis, setStage3Analysis] = useState(null);

  // Stage 4 — decision engine output
  const [stage4Decision, setStage4Decision] = useState(null);

  const updateRiskProfile = (questionId, answer) => {
    setRiskProfile((prev) => ({ ...prev, [questionId]: answer }));
  };

  const answeredCount = Object.values(riskProfile).filter(Boolean).length;
  const completionPercentage = Math.round((answeredCount / TOTAL_QUESTIONS) * 100);

  const value = {
    // Navigation
    currentStage,
    setCurrentStage,

    // Stage 1
    stage1Data,
    setStage1Data,

    // Stage 2
    riskProfile,
    updateRiskProfile,
    completionPercentage,
    answeredCount,
    totalQuestions: TOTAL_QUESTIONS,

    // Stage 3
    stage3Analysis,
    setStage3Analysis,

    // Stage 4
    stage4Decision,
    setStage4Decision,
  };

  return (
    <WorkflowContext.Provider value={value}>
      {children}
    </WorkflowContext.Provider>
  );
}

export function useWorkflow() {
  const ctx = useContext(WorkflowContext);
  if (!ctx) throw new Error('useWorkflow must be used inside <WorkflowProvider>');
  return ctx;
}
