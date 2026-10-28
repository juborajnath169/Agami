import { Chapter, StudyTask, Priority, ChapterDifficulty, TaskType } from '../types';

export interface WorkloadMetrics {
  totalSyllabusHours: number;
  remainingSyllabusHours: number;
  overallProgressPercentage: number;
  daysUntilTargetExam: number;
  availableStudyHoursBeforeTarget: number;
  isWorkloadFeasible: boolean;
  feasibilityRatio: number; // available / remaining
}

export const priorityScore: Record<Priority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export const difficultyScore: Record<ChapterDifficulty, number> = {
  Hard: 3,
  Medium: 2,
  Easy: 1,
};

/**
 * Calculates remaining days between two date strings (YYYY-MM-DD)
 */
export function calculateDaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - start.getTime();
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

/**
 * Calculates syllabus workload feasibility and progress percentages.
 */
export function calculateWorkloadMetrics(
  chapters: Chapter[],
  targetDateStr: string,
  dailyStudyHours: number,
  todayDate: Date = new Date()
): WorkloadMetrics {
  const totalSyllabusHours = chapters.reduce((sum, c) => sum + (c.estimatedHours || 5), 0);
  const remainingChapters = chapters.filter(c => c.status !== 'completed');
  const remainingSyllabusHours = remainingChapters.reduce((sum, c) => sum + (c.estimatedHours || 5), 0);

  const overallProgressPercentage = totalSyllabusHours > 0
    ? Math.round(((totalSyllabusHours - remainingSyllabusHours) / totalSyllabusHours) * 100)
    : 0;

  const todayZero = new Date(todayDate);
  todayZero.setHours(0, 0, 0, 0);
  const targetZero = new Date(targetDateStr || '2026-12-20');
  targetZero.setHours(0, 0, 0, 0);

  const diffTime = targetZero.getTime() - todayZero.getTime();
  const daysUntilTargetExam = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const availableStudyHoursBeforeTarget = daysUntilTargetExam * (dailyStudyHours || 6);
  const isWorkloadFeasible = remainingSyllabusHours <= availableStudyHoursBeforeTarget;
  const feasibilityRatio = remainingSyllabusHours > 0
    ? Number((availableStudyHoursBeforeTarget / remainingSyllabusHours).toFixed(2))
    : 1.0;

  return {
    totalSyllabusHours,
    remainingSyllabusHours,
    overallProgressPercentage,
    daysUntilTargetExam,
    availableStudyHoursBeforeTarget,
    isWorkloadFeasible,
    feasibilityRatio,
  };
}

/**
 * Sorts pending chapters by urgency:
 * 1. Needs revision first
 * 2. Priority (Urgent > High > Medium > Low)
 * 3. Difficulty (Hard > Medium > Easy)
 * 4. Deadline (earliest first)
 */
export function sortChaptersForScheduling(chapters: Chapter[]): Chapter[] {
  return [...chapters]
    .filter(c => c.status !== 'completed')
    .sort((a, b) => {
      if (a.status === 'needs_revision' && b.status !== 'needs_revision') return -1;
      if (b.status === 'needs_revision' && a.status !== 'needs_revision') return 1;

      const pDiff = (priorityScore[b.priority] || 2) - (priorityScore[a.priority] || 2);
      if (pDiff !== 0) return pDiff;

      const dDiff = (difficultyScore[b.difficulty] || 2) - (difficultyScore[a.difficulty] || 2);
      if (dDiff !== 0) return dDiff;

      return (a.deadlineDate || '9999').localeCompare(b.deadlineDate || '9999');
    });
}

/**
 * Deterministic scheduling algorithm.
 * Rebalances uncompleted future tasks while preserving past and completed tasks.
 */
export function runDeterministicRebalance(
  currentChapters: Chapter[],
  existingTasks: StudyTask[],
  targetDailyHours: number,
  daysToSchedule = 7,
  language: 'en' | 'bn' = 'en',
  baseDate: Date = new Date()
): StudyTask[] {
  const baseDateZero = new Date(baseDate);
  const todayStr = baseDateZero.toISOString().split('T')[0];

  // Preserve completed tasks & all past tasks
  const preservedTasks = existingTasks.filter(t => t.completed || t.date < todayStr);

  const activeChapters = sortChaptersForScheduling(currentChapters);
  if (activeChapters.length === 0) {
    return preservedTasks;
  }

  const newFutureTasks: StudyTask[] = [];
  let chapterIndex = 0;

  for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
    const dayDate = new Date(baseDateZero.getTime() + dayOffset * 86400000);
    const dayStr = dayDate.toISOString().split('T')[0];

    // Existing minutes already scheduled and preserved on this day
    const alreadyScheduledMinutes = preservedTasks
      .filter(t => t.date === dayStr)
      .reduce((sum, t) => sum + (t.durationMinutes || 0), 0);

    let availableMinutes = Math.max(0, targetDailyHours * 60 - alreadyScheduledMinutes);

    let startHour = 16;
    let startMinute = 0;

    while (availableMinutes >= 45 && chapterIndex < activeChapters.length) {
      const chapter = activeChapters[chapterIndex];
      const sessionDuration = Math.min(60, availableMinutes);
      const timeStr = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;

      // Select task type balanced by chapter difficulty
      let taskType: TaskType = 'theory';
      if (chapter.difficulty === 'Hard') taskType = 'numerical';
      else if (chapter.status === 'needs_revision') taskType = 'revision';
      else if (chapter.confidence === 'strong') taskType = 'cq';

      const chapterTitle = language === 'bn' ? (chapter.nameBn || chapter.nameEn) : chapter.nameEn;
      const taskSuffix =
        taskType === 'numerical' ? 'Problem Solving' :
        taskType === 'revision' ? 'Quick Revision' :
        taskType === 'cq' ? 'Board CQ Practice' : 'Core Concepts';

      newFutureTasks.push({
        id: `det_${Date.now()}_${dayOffset}_${chapterIndex}_${Math.random().toString(36).substring(2, 6)}`,
        subjectId: chapter.subjectId,
        chapterId: chapter.id,
        title: `${chapterTitle}: ${taskSuffix}`,
        date: dayStr,
        startTime: timeStr,
        durationMinutes: sessionDuration,
        priority: chapter.priority,
        taskType,
        completed: false,
        scheduledBy: 'rule',
        reason: `Scheduled based on ${chapter.priority} priority & deadline (${chapter.deadlineDate || 'None'})`,
      });

      availableMinutes -= sessionDuration;
      startMinute += sessionDuration + 10; // 10 min break
      if (startMinute >= 60) {
        startHour += Math.floor(startMinute / 60);
        startMinute = startMinute % 60;
      }

      chapterIndex = (chapterIndex + 1) % activeChapters.length;
      if (chapterIndex === 0) break;
    }
  }

  return [...preservedTasks, ...newFutureTasks];
}
