import PriorityIndicator from './PriorityIndicator';
import StatusBadge from '../StatusBadge';
import { formatDateTime } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function OccurrenceQueueItem({ occurrence, workflowStatus }) {
  const resolved = workflowStatus === OPERATION_STATUS.RESOLVED;
  const distance = Number(occurrence.metadata?.distanceKm ?? 0).toFixed(1).replace('.', ',');

  return (
    <a
      className={`d-block p-4 border rounded bg-white text-decoration-none ${resolved ? 'opacity-75' : ''}`}
      style={{ borderLeft: `5px solid var(--color-severity-${occurrence.priority.classification === 'baixa' ? 'low' : occurrence.priority.classification === 'atenção' ? 'attention' : occurrence.priority.classification === 'alta' ? 'high' : 'critical'})`, transition: 'border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease' }}
      href={`#/operator/occurrence/${occurrence.id}`}
      aria-label={`Abrir ocorrência ${occurrence.id} de ${occurrence.client.name}`}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
        <PriorityIndicator priority={occurrence.priority} compact />
        <StatusBadge value={workflowStatus} />
      </div>
      <div className="row g-4 mt-3">
        <div className="col-12 col-md-7">
          <span className="d-block text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.78rem' }}>{occurrence.client.type}</span>
          <h3 className="fs-5 mb-1 text-dark">{occurrence.client.name}</h3>
          <p className="mb-0 text-secondary" style={{ fontSize: '0.9rem' }}>{occurrence.elevator.identification} · {occurrence.description}</p>
        </div>
        <div className="col-12 col-md-5">
          <dl className="row g-3 mb-0">
            <div className="col-6"><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Distância</dt><dd className="fw-bold mb-0 text-dark">{distance} km</dd></div>
            <div className="col-6"><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Abertura</dt><dd className="fw-bold mb-0 text-dark">{formatDateTime(occurrence.time)}</dd></div>
          </dl>
        </div>
      </div>
      <span className="d-block mt-3 text-primary fw-bold" style={{ fontSize: '0.86rem' }}>Ver detalhes <span aria-hidden="true">→</span></span>
    </a>
  );
}
