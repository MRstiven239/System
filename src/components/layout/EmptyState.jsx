import { useTheme } from '../../theme/ThemeContext';

export function EmptyState({ onCreateFirst }) {
  const theme = useTheme();

  return (
    <div className="text-center py-16 rounded-2xl" style={{ border: `1px dashed ${theme.border}` }}>
      <p style={{ fontFamily: 'Fraunces, serif', color: theme.ink }} className="text-lg mb-2">
        Aún no has plantado ningún hábito.
      </p>
      <p style={{ color: theme.inkMuted }} className="text-sm mb-5 max-w-sm mx-auto">
        Elige quién quieres ser, y empieza por un solo día.
      </p>
      <button
        onClick={onCreateFirst}
        className="rounded-full px-5 py-2.5 text-sm font-medium"
        style={{ background: theme.ink, color: theme.onInk }}
      >
        Plantar mi primer hábito
      </button>
    </div>
  );
}
