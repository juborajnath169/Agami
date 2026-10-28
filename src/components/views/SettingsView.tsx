import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  User,
  Globe,
  Sun,
  Moon,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Database,
  Check,
  AlertCircle,
  Save,
  Bell,
  Sparkles,
  ChevronRight,
  Cpu,
  Play
} from 'lucide-react';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { NavigationTab } from '../../types';

interface SettingsViewProps {
  onNavigate?: (tab: NavigationTab) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate }) => {
  const {
    settings,
    updateSettings,
    resetAllData,
    exportBackupJson,
    importBackupJson,
    setLanguage,
    t,
    cloudSyncStatus,
    testAndSyncSupabase
  } = useApp();

  const [studentName, setStudentName] = useState(settings.studentName);
  const [targetGoal, setTargetGoal] = useState(settings.targetGoal);
  const [targetDate, setTargetDate] = useState(settings.targetDate);
  const [dailyStudyHours, setDailyStudyHours] = useState(settings.dailyStudyHours);
  const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState(settings.pomodoroFocusMinutes);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(settings.pomodoroBreakMinutes);
  const [pomodoroLongBreakMinutes, setPomodoroLongBreakMinutes] = useState(settings.pomodoroLongBreakMinutes);

  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [importNotice, setImportNotice] = useState<{ success: boolean; text: string } | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: studentName.trim(),
      targetGoal: targetGoal.trim(),
      targetDate,
      dailyStudyHours: Number(dailyStudyHours),
      pomodoroFocusMinutes: Number(pomodoroFocusMinutes),
      pomodoroBreakMinutes: Number(pomodoroBreakMinutes),
      pomodoroLongBreakMinutes: Number(pomodoroLongBreakMinutes),
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseAnonKey: supabaseAnonKey.trim() || undefined
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const success = importBackupJson(text);
      if (success) {
        setImportNotice({ success: true, text: 'Data backup imported successfully!' });
      } else {
        setImportNotice({ success: false, text: 'Invalid JSON backup file. Please select a valid backup.' });
      }
      setTimeout(() => setImportNotice(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleTestSupabase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    updateSettings({
      supabaseUrl: supabaseUrl.trim() || undefined,
      supabaseAnonKey: supabaseAnonKey.trim() || undefined
    });
    const ok = await testAndSyncSupabase();
    setIsSyncing(false);
    if (ok) {
      setSyncMessage(t('syncStatusConnected'));
    } else {
      setSyncMessage(t('syncStatusFailed'));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-600" />
          <span>{t('settingsTitle')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Customize your profile, target deadlines, language, themes, timer durations, and cloud storage.
        </p>
      </div>

      {savedNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {importNotice && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-2 animate-in fade-in ${
          importNotice.success
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200'
        }`}>
          {importNotice.success ? (
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{importNotice.text}</span>
        </div>
      )}

      {/* AI Adaptive Auto-Planner Link Card */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-blue-900/10 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-purple-200 dark:border-purple-800/60 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('aiAutoPlannerStatus')}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                settings.aiSettings?.autoPlanningEnabled
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {settings.aiSettings?.autoPlanningEnabled ? 'Auto-Active' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Provider: <span className="font-semibold text-purple-600 dark:text-purple-400 capitalize">{settings.aiSettings?.provider || 'Gemini'}</span> • Pace: <span className="font-semibold capitalize">{settings.aiSettings?.aggressiveness || 'Balanced'}</span>
            </p>
          </div>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('aisettings')}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 shrink-0"
          >
            <span>{t('aisettings')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Language & Theme Controls Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-indigo-500" />
          <span>{t('languageSection')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('selectLanguage')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  settings.language === 'bn'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                বাংলা (Bangla)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  settings.language === 'en'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              {t('selectTheme')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'light' })}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  settings.theme === 'light'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t('light')}</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ theme: 'dark' })}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                  settings.theme === 'dark'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t('dark')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Profile & Deadlines Form */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span>{t('profileSection')}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('studentName')}
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('targetExamName')}
            </label>
            <input
              type="text"
              required
              value={targetGoal}
              onChange={e => setTargetGoal(e.target.value)}
              placeholder="e.g. HSC 2026 Examination / University Admission"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('examDeadlineDate')}
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('dailyHoursTarget')}
            </label>
            <input
              type="number"
              min={1}
              max={16}
              step={0.5}
              value={dailyStudyHours}
              onChange={e => setDailyStudyHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Focus Timer Durations */}
        <div className="pt-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t('studyDurationSettings')}
          </label>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">{t('focusDuration')}</span>
              <input
                type="number"
                min={5}
                max={120}
                value={pomodoroFocusMinutes}
                onChange={e => setPomodoroFocusMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-1">{t('breakDuration')}</span>
              <input
                type="number"
                min={1}
                max={30}
                value={pomodoroBreakMinutes}
                onChange={e => setPomodoroBreakMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <span className="text-slate-500 block mb-1">{t('longBreakDuration')}</span>
              <input
                type="number"
                min={5}
                max={60}
                value={pomodoroLongBreakMinutes}
                onChange={e => setPomodoroLongBreakMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{t('save')}</span>
          </button>
        </div>
      </form>

      {/* Supabase Cloud Storage Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {t('supabaseSection')}
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            cloudSyncStatus === 'synced' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
            cloudSyncStatus === 'error' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {cloudSyncStatus === 'synced' ? t('syncStatusConnected') :
             cloudSyncStatus === 'error' ? t('syncStatusFailed') :
             t('syncStatusLocal')}
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {t('supabaseDesc')} All study data is safely preserved offline on your device right now. To enable multi-device sync, paste your Supabase Project URL and Anon API Key below.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('supabaseUrlLabel')}
            </label>
            <input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={e => setSupabaseUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('supabaseAnonKeyLabel')}
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={e => setSupabaseAnonKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTestSupabase}
              disabled={isSyncing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              {isSyncing ? 'Connecting...' : t('syncNow')}
            </button>
            {syncMessage && (
              <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{syncMessage}</span>
            )}
          </div>
        </div>
      </div>

      {/* PWA & Install Guide Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {t('installApp')}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md">
            {t('installAppDesc')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('agami:replay-splash'));
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600" />
            <span>Replay Intro</span>
          </button>
          <PWAInstallButton />
        </div>
      </div>

      {/* Backup, Export & Reset Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('dataBackup')}
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportBackupJson}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>{t('exportJson')}</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs">
            <Upload className="w-4 h-4 text-emerald-500" />
            <span>{t('importJson')}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/20 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 transition shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>{t('resetData')}</span>
          </button>
        </div>

        {/* Reset Confirmation Prompt */}
        {showResetConfirm && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{t('resetWarning')}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetAllData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-semibold hover:bg-rose-700"
              >
                {t('confirmReset')}
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
