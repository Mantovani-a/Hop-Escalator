export default function MetricCard({ label, value, detail, tone = 'default' }) {
  return (
    <article className="app-card position-relative border rounded p-4 overflow-hidden" style={{ minWidth: 0 }}>
      <div className="position-absolute top-0 bottom-0 start-0" style={{ width: '4px', backgroundColor: tone === 'critical' ? 'var(--color-severity-critical)' : tone === 'success' ? 'var(--color-severity-low)' : 'var(--color-primary-action)' }} />
      <span className="d-block text-secondary" style={{ fontSize: '0.78rem' }}>{label}</span>
      <strong className="d-block my-2" style={{ color: 'var(--color-text)', fontSize: 'clamp(1.55rem, 6vw, 2.15rem)', lineHeight: 1 }}>{value}</strong>
      <span className="d-block text-secondary" style={{ fontSize: '0.78rem' }}>{detail}</span>
    </article>
  );
}
