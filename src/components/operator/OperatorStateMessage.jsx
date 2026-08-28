export default function OperatorStateMessage({ type, title, children }) {
  return (
    <section className="d-flex align-items-center gap-4 p-4 border rounded app-card" style={{ minHeight: '150px', borderLeft: type === 'error' ? '4px solid var(--color-severity-critical)' : '1px solid var(--color-border)' }} role={type === 'error' ? 'alert' : 'status'}>
      {type === 'loading' ? (
        <div className="spinner-border text-primary flex-shrink-0" style={{ width: '42px', height: '42px', borderWidth: '3px' }} role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      ) : (
        <span className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle" style={{ width: '42px', height: '42px', color: type === 'error' ? 'var(--color-severity-critical-text)' : 'var(--color-on-primary)', backgroundColor: type === 'error' ? 'var(--color-severity-critical-soft)' : 'var(--color-primary-action)', fontWeight: 800 }} aria-hidden="true">
          {type === 'error' ? '!' : '✓'}
        </span>
      )}
      <div><h2 className="fs-5 mb-1" style={{ color: 'var(--color-text)' }}>{title}</h2><p className="mb-0 text-secondary">{children}</p></div>
    </section>
  );
}
