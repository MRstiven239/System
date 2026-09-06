import { useTheme } from '../../theme/ThemeContext';

export function ColorPicker({ value, onChange }) {
  const theme = useTheme();

  return (
    <div>
      <label className="text-sm block mb-2" style={{ color: theme.ink }}>
        Color (según el tema "{theme.name}")
      </label>
      <div className="flex flex-wrap gap-2">
        {theme.palette.map((color) => (
          <button
            type="button"
            key={color}
            onClick={() => onChange(color)}
            aria-label={color}
            className="w-7 h-7 rounded-full"
            style={{
              background: color,
              boxShadow: value === color ? `0 0 0 2px ${theme.surface}, 0 0 0 4px ${color}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
