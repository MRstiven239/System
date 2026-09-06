import { useTheme } from '../../theme/ThemeContext';
import { dateKey, daysInMonth, MONTH_SHORT } from '../../domain/dates';

/**
 * Year heatmap showing habit activity across 12 months.
 * Each month is rendered as a mini grid of colored dots.
 */
export function YearHeatmap({ habit, today }) {
  const theme = useTheme();
  const year = today.getFullYear();
  const color = habit.color;

  // Precompute completed keys into a Set for O(1) lookup
  const completedSet = new Set(habit.completions);

  return (
    <div className="mt-3">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
        }}
      >
        {Array.from({ length: 12 }).map((_, monthIdx) => {
          const totalDays = daysInMonth(year, monthIdx);
          const firstDayOfWeek = (new Date(year, monthIdx, 1).getDay() + 6) % 7;
          const isFutureMonth = new Date(year, monthIdx, 1) > today;

          // Count completed days this month
          let completedCount = 0;
          for (let d = 1; d <= totalDays; d++) {
            const dKey = dateKey(new Date(year, monthIdx, d));
            if (completedSet.has(dKey)) completedCount++;
          }

          return (
            <div
              key={monthIdx}
              style={{
                opacity: isFutureMonth ? 0.3 : 1,
                padding: '6px',
                borderRadius: '8px',
                background: theme.surfaceAlt,
                border: `1px solid ${theme.border}`,
              }}
            >
              {/* Month label + count */}
              <div className="flex justify-between items-center mb-2">
                <span style={{ fontSize: '10px', fontWeight: 600, color: theme.ink }}>
                  {MONTH_SHORT[monthIdx]}
                </span>
                {completedCount > 0 && (
                  <span style={{ fontSize: '9px', color, fontWeight: 600 }}>
                    {completedCount}d
                  </span>
                )}
              </div>

              {/* Mini dot grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '1px',
                }}
              >
                {/* Padding for first day offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`pad-${i}`} />
                ))}

                {Array.from({ length: totalDays }).map((_, dayIdx) => {
                  const d = dayIdx + 1;
                  const date = new Date(year, monthIdx, d);
                  const dKey = dateKey(date);
                  const isDone = completedSet.has(dKey);
                  const isFuture = date > today;

                  return (
                    <div
                      key={dKey}
                      style={{
                        width: '100%',
                        aspectRatio: '1',
                        borderRadius: '50%',
                        background: isDone ? color : theme.border,
                        opacity: isFuture ? 0.1 : isDone ? 1 : 0.2,
                        transition: 'background 0.15s ease',
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
