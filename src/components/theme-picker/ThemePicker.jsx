import { THEMES } from '../../theme/themes';
import { useTheme } from '../../theme/ThemeContext';

export function ThemePicker({ activeThemeKey, onSelect }) {
  const theme = useTheme();

  return (
    <div className="flex gap-4">
      {Object.values(THEMES).map((themeOption) => {
        const isActive = activeThemeKey === themeOption.key;
        return (
          <button
            key={themeOption.key}
            onClick={() => onSelect(themeOption.key)}
            className="flex flex-col items-center gap-2 group"
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-105"
              style={{
                background: themeOption.pageBg,
                border: isActive ? `2px solid ${themeOption.accent}` : `2px solid ${themeOption.border}`,
                boxShadow: isActive ? `0 0 0 4px ${themeOption.accentMuted}` : 'none',
              }}
            >
              <div 
                className="w-8 h-8 rounded-full"
                style={{ background: themeOption.accent }}
              />
            </div>
            <span style={{ color: isActive ? theme.ink : theme.inkMuted }} className="text-xs font-medium">
              {themeOption.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
