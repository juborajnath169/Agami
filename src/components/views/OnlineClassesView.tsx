import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Video,
  Plus,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  User,
  Trash2,
  Filter
} from 'lucide-react';
import { AddClassModal } from '../modals/ActionModals';
import { ClassStatus } from '../../types';

export const OnlineClassesView: React.FC = () => {
  const {
    classes,
    subjects,
    settings,
    t,
    formatNumber,
    setClassStatus,
    deleteClass
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClasses = classes.filter(c => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-purple-600" />
            <span>{t('onlineClasses')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Never miss a live coaching class or lecture. Save Google Meet, Zoom, and YouTube links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                filterStatus === 'all' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('all')}
            </button>
            <button
              onClick={() => setFilterStatus('upcoming')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                filterStatus === 'upcoming' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('upcomingClasses')}
            </button>
            <button
              onClick={() => setFilterStatus('attended')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                filterStatus === 'attended' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('attendedClasses')}
            </button>
            <button
              onClick={() => setFilterStatus('missed')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                filterStatus === 'missed' ? 'bg-rose-600 text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t('missedClasses')}
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addClass')}</span>
          </button>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClasses.length === 0 ? (
          <div className="col-span-2 text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
            <Video className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('noClasses')}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold hover:bg-purple-700 transition"
            >
              + {t('addClass')}
            </button>
          </div>
        ) : (
          filteredClasses.map(cls => {
            const subject = subjects.find(s => s.id === cls.subjectId);
            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {subject && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/60">
                          {settings.language === 'bn' ? subject.nameBn : subject.nameEn}
                        </span>
                      )}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {cls.platform}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                      cls.status === 'attended' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                      cls.status === 'missed' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                    }`}>
                      {cls.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                    {cls.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{cls.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {cls.date}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5" />
                        {cls.startTime} ({formatNumber(cls.durationMinutes)}m)
                      </span>
                    </div>
                  </div>

                  {cls.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 mb-4">
                      {cls.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setClassStatus(cls.id, 'attended')}
                      className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                        cls.status === 'attended'
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                      }`}
                      title={t('markAttended')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Attended</span>
                    </button>
                    <button
                      onClick={() => setClassStatus(cls.id, 'missed')}
                      className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                        cls.status === 'missed'
                          ? 'bg-rose-500 text-white border-rose-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                      }`}
                      title={t('markMissed')}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Missed</span>
                    </button>
                    <button
                      onClick={() => deleteClass(cls.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                      title={t('delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <a
                    href={cls.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
                  >
                    <span>{t('joinClass')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AddClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
