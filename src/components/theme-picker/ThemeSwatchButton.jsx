import { useTheme } from '../../theme/ThemeContext';

export function ThemeSwatchButton({ themeOption, isActive, onSelect }) {
  const activeTheme = useTheme();

  return (
    <button
      onClick={() => onSelect(themeOption.key)}
      className="px-3 py-1 rounded-full text-xs flex items-center gap-1.5"
      style={{
        background: isActive ? activeTheme.surface : 'transparent',
        border: `1px solid ${isActive ? activeTheme.ink : activeTheme.border}`,
        color: activeTheme.ink,
        fontWeight: isActive ? 600 : 400,
      }}
    >
      <span
        style={{ width: 8, height: 8, borderRadius: 9999, background: themeOption.palette[0] }}
        className="inline-block"
      />
      {themeOption.name}
    </button>
  );
}
