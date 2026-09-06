import { addDays, dateKey, daysInMonth, pad, startOfWeek, WEEKDAY_SHORT, MONTH_SHORT } from '../../domain/dates';

/**
 * Returns the columns to render for the given range/anchor combination.
 * Kept out of the component so the "what does a week/month/year look
 * like as columns" rule can be tested and changed without touching JSX.
 */
export function buildColumns(range, anchorDate) {
  if (range === 'week') {
    const s = startOfWeek(anchorDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(s, i);
      return { key: dateKey(d), label: WEEKDAY_SHORT[i], sublabel: d.getDate(), date: d };
    });
  }

  if (range === 'month') {
    const n = daysInMonth(anchorDate.getFullYear(), anchorDate.getMonth());
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), i + 1);
      return { key: dateKey(d), label: i + 1, date: d };
    });
  }

  // year
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(anchorDate.getFullYear(), i, 1);
    return { key: `${anchorDate.getFullYear()}-${pad(i + 1)}`, label: MONTH_SHORT[i], date: d };
  });
}
