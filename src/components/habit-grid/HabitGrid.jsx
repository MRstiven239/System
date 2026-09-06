import { useTheme } from '../../theme/ThemeContext';
import { buildColumns } from './gridColumns';
import { GridHeaderRow } from './GridHeaderRow';
import { HabitRow } from './HabitRow';

export function HabitGrid({ habits, range, anchorDate, today, onToggleDay, onOpenModal, onJumpToMonth, pulseKeyFor }) {
  const theme = useTheme();
  const columns = buildColumns(range, anchorDate);

  return (
    <div className="overflow-x-auto rounded-2xl" style={{ background: theme.surface, border: `1px solid ${theme.border}` }}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <GridHeaderRow columns={columns} range={range} />
        </thead>
        <tbody>
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              columns={columns}
              range={range}
              today={today}
              onToggleDay={onToggleDay}
              onOpenModal={onOpenModal}
              onJumpToMonth={onJumpToMonth}
              pulseKey={pulseKeyFor(habit.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
