import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  ExternalLink,
  CheckSquare,
  Square,
  Sparkles,
  Filter,
  Layers,
  Archive,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { Chapter, Priority, CompletionStatus, ConfidenceLevel, ChapterDifficulty, TaskType } from '../../types';
import { AddChapterModal } from '../modals/ActionModals';

export const SyllabusView: React.FC = () => {
  const {
    subjects,
    chapters,
    settings,
    t,
    formatNumber,
    toggleChapterComplete,
    updateChapterConfidence,
    updateChapterDifficulty,
    updateChapter,
    deleteChapter,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    generateAITasksForChapter,
    addSubject,
    deleteSubject,
    archiveSubject,
    bulkAddChapters
  } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null);

  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});
  const [generatingTasksForId, setGeneratingTasksForId] = useState<string | null>(null);

  // Quick subject add state
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubNameEn, setNewSubNameEn] = useState('');
  const [newSubNameBn, setNewSubNameBn] = useState('');

  // Bulk add modal state
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkSubjectId, setBulkSubjectId] = useState<string>(subjects[0]?.id || '');
  const [bulkText, setBulkText] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubNameEn.trim()) return;
    addSubject({
      nameEn: newSubNameEn.trim(),
      nameBn: newSubNameBn.trim() || newSubNameEn.trim(),
      code: `SUB-${Date.now().toString().slice(-3)}`,
      color: 'bg-blue-600',
    });
    setNewSubNameEn('');
    setNewSubNameBn('');
    setIsAddingSubject(false);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean);
    const newChaptersList: Array<Omit<Chapter, 'id'>> = lines.map((line, idx) => {
      // Format: "Chapter Name, 8h, Hard" or just "Chapter Name"
      const parts = line.split(',');
      const name = parts[0]?.trim() || `Chapter ${idx + 1}`;
      const hours = parts[1] ? parseInt(parts[1].replace(/[^0-9]/g, ''), 10) || 6 : 6;
      const diff = parts[2]?.trim().toLowerCase().includes('hard') ? 'Hard' : parts[2]?.trim().toLowerCase().includes('easy') ? 'Easy' : 'Medium';

      return {
        subjectId: bulkSubjectId,
        nameEn: name,
        nameBn: name,
        topics: ['Core Concepts', 'Practice Problems'],
        estimatedHours: hours,
        difficulty: diff as ChapterDifficulty,
        priority: 'high',
        deadlineDate: new Date(Date.now() + (idx + 1) * 7 * 86400000).toISOString().split('T')[0],
        status: 'not_started',
        confidence: 'average',
        resourceLinks: [],
        subtasks: []
      };
    });

    bulkAddChapters(newChaptersList);
    setBulkText('');
    setIsBulkModalOpen(false);
  };

  const handleGenerateTasks = async (chapterId: string) => {
    setGeneratingTasksForId(chapterId);
    await generateAITasksForChapter(chapterId);
    setGeneratingTasksForId(null);
  };

  // Filter chapters
  const filteredChapters = chapters.filter(ch => {
    if (selectedSubjectId !== 'all' && ch.subjectId !== selectedSubjectId) return false;
    if (filterPriority !== 'all' && ch.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && ch.status !== filterStatus) return false;
    if (filterConfidence !== 'all' && ch.confidence !== filterConfidence) return false;
    if (filterDifficulty !== 'all' && ch.difficulty !== filterDifficulty) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = ch.nameEn.toLowerCase().includes(q) || ch.nameBn.toLowerCase().includes(q);
      const matchTopics = ch.topics.some(tp => tp.toLowerCase().includes(q));
      if (!matchName && !matchTopics) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <span>{t('syllabus')}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Organize chapters, difficulty, exam weights, subtasks, and track confidence levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>{t('bulkAddChapters')}</span>
          </button>
          <button
            onClick={() => setIsAddingSubject(!isAddingSubject)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addSubject')}</span>
          </button>
          <button
            onClick={() => setIsAddChapterModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addChapter')}</span>
          </button>
        </div>
      </div>

      {/* Add Subject Inline Form */}
      {isAddingSubject && (
        <form onSubmit={handleAddSubject} className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 flex flex-wrap items-center gap-3 animate-in fade-in">
          <input
            type="text"
            required
            placeholder="Subject Name (English, e.g. Statistics)"
            value={newSubNameEn}
            onChange={e => setNewSubNameEn(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          <input
            type="text"
            placeholder="Subject Name (Bangla, যেমন: পরিসংখ্যান)"
            value={newSubNameBn}
            onChange={e => setNewSubNameBn(e.target.value)}
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-medium hover:bg-blue-700"
            >
              {t('submit')}
            </button>
            <button
              type="button"
              onClick={() => setIsAddingSubject(false)}
              className="px-3 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Subject Filter Pills Horizontal Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
            selectedSubjectId === 'all'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
          }`}
        >
          {t('allSubjects')} ({formatNumber(chapters.length)})
        </button>
        {subjects.map(s => {
          const subChapters = chapters.filter(c => c.subjectId === s.id);
          const completedCount = subChapters.filter(c => c.status === 'completed').length;
          const isSelected = selectedSubjectId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              <span>{settings.language === 'bn' ? s.nameBn : s.nameEn}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                {formatNumber(completedCount)}/{formatNumber(subChapters.length)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('searchChapters')}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Priority filter */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Priority: All</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Difficulty filter */}
          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Difficulty: All</option>
            <option value="Hard">Hard</option>
            <option value="Medium">Medium</option>
            <option value="Easy">Easy</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="completed">Completed</option>
            <option value="in_progress">In Progress</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="not_started">Not Started</option>
          </select>

          {/* Confidence filter */}
          <select
            value={filterConfidence}
            onChange={e => setFilterConfidence(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="all">Confidence: All</option>
            <option value="weak">Weak (Revision)</option>
            <option value="average">Average</option>
            <option value="strong">Strong</option>
          </select>
        </div>
      </div>

      {/* Chapters Count Summary */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>Showing {formatNumber(filteredChapters.length)} of {formatNumber(chapters.length)} chapters</span>
      </div>

      {/* Chapters List */}
      <div className="space-y-3.5">
        {filteredChapters.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No chapters found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          filteredChapters.map(chapter => {
            const subject = subjects.find(s => s.id === chapter.subjectId);
            const isExpanded = expandedChapterId === chapter.id;
            const completedSubtasks = (chapter.subtasks || []).filter(st => st.completed).length;
            const totalSubtasks = (chapter.subtasks || []).length;

            return (
              <div
                key={chapter.id}
                className={`rounded-2xl border transition-all duration-200 ${
                  chapter.status === 'completed'
                    ? 'bg-emerald-50/20 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40'
                    : chapter.priority === 'urgent'
                    ? 'bg-white dark:bg-slate-900 border-red-300 dark:border-red-900/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                {/* Main Chapter Header Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Completion checkbox button */}
                    <button
                      onClick={() => toggleChapterComplete(chapter.id)}
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition shrink-0 ${
                        chapter.status === 'completed'
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500'
                      }`}
                      title={chapter.status === 'completed' ? t('markIncomplete') : t('markComplete')}
                    >
                      {chapter.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {subject && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                            {settings.language === 'bn' ? subject.nameBn : subject.nameEn}
                          </span>
                        )}

                        {/* Priority Badge */}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          chapter.priority === 'urgent' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300' :
                          chapter.priority === 'high' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300' :
                          chapter.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' :
                          'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {t(chapter.priority)}
                        </span>

                        {/* Difficulty Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          chapter.difficulty === 'Hard' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' :
                          chapter.difficulty === 'Medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {chapter.difficulty}
                        </span>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          chapter.status === 'needs_revision' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 border border-amber-300' :
                          chapter.confidence === 'weak' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200' :
                          chapter.confidence === 'average' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                          'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        }`}>
                          {chapter.status === 'needs_revision' ? t('needs_revision') : t(chapter.confidence)}
                        </span>
                      </div>

                      <h3 className={`text-base font-bold ${chapter.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {settings.language === 'bn' ? chapter.nameBn : chapter.nameEn}
                        <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-2">
                          ({settings.language === 'bn' ? chapter.nameEn : chapter.nameBn})
                        </span>
                      </h3>

                      {/* Metadata Row: Estimated Time, Deadline, Exam Weight */}
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatNumber(chapter.estimatedHours)} {t('hours')}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {t('deadline')}: <span className="font-semibold text-slate-700 dark:text-slate-300">{chapter.deadlineDate}</span>
                        </span>
                        {chapter.examWeight && (
                          <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">
                            ★ {chapter.examWeight}
                          </span>
                        )}
                        {totalSubtasks > 0 && (
                          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                            <CheckSquare className="w-3.5 h-3.5" />
                            {formatNumber(completedSubtasks)}/{formatNumber(totalSubtasks)} {t('subtasksCompleted')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Expand Button */}
                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                    {/* AI Tasks Generator Button */}
                    <button
                      onClick={() => handleGenerateTasks(chapter.id)}
                      disabled={generatingTasksForId === chapter.id}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition"
                      title="Auto-break chapter into study tasks"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${generatingTasksForId === chapter.id ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">AI Tasks</span>
                    </button>

                    {/* Difficulty selector */}
                    <select
                      value={chapter.difficulty}
                      onChange={e => updateChapterDifficulty(chapter.id, e.target.value as ChapterDifficulty)}
                      className="px-2 py-1 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedChapterId(isExpanded ? null : chapter.id)}
                      className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Delete Chapter */}
                    <button
                      onClick={() => {
                        if (confirm(t('confirmDelete'))) {
                          deleteChapter(chapter.id);
                        }
                      }}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details: Topics, Subtasks, Notes, Deadline Editor */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-4 text-xs">
                    {/* Topics covered */}
                    {chapter.topics && chapter.topics.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                          {t('topics')}:
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {chapter.topics.map((tp, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs"
                            >
                              {tp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Deadline & Weight Editor */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          {t('deadline')}:
                        </span>
                        <input
                          type="date"
                          value={chapter.deadlineDate}
                          onChange={e => updateChapter(chapter.id, { deadlineDate: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Priority:
                        </span>
                        <select
                          value={chapter.priority}
                          onChange={e => updateChapter(chapter.id, { priority: e.target.value as Priority })}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="urgent">Urgent</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                          Status:
                        </span>
                        <select
                          value={chapter.status}
                          onChange={e => updateChapter(chapter.id, { status: e.target.value as CompletionStatus })}
                          className="w-full px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        >
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="needs_revision">Needs Revision</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>

                    {/* Subtasks / Study Tasks Breakdown */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                          {t('subtasks')}
                        </span>
                        <button
                          onClick={() => handleGenerateTasks(chapter.id)}
                          className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Generate Subtasks with AI</span>
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {(chapter.subtasks || []).map(st => (
                          <div
                            key={st.id}
                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/40"
                          >
                            <button
                              onClick={() => toggleSubtask(chapter.id, st.id)}
                              className="flex items-center gap-2 text-left min-w-0"
                            >
                              {st.completed ? (
                                <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span className={`text-xs ${st.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                {st.title}
                              </span>
                            </button>
                            <button
                              onClick={() => deleteSubtask(chapter.id, st.id)}
                              className="text-slate-400 hover:text-rose-500 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}

                        {/* Add subtask input */}
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="text"
                            placeholder={t('addSubtask')}
                            value={subtaskInputs[chapter.id] || ''}
                            onChange={e => setSubtaskInputs({ ...subtaskInputs, [chapter.id]: e.target.value })}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = subtaskInputs[chapter.id];
                                if (val) {
                                  addSubtask(chapter.id, val);
                                  setSubtaskInputs({ ...subtaskInputs, [chapter.id]: '' });
                                }
                              }
                            }}
                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                          />
                          <button
                            onClick={() => {
                              const val = subtaskInputs[chapter.id];
                              if (val) {
                                addSubtask(chapter.id, val);
                                setSubtaskInputs({ ...subtaskInputs, [chapter.id]: '' });
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Personal Notes */}
                    {chapter.personalNotes && (
                      <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
                        <span className="font-semibold text-amber-900 dark:text-amber-300 text-[11px] block mb-1">
                          {t('personalNotes')}:
                        </span>
                        <p className="text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
                          {chapter.personalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <AddChapterModal
        isOpen={isAddChapterModalOpen}
        onClose={() => setIsAddChapterModalOpen(false)}
        defaultSubjectId={selectedSubjectId !== 'all' ? selectedSubjectId : undefined}
      />

      {/* Bulk Add Chapters Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {t('bulkAddChapters')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter one chapter per line. Optionally format as "Chapter Name, estimatedHours, difficulty".
            </p>

            <form onSubmit={handleBulkSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">{t('subject')}</label>
                <select
                  value={bulkSubjectId}
                  onChange={e => setBulkSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.nameEn}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Chapters List (1 per line)</label>
                <textarea
                  rows={6}
                  required
                  placeholder={`Thermodynamics, 8, Hard\nCurrent Electricity, 6, Medium\nWave Optics, 5, Easy`}
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  {t('submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
