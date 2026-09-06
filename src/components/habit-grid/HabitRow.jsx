import { useTheme } from '../../theme/ThemeContext';
import { rootDepth, stageIndexFor } from '../../domain/rootDepth';
import { GrowthIllustration } from '../growth-illustration/GrowthIllustration';
import { DayCell } from './DayCell';
import { MonthHeatCell } from './MonthHeatCell';

export function HabitRow({ habit, columns, range, today, onToggleDay, onOpenModal, onJumpToMonth, pulseKey }) {
  const theme = useTheme();
  const stageIndex = stageIndexFor(rootDepth(habit, today));

  return (
    <tr style={{ borderTop: `1px solid ${theme.border}` }}>
      <td className="px-4 py-2 sticky left-0 whitespace-nowrap" style={{ background: theme.surface }}>
        <button onClick={() => onOpenModal(habit.id)} className="flex items-center gap-2 text-left">
          <span>{habit.icon}</span>
          <span style={{ color: theme.ink, fontWeight: 500 }}>{habit.name}</span>
        </button>
      </td>

      {columns.map((column) =>
        range === 'year' ? (
          <MonthHeatCell
            key={column.key}
            habit={habit}
            monthDate={column.date}
            today={today}
            color={habit.color}
            onJumpToMonth={onJumpToMonth}
          />
        ) : (
          <DayCell
            key={column.key}
            dateKeyValue={column.key}
            isDone={habit.completions.includes(column.key)}
            isFuture={column.date > today}
            color={habit.color}
            onToggle={(dateKeyValue) => onToggleDay(habit.id, dateKeyValue)}
          />
        )
      )}

      <td className="px-2 py-2 text-center">
        <GrowthIllustration
          stageIndex={stageIndex}
          color={habit.color}
          mutedInk={theme.inkMuted}
          size={30}
          pulseKey={pulseKey}
        />
      </td>
    </tr>
  );
}
