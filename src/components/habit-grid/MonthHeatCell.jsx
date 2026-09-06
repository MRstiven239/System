import { useTheme } from '../../theme/ThemeContext';
import { hexToRgba } from '../../domain/color';
import { monthCompletionRate } from '../../domain/progress';

export function MonthHeatCell({ habit, monthDate, today, color, onJumpToMonth }) {
  const theme = useTheme();
  const rate = monthCompletionRate(habit, monthDate.getFullYear(), monthDate.getMonth(), today);

  return (
    <td className="px-1 py-2 text-center">
      <button
        onClick={() => onJumpToMonth(monthDate)}
        title={rate === null ? 'Aún no llega este mes' : `${Math.round(rate * 100)}% completado`}
        className="w-7 h-7 rounded-md mx-auto block"
        style={{
          background: rate === null ? 'transparent' : hexToRgba(color, 0.15 + rate * 0.7),
          border: `1px solid ${theme.border}`,
        }}
      />
    </td>
  );
}
