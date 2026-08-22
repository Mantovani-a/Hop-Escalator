import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const THEME_STORAGE_KEY = 'hop-theme';

const ThemeContext = createContext(null);

const readPreferredTheme = () => {
  let storedTheme = null;
  try { storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY); } catch { storedTheme = null; }
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initialTheme = readPreferredTheme();
    applyTheme(initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    const colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!colorScheme) return undefined;
    const followSystemTheme = (event) => {
      try { if (window.localStorage.getItem(THEME_STORAGE_KEY)) return; } catch { /* segue o sistema */ }
      const nextTheme = event.matches ? 'dark' : 'light';
      applyTheme(nextTheme);
      setTheme(nextTheme);
    };
    colorScheme.addEventListener('change', followSystemTheme);
    return () => colorScheme.removeEventListener('change', followSystemTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
      try { window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme); } catch { /* preferência mantida na sessão */ }
      applyTheme(nextTheme);
      return nextTheme;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme deve ser utilizado dentro de ThemeProvider.');
  return context;
};
