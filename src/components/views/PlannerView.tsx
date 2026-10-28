import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Coffee,
  Check,
  Play,
  RotateCcw,
  CalendarDays,
  List,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AddTaskModal } from '../modals/ActionModals';
import { TaskType } from '../../types';

export const PlannerView: React.FC<{ onNavigateToTimer?: (taskId?: string) => void }> = ({ onNavigateToTimer }) => {
  const {
    tasks,
    subjects,
    settings,
    t,
    formatNumber,
    toggleTaskComplete,
    deleteTask,
    rescheduleOverdueTasks,
    triggerScheduleRebalance,
    isRebalancing,
    updateSettings
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [suggestionMessage, setSuggestionMessage] = useState<string | null>(null);
  const [plannerMode, setPlannerMode] = useState<'daily' | 'weekly'>('daily');

  // Navigate date
  const changeDateByDays = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  // Date formatted
  const formattedSelectedDate = new Date(selectedDate).toLocaleDateString(
    settings.language === 'bn' ? 'bn-BD' : 'en-US',
    { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }
  );

  // Tasks for selected date
  const dateTasks = tasks.filter(t => t.date === selectedDate);
  const completedDateTasks = dateTasks.filter(t => t.completed);
  const plannedMinutes = dateTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);
  const completedMinutes = completedDateTasks.reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

  // Available daily hours
  const dailyTargetHours = settings.dailyStudyHours || 6;
  const plannedHours = (plannedMinutes / 60).toFixed(1);
  const completedHours = (completedMinutes / 60).toFixed(1);

  // Overdue tasks
  const overdueTasks = tasks.filter(t => !t.completed && t.date < todayStr);

  const handleAutoSuggest = async () => {
    const ok = await triggerScheduleRebalance('User clicked smart planner', true);
    if (ok) {
      setSuggestionMessage(t('scheduleSuggestionSuccess'));
      setTimeout(() => setSuggestionMessage(null), 4000);
    }
  };

  // Compute 7 days for weekly view
  const weekDays = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + idx);
    const dateKey = d.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.date === dateKey);
    return {
      date: dateKey,
      dayName: d.toLocaleDateString(settings.language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' }),
      dateNum: d.getDate(),
      tasks: dayTasks
    };
  });

  const getTaskTypeBadge = (type?: TaskType) => {
    switch (type) {
      case 'theory':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">{t('theory')}</span>;
      case 'numerical':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">{t('numerical')}</span>;
      case 'mcq':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">{t('mcq')}</span>;
      case 'cq':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">{t('cq')}</span>;
      case 'revision':
        return <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">{t('revision')}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span>{plannerMode === 'daily' ? t('dailyPlanner') : t('weeklyPlanner')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Flexible study sessions that adapt automatically to your target deadlines and available hours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Day / Week View Toggle */}
          <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
            <button
              onClick={() => setPlannerMode('daily')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                plannerMode === 'daily' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Day</span>
            </button>
            <button
              onClick={() => setPlannerMode('weekly')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition ${
                plannerMode === 'weekly' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
          </div>

          <button
            onClick={handleAutoSuggest}
            disabled={isRebalancing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold shadow-md transition active:scale-95 disabled:opacity-50"
            title={t('autoSuggestTooltip')}
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${isRebalancing ? 'animate-spin' : ''}`} />
            <span>{isRebalancing ? 'Optimizing...' : t('autoSuggestPlan')}</span>
          </button>

          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md hover:bg-blue-700 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSession')}</span>
          </button>
        </div>
      </div>

      {/* Suggestion alert banner */}
      {suggestionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{suggestionMessage}</span>
        </div>
      )}

      {/* Overdue Rollover Notice */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="text-xs sm:text-sm font-semibold text-rose-900 dark:text-rose-200">
                {t('overdueTasksNotice', { count: overdueTasks.length })}
              </span>
              <p className="text-xs text-rose-700 dark:text-rose-400">
                Unfinished tasks are preserved and can be rolled over to today with 1 tap.
              </p>
            </div>
          </div>
          <button
            onClick={() => rescheduleOverdueTasks(todayStr)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 shrink-0"
          >
            {t('rescheduleAllToToday')}
          </button>
        </div>
      )}

      {/* Date Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateByDays(plannerMode === 'daily' ? -1 : -7)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="text-center sm:text-left">
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {formattedSelectedDate}
            </div>
            <div className="text-xs text-slate-400">
              {selectedDate === todayStr ? t('today') : selectedDate}
            </div>
          </div>
          <button
            onClick={() => changeDateByDays(plannerMode === 'daily' ? 1 : 7)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Quick Date Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedDate === todayStr
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {t('today')}
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Daily Study Time Meter & Target Setting */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Planned Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">{t('plannedHours')}</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatNumber(plannedHours)} <span className="text-xs font-normal text-slate-500">{t('hours')}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {formatNumber(dateTasks.length)} sessions planned
          </div>
        </div>

        {/* Completed Time */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-medium mb-1">{t('completedTasks')}</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatNumber(completedHours)} <span className="text-xs font-normal text-slate-500">{t('hours')}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {formatNumber(completedDateTasks.length)} / {formatNumber(dateTasks.length)} tasks finished
          </div>
        </div>

        {/* Available Daily Study Hours Setter */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span>{t('availableHours')}</span>
            <span className="font-bold text-slate-900 dark:text-white">{formatNumber(dailyTargetHours)} hrs/day</span>
          </div>
          <input
            type="range"
            min={2}
            max={14}
            step={0.5}
            value={dailyTargetHours}
            onChange={e => updateSettings({ dailyStudyHours: Number(e.target.value) })}
            className="w-full accent-blue-600 cursor-pointer my-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>2 hrs</span>
            <span>6 hrs (Standard)</span>
            <span>14 hrs</span>
          </div>
        </div>
      </div>

      {/* View Switch: Daily or Weekly */}
      {plannerMode === 'daily' ? (
        /* Daily Task List */
        <div className="space-y-3">
          {dateTasks.length === 0 ? (
            <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
              <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('noPlannedTasks')}</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Add a study session or click "Auto-Generate Smart Plan" to generate sessions automatically.
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => setIsTaskModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
                >
                  + {t('addSession')}
                </button>
                <button
                  onClick={handleAutoSuggest}
                  className="px-4 py-2 bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-semibold hover:bg-purple-100 transition"
                >
                  {t('autoSuggestPlan')}
                </button>
              </div>
            </div>
          ) : (
            dateTasks.map(task => {
              const subject = subjects.find(s => s.id === task.subjectId);
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    task.completed
                      ? 'bg-emerald-50/20 dark:bg-emerald-950/15 border-emerald-200/60 dark:border-emerald-900/40 text-slate-400'
                      : task.priority === 'urgent'
                      ? 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-900/50 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                          task.completed
                            ? 'bg-emerald-500 text-white'
                            : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {task.startTime && (
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-blue-600" />
                              {task.startTime}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            ({formatNumber(task.durationMinutes)} {t('minutes')})
                          </span>
                          {subject && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/50">
                              {settings.language === 'bn' ? subject.nameBn : subject.nameEn}
                            </span>
                          )}
                          {getTaskTypeBadge(task.taskType)}
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                            task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300' :
                            task.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                            task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {t(task.priority)}
                          </span>
                          {task.scheduledBy === 'ai' && (
                            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" /> AI
                            </span>
                          )}
                        </div>

                        <h4 className={`text-sm font-semibold ${task.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                          {task.title}
                        </h4>

                        {task.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {task.notes}
                          </p>
                        )}
                        {task.reason && (
                          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                            Reason: {task.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Timer Shortcut button */}
                      <button
                        onClick={() => onNavigateToTimer && onNavigateToTimer(task.id)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Start Timer with this task"
                      >
                        <Play className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title={t('deleteTask')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Weekly Schedule Columns View */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map(col => {
            const isToday = col.date === todayStr;
            return (
              <div
                key={col.date}
                className={`p-3 rounded-2xl border flex flex-col min-h-[300px] ${
                  isToday
                    ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className={`text-xs font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {col.dayName} {formatNumber(col.dateNum)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {formatNumber(col.tasks.length)}
                  </span>
                </div>

                <div className="space-y-2 flex-1 overflow-y-auto">
                  {col.tasks.map(t => (
                    <div
                      key={t.id}
                      onClick={() => toggleTaskComplete(t.id)}
                      className={`p-2 rounded-xl border text-xs cursor-pointer transition ${
                        t.completed
                          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 line-through text-slate-400'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/70 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{t.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex justify-between">
                        <span>{t.startTime || '16:00'}</span>
                        <span>{formatNumber(t.durationMinutes)}m</span>
                      </div>
                    </div>
                  ))}
                  {col.tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-400 py-6 text-center">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        initialDate={selectedDate}
      />
    </div>
  );
};
