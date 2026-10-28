export type Language = 'en' | 'bn';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type CompletionStatus = 'not_started' | 'in_progress' | 'completed' | 'needs_revision';

export type ConfidenceLevel = 'weak' | 'average' | 'strong';

export type ChapterDifficulty = 'Easy' | 'Medium' | 'Hard';

export type TaskType = 'theory' | 'numerical' | 'mcq' | 'cq' | 'revision' | 'mock_test';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
  taskType?: TaskType;
}

export type ResourceType = 'youtube' | 'drive' | 'pdf' | 'web';

export interface ResourceLink {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  fileData?: string; // Base64 for uploaded PDFs
}

export interface Chapter {
  id: string;
  subjectId: string;
  nameEn: string;
  nameBn: string;
  topics: string[];
  subtopics?: string[];
  estimatedHours: number;
  difficulty: ChapterDifficulty;
  priority: Priority;
  deadlineDate: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:mm
  status: CompletionStatus;
  confidence: ConfidenceLevel;
  completionPercent?: number; // 0-100
  examWeight?: string; // e.g. "10 marks CQ", "High yield"
  revisionRequired?: boolean;
  personalNotes?: string;
  resourceLinks: ResourceLink[];
  subtasks: SubTask[];
  completedAt?: string;
}

export interface Subject {
  id: string;
  nameEn: string;
  nameBn: string;
  code: string;
  color: string;
  deadlineDate?: string;
  isArchived?: boolean;
  order?: number;
  chaptersCount?: number;
}

export interface StudyTask {
  id: string;
  subjectId: string;
  chapterId?: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  durationMinutes: number;
  priority: Priority;
  taskType?: TaskType;
  completed: boolean;
  completedAt?: string;
  notes?: string;
  isBreak?: boolean;
  scheduledBy?: 'ai' | 'rule' | 'manual';
  reason?: string;
}

export type ClassPlatform = 'google_meet' | 'zoom' | 'youtube' | 'teams' | 'other';
export type ClassStatus = 'upcoming' | 'attended' | 'missed';

export interface OnlineClass {
  id: string;
  title: string;
  subjectId: string;
  teacherName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  durationMinutes: number;
  meetUrl: string;
  platform: ClassPlatform;
  status: ClassStatus;
  notes?: string;
  resources?: ResourceLink[];
}

export interface NoteItem {
  id: string;
  title: string;
  subjectId?: string;
  chapterId?: string;
  content: string;
  resources: ResourceLink[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface ExamGoal {
  id: string;
  title: string;
  targetDate: string; // YYYY-MM-DD
  targetScore?: string;
  notes?: string;
  syllabusSubjectIds?: string[];
}

export interface StudyLog {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  sessionsCount: number;
}

export type AIProvider = 'gemini' | 'openai' | 'rule_based';
export type PlanningAggressiveness = 'conservative' | 'balanced' | 'dynamic';

export interface AISettings {
  provider: AIProvider;
  model: string;
  autoPlanningEnabled: boolean;
  aggressiveness: PlanningAggressiveness;
  requireConfirmation: boolean;
  lastRebalancedAt?: string;
  lastRebalanceReason?: string;
}

export interface UserSettings {
  studentName: string;
  targetGoal: string;
  targetDate: string; // YYYY-MM-DD
  planStartDate: string; // YYYY-MM-DD
  dailyStudyHours: number;
  preferredStudyDays: number[]; // 0 for Sun, 1 for Mon, etc.
  preferredStudyStartTime: string; // e.g. "16:00"
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  pomodoroLongBreakMinutes: number;
  pomodoroSessionsBeforeLongBreak: number;
  language: Language;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  aiSettings: AISettings;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}

export type NavigationTab = 
  | 'dashboard'
  | 'syllabus'
  | 'planner'
  | 'timer'
  | 'calendar'
  | 'classes'
  | 'notes'
  | 'analytics'
  | 'aisettings'
  | 'settings';
