import { addDays, dateKey } from './dates';
import { isRequiredDay } from './habit';

/**
 * Current consecutive-day streak, walking backward from `referenceDate`.
 * Weekly-target habits don't have a meaningful day-streak (use
 * weeklyProgress instead), so this returns null for them.
 *
 * Grace rule: if today is required but not yet completed, we don't
 * treat that as "broken" — the day isn't over yet. We simply don't
 * count today and start evaluating from yesterday.
 */
export function currentStreak(habit, referenceDate) {
  if (habit.frequency.type === 'weekly') return null;

  let count = 0;
  let cursor = referenceDate;

  if (isRequiredDay(habit.frequency, cursor) && !habit.completions.includes(dateKey(cursor))) {
    cursor = addDays(cursor, -1);
  }

  while (dateKey(cursor) >= habit.startDate) {
    if (isRequiredDay(habit.frequency, cursor)) {
      if (habit.completions.includes(dateKey(cursor))) count++;
      else break;
    }
    cursor = addDays(cursor, -1);
  }

  return count;
}
