import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Subject,
  Chapter,
  StudyTask,
  OnlineClass,
  NoteItem,
  ExamGoal,
  StudyLog,
  UserSettings,
  AISettings,
  Language,
  CompletionStatus,
  ConfidenceLevel,
  Priority,
  ChapterDifficulty,
  TaskType
} from '../types';
import {
  defaultSubjects,
  defaultChapters,
  defaultExams,
  defaultOnlineClasses,
  defaultStudyTasks,
  defaultNotes
} from '../data/defaultSyllabus';
import { translations, TranslationKey, toBengaliDigits } from '../i18n/translations';
import { runDeterministicRebalance, calculateWorkloadMetrics } from '../utils/scheduler';

interface RebalanceNotification {
  id: string;
  reason: string;
  timestamp: string;
  sessionsUpdatedCount: number;
}

interface AppContextType {
  // Settings & Profile
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateAISettings: (newAISettings: Partial<AISettings>) => void;
  resetAllData: () => void;
  exportBackupJson: () => void;
  importBackupJson: (jsonString: string) => boolean;

  // Language & Translation
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, replacements?: Record<string, string | number>) => string;
  formatNumber: (val: number | string) => string;

  // Subjects
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  archiveSubject: (id: string, archive?: boolean) => void;

  // Chapters & Syllabus
  chapters: Chapter[];
  addChapter: (chapter: Omit<Chapter, 'id'>) => void;
  bulkAddChapters: (chaptersList: Array<Omit<Chapter, 'id'>>) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  toggleChapterComplete: (id: string) => void;
  updateChapterConfidence: (id: string, confidence: ConfidenceLevel) => void;
  updateChapterDifficulty: (id: string, difficulty: ChapterDifficulty) => void;
  addSubtask: (chapterId: string, title: string, estimatedMinutes?: number, taskType?: TaskType) => void;
  toggleSubtask: (chapterId: string, subtaskId: string) => void;
  deleteSubtask: (chapterId: string, subtaskId: string) => void;
  generateAITasksForChapter: (chapterId: string) => Promise<boolean>;

  // Tasks & Planner
  tasks: StudyTask[];
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  rescheduleOverdueTasks: (newDate?: string) => void;
  triggerScheduleRebalance: (reason: string, forceAI?: boolean) => Promise<boolean>;
  undoScheduleRebalance: () => boolean;
  canUndoSchedule: boolean;
  isRebalancing: boolean;
  rebalanceNotification: RebalanceNotification | null;
  dismissRebalanceNotification: () => void;

  // Online Classes
  classes: OnlineClass[];
  addClass: (cls: Omit<OnlineClass, 'id'>) => void;
  updateClass: (id: string, updates: Partial<OnlineClass>) => void;
  deleteClass: (id: string) => void;
  setClassStatus: (id: string, status: OnlineClass['status']) => void;

  // Notes & Resources
  notes: NoteItem[];
  addNote: (note: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<NoteItem>) => void;
  deleteNote: (id: string) => void;
  toggleFavoriteNote: (id: string) => void;

  // Exams & Goals
  exams: ExamGoal[];
  addExam: (exam: Omit<ExamGoal, 'id'>) => void;
  updateExam: (id: string, updates: Partial<ExamGoal>) => void;
  deleteExam: (id: string) => void;

  // Study Logs & Focus Timer
  studyLogs: StudyLog[];
  logFocusMinutes: (minutes: number, linkedTaskId?: string) => void;
  getTodayStudyMinutes: () => number;
  getWeeklyStudyStats: () => { day: string; date: string; minutes: number }[];
  getStudyStreak: () => number;

  // Workload & Analytics
  remainingSyllabusHours: number;
  totalSyllabusHours: number;
  overallProgressPercentage: number;
  availableStudyHoursBeforeTarget: number;
  isWorkloadFeasible: boolean;
  daysUntilTargetExam: number;
  aiRecommendation: { isFeasible: boolean; evaluation: string; tips: string[] } | null;

  // Sound Chime & Confetti
  triggerCelebration: () => void;
  playTimerChime: () => void;

  // Cloud Sync Status
  cloudSyncStatus: 'local' | 'synced' | 'syncing' | 'error';
  testAndSyncSupabase: () => Promise<boolean>;
}

