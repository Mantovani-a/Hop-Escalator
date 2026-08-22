export default function FeedbackMessage({ tone = 'info', title, children }) {
  return (
    <div className="d-flex gap-3 mt-4 p-4 border rounded" style={{ borderLeft: `4px solid ${tone === 'success' ? 'var(--color-severity-low)' : 'var(--color-primary-action)'}`, backgroundColor: tone === 'success' ? 'var(--color-severity-low-soft)' : 'var(--color-primary-soft)' }} role="status">
      <span className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '1.4rem', height: '1.4rem', border: '1px solid currentColor', color: 'var(--color-primary-action)', fontSize: '0.8rem', fontWeight: 800 }} aria-hidden="true">i</span>
      <div>
        <strong className="text-dark">{title}</strong>
        <p className="mt-1 mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>{children}</p>
      </div>
    </div>
  );
}
