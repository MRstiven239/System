import { useTheme } from '../../theme/ThemeContext';
import { addDays, dateKey, startOfWeek, WEEKDAY_SHORT } from '../../domain/dates';

export function MiniWeekCalendar({ habit, today, onToggleDay }) {
  const theme = useTheme();
  const start = startOfWeek(today);

  return (
    <div className="flex justify-between items-center w-full mt-3">
      {Array.from({ length: 7 }).map((_, i) => {
        const d = addDays(start, i);
        const dKey = dateKey(d);
        const isDone = habit.completions.includes(dKey);
        const isFuture = d > today;
        const color = habit.color;

        return (
          <div key={dKey} className="flex flex-col items-center gap-1.5">
            <span style={{ fontSize: '10px', color: theme.inkFaint }}>
              {WEEKDAY_SHORT[i][0]}
            </span>
            <button
              disabled={isFuture}
              onClick={(e) => {
                e.stopPropagation();
                onToggleDay(dKey);
              }}
              title={dKey}
              className="w-5 h-5 rounded-full transition-transform active:scale-110"
              style={{
                background: isDone ? color : 'transparent',
                border: `1.5px solid ${isDone ? color : theme.border}`,
                opacity: isFuture ? 0.2 : 1,
                cursor: isFuture ? 'default' : 'pointer',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
