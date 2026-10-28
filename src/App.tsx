/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AppNavigation } from './components/navigation/AppNavigation';
import { DashboardView } from './components/views/DashboardView';
import { SyllabusView } from './components/views/SyllabusView';
import { PlannerView } from './components/views/PlannerView';
import { FocusTimerView } from './components/views/FocusTimerView';
import { CalendarView } from './components/views/CalendarView';
import { OnlineClassesView } from './components/views/OnlineClassesView';
import { NotesResourcesView } from './components/views/NotesResourcesView';
import { ProgressAnalyticsView } from './components/views/ProgressAnalyticsView';
import { AISettingsView } from './components/views/AISettingsView';
import { SettingsView } from './components/views/SettingsView';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';
import { NotificationBell } from './components/common/NotificationBell';
import { PWAInstallButton } from './components/pwa/PWAInstallButton';
import { NavigationTab } from './types';
import { Target, User, ShieldCheck } from 'lucide-react';
import { SplashScreen } from './components/splash/SplashScreen';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('agami_splash_shown');
    } catch {
      return true;
    }
  });

  React.useEffect(() => {
    const handleReplay = () => {
      setShowSplash(true);
    };
    window.addEventListener('agami:replay-splash', handleReplay);
    return () => window.removeEventListener('agami:replay-splash', handleReplay);
  }, []);

  const { settings, t, formatNumber, daysUntilTargetExam } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Animated Splash Screen Overlay */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* Navigation Layer */}
      <AppNavigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <div className="md:pl-64 flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-900/50 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
              <Target className="w-3.5 h-3.5" />
              <span>{settings.targetGoal}</span>
              <span className="font-bold">• {formatNumber(daysUntilTargetExam)} {t('daysLeft')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton compact />
            <NotificationBell onNavigateTab={setCurrentTab} />

            <div
              onClick={() => setCurrentTab('settings')}
              className="flex items-center gap-2.5 pl-3 border-l border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-80 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {settings.studentName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                  {settings.studentName}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  Student Profile
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 max-w-7xl w-full mx-auto pb-20 md:pb-12">
          {currentTab === 'dashboard' && <DashboardView onNavigate={setCurrentTab} />}
          {currentTab === 'syllabus' && <SyllabusView />}
          {currentTab === 'planner' && <PlannerView />}
          {currentTab === 'timer' && <FocusTimerView />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'classes' && <OnlineClassesView />}
          {currentTab === 'notes' && <NotesResourcesView />}
          {currentTab === 'analytics' && <ProgressAnalyticsView onNavigate={setCurrentTab} />}
          {currentTab === 'aisettings' && <AISettingsView />}
          {currentTab === 'settings' && <SettingsView onNavigate={setCurrentTab} />}
        </main>
      </div>

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