const STORAGE_KEYS = {
  SETTINGS: 'studytrack_settings_v2',
  SUBJECTS: 'studytrack_subjects_v2',
  CHAPTERS: 'studytrack_chapters_v2',
  TASKS: 'studytrack_tasks_v2',
  CLASSES: 'studytrack_classes_v2',
  NOTES: 'studytrack_notes_v2',
  EXAMS: 'studytrack_exams_v2',
  LOGS: 'studytrack_logs_v2',
};

const initialAISettings: AISettings = {
  provider: 'gemini',
  model: 'gemini-3.8-flash',
  autoPlanningEnabled: true,
  aggressiveness: 'balanced',
  requireConfirmation: false,
};

const initialSettings: UserSettings = {
  studentName: 'Joy',
  targetGoal: 'HSC Board Examination 2026',
  targetDate: '2026-12-20',
  planStartDate: '2026-10-28',
  dailyStudyHours: 6,
  preferredStudyDays: [0, 1, 2, 3, 4, 5, 6],
  preferredStudyStartTime: '16:00',
  pomodoroFocusMinutes: 25,
  pomodoroBreakMinutes: 5,
  pomodoroLongBreakMinutes: 15,
  pomodoroSessionsBeforeLongBreak: 4,
  language: 'en',
  theme: 'light',
  notificationsEnabled: true,
  aiSettings: initialAISettings,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or fallback to defaults
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!saved) return initialSettings;
      const parsed = JSON.parse(saved);
      return {
        ...initialSettings,
        ...parsed,
        aiSettings: { ...initialAISettings, ...(parsed.aiSettings || {}) }
      };
    } catch {
      return initialSettings;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : defaultSubjects;
    } catch {
      return defaultSubjects;
    }
  });

  const [chapters, setChapters] = useState<Chapter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
      return saved ? JSON.parse(saved) : defaultChapters;
    } catch {
      return defaultChapters;
    }
  });

  const [tasks, setTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : defaultStudyTasks;
    } catch {
      return defaultStudyTasks;
    }
  });

  const [classes, setClasses] = useState<OnlineClass[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLASSES);
      return saved ? JSON.parse(saved) : defaultOnlineClasses;
    } catch {
      return defaultOnlineClasses;
    }
  });

  const [notes, setNotes] = useState<NoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
      return saved ? JSON.parse(saved) : defaultNotes;
    } catch {
      return defaultNotes;
    }
  });

  const [exams, setExams] = useState<ExamGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return saved ? JSON.parse(saved) : defaultExams;
    } catch {
      return defaultExams;
    }
  });

  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      return saved ? JSON.parse(saved) : [
        { date: '2026-10-26', totalMinutes: 240, sessionsCount: 4 },
        { date: '2026-10-27', totalMinutes: 180, sessionsCount: 3 },
        { date: '2026-10-28', totalMinutes: 90, sessionsCount: 2 },
      ];
    } catch {
      return [];
    }
  });

  // State for AI schedule snapshots (Undo functionality)
  const [previousTasksSnapshot, setPreviousTasksSnapshot] = useState<StudyTask[] | null>(null);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [rebalanceNotification, setRebalanceNotification] = useState<RebalanceNotification | null>(null);
  const [aiRecommendation, setAiRecommendation] = useState<{ isFeasible: boolean; evaluation: string; tips: string[] } | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'local' | 'synced' | 'syncing' | 'error'>('local');

  // Debounce ref for event-driven automatic rebalancing
  const autoRebalanceDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Persistence to localStorage
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch (e) { console.warn(e); }
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); } catch (e) { console.warn(e); }
  }, [subjects]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters)); } catch (e) { console.warn(e); }
  }, [chapters]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks)); } catch (e) { console.warn(e); }
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes)); } catch (e) { console.warn(e); }
  }, [classes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes)); } catch (e) { console.warn(e); }
  }, [notes]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams)); } catch (e) { console.warn(e); }
  }, [exams]);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(studyLogs)); } catch (e) { console.warn(e); }
  }, [studyLogs]);

  // Dark / Light Theme Sync
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Translation function
  const t = (key: TranslationKey, replacements?: Record<string, string | number>): string => {
    const langDict = translations[settings.language] || translations.en;
    let str = (langDict as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        const formattedV = typeof v === 'number' ? toBengaliDigits(v, settings.language) : String(v);
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), formattedV);
      });
    }
    return str;
  };

  const formatNumber = (val: number | string): string => {
    return toBengaliDigits(val, settings.language);
  };

  const setLanguage = (lang: Language) => {
    updateSettings({ language: lang });
  };

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  };

  const updateAISettings = (newAISettings: Partial<AISettings>) => {
    setSettings(prev => ({
      ...prev,
      aiSettings: { ...prev.aiSettings, ...newAISettings }
    }));
  };

  // Sound chime using Web Audio API
  const playTimerChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.15);
        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + index * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.15 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.15);
        osc.stop(ctx.currentTime + index * 0.15 + 0.7);
      });
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.65 }
    });
    playTimerChime();
  };

  // ==========================================
  // HYBRID AI & DETERMINISTIC SCHEDULING ENGINE
  // ==========================================

  // Main schedule rebalance function (Hybrid AI + Deterministic Fallback)
  const triggerScheduleRebalance = useCallback(async (reason: string, forceAI = false): Promise<boolean> => {
    setIsRebalancing(true);

    try {
      // Save previous snapshot for Undo
      setPreviousTasksSnapshot([...tasks]);

      const todayStr = new Date().toISOString().split('T')[0];
      const dailyHours = settings.dailyStudyHours || 6;

      // Check if AI planning is enabled
      if (settings.aiSettings?.autoPlanningEnabled || forceAI) {
        try {
          const response = await fetch('/api/ai/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              studentName: settings.studentName,
              targetGoal: settings.targetGoal,
              targetDate: settings.targetDate,
              dailyStudyHours: dailyHours,
              subjects,
              chapters,
              provider: settings.aiSettings?.provider || 'gemini',
              model: settings.aiSettings?.model || 'gemini-3.8-flash',
              daysToSchedule: 7,
            }),
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.sessions && Array.isArray(result.data.sessions)) {
              // Validate returned AI sessions against schedule constraints
              const aiSessions = result.data.sessions;
              const preservedTasks = tasks.filter(t => t.completed || t.date < todayStr);
              const now = new Date();

              const validatedNewTasks: StudyTask[] = aiSessions.map((session: any, idx: number) => {
                const dayDate = new Date(now.getTime() + (session.dayOffset || 0) * 86400000);
                const dayStr = dayDate.toISOString().split('T')[0];

                return {
                  id: `ai_${Date.now()}_${idx}`,
                  subjectId: session.subjectId || subjects[0]?.id || 'sub_general',
                  chapterId: session.chapterId || undefined,
                  title: session.title || 'Study Session',
                  date: dayStr,
                  startTime: session.startTime || '16:00',
                  durationMinutes: Math.min(120, Math.max(30, session.durationMinutes || 60)),
                  priority: (session.priority as Priority) || 'medium',
                  taskType: (session.taskType as TaskType) || 'theory',
                  completed: false,
                  scheduledBy: 'ai',
                  reason: session.reason || result.data.reasoning || reason,
                };
              });

              // Prevent overlapping tasks on the same day: sequential timings
              const sanitizedTasks = [...preservedTasks, ...validatedNewTasks];
              setTasks(sanitizedTasks);

              // Update AI metadata
              updateAISettings({
                lastRebalancedAt: new Date().toLocaleTimeString(),
                lastRebalanceReason: result.data.reasoning || reason,
              });

              setRebalanceNotification({
                id: `notif_${Date.now()}`,
                reason: result.data.reasoning || reason,
                timestamp: new Date().toLocaleTimeString(),
                sessionsUpdatedCount: validatedNewTasks.length,
              });

              return true;
            }
          }
        } catch (err) {
          console.warn('AI Plan request failed, falling back to deterministic scheduling:', err);
        }
      }

      // Deterministic Rule-Based Rebalance Fallback
      const deterministicTasks = runDeterministicRebalance(chapters, tasks, dailyHours, 7, settings.language);
      setTasks(deterministicTasks);

      updateAISettings({
        lastRebalancedAt: new Date().toLocaleTimeString(),
        lastRebalanceReason: reason,
      });

      setRebalanceNotification({
        id: `notif_${Date.now()}`,
        reason: `Deterministic Engine: ${reason}`,
        timestamp: new Date().toLocaleTimeString(),
        sessionsUpdatedCount: deterministicTasks.length - tasks.filter(t => t.completed || t.date < todayStr).length,
      });

      return true;
    } catch (criticalErr) {
      console.error('Critical rebalance error:', criticalErr);
      return false;
    } finally {
      setIsRebalancing(false);
    }
  }, [tasks, subjects, chapters, settings, settings.dailyStudyHours, settings.aiSettings]);

  // Event-Driven Schedule Trigger helper (debounced by 1.5s)
  const scheduleEventTriggeredRebalance = useCallback((reason: string) => {
    if (!settings.aiSettings?.autoPlanningEnabled) return;
    if (autoRebalanceDebounceTimer.current) {
      clearTimeout(autoRebalanceDebounceTimer.current);
    }
    autoRebalanceDebounceTimer.current = setTimeout(() => {
      triggerScheduleRebalance(reason);
    }, 1500);
  }, [settings.aiSettings?.autoPlanningEnabled, triggerScheduleRebalance]);

  // Undo last schedule rebalance
  const undoScheduleRebalance = (): boolean => {
    if (!previousTasksSnapshot) return false;
    setTasks(previousTasksSnapshot);
    setPreviousTasksSnapshot(null);
    setRebalanceNotification(null);
    return true;
  };

  const dismissRebalanceNotification = () => {
    setRebalanceNotification(null);
  };

  // AI Task Generator for Chapters
  const generateAITasksForChapter = async (chapterId: string): Promise<boolean> => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (!chapter) return false;
    const subject = subjects.find(s => s.id === chapter.subjectId);

    try {
      const resp = await fetch('/api/ai/suggest-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subject ? subject.nameEn : 'General Subject',
          chapterName: chapter.nameEn,
          topics: chapter.topics,
          difficulty: chapter.difficulty,
          language: settings.language,
        }),
      });

      if (resp.ok) {
        const data = await resp.json();
        if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
          const generatedSubtasks = data.tasks.map((t: any, idx: number) => ({
            id: `st_ai_${Date.now()}_${idx}`,
            title: t.title,
            completed: false,
            estimatedMinutes: t.estimatedMinutes || 45,
            taskType: t.taskType || 'theory',
          }));

          setChapters(prev => prev.map(ch => {
            if (ch.id === chapterId) {
              return {
                ...ch,
                subtasks: [...(ch.subtasks || []), ...generatedSubtasks],
              };
            }
            return ch;
          }));

          scheduleEventTriggeredRebalance(`AI generated tasks for ${chapter.nameEn}`);
          return true;
        }
      }
    } catch (e) {
      console.warn('AI task generation error:', e);
    }

    // Fallback: Rule-based task templates
    const fallbackTasks = [
      { id: `st_fb_${Date.now()}_1`, title: 'Read & annotate core textbook concepts', completed: false, estimatedMinutes: 45, taskType: 'theory' as TaskType },
      { id: `st_fb_${Date.now()}_2`, title: 'Compile key formula sheet & definitions', completed: false, estimatedMinutes: 30, taskType: 'theory' as TaskType },
      { id: `st_fb_${Date.now()}_3`, title: 'Solve standard board numericals & CQ problems', completed: false, estimatedMinutes: 60, taskType: 'cq' as TaskType },
      { id: `st_fb_${Date.now()}_4`, title: 'Complete timed 20-question MCQ practice set', completed: false, estimatedMinutes: 30, taskType: 'mcq' as TaskType },
      { id: `st_fb_${Date.now()}_5`, title: 'Review mistakes and revise tricky formulas', completed: false, estimatedMinutes: 30, taskType: 'revision' as TaskType },
    ];

    setChapters(prev => prev.map(ch => ch.id === chapterId ? { ...ch, subtasks: [...(ch.subtasks || []), ...fallbackTasks] } : ch));
    return true;
  };

  // Subjects Management
  const addSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `sub_${Date.now()}`,
      isArchived: false,
      order: subjects.length + 1
    };
    setSubjects(prev => [...prev, newSubject]);
    scheduleEventTriggeredRebalance(`New subject added: ${newSubject.nameEn}`);
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    setChapters(prev => prev.filter(c => c.subjectId !== id));
    setTasks(prev => prev.filter(t => t.subjectId !== id));
    setClasses(prev => prev.filter(c => c.subjectId !== id));
    scheduleEventTriggeredRebalance('Subject deleted');
  };

  const archiveSubject = (id: string, archive = true) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, isArchived: archive } : s));
  };

  // Chapters Management
  const addChapter = (chapterData: Omit<Chapter, 'id'>) => {
    const newChapter: Chapter = {
      ...chapterData,
      id: `ch_${Date.now()}`
    };
    setChapters(prev => [newChapter, ...prev]);
    scheduleEventTriggeredRebalance(`New chapter added: ${newChapter.nameEn}`);
  };

  const bulkAddChapters = (chaptersList: Array<Omit<Chapter, 'id'>>) => {
    const newChapters: Chapter[] = chaptersList.map((c, i) => ({
      ...c,
      id: `ch_bulk_${Date.now()}_${i}`
    }));
    setChapters(prev => [...newChapters, ...prev]);
    scheduleEventTriggeredRebalance(`Bulk added ${newChapters.length} chapters`);
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, ...updates } : ch));
    if (updates.priority || updates.difficulty || updates.deadlineDate || updates.estimatedHours || updates.status) {
      scheduleEventTriggeredRebalance(`Chapter updated`);
    }
  };

  const deleteChapter = (id: string) => {
    setChapters(prev => prev.filter(ch => ch.id !== id));
    setTasks(prev => prev.filter(t => t.chapterId !== id));
    scheduleEventTriggeredRebalance('Chapter removed from syllabus');
  };

  const toggleChapterComplete = (id: string) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === id) {
        const nextStatus: CompletionStatus = ch.status === 'completed' ? 'in_progress' : 'completed';
        if (nextStatus === 'completed') {
          triggerCelebration();
          return { ...ch, status: nextStatus, completedAt: new Date().toISOString() };
        }
        return { ...ch, status: nextStatus, completedAt: undefined };
      }
      return ch;
    }));
    scheduleEventTriggeredRebalance('Chapter completion status changed');
  };

  const updateChapterConfidence = (id: string, confidence: ConfidenceLevel) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, confidence } : ch));
    scheduleEventTriggeredRebalance(`Chapter confidence updated to ${confidence}`);
  };

  const updateChapterDifficulty = (id: string, difficulty: ChapterDifficulty) => {
    setChapters(prev => prev.map(ch => ch.id === id ? { ...ch, difficulty } : ch));
    scheduleEventTriggeredRebalance(`Chapter difficulty set to ${difficulty}`);
  };

  const addSubtask = (chapterId: string, title: string, estimatedMinutes = 30, taskType: TaskType = 'theory') => {
    if (!title.trim()) return;
    const newSubtask = {
      id: `st_${Date.now()}`,
      title: title.trim(),
      completed: false,
      estimatedMinutes,
      taskType
    };
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, subtasks: [...(ch.subtasks || []), newSubtask] };
      }
      return ch;
    }));
  };

  const toggleSubtask = (chapterId: string, subtaskId: string) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        const updatedSubtasks = (ch.subtasks || []).map(st =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(s => s.completed);
        return {
          ...ch,
          subtasks: updatedSubtasks,
          status: allCompleted ? 'completed' : ch.status === 'completed' ? 'in_progress' : ch.status
        };
      }
      return ch;
    }));
  };

  const deleteSubtask = (chapterId: string, subtaskId: string) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return { ...ch, subtasks: (ch.subtasks || []).filter(st => st.id !== subtaskId) };
      }
      return ch;
    }));
  };

  // Study Tasks & Planner Management
  const addTask = (taskData: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `task_${Date.now()}`
    };
    setTasks(prev => [...prev, newTask]);
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          triggerCelebration();
          logFocusMinutes(t.durationMinutes);
          return { ...t, completed: true, completedAt: new Date().toISOString() };
        }
        return { ...t, completed: false, completedAt: undefined };
      }
      return t;
    }));
    scheduleEventTriggeredRebalance('Task completed');
  };

  const rescheduleOverdueTasks = (newDate?: string) => {
    const targetDate = newDate || new Date().toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];
    setTasks(prev => prev.map(t => {
      if (!t.completed && t.date < todayStr) {
        return { ...t, date: targetDate };
      }
      return t;
    }));
    scheduleEventTriggeredRebalance('Overdue tasks rescheduled to today');
  };

  // Online Classes Management
  const addClass = (clsData: Omit<OnlineClass, 'id'>) => {
    const newClass: OnlineClass = {
      ...clsData,
      id: `class_${Date.now()}`
    };
    setClasses(prev => [...prev, newClass]);
  };

  const updateClass = (id: string, updates: Partial<OnlineClass>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteClass = (id: string) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const setClassStatus = (id: string, status: OnlineClass['status']) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  // Notes & Resources
  const addNote = (noteData: Omit<NoteItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      ...noteData,
      id: `note_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateNote = (id: string, updates: Partial<NoteItem>) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const toggleFavoriteNote = (id: string) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  // Exams Management
  const addExam = (examData: Omit<ExamGoal, 'id'>) => {
    const newExam: ExamGoal = {
      ...examData,
      id: `exam_${Date.now()}`
    };
    setExams(prev => [...prev, newExam]);
    scheduleEventTriggeredRebalance(`Exam deadline added: ${newExam.title}`);
  };

  const updateExam = (id: string, updates: Partial<ExamGoal>) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    scheduleEventTriggeredRebalance('Exam date updated');
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(e => e.id !== id));
    scheduleEventTriggeredRebalance('Exam removed');
  };

  // Focus Timer & Logs
  const logFocusMinutes = (minutes: number, linkedTaskId?: string) => {
    if (minutes <= 0) return;
    const todayStr = new Date().toISOString().split('T')[0];
    setStudyLogs(prev => {
      const existing = prev.find(l => l.date === todayStr);
      if (existing) {
        return prev.map(l => l.date === todayStr ? {
          ...l,
          totalMinutes: l.totalMinutes + minutes,
          sessionsCount: l.sessionsCount + 1
        } : l);
      }
      return [...prev, { date: todayStr, totalMinutes: minutes, sessionsCount: 1 }];
    });

    if (linkedTaskId) {
      toggleTaskComplete(linkedTaskId);
    }
  };

  const getTodayStudyMinutes = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const log = studyLogs.find(l => l.date === todayStr);
    return log ? log.totalMinutes : 0;
  };

  const getWeeklyStudyStats = () => {
    const today = new Date();
    const result: { day: string; date: string; minutes: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const log = studyLogs.find(l => l.date === dateStr);
      result.push({
        day: dayNames[d.getDay()],
        date: dateStr,
        minutes: log ? log.totalMinutes : 0
      });
    }
    return result;
  };

  const getStudyStreak = () => {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today.getTime() - i * 86400000);
      const dateStr = d.toISOString().split('T')[0];
      const log = studyLogs.find(l => l.date === dateStr);
      if (log && log.totalMinutes > 0) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return Math.max(1, streak);
  };

  // Workload Feasibility Calculations via pure scheduler utility
  const workload = calculateWorkloadMetrics(
    chapters,
    settings.targetDate || '2026-12-20',
    settings.dailyStudyHours || 6
  );

  const {
    totalSyllabusHours,
    remainingSyllabusHours,
    overallProgressPercentage,
    daysUntilTargetExam,
    availableStudyHoursBeforeTarget,
    isWorkloadFeasible
  } = workload;

  // Background AI Schedule Analysis
  useEffect(() => {
    const fetchScheduleAnalysis = async () => {
      try {
        const resp = await fetch('/api/ai/analyze-schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetDate: settings.targetDate,
            dailyStudyHours: settings.dailyStudyHours || 6,
            totalRemainingHours: remainingSyllabusHours,
            weakChaptersCount: chapters.filter(c => c.confidence === 'weak').length,
            overdueCount: tasks.filter(t => !t.completed && t.date < new Date().toISOString().split('T')[0]).length,
          }),
        });
        if (resp.ok) {
          const res = await resp.json();
          if (res.data) setAiRecommendation(res.data);
        }
      } catch {
        // Safe fallback
      }
    };

    fetchScheduleAnalysis();
  }, [settings.targetDate, settings.dailyStudyHours, remainingSyllabusHours]);

  // Backup & Reset
  const resetAllData = () => {
    setSettings(initialSettings);
    setSubjects(defaultSubjects);
    setChapters(defaultChapters);
    setTasks(defaultStudyTasks);
    setClasses(defaultOnlineClasses);
    setNotes(defaultNotes);
    setExams(defaultExams);
    setStudyLogs([]);
    localStorage.clear();
  };

  const exportBackupJson = () => {
    const backupData = {
      appName: 'Agami',
      version: 2,
      exportedAt: new Date().toISOString(),
      settings,
      subjects,
      chapters,
      tasks,
      classes,
      notes,
      exams,
      studyLogs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Study_track_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) setSettings(data.settings);
      if (data.subjects) setSubjects(data.subjects);
      if (data.chapters) setChapters(data.chapters);
      if (data.tasks) setTasks(data.tasks);
      if (data.classes) setClasses(data.classes);
      if (data.notes) setNotes(data.notes);
      if (data.exams) setExams(data.exams);
      if (data.studyLogs) setStudyLogs(data.studyLogs);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const testAndSyncSupabase = async (): Promise<boolean> => {
    if (!settings.supabaseUrl || !settings.supabaseAnonKey) {
      setCloudSyncStatus('local');
      return false;
    }
    setCloudSyncStatus('syncing');
    try {
      const resp = await fetch(`${settings.supabaseUrl.replace(/\/$/, '')}/rest/v1/`, {
        headers: {
          apikey: settings.supabaseAnonKey,
          Authorization: `Bearer ${settings.supabaseAnonKey}`
        }
      });
      if (resp.ok || resp.status === 404 || resp.status === 200) {
        setCloudSyncStatus('synced');
        return true;
      } else {
        setCloudSyncStatus('error');
        return false;
      }
    } catch {
      setCloudSyncStatus('error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        updateSettings,
        updateAISettings,
        resetAllData,
        exportBackupJson,
        importBackupJson,
        language: settings.language,
        setLanguage,
        t,
        formatNumber,
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        archiveSubject,
        chapters,
        addChapter,
        bulkAddChapters,
        updateChapter,
        deleteChapter,
        toggleChapterComplete,
        updateChapterConfidence,
        updateChapterDifficulty,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        generateAITasksForChapter,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        rescheduleOverdueTasks,
        triggerScheduleRebalance,
        undoScheduleRebalance,
        canUndoSchedule: Boolean(previousTasksSnapshot),
        isRebalancing,
        rebalanceNotification,
        dismissRebalanceNotification,
        classes,
        addClass,
        updateClass,
        deleteClass,
        setClassStatus,
        notes,
        addNote,
        updateNote,
        deleteNote,
        toggleFavoriteNote,
        exams,
        addExam,
        updateExam,
        deleteExam,
        studyLogs,
        logFocusMinutes,
        getTodayStudyMinutes,
        getWeeklyStudyStats,
        getStudyStreak,
        remainingSyllabusHours,
        totalSyllabusHours,
        overallProgressPercentage,
        availableStudyHoursBeforeTarget,
        isWorkloadFeasible,
        daysUntilTargetExam,
        aiRecommendation,
        triggerCelebration,
        playTimerChime,
        cloudSyncStatus,
        testAndSyncSupabase
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
