import { WorkflowProvider, useWorkflow } from './context/WorkflowContext.jsx';
import HomePage from './pages/HomePage.jsx';
import ClientProfileStage from './pages/ClientProfileStage.jsx';
import RiskAssessmentStage from './pages/RiskAssessmentStage.jsx';
import AIAnalysisStage from './pages/AIAnalysisStage.jsx';
import Stage4ScoringDashboard from './pages/Stage4ScoringDashboard.jsx';
import PortfolioDashboard from './pages/PortfolioDashboard.jsx';

function AppRoutes() {
  const { currentStage, setCurrentStage } = useWorkflow();

  if (currentStage === 'home') {
    return <HomePage onStart={() => setCurrentStage('profile')} />;
  }
  if (currentStage === 'profile') {
    return (
      <ClientProfileStage
        onBack={() => setCurrentStage('home')}
        onNext={() => setCurrentStage('risk')}
      />
    );
  }
  if (currentStage === 'risk') {
    return (
      <RiskAssessmentStage
        onBack={() => setCurrentStage('profile')}
        onNext={() => setCurrentStage('analysis')}
      />
    );
  }
  if (currentStage === 'analysis') {
    return (
      <AIAnalysisStage
        onBack={() => setCurrentStage('risk')}
        onNext={() => setCurrentStage('scoring')}
      />
    );
  }
  if (currentStage === 'scoring') {
    return (
      <Stage4ScoringDashboard
        onBack={() => setCurrentStage('analysis')}
        onNext={() => setCurrentStage('dashboard')}
        onRestart={() => setCurrentStage('home')}
      />
    );
  }
  if (currentStage === 'dashboard') {
    return (
      <PortfolioDashboard
        onBack={() => setCurrentStage('scoring')}
        onRestart={() => setCurrentStage('home')}
      />
    );
  }

  return null;
}

export default function App() {
  return (
    <WorkflowProvider>
      <div className="text-gray-900">
        <AppRoutes />
      </div>
    </WorkflowProvider>
  );
}
