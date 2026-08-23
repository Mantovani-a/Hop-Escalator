export default function MetricCard({ label, value, detail, tone = 'default' }) {
  const accentColor = tone === 'critical'
    ? 'var(--color-severity-critical)'
    : tone === 'success'
      ? 'var(--color-severity-low)'
      : 'var(--color-primary-action)';

  return (
    <article className="app-card position-relative p-3 overflow-hidden h-100 d-flex flex-column justify-content-between" style={{ minWidth: 0, minHeight: '112px' }}>
      <div className="position-absolute top-0 bottom-0 start-0" style={{ width: '4px', backgroundColor: accentColor }} />
      <div>
        <span className="d-block text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>{label}</span>
        <strong className="d-block my-1" style={{ color: 'var(--color-text)', fontSize: 'clamp(1.5rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{value}</strong>
      </div>
      <span className="d-block text-secondary" style={{ fontSize: '0.74rem' }}>{detail}</span>
    </article>
  );
}
