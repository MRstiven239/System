// Aggregate progress math over a date range. This is the one function
// that streaks, root depth and growth rings all build on, so it lives
// on its own — change how "expected days" is computed once, and every
// derived stat stays consistent.

import { addDays, dateKey, parseKey } from './dates';
import { isRequiredDay } from './habit';

/**
 * Counts how many days in [rangeStart, rangeEnd] were "required" by the
 * habit's frequency, and how many of those were actually completed.
 * For weekly-target habits, "expected" is scaled to the target rate
 * instead of counting every day.
 */
export function periodStats(habit, rangeStart, rangeEnd) {
  let daysCount = 0;
  let completed = 0;
  for (let d = rangeStart; d <= rangeEnd; d = addDays(d, 1)) {
    if (isRequiredDay(habit.frequency, d)) {
      daysCount++;
      if (habit.completions.includes(dateKey(d))) completed++;
    }
  }
  let expected = daysCount;
  if (habit.frequency.type === 'weekly') {
    expected = Math.max(1, Math.round((daysCount / 7) * habit.frequency.timesPerWeek));
  }
  return { expected: Math.max(expected, 0), completed };
}

export function monthCompletionRate(habit, year, month, referenceDate) {
  const start = parseKey(habit.startDate);
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  if (monthStart > referenceDate) return null;

  const rangeStart = monthStart < start ? start : monthStart;
  const rangeEnd = monthEnd > referenceDate ? referenceDate : monthEnd;
  if (rangeEnd < rangeStart) return null;

  const { expected, completed } = periodStats(habit, rangeStart, rangeEnd);
  return expected === 0 ? 0 : Math.min(1, completed / expected);
}
