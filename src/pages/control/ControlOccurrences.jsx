import { useState } from 'react';
import StatusBadge from '../../components/StatusBadge';
import { formatElapsedMinutes } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';
import ControlNewOccurrenceModal from '../../components/control/ControlNewOccurrenceModal';

const filters = [
  ['all', 'Todas'], ['critical', 'Críticas'], ['unassigned', 'Sem técnico'], ['traveling', 'Em deslocamento'], ['attending', 'Em atendimento'],
];

export default function ControlOccurrences({ occurrences, onSelectOccurrence }) {
  const [filter, setFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      <section className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-sm-between gap-4 pb-4 border-bottom">
        <div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Fila operacional</p><h1 className="mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Ocorrências</h1></div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="badge app-card text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">{active.length} ativas</span>
          <button type="button" className="btn btn-primary" onClick={() => setIsModalOpen(true)}>Registrar Ocorrência</button>
        </div>
      </section>
      {isModalOpen && <ControlNewOccurrenceModal onClose={() => setIsModalOpen(false)} />}
      <div className="d-flex gap-2 my-4 pb-2 overflow-x-auto" role="group" aria-label="Filtrar ocorrências">{filters.map(([id, label]) => <button key={id} className={`btn rounded-pill fw-bold text-nowrap flex-shrink-0 ${filter === id ? 'btn-primary bg-opacity-10 text-primary border-primary' : 'btn-outline-secondary text-secondary app-card border-light-subtle'}`} style={{ minHeight: '42px', fontSize: '0.8rem' }} type="button" onClick={() => setFilter(id)}>{label}</button>)}</div>
      <section className="app-card overflow-hidden" aria-label="Fila de ocorrências">
        <div className="w-100 overflow-x-auto">
          <table className="w-100 table table-hover mb-0" style={{ minWidth: '1020px', fontSize: '0.8rem' }}>
            <thead className="text-secondary text-uppercase" style={{ backgroundColor: 'var(--color-surface-hover)', fontSize: '0.68rem', letterSpacing: '0.04em' }}>
              <tr><th className="p-3 fw-bold border-0">Protocolo</th><th className="p-3 fw-bold border-0">Prioridade</th><th className="p-3 fw-bold border-0">Estabelecimento</th><th className="p-3 fw-bold border-0">Elevador / problema</th><th className="p-3 fw-bold border-0">Técnico</th><th className="p-3 fw-bold border-0">Status</th><th className="p-3 fw-bold border-0">Tempo aberto</th></tr>
            </thead>
            <tbody className="border-top">
              {filtered.map((occurrence) => (
                <tr key={occurrence.id} onClick={() => onSelectOccurrence(occurrence.id)} style={{ cursor: 'pointer' }}>
                  <td className="p-3 align-middle"><button className="btn btn-link p-0 text-primary fw-bold text-decoration-none" type="button" onClick={() => onSelectOccurrence(occurrence.id)}>{occurrence.protocol}</button></td>
                  <td className="p-3 align-middle"><div className="d-flex align-items-center"><StatusBadge value={occurrence.priority.classification} type="severity" /><strong className="ms-2 fs-6">{occurrence.priority.score}</strong></div></td>
                  <td className="p-3 align-middle"><strong className="d-block" style={{ color: 'var(--color-text)' }}>{occurrence.client.name}</strong><small className="d-block text-secondary mt-1 text-truncate" style={{ maxWidth: '270px' }}>{occurrence.client.type}</small></td>
                  <td className="p-3 align-middle"><strong className="d-block" style={{ color: 'var(--color-text)' }}>{occurrence.elevator.identification}</strong><small className="d-block text-secondary mt-1 text-truncate" style={{ maxWidth: '270px' }}>{occurrence.description}</small></td>
                  <td className="p-3 align-middle">{occurrence.technician?.name || <span className="text-danger fw-bold">Sem técnico</span>}</td>
                  <td className="p-3 align-middle"><StatusBadge value={occurrence.operationalStatus} /></td>
                  <td className="p-3 align-middle fw-bold">{formatElapsedMinutes(occurrence.priority.elapsedMinutes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && <p className="d-flex flex-column gap-1 m-5 p-4 rounded-3 text-muted bg-light text-center">Nenhuma ocorrência corresponde ao filtro selecionado.</p>}
      </section>
    </>
  );
}
