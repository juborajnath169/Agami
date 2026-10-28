import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  Clock,
  Calendar,
  Video,
  FileText,
  TrendingUp,
  Settings,
  MoreHorizontal,
  X,
  Globe,
  Sun,
  Moon,
  Sparkles,
  Download
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { NotificationBell } from '../common/NotificationBell';
import { PWAInstallButton } from '../pwa/PWAInstallButton';

interface AppNavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const AppNavigation: React.FC<AppNavigationProps> = ({ currentTab, onSelectTab }) => {
  const { settings, setLanguage, updateSettings, t, formatNumber, overallProgressPercentage } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { id: 'dashboard' as NavigationTab, label: t('dashboard'), icon: LayoutDashboard },
    { id: 'syllabus' as NavigationTab, label: t('syllabus'), icon: BookOpen },
    { id: 'planner' as NavigationTab, label: t('planner'), icon: CalendarDays },
    { id: 'timer' as NavigationTab, label: t('timer'), icon: Clock },
    { id: 'calendar' as NavigationTab, label: t('calendar'), icon: Calendar },
    { id: 'classes' as NavigationTab, label: t('classes'), icon: Video },
    { id: 'notes' as NavigationTab, label: t('notes'), icon: FileText },
    { id: 'analytics' as NavigationTab, label: t('analytics'), icon: TrendingUp },
    { id: 'aisettings' as NavigationTab, label: t('aisettings'), icon: Sparkles },
    { id: 'settings' as NavigationTab, label: t('settings'), icon: Settings },
  ];

  // Mobile bottom bar main 4 tabs + More
  const mobilePrimaryTabs = navItems.slice(0, 4);
  const mobileMoreTabs = navItems.slice(4);

  return (
    <>
      {/* Desktop Sidebar (Visible on md and up) */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-30 select-none">
        {/* Brand Logo & Name */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white block">
                {t('appName')}
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wider uppercase block">
                {settings.language === 'bn' ? 'স্টাডি প্ল্যানার' : 'Study Planner'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Footer: Language Switcher, Theme & Install */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {/* Quick Syllabus Progress Pill */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>{t('overallProgress')}</span>
              <span className="text-indigo-600 dark:text-indigo-400">{formatNumber(overallProgressPercentage)}%</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${overallProgressPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1">
            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(settings.language === 'bn' ? 'en' : 'bn')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-500" />
              <span>{settings.language === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {settings.theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
            </button>
          </div>

          <div className="pt-1">
            <PWAInstallButton compact />
          </div>
        </div>
      </aside>

      {/* Mobile Top Header (Visible on screens < md) */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5" onClick={() => onSelectTab('dashboard')}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white block leading-tight">
              {t('appName')}
            </span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold block leading-tight">
              {settings.studentName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <button
            onClick={() => setLanguage(settings.language === 'bn' ? 'en' : 'bn')}
            className="px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition"
          >
            {settings.language === 'bn' ? 'EN' : 'বাং'}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Notification Bell */}
          <NotificationBell onNavigateTab={onSelectTab} />
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb friendly) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mobilePrimaryTabs.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setShowMoreMenu(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            mobileMoreTabs.some(t => t.id === currentTab)
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <MoreHorizontal className="w-5 h-5 mb-0.5 stroke-2" />
          <span className="text-[10px]">{t('more')}</span>
        </button>
      </nav>

      {/* Mobile "More" Drawer / Bottom Sheet */}
      {showMoreMenu && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {t('more')} Navigation
              </h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 py-4">
              {mobileMoreTabs.map(item => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setShowMoreMenu(false);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-600 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <PWAInstallButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
