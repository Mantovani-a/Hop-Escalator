import PriorityIndicator from './PriorityIndicator';
import StatusBadge from '../StatusBadge';
import { formatDateTime } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function OccurrenceQueueItem({ occurrence, workflowStatus }) {
  const resolved = workflowStatus === OPERATION_STATUS.RESOLVED;
  const distance = Number(occurrence.metadata?.distanceKm ?? 0).toFixed(1).replace('.', ',');

  return (
    <a
      className={`operator-queue-item operator-queue-item--${occurrence.priority.classification}${resolved ? ' is-resolved' : ''}`}
      href={`#/operator/occurrence/${occurrence.id}`}
      aria-label={`Abrir ocorrência ${occurrence.id} de ${occurrence.client.name}`}
    >
      <div className="operator-queue-item__topline">
        <PriorityIndicator priority={occurrence.priority} compact />
        <StatusBadge value={workflowStatus} />
      </div>
      <div className="operator-queue-item__body">
        <div>
          <span className="operator-queue-item__type">{occurrence.client.type}</span>
          <h3>{occurrence.client.name}</h3>
          <p>{occurrence.elevator.identification} · {occurrence.description}</p>
        </div>
        <dl>
          <div><dt>Distância</dt><dd>{distance} km</dd></div>
          <div><dt>Abertura</dt><dd>{formatDateTime(occurrence.time)}</dd></div>
        </dl>
      </div>
      <span className="operator-queue-item__open">Ver detalhes <span aria-hidden="true">→</span></span>
    </a>
  );
}
