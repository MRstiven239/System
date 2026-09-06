// A "growth ring" is a calendar month where the habit was kept at
// least 60% of the time. Unlike root depth, this count never
// decreases — it's a permanent record, like a tree's rings.

import { parseKey } from './dates';
import { periodStats } from './progress';

const RING_THRESHOLD = 0.6;

export function growthRingsCount(habit, referenceDate) {
  const start = parseKey(habit.startDate);
  let rings = 0;
  let cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);

  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const monthStart = new Date(y, m, 1);
    const monthEnd = new Date(y, m + 1, 0);
    const rangeStart = monthStart < start ? start : monthStart;
    const rangeEnd = monthEnd > referenceDate ? referenceDate : monthEnd;

    if (rangeEnd >= rangeStart) {
      const { expected, completed } = periodStats(habit, rangeStart, rangeEnd);
      if (expected > 0 && completed / expected >= RING_THRESHOLD) rings++;
    }
    cursor = new Date(y, m + 1, 1);
  }

  return rings;
}
