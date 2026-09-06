import { useTheme } from '../../theme/ThemeContext';

const RANGE_OPTIONS = [
  ['week', 'Semana'],
  ['month', 'Mes'],
  ['year', 'Año'],
];

export function RangePicker({ range, onChange }) {
  const theme = useTheme();

  return (
    <div className="inline-flex rounded-full p-1" style={{ background: theme.surfaceAlt }}>
      {RANGE_OPTIONS.map(([value, label]) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className="px-3.5 py-1.5 rounded-full text-sm"
          style={{
            background: range === value ? theme.surface : 'transparent',
            color: theme.ink,
            fontWeight: range === value ? 600 : 400,
            boxShadow: range === value ? '0 1px 2px rgba(0,0,0,0.12)' : 'none',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
