import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, AlertTriangle, Calendar, Video, BookOpen, Check, X } from 'lucide-react';

export const NotificationBell: React.FC<{ onNavigateTab?: (tab: any) => void }> = ({ onNavigateTab }) => {
  const { tasks, chapters, classes, exams, t, formatNumber, rescheduleOverdueTasks } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Overdue tasks
  const overdueTasks = tasks.filter(t => !t.completed && t.date < todayStr);

  // Today's classes
  const todayClasses = classes.filter(c => c.date === todayStr && c.status === 'upcoming');

  // Chapters with deadline within next 3 days
  const soonDeadlines = chapters.filter(c => {
    if (c.status === 'completed' || !c.deadlineDate) return false;
    const diffDays = Math.ceil((new Date(c.deadlineDate).getTime() - new Date().getTime()) / 86400000);
    return diffDays >= 0 && diffDays <= 3;
  });

  // Weak chapters needing revision
  const weakChapters = chapters.filter(c => c.confidence === 'weak' && c.status !== 'completed');

  const totalAlerts = overdueTasks.length + todayClasses.length + soonDeadlines.length;

  const handleRequestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(t('appName'), {
          body: t('notificationsEnabledNotice'),
          icon: '/icon.svg',
        });
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {totalAlerts > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs">
            {totalAlerts > 9 ? '9+' : formatNumber(totalAlerts)}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 p-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Reminders & Alerts ({formatNumber(totalAlerts)})
                </h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto py-2 space-y-2.5">
              {/* Overdue tasks */}
              {overdueTasks.length > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{t('overdueTasksNotice', { count: overdueTasks.length })}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mb-2">
                    {overdueTasks.slice(0, 2).map(t => t.title).join(', ')}
                  </p>
                  <button
                    onClick={() => {
                      rescheduleOverdueTasks();
                      setIsOpen(false);
                    }}
                    className="w-full text-center py-1 text-xs font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition"
                  >
                    {t('rescheduleAllToToday')}
                  </button>
                </div>
              )}

              {/* Today's online classes */}
              {todayClasses.map(cls => (
                <div key={cls.id} className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                    <Video className="w-3.5 h-3.5" />
                    <span>{cls.startTime} - {cls.title}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{cls.teacherName}</span>
                    <a
                      href={cls.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition"
                    >
                      {t('joinClass')}
                    </a>
                  </div>
                </div>
              ))}

              {/* Upcoming Chapter Deadlines */}
              {soonDeadlines.map(ch => (
                <div key={ch.id} className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Deadline: {ch.nameEn} ({ch.nameBn})</span>
                  </div>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1">
                    Due date: {ch.deadlineDate}
                  </p>
                </div>
              ))}

              {/* Empty state */}
              {totalAlerts === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p>All caught up! No overdue tasks or pending alerts.</p>
                </div>
              )}
            </div>

            {/* Notification Permission Button */}
            {'Notification' in window && Notification.permission !== 'granted' && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button
                  onClick={handleRequestPermission}
                  className="w-full text-center py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  {t('enableNotifications')}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
