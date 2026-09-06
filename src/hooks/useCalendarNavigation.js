import { useCallback, useMemo, useState } from 'react';
import { addDays, cap, startOfWeek, MONTH_NAMES, MONTH_SHORT } from '../domain/dates';

export function useCalendarNavigation(initialRange = 'month') {
  const [range, setRange] = useState(initialRange);
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const goToPrevious = useCallback(() => {
    setAnchorDate((d) => {
      if (range === 'week') return addDays(d, -7);
      if (range === 'month') return new Date(d.getFullYear(), d.getMonth() - 1, 1);
      return new Date(d.getFullYear() - 1, d.getMonth(), 1);
    });
  }, [range]);

  const goToNext = useCallback(() => {
    setAnchorDate((d) => {
      if (range === 'week') return addDays(d, 7);
      if (range === 'month') return new Date(d.getFullYear(), d.getMonth() + 1, 1);
      return new Date(d.getFullYear() + 1, d.getMonth(), 1);
    });
  }, [range]);

  const jumpToMonth = useCallback((date) => {
    setRange('month');
    setAnchorDate(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);

  const label = useMemo(() => {
    if (range === 'week') {
      const s = startOfWeek(anchorDate);
      const e = addDays(s, 6);
      if (s.getMonth() === e.getMonth()) {
        return `${s.getDate()}–${e.getDate()} de ${cap(MONTH_NAMES[e.getMonth()])} ${e.getFullYear()}`;
      }
      return `${s.getDate()} ${MONTH_SHORT[s.getMonth()]} – ${e.getDate()} ${MONTH_SHORT[e.getMonth()]} ${e.getFullYear()}`;
    }
    if (range === 'month') return `${cap(MONTH_NAMES[anchorDate.getMonth()])} ${anchorDate.getFullYear()}`;
    return `${anchorDate.getFullYear()}`;
  }, [range, anchorDate]);

  return { range, setRange, anchorDate, goToPrevious, goToNext, jumpToMonth, label };
}
