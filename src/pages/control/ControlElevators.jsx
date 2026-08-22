import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/presentation';

export default function ControlElevators({ elevators }) {
  return (
    <>
      <section className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-sm-between gap-4 pb-4 border-bottom"><div><p className="eyebrow eyebrow--dark">Parque monitorado</p><h1>Elevadores</h1></div><span className="badge bg-white text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">{elevators.filter((item) => item.status === 'operando').length} operando</span></section>
      <section className="row g-4 mt-2">
        {elevators.map((elevator) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={elevator.id}>
            <article
              className="bg-white border rounded shadow-sm p-4 d-flex flex-column"
              style={{ minHeight: '340px', borderTop: elevator.recurrent ? '4px solid var(--color-severity-high)' : '1px solid var(--color-border)' }}
            >
              <header className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                <p className="text-primary fw-bold text-uppercase mb-0" style={{ fontSize: '0.75rem', letterSpacing: '0.08em', lineHeight: 1.45 }}>{elevator.client.name}</p>
                <StatusBadge value={elevator.status} />
              </header>
              <div className="mb-4 flex-grow-1">
                <h2 className="fs-5 mb-1 text-dark" style={{ fontWeight: 750, lineHeight: 1.35 }}>{elevator.identification}</h2>
                <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>{elevator.model}</p>
              </div>
              <dl className="d-grid gap-3 pt-4 border-top m-0">
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Última manutenção</dt><dd className="fw-bold mb-0 text-dark" style={{ fontSize: '0.84rem' }}>{formatDate(elevator.lastMaintenance)}</dd></div>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Último chamado</dt><dd className="fw-bold mb-0 text-dark" style={{ fontSize: '0.84rem' }}>{elevator.lastOccurrence ? formatDateTime(elevator.lastOccurrence.time) : 'Sem registro recente'}</dd></div>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Ocorrências recentes</dt><dd className="fw-bold mb-0 text-dark" style={{ fontSize: '0.84rem' }}>{elevator.recentOccurrenceCount}</dd></div>
              </dl>
              {elevator.recurrent && (
                <div className="d-flex flex-column mt-4 p-3 rounded" style={{ borderLeft: '4px solid var(--color-severity-high)', backgroundColor: 'var(--color-severity-high-soft)' }}>
                  <strong style={{ color: 'var(--color-severity-high-text)', fontSize: '0.78rem' }}>Reincidência elevada</strong>
                  <span className="text-secondary" style={{ fontSize: '0.7rem' }}>{elevator.recentOccurrenceCount} ocorrências nos últimos 30 dias</span>
                </div>
              )}
            </article>
          </div>
        ))}
      </section>
    </>
  );
}
