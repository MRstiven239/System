import { useTheme } from '../../theme/ThemeContext';

export function DayCell({ dateKeyValue, isDone, isFuture, color, onToggle }) {
  const theme = useTheme();

  return (
    <td className="px-1 py-2 text-center">
      <button
        disabled={isFuture}
        onClick={() => onToggle(dateKeyValue)}
        title={dateKeyValue}
        className="w-6 h-6 rounded-full mx-auto block transition-transform active:scale-90"
        style={{
          background: isDone ? color : 'transparent',
          border: `1.5px solid ${isDone ? color : theme.border}`,
          opacity: isFuture ? 0.3 : 1,
          cursor: isFuture ? 'default' : 'pointer',
        }}
      />
    </td>
  );
}
