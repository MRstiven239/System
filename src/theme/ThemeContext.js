import { createContext, useContext } from 'react';
import { THEMES, DEFAULT_THEME_KEY } from './themes';

export const ThemeContext = createContext(THEMES[DEFAULT_THEME_KEY]);

export function useTheme() {
  return useContext(ThemeContext);
}
