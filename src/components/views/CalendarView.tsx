import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookOpen,
  Video,
  Target,
  AlertCircle,
  Bell,
  CheckCircle2
} from 'lucide-react';

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC = () => {
  const {
    tasks,
    chapters,
    classes,
    exams,
    settings,
    t,
    formatNumber,
    toggleTaskComplete
  } = useApp();

  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayStr, setSelectedDayStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const monthName = settings.language === 'bn' ? monthNamesBn[month] : monthNamesEn[month];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  // Find all items for selected day
  const dayTasks = tasks.filter(t => t.date === selectedDayStr);
  const dayChapters = chapters.filter(c => c.deadlineDate === selectedDayStr);
  const dayClasses = classes.filter(c => c.date === selectedDayStr);
  const dayExams = exams.filter(e => e.targetDate === selectedDayStr);

  const totalDayItems = dayTasks.length + dayChapters.length + dayClasses.length + dayExams.length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-600" />
            <span>{t('calendarView')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track all custom deadlines, exam dates, coaching classes, and study sessions.
          </p>
        </div>

        {/* View Mode Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 self-start sm:self-auto">
          {(['month', 'week', 'day'] as CalendarViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                viewMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t(mode)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend Indicators */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>{t('targetExam')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>{t('chapterDeadline')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span>{t('onlineClass')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
          <span>{t('studyTask')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {/* Calendar Header Month Controls */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {monthName} {formatNumber(year)}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              </button>
            </div>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Blank offset days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`blank-${i}`} className="h-14 sm:h-20 rounded-xl bg-slate-50/50 dark:bg-slate-800/20" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDayStr === cellDateStr;
              const isToday = cellDateStr === new Date().toISOString().split('T')[0];

              // Check items on this day
              const hasExam = exams.some(e => e.targetDate === cellDateStr);
              const hasChapter = chapters.some(c => c.deadlineDate === cellDateStr);
              const hasClass = classes.some(c => c.date === cellDateStr);
              const hasTask = tasks.some(t => t.date === cellDateStr);

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDayStr(cellDateStr)}
                  className={`h-14 sm:h-20 p-1.5 rounded-2xl flex flex-col justify-between items-start transition text-left border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                      : isToday
                      ? 'border-indigo-300 dark:border-indigo-700 bg-slate-50 dark:bg-slate-800/40'
                      : 'border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30'
                  }`}
                >
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    isToday ? 'bg-indigo-600 text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}>
                    {formatNumber(dayNum)}
                  </span>

                  {/* Indicator Dots */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {hasExam && <span className="w-2 h-2 rounded-full bg-rose-500" title="Exam" />}
                    {hasChapter && <span className="w-2 h-2 rounded-full bg-amber-500" title="Chapter Deadline" />}
                    {hasClass && <span className="w-2 h-2 rounded-full bg-purple-500" title="Online Class" />}
                    {hasTask && <span className="w-2 h-2 rounded-full bg-indigo-500" title="Task" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {t('scheduledItems')}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {selectedDayStr}
            </h3>
            <span className="text-xs text-slate-500">
              {formatNumber(totalDayItems)} items scheduled
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {totalDayItems === 0 && (
              <div className="text-center py-10 text-xs text-slate-400">
                <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>{t('noItemsThisDay')}</p>
              </div>
            )}

            {/* Target Exams */}
            {dayExams.map(ex => (
              <div key={ex.id} className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60">
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  <Target className="w-3.5 h-3.5" />
                  <span>{t('targetExam')}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{ex.title}</h4>
                {ex.targetScore && <p className="text-xs text-rose-600 mt-0.5">Target: {ex.targetScore}</p>}
              </div>
            ))}

            {/* Chapter Deadlines */}
            {dayChapters.map(ch => (
              <div key={ch.id} className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('chapterDeadline')}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                  {settings.language === 'bn' ? ch.nameBn : ch.nameEn}
                </h4>
                <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 mt-1">
                  <span>Est: {formatNumber(ch.estimatedHours)} hrs</span>
                  <span className="capitalize font-semibold">{t(ch.status)}</span>
                </div>
              </div>
            ))}

            {/* Online Classes */}
            {dayClasses.map(cls => (
              <div key={cls.id} className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" />
                    {cls.startTime}
                  </span>
                  <a
                    href={cls.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-purple-600 hover:underline"
                  >
                    {t('joinClass')}
                  </a>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mt-1">{cls.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{cls.teacherName}</p>
              </div>
            ))}

            {/* Study Tasks */}
            {dayTasks.map(tk => (
              <div key={tk.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => toggleTaskComplete(tk.id)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition shrink-0 ${
                      tk.completed ? 'bg-emerald-500 text-white' : 'border border-slate-300'
                    }`}
                  >
                    {tk.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="min-w-0">
                    <h5 className={`text-xs font-semibold truncate ${tk.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                      {tk.title}
                    </h5>
                    <span className="text-[11px] text-slate-400">{tk.startTime || 'Anytime'} • {formatNumber(tk.durationMinutes)}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
