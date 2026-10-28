import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDaysBetween,
  calculateWorkloadMetrics,
  sortChaptersForScheduling,
  runDeterministicRebalance
} from './scheduler';
import { Chapter, StudyTask } from '../types';

test('calculateDaysBetween calculates accurate day differences', () => {
  assert.equal(calculateDaysBetween('2026-10-01', '2026-10-10'), 9);
  assert.equal(calculateDaysBetween('2026-10-10', '2026-10-10'), 0);
  assert.equal(calculateDaysBetween('2026-10-10', '2026-10-05'), 0); // clamp at 0
});

test('calculateWorkloadMetrics computes syllabus progress and feasibility', () => {
  const dummyChapters: Chapter[] = [
    {
      id: 'ch_1',
      subjectId: 'sub_phy',
      nameEn: 'Vector',
      nameBn: 'ভেক্টর',
      topics: ['Dot product', 'Cross product'],
      estimatedHours: 6,
      priority: 'high',
      difficulty: 'Medium',
      deadlineDate: '2026-11-15',
      status: 'completed',
      confidence: 'strong',
      subtasks: [],
      resourceLinks: []
    },
    {
      id: 'ch_2',
      subjectId: 'sub_phy',
      nameEn: 'Dynamics',
      nameBn: 'গতিবিদ্যা',
      topics: ['Projectile'],
      estimatedHours: 10,
      priority: 'urgent',
      difficulty: 'Hard',
      deadlineDate: '2026-11-10',
      status: 'in_progress',
      confidence: 'weak',
      subtasks: [],
      resourceLinks: []
    }
  ];

  const today = new Date('2026-10-28T00:00:00Z');
  const metrics = calculateWorkloadMetrics(dummyChapters, '2026-11-05', 4, today);

  assert.equal(metrics.totalSyllabusHours, 16);
  assert.equal(metrics.remainingSyllabusHours, 10);
  assert.equal(metrics.overallProgressPercentage, 38); // (16 - 10) / 16 = 37.5% -> 38%
  assert.equal(metrics.daysUntilTargetExam, 8); // Oct 28 to Nov 5 = 8 days
  assert.equal(metrics.availableStudyHoursBeforeTarget, 32); // 8 * 4 = 32 hours
  assert.equal(metrics.isWorkloadFeasible, true); // 10 <= 32
});

test('sortChaptersForScheduling places needs_revision first, followed by urgent priority and hardness', () => {
  const chapters: Chapter[] = [
    {
      id: 'ch_easy',
      subjectId: 'sub_1',
      nameEn: 'Easy Chapter',
      nameBn: 'সহজ',
      topics: [],
      estimatedHours: 4,
      priority: 'low',
      difficulty: 'Easy',
      deadlineDate: '2026-12-01',
      status: 'in_progress',
      confidence: 'average',
      subtasks: [],
      resourceLinks: []
    },
    {
      id: 'ch_urgent',
      subjectId: 'sub_1',
      nameEn: 'Urgent Hard Chapter',
      nameBn: 'জরুরি কঠিন',
      topics: [],
      estimatedHours: 8,
      priority: 'urgent',
      difficulty: 'Hard',
      deadlineDate: '2026-11-01',
      status: 'in_progress',
      confidence: 'weak',
      subtasks: [],
      resourceLinks: []
    },
    {
      id: 'ch_revision',
      subjectId: 'sub_1',
      nameEn: 'Needs Revision Chapter',
      nameBn: 'রিভিশন',
      topics: [],
      estimatedHours: 5,
      priority: 'medium',
      difficulty: 'Medium',
      deadlineDate: '2026-11-20',
      status: 'needs_revision',
      confidence: 'average',
      subtasks: [],
      resourceLinks: []
    },
    {
      id: 'ch_completed',
      subjectId: 'sub_1',
      nameEn: 'Already Done',
      nameBn: 'সম্পন্ন',
      topics: [],
      estimatedHours: 5,
      priority: 'urgent',
      difficulty: 'Hard',
      deadlineDate: '2026-10-01',
      status: 'completed',
      confidence: 'strong',
      subtasks: [],
      resourceLinks: []
    }
  ];

  const sorted = sortChaptersForScheduling(chapters);

  // Completed chapter should be filtered out
  assert.equal(sorted.length, 3);
  // 'needs_revision' must be #1
  assert.equal(sorted[0].id, 'ch_revision');
  // 'urgent' must come before 'low'
  assert.equal(sorted[1].id, 'ch_urgent');
  assert.equal(sorted[2].id, 'ch_easy');
});

test('runDeterministicRebalance preserves completed and past tasks and allocates realistic sessions', () => {
  const baseDate = new Date('2026-10-28T00:00:00Z');

  const existingTasks: StudyTask[] = [
    {
      id: 'past_task_1',
      subjectId: 'sub_1',
      chapterId: 'ch_1',
      title: 'Past Completed Study Session',
      date: '2026-10-25',
      startTime: '10:00',
      durationMinutes: 60,
      priority: 'high',
      taskType: 'theory',
      completed: true,
      scheduledBy: 'manual'
    },
    {
      id: 'future_task_uncompleted',
      subjectId: 'sub_1',
      chapterId: 'ch_1',
      title: 'Outdated Task to be Rebalanced',
      date: '2026-10-29',
      startTime: '16:00',
      durationMinutes: 60,
      priority: 'medium',
      taskType: 'theory',
      completed: false,
      scheduledBy: 'rule'
    }
  ];

  const chapters: Chapter[] = [
    {
      id: 'ch_urgent_hard',
      subjectId: 'sub_phy',
      nameEn: 'Newtonian Mechanics',
      nameBn: 'নিউটনিয়ান বলবিদ্যা',
      topics: ['Friction'],
      estimatedHours: 8,
      priority: 'urgent',
      difficulty: 'Hard',
      deadlineDate: '2026-11-05',
      status: 'in_progress',
      confidence: 'weak',
      subtasks: [],
      resourceLinks: []
    }
  ];

  const rebalanced = runDeterministicRebalance(chapters, existingTasks, 2, 3, 'en', baseDate);

  // Must preserve completed past task
  const hasPastTask = rebalanced.some(t => t.id === 'past_task_1');
  assert.equal(hasPastTask, true);

  // The outdated future uncompleted task should be replaced
  const hasOldFutureTask = rebalanced.some(t => t.id === 'future_task_uncompleted');
  assert.equal(hasOldFutureTask, false);

  // New tasks should be scheduled
  const newTasks = rebalanced.filter(t => t.scheduledBy === 'rule');
  assert.ok(newTasks.length > 0);

  // The urgent hard chapter gets 'numerical' taskType
  assert.equal(newTasks[0].taskType, 'numerical');
  assert.equal(newTasks[0].priority, 'urgent');
});
