import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Clock,
  Coffee,
  Sparkles,
  Volume2,
  VolumeX,
  Flame
} from 'lucide-react';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

export const FocusTimerView: React.FC = () => {
  const {
    settings,
    t,
    formatNumber,
    logFocusMinutes,
    triggerCelebration,
    playTimerChime,
    getTodayStudyMinutes,
    getStudyStreak
  } = useApp();

  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompletedToday, setSessionsCompletedToday] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Durations in seconds
  const focusSeconds = (settings.pomodoroFocusMinutes || 25) * 60;
  const shortBreakSeconds = (settings.pomodoroBreakMinutes || 5) * 60;
  const longBreakSeconds = (settings.pomodoroLongBreakMinutes || 15) * 60;

  const getDurationForMode = (m: TimerMode) => {
    switch (m) {
      case 'pomodoro': return focusSeconds;
      case 'shortBreak': return shortBreakSeconds;
      case 'longBreak': return longBreakSeconds;
    }
  };

  const [timeLeft, setTimeLeft] = useState(focusSeconds);
  const totalDuration = getDurationForMode(mode);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync when mode changes or settings change
  useEffect(() => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  }, [mode, settings.pomodoroFocusMinutes, settings.pomodoroBreakMinutes, settings.pomodoroLongBreakMinutes]);

  // Timer interval loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const { tasks } = useApp();
  const [linkedTaskId, setLinkedTaskId] = useState<string>('');

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (soundEnabled) {
      playTimerChime();
    }

    if (mode === 'pomodoro') {
      const minutesCompleted = Math.round(focusSeconds / 60);
      logFocusMinutes(minutesCompleted, linkedTaskId || undefined);
      triggerCelebration();
      const nextCount = sessionsCompletedToday + 1;
      setSessionsCompletedToday(nextCount);

      // Auto switch to break
      if (nextCount % (settings.pomodoroSessionsBeforeLongBreak || 4) === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      // Break finished, return to pomodoro
      setMode('pomodoro');
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(getDurationForMode(mode));
  };

  const handleSkip = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setMode('shortBreak');
    } else {
      setMode('pomodoro');
    }
  };

  // Minutes and seconds formatted
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Progress percentage
  const progressPercent = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;
  const strokeDashoffset = 440 - (440 * progressPercent) / 100;

  const todayMinutes = getTodayStudyMinutes();
  const todayHours = (todayMinutes / 60).toFixed(1);
  const streak = getStudyStreak();

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-16">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-indigo-600" />
          <span>{t('focusTimer')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {mode === 'pomodoro' ? t('stayFocused') : t('takeABreak')}
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs max-w-md mx-auto">
        <button
          onClick={() => setMode('pomodoro')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
            mode === 'pomodoro'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('pomodoro')} ({formatNumber(settings.pomodoroFocusMinutes || 25)}m)
        </button>
        <button
          onClick={() => setMode('shortBreak')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
            mode === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('shortBreak')} ({formatNumber(settings.pomodoroBreakMinutes || 5)}m)
        </button>
        <button
          onClick={() => setMode('longBreak')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
            mode === 'longBreak'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          {t('longBreak')} ({formatNumber(settings.pomodoroLongBreakMinutes || 15)}m)
        </button>
      </div>

      {/* Linked Task Selector */}
      <div className="max-w-md mx-auto">
        <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
          {t('linkTaskToTimer')} (Optional)
        </label>
        <select
          value={linkedTaskId}
          onChange={e => setLinkedTaskId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
        >
          <option value="">-- No specific task linked --</option>
          {tasks.filter(t => !t.completed).map(task => (
            <option key={task.id} value={task.id}>
              {task.title} ({task.durationMinutes}m)
            </option>
          ))}
        </select>
      </div>

      {/* Circular Timer Display */}
      <div className="relative flex flex-col items-center justify-center py-6">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              className={`transition-all duration-500 ${
                mode === 'pomodoro'
                  ? 'stroke-indigo-600'
                  : mode === 'shortBreak'
                  ? 'stroke-emerald-500'
                  : 'stroke-purple-600'
              }`}
              strokeWidth="8"
              strokeDasharray="440"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          {/* Center Digital Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
              {formatNumber(timeFormatted)}
            </span>
            <span className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 mt-2 tracking-wider">
              {mode === 'pomodoro' ? 'Study Block' : 'Break Time'}
            </span>
          </div>
        </div>

        {/* Timer Controls Bar */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs"
            title={t('reset')}
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-lg transition active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
                : mode === 'pomodoro'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-6 h-6 fill-current" />
                <span>{t('pause')}</span>
              </>
            ) : (
              <>
                <Play className="w-6 h-6 fill-current ml-0.5" />
                <span>{t('start')}</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 shadow-xs"
            title={t('skip')}
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Chime Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-5 hover:text-slate-700"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          <span>{soundEnabled ? 'Timer bell sound enabled' : 'Timer sound muted'}</span>
        </button>
      </div>

      {/* Focus Session Daily Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
          <div className="text-xs text-slate-500 font-medium mb-1">{t('sessionsCompletedToday')}</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatNumber(sessionsCompletedToday)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Focus sprints
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center">
          <div className="text-xs text-slate-500 font-medium mb-1">{t('todayStudyTime')}</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatNumber(todayHours)} {t('hours')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Logged into daily log
          </div>
        </div>
      </div>
    </div>
  );
};
