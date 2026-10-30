import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseTimeMinutes,
  calculateDurationMinutes,
  validateScheduleInput,
  filterAndSortSchedules,
  computeDailyStats,
  buildMonthGrid,
  createInitialSchedules,
} from './scheduleLogic';

test('parseTimeMinutes and calculateDurationMinutes compute accurate durations', () => {
  assert.equal(parseTimeMinutes('09:30'), 570);
  assert.equal(parseTimeMinutes('invalid'), -1);
  assert.equal(calculateDurationMinutes('09:00', '10:30'), 90);
  assert.equal(calculateDurationMinutes('14:00', '13:00'), 0);
});

test('validateScheduleInput rejects empty title or invalid time range', () => {
  const emptyTitle = validateScheduleInput({
    title: '   ',
    date: '2026-10-29',
    startTime: '09:00',
    endTime: '10:00',
  });
  assert.equal(emptyTitle.valid, false);

  const reversedTime = validateScheduleInput({
    title: '디자인 리뷰',
    date: '2026-10-29',
    startTime: '15:00',
    endTime: '14:00',
  });
  assert.equal(reversedTime.valid, false);

  const validItem = validateScheduleInput({
    title: '디자인 리뷰',
    date: '2026-10-29',
    startTime: '14:00',
    endTime: '15:30',
  });
  assert.equal(validItem.valid, true);
});

test('filterAndSortSchedules filters by date, category, status, and query and sorts chronologically', () => {
  const seed = createInitialSchedules('2026-10-29');
  const dayItems = filterAndSortSchedules(seed, { date: '2026-10-29' });
  assert.equal(dayItems.length, 5);
  assert.equal(dayItems[0].startTime, '09:00');
  assert.equal(dayItems[4].startTime, '19:00');

  const workOnly = filterAndSortSchedules(seed, {
    date: '2026-10-29',
    category: 'work',
  });
  assert.equal(workOnly.length, 1);
  assert.equal(workOnly[0].id, 'sched-2');

  const completedOnly = filterAndSortSchedules(seed, {
    date: '2026-10-29',
    status: 'completed',
  });
  assert.equal(completedOnly.length, 2);

  const searchMatch = filterAndSortSchedules(seed, {
    searchQuery: '스트레칭',
  });
  assert.equal(searchMatch.length, 1);
  assert.equal(searchMatch[0].id, 'sched-5');
});

test('computeDailyStats calculates completion percentage and planned minutes', () => {
  const seed = createInitialSchedules('2026-10-29');
  const stats = computeDailyStats(seed, '2026-10-29');
  assert.equal(stats.totalCount, 5);
  assert.equal(stats.completedCount, 2);
  assert.equal(stats.pendingCount, 3);
  assert.equal(stats.completionRate, 40);
  assert.equal(stats.totalPlannedMinutes, 45 + 90 + 120 + 60 + 60);
  assert.equal(stats.completedMinutes, 45 + 90);
});

test('buildMonthGrid generates valid 35 or 42 cell matrix with event counts', () => {
  const seed = createInitialSchedules('2026-10-29');
  const cells = buildMonthGrid(2026, 9, '2026-10-29', seed); // October 2026 (month index 9)
  assert.ok(cells.length === 35 || cells.length === 42);
  const todayCell = cells.find((c) => c.dateStr === '2026-10-29');
  assert.ok(todayCell);
  assert.equal(todayCell.isToday, true);
  assert.equal(todayCell.totalEvents, 5);
  assert.equal(todayCell.completedEvents, 2);
});
