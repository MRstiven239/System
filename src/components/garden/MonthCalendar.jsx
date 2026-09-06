import { useTheme } from '../../theme/ThemeContext';
import { dateKey, daysInMonth, WEEKDAY_LETTER } from '../../domain/dates';

/**
 * Compact monthly calendar showing completed days for a single habit.
 * Renders a 7-column grid with the habit's color for completed days.
 */
export function MonthCalendar({ habit, today, onToggleDay }) {
  const theme = useTheme();
  
  const year = today.getFullYear();
  const month = today.getMonth();
  const totalDays = daysInMonth(year, month);
  
  // Day of week for the 1st of the month (Monday = 0 style)
  const firstDate = new Date(year, month, 1);
  const firstDayOfWeek = (firstDate.getDay() + 6) % 7; // Mon=0, Sun=6
  
  const color = habit.color;
  
  // Build cells: empty cells for padding + day cells
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push({ type: 'empty', key: `e${i}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const dKey = dateKey(date);
    const isDone = habit.completions.includes(dKey);
    const isFuture = date > today;
    const isToday = dateKey(date) === dateKey(today);
    cells.push({ type: 'day', key: dKey, day: d, isDone, isFuture, isToday, dKey });
  }
  
  return (
    <div className="mt-3">
      {/* Weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {WEEKDAY_LETTER.map(letter => (
          <div
            key={letter}
            style={{ textAlign: 'center', fontSize: '9px', color: theme.inkFaint, fontWeight: 600, padding: '2px 0' }}
          >
            {letter}
          </div>
        ))}
      </div>
      
      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {cells.map(cell => {
          if (cell.type === 'empty') {
            return <div key={cell.key} />;
          }
          
          return (
            <button
              key={cell.key}
              disabled={cell.isFuture}
              onClick={(e) => {
                e.stopPropagation();
                onToggleDay(cell.dKey);
              }}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: '50%',
                border: cell.isToday ? `2px solid ${color}` : '1.5px solid transparent',
                background: cell.isDone ? color : 'transparent',
                opacity: cell.isFuture ? 0.15 : cell.isDone ? 1 : 0.35,
                cursor: cell.isFuture ? 'default' : 'pointer',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '9px',
                fontWeight: 500,
                color: cell.isDone ? '#fff' : theme.inkMuted,
                padding: 0,
              }}
              title={cell.dKey}
            >
              {cell.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
