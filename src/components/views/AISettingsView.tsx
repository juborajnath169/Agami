import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sliders,
  Shield,
  Zap,
  RefreshCw,
  Server,
  Layers
} from 'lucide-react';
import { AIProvider, PlanningAggressiveness } from '../../types';

export const AISettingsView: React.FC = () => {
  const {
    settings,
    updateAISettings,
    t,
    triggerScheduleRebalance,
    isRebalancing,
    canUndoSchedule,
    undoScheduleRebalance
  } = useApp();

  const [provider, setProvider] = useState<AIProvider>(settings.aiSettings?.provider || 'gemini');
  const [model, setModel] = useState<string>(settings.aiSettings?.model || 'gemini-3.8-flash');
  const [autoPlanningEnabled, setAutoPlanningEnabled] = useState<boolean>(settings.aiSettings?.autoPlanningEnabled ?? true);
  const [aggressiveness, setAggressiveness] = useState<PlanningAggressiveness>(settings.aiSettings?.aggressiveness || 'balanced');
  const [requireConfirmation, setRequireConfirmation] = useState<boolean>(settings.aiSettings?.requireConfirmation ?? false);

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    geminiAvailable?: boolean;
    openaiAvailable?: boolean;
  } | null>(null);

  // Test connection on load or on button press
  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const resp = await fetch('/api/ai/status');
      if (resp.ok) {
        const data = await resp.json();
        setConnectionStatus({
          tested: true,
          success: (provider === 'gemini' && data.geminiAvailable) || (provider === 'openai' && data.openaiAvailable) || provider === 'rule_based',
          message: data.message || 'Status retrieved.',
          geminiAvailable: data.geminiAvailable,
          openaiAvailable: data.openaiAvailable,
        });
      } else {
        setConnectionStatus({
          tested: true,
          success: false,
          message: 'Server status endpoint not reachable.',
        });
      }
    } catch (e: any) {
      setConnectionStatus({
        tested: true,
        success: false,
        message: e.message || 'Network error.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  useEffect(() => {
    handleTestConnection();
  }, []);

  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAISettings({
      provider,
      model,
      autoPlanningEnabled,
      aggressiveness,
      requireConfirmation,
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <span>{t('aiSettingsTitle')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t('aiSettingsDesc')}
        </p>
      </div>

      {saveSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>AI Planner preferences saved successfully!</span>
        </div>
      )}

      {/* Connection Status Banner */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">AI Engine Status</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                connectionStatus?.geminiAvailable || connectionStatus?.openaiAvailable
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {connectionStatus?.geminiAvailable ? 'Gemini Ready' : connectionStatus?.openaiAvailable ? 'OpenAI Ready' : 'Deterministic Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {connectionStatus?.message || 'Checking connection...'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testingConnection}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testingConnection ? 'animate-spin' : ''}`} />
          <span>{t('testConnection')}</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
        {/* Provider Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
            {t('providerSelection')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Gemini */}
            <button
              type="button"
              onClick={() => {
                setProvider('gemini');
                setModel('gemini-3.8-flash');
              }}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                provider === 'gemini'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Google Gemini</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Recommended</span>
              </div>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                Server-side GEMINI_API_KEY
              </span>
            </button>

            {/* OpenAI */}
            <button
              type="button"
              onClick={() => {
                setProvider('openai');
                setModel('gpt-4o-mini');
              }}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                provider === 'openai'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">OpenAI</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Optional Alt</span>
              </div>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold mt-2">
                Server-side OPENAI_API_KEY
              </span>
            </button>

            {/* Rule Based */}
            <button
              type="button"
              onClick={() => {
                setProvider('rule_based');
                setModel('deterministic');
              }}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                provider === 'rule_based'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">Rule-Based</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">Zero External API</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
                Deterministic Engine
              </span>
            </button>
          </div>
        </div>

        {/* Model Selection */}
        {provider !== 'rule_based' && (
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">
              {t('modelSelection')}
            </label>
            <select
              value={model}
              onChange={e => setModel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {provider === 'gemini' ? (
                <>
                  <option value="gemini-3.8-flash">gemini-3.8-flash (Fast, balanced, recommended)</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Ultra-low latency)</option>
                </>
              ) : (
                <>
                  <option value="gpt-4o-mini">gpt-4o-mini (Cost-effective)</option>
                  <option value="gpt-4o">gpt-4o (Full model)</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Auto Planning Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {t('autoPlanningToggle')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              {t('autoPlanningHelp')}
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoPlanningEnabled}
            onChange={e => setAutoPlanningEnabled(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer mt-1"
          />
        </div>

        {/* Aggressiveness Setting */}
        <div>
          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
            {t('planningAggressiveness')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            {(['conservative', 'balanced', 'dynamic'] as PlanningAggressiveness[]).map(agg => (
              <button
                key={agg}
                type="button"
                onClick={() => setAggressiveness(agg)}
                className={`py-2 px-3 rounded-xl font-semibold border transition text-left ${
                  aggressiveness === agg
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="capitalize block">{agg}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {agg === 'conservative' ? 'Minimal edits' : agg === 'balanced' ? 'Balanced shifts' : 'Proactive rebalance'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Require Confirmation */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              {t('requireConfirmationToggle')}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-lg">
              Display notification toast with summary and one-tap Undo option whenever auto-scheduling occurs.
            </p>
          </div>
          <input
            type="checkbox"
            checked={requireConfirmation}
            onChange={e => setRequireConfirmation(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500 cursor-pointer mt-1"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerScheduleRebalance('Manual user request', true)}
              disabled={isRebalancing}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isRebalancing ? t('aiRebalancingProgress') : t('generateAiPlan')}</span>
            </button>

            {canUndoSchedule && (
              <button
                type="button"
                onClick={undoScheduleRebalance}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('aiUndoChanges')}</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-95"
          >
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};
