export default function OperatorStateMessage({ type, title, children }) {
  return (
    <section className={`operator-state operator-state--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span className="operator-state__icon" aria-hidden="true">{type === 'loading' ? '' : type === 'error' ? '!' : '✓'}</span>
      <div><h2>{title}</h2><p>{children}</p></div>
    </section>
  );
}
