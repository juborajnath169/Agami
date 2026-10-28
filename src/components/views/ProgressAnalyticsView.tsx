import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  BookOpen,
  Calendar,
  Flame,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { NavigationTab } from '../../types';

export const ProgressAnalyticsView: React.FC<{ onNavigate: (tab: NavigationTab) => void }> = ({ onNavigate }) => {
  const {
    subjects,
    chapters,
    tasks,
    settings,
    studyLogs,
    t,
    formatNumber,
    remainingSyllabusHours,
    totalSyllabusHours,
    overallProgressPercentage,
    getStudyStreak,
    daysUntilTargetExam
  } = useApp();

  const streak = getStudyStreak();
  const totalCompletedChapters = chapters.filter(c => c.status === 'completed').length;
  const inProgressChapters = chapters.filter(c => c.status === 'in_progress').length;
  const notStartedChapters = chapters.filter(c => c.status === 'not_started').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasksCount = tasks.filter(t => !t.completed && t.date < todayStr).length;

  // Weak chapters requiring revision
  const weakChapters = chapters.filter(c => c.confidence === 'weak' && c.status !== 'completed');

  // Total study minutes logged all time
  const totalStudyMinutesAllTime = studyLogs.reduce((sum, l) => sum + l.totalMinutes, 0);
  const totalStudyHoursAllTime = (totalStudyMinutesAllTime / 60).toFixed(1);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <span>{t('analyticsTitle')}</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Real performance data computed from your study logs, chapters, and task completions.
        </p>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Overall Completion */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 shrink-0">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">{t('overallSyllabusCompletion')}</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(overallProgressPercentage)}%
            </div>
            <span className="text-[11px] text-slate-400">
              {formatNumber(totalCompletedChapters)} of {formatNumber(chapters.length)} chapters
            </span>
          </div>
        </div>

        {/* Study Streak */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-500 shrink-0">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">{t('studyStreak')}</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(streak)} <span className="text-sm font-semibold text-amber-500">{t('daysStreak')}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Consistent daily study
            </span>
          </div>
        </div>

        {/* Total Study Time Recorded */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 shrink-0">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500">{t('totalStudyHoursRecorded')}</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {formatNumber(totalStudyHoursAllTime)} <span className="text-sm font-semibold text-emerald-600">{t('hours')}</span>
            </div>
            <span className="text-[11px] text-slate-400">
              From Pomodoro & completed tasks
            </span>
          </div>
        </div>
      </div>

      {/* Weak Chapters Revision Radar Alert Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t('weakChaptersAlert')} ({formatNumber(weakChapters.length)})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('planner')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 self-start sm:self-auto"
          >
            {t('scheduleRevision')}
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          {t('weakChaptersDesc')}
        </p>

        {weakChapters.length === 0 ? (
          <div className="text-center py-6 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60">
            {t('noWeakChapters')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {weakChapters.map(ch => {
              const sub = subjects.find(s => s.id === ch.subjectId);
              return (
                <div
                  key={ch.id}
                  className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      {sub && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                          {settings.language === 'bn' ? sub.nameBn : sub.nameEn}
                        </span>
                      )}
                      <span className="text-[10px] text-rose-600 font-bold">
                        {ch.deadlineDate ? `Due ${ch.deadlineDate}` : 'No deadline'}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1">
                      {settings.language === 'bn' ? ch.nameBn : ch.nameEn}
                    </h4>
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Estimated: {formatNumber(ch.estimatedHours)} hours
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('syllabus')}
                    className="mt-3 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 self-start"
                  >
                    <span>View Chapter Topics</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject-Wise Syllabus Completion Progress Bars */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">
          {t('subjectProgress')}
        </h3>

        <div className="space-y-4">
          {subjects.map(sub => {
            const subChapters = chapters.filter(c => c.subjectId === sub.id);
            const completedCount = subChapters.filter(c => c.status === 'completed').length;
            const subPercent = subChapters.length > 0 ? Math.round((completedCount / subChapters.length) * 100) : 0;
            const subHours = subChapters.reduce((s, c) => s + (c.estimatedHours || 0), 0);

            return (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">
                    {settings.language === 'bn' ? sub.nameBn : sub.nameEn}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-normal text-slate-400">
                      {formatNumber(completedCount)} / {formatNumber(subChapters.length)} {t('chapters')} ({formatNumber(subHours)}h)
                    </span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {formatNumber(subPercent)}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${subPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task & Chapter Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Chapters Distribution */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Chapter Status Breakdown
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                {t('completed')}
              </span>
              <span className="font-bold">{formatNumber(totalCompletedChapters)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-800 dark:text-indigo-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                {t('in_progress')}
              </span>
              <span className="font-bold">{formatNumber(inProgressChapters)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                {t('not_started')}
              </span>
              <span className="font-bold">{formatNumber(notStartedChapters)}</span>
            </div>
          </div>
        </div>

        {/* Study Tasks Ratio */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            {t('taskCompletionRatio')}
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300">
              <span>{t('completedTasks')}</span>
              <span className="font-bold">{formatNumber(completedTasks)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300">
              <span>{t('pendingTasks')}</span>
              <span className="font-bold">{formatNumber(pendingTasks)}</span>
            </div>
            {overdueTasksCount > 0 && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-300">
                <span>{t('overdue')}</span>
                <span className="font-bold">{formatNumber(overdueTasksCount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
