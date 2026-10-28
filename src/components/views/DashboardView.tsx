import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Plus,
  BookOpen,
  Video,
  FileText,
  Target,
  Sparkles,
  ChevronRight,
  Cpu,
  RotateCcw,
  Zap,
  Check,
  ShieldAlert
} from 'lucide-react';
import { NavigationTab } from '../../types';
import { AddTaskModal, AddChapterModal, AddClassModal } from '../modals/ActionModals';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    settings,
    subjects,
    chapters,
    tasks,
    classes,
    t,
    formatNumber,
    remainingSyllabusHours,
    totalSyllabusHours,
    overallProgressPercentage,
    availableStudyHoursBeforeTarget,
    isWorkloadFeasible,
    daysUntilTargetExam,
    toggleTaskComplete,
    rescheduleOverdueTasks,
    getTodayStudyMinutes,
    getWeeklyStudyStats,
    getStudyStreak,
    rebalanceNotification,
    dismissRebalanceNotification,
    canUndoSchedule,
    undoScheduleRebalance,
    aiRecommendation,
    triggerScheduleRebalance,
    isRebalancing
  } = useApp();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Today's tasks
  const todaysTasks = tasks.filter(t => t.date === todayStr);
  const completedTodayTasks = todaysTasks.filter(t => t.completed);

  // Overdue tasks
  const overdueTasks = tasks.filter(t => !t.completed && t.date < todayStr);

  // Urgent deadlines & revision due
  const urgentChapters = chapters.filter(c => c.priority === 'urgent' && c.status !== 'completed');
  const revisionChapters = chapters.filter(c => c.status === 'needs_revision' || (c.confidence === 'weak' && c.status !== 'completed'));

  // Today's classes
  const todayClasses = classes.filter(c => c.date === todayStr);

  // Today's focus minutes
  const todayMinutes = getTodayStudyMinutes();
  const todayHours = (todayMinutes / 60).toFixed(1);

  // Weekly stats
  const weeklyStats = getWeeklyStudyStats();
  const maxWeeklyMinutes = Math.max(60, ...weeklyStats.map(s => s.minutes));

  // Study streak
  const streak = getStudyStreak();

  // Completed chapters count
  const completedChaptersCount = chapters.filter(c => c.status === 'completed').length;
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const pendingTasksCount = totalTasksCount - completedTasksCount;

  // Format today's date in local friendly string
  const todayDateFormatted = new Date().toLocaleDateString(
    settings.language === 'bn' ? 'bn-BD' : 'en-US',
    { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Welcome Bar & AI Auto Planner Status */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-medium mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>{todayDateFormatted}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t('welcomeBack')} <span className="text-blue-100">{settings.studentName}</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-lg">
            {t('targetExam')}: <span className="font-semibold text-white">{settings.targetGoal}</span> ({settings.targetDate})
          </p>
        </div>

        {/* AI Auto Planner Badge & Focus Shortcut */}
        <div className="relative z-10 flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* AI Status Badge */}
          <button
            onClick={() => onNavigate('aisettings')}
            className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 hover:bg-white/25 transition text-left"
            title="Configure AI Planner"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-300" />
                <span>{t('aiAutoPlannerStatus')}</span>
              </div>
              <div className="text-xs font-bold text-white">
                {settings.aiSettings?.autoPlanningEnabled ? t('aiStatusActive') : t('aiStatusRuleBased')}
              </div>
            </div>
          </button>

          {/* Streak Badge */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20">
            <Flame className="w-5 h-5 text-amber-300 animate-bounce" />
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">{t('studyStreak')}</div>
              <div className="text-xs font-bold text-white">{formatNumber(streak)} {t('daysStreak')}</div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('timer')}
            className="flex items-center gap-1.5 bg-white text-blue-900 font-semibold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md hover:bg-blue-50 transition active:scale-95"
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{t('timer')}</span>
          </button>
        </div>
      </div>

      {/* AI Schedule Rebalance Toast / Undo Banner */}
      {rebalanceNotification && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-semibold text-purple-900 dark:text-purple-200">
                {t('aiStatusRebalanced')}
              </span>
              <p className="text-xs text-purple-700 dark:text-purple-400">
                {rebalanceNotification.reason} ({rebalanceNotification.sessionsUpdatedCount} sessions organized)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {canUndoSchedule && (
              <button
                onClick={undoScheduleRebalance}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 rounded-xl text-xs font-semibold hover:bg-purple-50 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('aiUndoChanges')}</span>
              </button>
            )}
            <button
              onClick={dismissRebalanceNotification}
              className="text-purple-400 hover:text-purple-600 p-1 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Workload Feasibility Warning Banner */}
      {!isWorkloadFeasible && (
        <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <div className="font-semibold flex items-center gap-1.5">
              <span>{t('workloadFeasibilityWarning')}</span>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {t('workloadFeasibilityDetail', {
                remainingHours: remainingSyllabusHours,
                availableHours: availableStudyHoursBeforeTarget,
                targetDate: settings.targetDate
              })}
            </p>
          </div>
        </div>
      )}

      {/* AI Recommendation Card (If available) */}
      {aiRecommendation && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200/80 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500 text-white shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                {t('aiRecommendationTitle')}
              </span>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                {aiRecommendation.evaluation}
              </p>
              {aiRecommendation.tips && aiRecommendation.tips.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {aiRecommendation.tips.map((tip, idx) => (
                    <span key={idx} className="text-[11px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/40">
                      💡 {tip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => triggerScheduleRebalance('User refreshed recommendation', true)}
            disabled={isRebalancing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isRebalancing ? 'Optimizing...' : 'Optimize'}</span>
          </button>
        </div>
      )}

      {/* Overdue Tasks Notice */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                {t('overdueTasksNotice', { count: overdueTasks.length })}
              </h4>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                Keep your plan up to date by rolling unfinished tasks over to today.
              </p>
            </div>
          </div>
          <button
            onClick={() => rescheduleOverdueTasks()}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 shrink-0"
          >
            {t('rescheduleAllToToday')}
          </button>
        </div>
      )}

      {/* Key Metric Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Days Left to Target */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('daysRemaining')}</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(daysUntilTargetExam)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">{t('daysLeft')}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            Target: {settings.targetDate}
          </div>
        </div>

        {/* Overall Syllabus Progress */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('overallProgress')}</span>
            <BookOpen className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatNumber(overallProgressPercentage)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, overallProgressPercentage)}%` }}
            />
          </div>
        </div>

        {/* Tasks Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('taskCompletionRatio')}</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {formatNumber(completedTasksCount)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">/ {formatNumber(totalTasksCount)} tasks</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {formatNumber(pendingTasksCount)} tasks remaining
          </div>
        </div>

        {/* Today's Study Time */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>{t('todayStudyTime')}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="my-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {formatNumber(todayHours)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1.5">{t('hours')}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Goal: {formatNumber(settings.dailyStudyHours || 6)} {t('hours')}
          </div>
        </div>
      </div>

      {/* Urgent Deadlines & Revisions Highlight Bar */}
      {(urgentChapters.length > 0 || revisionChapters.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {urgentChapters.length > 0 && (
            <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200 uppercase tracking-wider block">
                    {t('urgentDeadlines')} ({formatNumber(urgentChapters.length)})
                  </span>
                  <span className="text-xs text-rose-700 dark:text-rose-400">
                    {urgentChapters.slice(0, 2).map(c => c.nameEn).join(', ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('syllabus')}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0"
              >
                View
              </button>
            </div>
          )}

          {revisionChapters.length > 0 && (
            <div className="p-4 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider block">
                    {t('revisionDue')} ({formatNumber(revisionChapters.length)})
                  </span>
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    {revisionChapters.slice(0, 2).map(c => c.nameEn).join(', ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('syllabus')}
                className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline shrink-0"
              >
                Review
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions Grid */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
          {t('quickActions')}:
        </span>
        <button
          onClick={() => setIsTaskModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 text-xs font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addTask')}</span>
        </button>
        <button
          onClick={() => setIsChapterModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 text-xs font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addChapter')}</span>
        </button>
        <button
          onClick={() => setIsClassModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/50 hover:bg-purple-100 text-xs font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addClass')}</span>
        </button>
        <button
          onClick={() => onNavigate('notes')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50 hover:bg-amber-100 text-xs font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addNote')}</span>
        </button>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Tasks & Subject Progress (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Tasks Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('todaysTasks')}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
                    {formatNumber(completedTodayTasks.length)} / {formatNumber(todaysTasks.length)}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  1-tap to mark tasks complete and record study time.
                </p>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{t('planner')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaysTasks.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('noTasksToday')}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700 transition"
                  >
                    + {t('addSession')}
                  </button>
                  <button
                    onClick={() => triggerScheduleRebalance('Populate today plan')}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-200 transition"
                  >
                    {t('autoSuggestPlan')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaysTasks.map(task => {
                  const subject = subjects.find(s => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`group flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer select-none ${
                        task.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40 text-slate-400'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                            task.completed
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-slate-300 dark:border-slate-600 group-hover:border-blue-500'
                          }`}
                        >
                          {task.completed && <CheckCircle2 className="w-4 h-4" />}
                        </button>

                        <div className="min-w-0">
                          <h4 className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {subject && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-100/70 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                                {settings.language === 'bn' ? subject.nameBn : subject.nameEn}
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatNumber(task.durationMinutes)} {t('minutes')}
                            </span>
                            {task.scheduledBy === 'ai' && (
                              <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> AI
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          task.priority === 'urgent' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300' :
                          task.priority === 'high' ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300' :
                          task.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' :
                          'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {t(task.priority)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subject-Wise Progress Cards */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{t('subjectProgress')}</h3>
              <button
                onClick={() => onNavigate('syllabus')}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{t('syllabus')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.filter(s => !s.isArchived).slice(0, 6).map(sub => {
                const subChapters = chapters.filter(c => c.subjectId === sub.id);
                const subCompleted = subChapters.filter(c => c.status === 'completed').length;
                const percent = subChapters.length > 0 ? Math.round((subCompleted / subChapters.length) * 100) : 0;

                return (
                  <div
                    key={sub.id}
                    onClick={() => onNavigate('syllabus')}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {settings.language === 'bn' ? sub.nameBn : sub.nameEn}
                      </span>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {formatNumber(percent)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-1">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{formatNumber(subCompleted)} / {formatNumber(subChapters.length)} {t('chapters')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Study Time Chart & Focus Timer Shortcut */}
        <div className="space-y-6">
          {/* Weekly Performance Summary Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Weekly Study Time</span>
              </h3>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {formatNumber((weeklyStats.reduce((s, d) => s + d.minutes, 0) / 60).toFixed(1))} {t('hours')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Daily minutes focused over the last 7 days.
            </p>

            <div className="h-32 flex items-end justify-between gap-2 pt-2">
              {weeklyStats.map(stat => {
                const heightPercent = maxWeeklyMinutes > 0 ? Math.max(12, Math.round((stat.minutes / maxWeeklyMinutes) * 100)) : 12;
                const isToday = stat.date === todayStr;
                return (
                  <div key={stat.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {stat.minutes > 0 ? formatNumber(Math.round(stat.minutes / 60)) + 'h' : '0'}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        isToday
                          ? 'bg-blue-600 shadow-sm shadow-blue-500/30'
                          : stat.minutes > 0
                          ? 'bg-blue-300 dark:bg-blue-700'
                          : 'bg-slate-200 dark:bg-slate-800'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className={`text-[10px] font-medium ${isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {stat.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Auto Planner Quick Control */}
          <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/30 rounded-3xl p-5 text-purple-950 dark:text-purple-100 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Auto Planner</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                {settings.aiSettings?.provider?.toUpperCase() || 'GEMINI'}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Automatically updates and rebalances your daily sessions when deadlines, difficulty, or progress changes.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <button
                onClick={() => onNavigate('aisettings')}
                className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <span>{t('aisettings')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => triggerScheduleRebalance('Manual quick refresh', true)}
                disabled={isRebalancing}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold transition active:scale-95"
              >
                {isRebalancing ? 'Optimizing...' : 'Run Planner'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <AddTaskModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} />
      <AddChapterModal isOpen={isChapterModalOpen} onClose={() => setIsChapterModalOpen(false)} />
      <AddClassModal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} />
    </div>
  );
};
