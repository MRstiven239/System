import { useTheme } from '../../theme/ThemeContext';

export function Stat({ label, value }) {
  const theme = useTheme();
  return (
    <div>
      <div style={{ color: theme.inkMuted }} className="text-xs mb-0.5">{label}</div>
      <div style={{ color: theme.ink }} className="font-medium">{value}</div>
    </div>
  );
}
