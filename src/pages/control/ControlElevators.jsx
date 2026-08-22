import StatusBadge from '../../components/StatusBadge';
import { formatDate, formatDateTime } from '../../utils/presentation';

export default function ControlElevators({ elevators }) {
  return (
    <>
      <section className="control-page-heading"><div><p className="eyebrow eyebrow--dark">Parque monitorado</p><h1>Elevadores</h1></div><span className="control-shift">{elevators.filter((item) => item.status === 'operando').length} operando</span></section>
      <section className="control-elevator-grid">{elevators.map((elevator) => <article key={elevator.id} className={`app-card control-elevator-card${elevator.recurrent ? ' is-recurrent' : ''}`}><header><p className="eyebrow eyebrow--dark">{elevator.client.name}</p><StatusBadge value={elevator.status} /></header><div className="control-elevator-card__identity"><h2>{elevator.identification}</h2><p>{elevator.model}</p></div><dl><div><dt>Última manutenção</dt><dd>{formatDate(elevator.lastMaintenance)}</dd></div><div><dt>Último chamado</dt><dd>{elevator.lastOccurrence ? formatDateTime(elevator.lastOccurrence.time) : 'Sem registro recente'}</dd></div><div><dt>Ocorrências recentes</dt><dd>{elevator.recentOccurrenceCount}</dd></div></dl>{elevator.recurrent && <div className="control-recurrence"><strong>Reincidência elevada</strong><span>{elevator.recentOccurrenceCount} ocorrências nos últimos 30 dias</span></div>}</article>)}</section>
    </>
  );
}
