import { usePersistedState } from './usePersistedState';
import { THEMES, DEFAULT_THEME_KEY } from '../theme/themes';

const STORAGE_KEY = 'identity-habits-theme-v1';

// Themes are stored as their plain key. If an old key is found (like "gris" or "naturaleza"),
// the fallback logic will migrate them to the new DEFAULT_THEME_KEY (azul).
export function useThemeChoice() {
  const [themeKey, setThemeKey] = usePersistedState(STORAGE_KEY, DEFAULT_THEME_KEY, {
    serialize: (v) => v,
    deserialize: (raw) => (THEMES[raw] ? raw : DEFAULT_THEME_KEY),
  });

  const theme = THEMES[themeKey] || THEMES[DEFAULT_THEME_KEY];
  return { theme, themeKey, setThemeKey };
}
