import StatusBadge from '../../components/StatusBadge';
import { formatDateTime } from '../../utils/presentation';

export default function ControlElevators({ elevators }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__subtitle">Parque monitorado</p>
          <h1 className="page-header__title">Elevadores</h1>
        </div>
        <span className="hop-badge px-3 py-2">
          {elevators.filter((item) => item.status === 'operando').length} operando
        </span>
      </header>
      <section className="row g-4 mt-2">
        {elevators.map((elevator) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={elevator.id}>
            <article
              className="app-card h-100 p-3 d-flex flex-column"
              style={{ minHeight: '245px', borderLeft: elevator.recurrent ? '4px solid var(--color-severity-high)' : '1px solid var(--color-border)' }}
            >
              <header className="d-flex flex-nowrap align-items-start justify-content-between gap-2 mb-3">
                <p className="text-primary fw-bold text-uppercase text-truncate mb-0" style={{ maxWidth: 'calc(100% - 90px)', fontSize: '0.72rem', letterSpacing: '0.04em', lineHeight: 1.45 }}>{elevator.client?.name || 'Cliente Corporativo'}</p>
                <StatusBadge value={elevator.status || 'operando'} />
              </header>
              <div className="mb-3 flex-grow-1">
                <h2 className="fs-5 mb-1" style={{ color: 'var(--color-text)', fontWeight: 750, lineHeight: 1.35 }}>{elevator.identification || 'Elevador'}</h2>
                <p className="text-secondary mb-0 fw-medium" style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>{elevator.model || 'Passageiros'}</p>
              </div>
              <dl className="d-grid gap-3 pt-3 border-top m-0" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Último chamado</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)', fontSize: '0.84rem' }}>{elevator.lastOccurrence ? formatDateTime(elevator.lastOccurrence.time) : 'Sem registro recente'}</dd></div>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Ocorrências recentes</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)', fontSize: '0.84rem' }}>{elevator.recentOccurrenceCount ?? 0}</dd></div>
              </dl>
            </article>
          </div>
        ))}
      </section>
    </>
  );
}
