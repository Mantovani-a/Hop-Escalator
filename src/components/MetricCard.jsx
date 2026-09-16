import { ModuleIcon } from './ModuleSidebar';

export default function MetricCard({ label, value, detail, tone = 'default', icon }) {
  const accents = {
    critical: ['var(--color-severity-critical)', 'alert'],
    success: ['var(--color-severity-low)', 'users'],
    violet: ['var(--color-accent-violet)', 'users'],
    default: ['var(--color-primary-action)', 'phone'],
  };
  const [accentColor, defaultIcon] = accents[tone] || accents.default;

  return (
    <article
      className="app-card metric-card h-100"
      style={{ '--metric-accent': accentColor }}
      aria-label={`${label}: ${value}${detail ? `. ${detail}` : ''}`}
    >
      <div className="metric-card__icon"><ModuleIcon name={icon || defaultIcon} /></div>
      <div className="metric-card__content">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </article>
  );
}
