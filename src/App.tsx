import React from 'react';
import { HunterProvider, useHunter } from './context/HunterContext';
import { SystemHeader } from './components/SystemHeader';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { ChecklistScreen } from './screens/ChecklistScreen';
import { RoutineManageScreen } from './screens/RoutineManageScreen';
import { WeeklyReportScreen } from './screens/WeeklyReportScreen';

const MainApp: React.FC = () => {
  const { state, isLoading, activeTab } = useHunter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-system-bg font-mono text-xs text-cyan-400 gap-3">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span>INITIALIZING SYSTEM PROTOCOL...</span>
      </div>
    );
  }

  // If no hunter profile registered, show Onboarding
  if (!state.hunter) {
    return <OnboardingScreen />;
  }

  return (
    <div className="min-h-screen bg-system-bg text-slate-100 relative selection:bg-cyan-500 selection:text-slate-950">
      {/* Subtle Scanline Overlay */}
      <div className="system-scanline" />

      {/* Main Sticky Header */}
      <SystemHeader />

      {/* Main View Container */}
      <main className="max-w-4xl mx-auto px-4 pt-4">
        {activeTab === 'checklist' && <ChecklistScreen />}
        {activeTab === 'dashboard' && <DashboardScreen />}
        {activeTab === 'routine' && <RoutineManageScreen />}
        {activeTab === 'report' && <WeeklyReportScreen />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <HunterProvider>
      <MainApp />
    </HunterProvider>
  );
}

export default App;
