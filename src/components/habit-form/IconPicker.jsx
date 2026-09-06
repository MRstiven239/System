import { useTheme } from '../../theme/ThemeContext';
import { hexToRgba } from '../../domain/color';

const ICON_PRESETS = ['🧘', '📖', '🏃', '💧', '🖊️', '🎨', '🌱', '🥗', '😴', '💪', '🧹', '🎯', '🙏', '🚭', '📵', '🎵', '☀️', '🧠'];

export function IconPicker({ value, onChange, accentColor }) {
  const theme = useTheme();

  return (
    <div>
      <label className="text-sm block mb-2" style={{ color: theme.ink }}>Ícono</label>
      <div className="flex flex-wrap gap-1.5">
        {ICON_PRESETS.map((icon) => (
          <button
            type="button"
            key={icon}
            onClick={() => onChange(icon)}
            className="w-9 h-9 rounded-lg text-lg flex items-center justify-center select-none"
            style={{
              background: value === icon ? hexToRgba(accentColor, 0.2) : theme.surface,
              border: `1.5px solid ${value === icon ? accentColor : theme.border}`,
            }}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
