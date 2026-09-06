import { useTheme } from '../../theme/ThemeContext';
import { WEEKDAY_LETTER } from '../../domain/dates';

const FREQUENCY_TYPES = [
  ['daily', 'Todos los días'],
  ['days', 'Días específicos'],
  ['weekly', 'X veces por semana'],
];

export function FrequencyPicker({ freqType, onFreqTypeChange, days, onToggleDay, timesPerWeek, onTimesPerWeekChange, accentColor }) {
  const theme = useTheme();

  return (
    <div>
      <label className="text-sm block mb-2" style={{ color: theme.ink }}>Frecuencia</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {FREQUENCY_TYPES.map(([value, label]) => (
          <button
            type="button"
            key={value}
            onClick={() => onFreqTypeChange(value)}
            className="px-3 py-1.5 rounded-full text-xs"
            style={{
              background: freqType === value ? theme.ink : theme.surface,
              color: freqType === value ? theme.onInk : theme.ink,
              border: `1px solid ${freqType === value ? theme.ink : theme.border}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {freqType === 'days' && (
        <div className="flex gap-1.5">
          {WEEKDAY_LETTER.map((letter, i) => (
            <button
              type="button"
              key={i}
              onClick={() => onToggleDay(i)}
              className="w-8 h-8 rounded-full text-xs"
              style={{
                background: days.includes(i) ? accentColor : theme.surface,
                color: days.includes(i) ? '#fff' : theme.ink,
                border: `1px solid ${days.includes(i) ? accentColor : theme.border}`,
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {freqType === 'weekly' && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="7"
            value={timesPerWeek}
            onChange={(e) => onTimesPerWeekChange(e.target.value)}
            className="w-16 rounded-lg px-2 py-1.5 text-sm outline-none"
            style={{ border: `1px solid ${theme.border}`, background: theme.surface, color: theme.ink }}
          />
          <span className="text-sm" style={{ color: theme.inkMuted }}>veces por semana</span>
        </div>
      )}
    </div>
  );
}
