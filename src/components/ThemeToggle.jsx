import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ compact = false }) {
  const { theme, toggleTheme } = useTheme();
  const nextThemeLabel = theme === 'dark' ? 'claro' : 'escuro';
  return (
    <button
      className={`theme-toggle${compact ? ' theme-toggle--compact' : ''}`}
      type="button"
      onClick={toggleTheme}
      aria-label={`Ativar modo ${nextThemeLabel}`}
      title={`Ativar modo ${nextThemeLabel}`}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☀' : '◐'}</span>
      {!compact && <span>{theme === 'dark' ? 'Modo claro' : 'Modo escuro'}</span>}
    </button>
  );
}
