import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { formatElapsedMinutes } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

const filters = [
  ['all', 'Todas'], ['critical', 'Críticas'], ['unassigned', 'Sem técnico'], ['traveling', 'Em deslocamento'], ['attending', 'Em atendimento'],
];

export default function ControlOccurrences({ occurrences, onSelectOccurrence }) {
  const [filter, setFilter] = useState('all');
  const active = occurrences.filter((occurrence) => occurrence.operationalStatus !== OPERATION_STATUS.RESOLVED);
  const filtered = active.filter((occurrence) => {
    if (filter === 'critical') return occurrence.priority.classification === 'crítica';
    if (filter === 'unassigned') return !occurrence.technicianId;
    if (filter === 'traveling') return occurrence.operationalStatus === OPERATION_STATUS.TRAVELING;
    if (filter === 'attending') return [OPERATION_STATUS.ON_SITE, OPERATION_STATUS.MAINTENANCE].includes(occurrence.operationalStatus);
    return true;
  });
  return (
    <>
      <section className="control-page-heading"><div><p className="eyebrow eyebrow--dark">Fila operacional</p><h1>Ocorrências</h1></div><span className="control-shift">{active.length} ativas</span></section>
      <div className="control-filter-bar" role="group" aria-label="Filtrar ocorrências">{filters.map(([id, label]) => <button key={id} className={filter === id ? 'is-active' : ''} type="button" onClick={() => setFilter(id)}>{label}</button>)}</div>
      <section className="app-card control-table-card" aria-label="Fila de ocorrências">
        <div className="control-table-scroll"><table><thead><tr><th>Protocolo</th><th>Prioridade</th><th>Estabelecimento</th><th>Elevador / problema</th><th>Técnico</th><th>Status</th><th>Tempo aberto</th></tr></thead><tbody>{filtered.map((occurrence) => <tr key={occurrence.id} onClick={() => onSelectOccurrence(occurrence.id)}><td><button type="button" onClick={() => onSelectOccurrence(occurrence.id)}>{occurrence.protocol}</button></td><td><StatusBadge value={occurrence.priority.classification} type="severity" /><strong className="control-score">{occurrence.priority.score}</strong></td><td><strong>{occurrence.client.name}</strong><small>{occurrence.client.type}</small></td><td><strong>{occurrence.elevator.identification}</strong><small>{occurrence.description}</small></td><td>{occurrence.technician?.name || <span className="control-unassigned">Sem técnico</span>}</td><td><StatusBadge value={occurrence.operationalStatus} /></td><td>{formatElapsedMinutes(occurrence.priority.elapsedMinutes)}</td></tr>)}</tbody></table></div>
        {!filtered.length && <p className="control-empty-note">Nenhuma ocorrência corresponde ao filtro selecionado.</p>}
      </section>
    </>
  );
}
