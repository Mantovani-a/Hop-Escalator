import { quickHistoryByElevator } from '../../data/operatorData';
import { formatDate, formatDateTime } from '../../utils/presentation';
import StatusBadge from '../StatusBadge';

export default function TechnicalInfoPanel({ occurrence }) {
  const history = quickHistoryByElevator[occurrence.elevatorId] || ['Sem registros relacionados recentes.'];

  return (
    <section className="app-card p-4 h-100" aria-labelledby="technical-panel-title" style={{ gridArea: 'technical', minWidth: 0, overflowWrap: 'normal', wordBreak: 'normal' }}>
      <div className="d-flex align-items-center justify-content-between mb-4"><div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Consulta rápida</p><h2 className="fs-5 mb-0" id="technical-panel-title">Informações técnicas</h2></div></div>
      <div className="d-grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <article className="p-4 border rounded" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
          <h3 className="fs-6 mb-4">Elevador</h3>
          <dl className="d-grid gap-3 mb-0">
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Identificação</dt><dd className="fw-bold mb-0 text-break">{occurrence.elevator.identification}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Modelo demonstrativo</dt><dd className="fw-bold mb-0 text-break">{occurrence.elevator.model}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Estabelecimento</dt><dd className="fw-bold mb-0 text-break">{occurrence.client.name}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Última manutenção</dt><dd className="fw-bold mb-0 text-break">{formatDate(occurrence.elevator.lastMaintenance)}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Status registrado</dt><dd className="fw-bold mb-0 text-break"><StatusBadge value={occurrence.elevator.status} /></dd></div>
          </dl>
        </article>
        <article className="p-4 border rounded" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
          <h3 className="fs-6 mb-4">Falha</h3>
          <dl className="d-grid gap-3 mb-0">
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Código demonstrativo</dt><dd className="fw-bold mb-0 text-break">{occurrence.metadata.diagnosis.demoCode}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Sistema relacionado</dt><dd className="fw-bold mb-0 text-break">{occurrence.metadata.diagnosis.system}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Detecção</dt><dd className="fw-bold mb-0 text-break">{formatDateTime(occurrence.time)}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Origem dos dados</dt><dd className="fw-bold mb-0 text-break">{occurrence.metadata.diagnosis.source}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Descrição do cliente</dt><dd className="fw-bold mb-0 text-break">{occurrence.metadata.clientNotes}</dd></div>
          </dl>
        </article>
        <article className="p-4 border rounded" style={{ backgroundColor: 'var(--color-surface-hover)' }}>
          <h3 className="fs-6 mb-4">Histórico relacionado</h3>
          <ul className="list-unstyled m-0 d-grid gap-2">{history.slice(0, 4).map((item) => <li className="pb-2 border-bottom border-light" style={{ fontSize: '0.86rem' }} key={item}>{item}</li>)}</ul>
        </article>
      </div>
    </section>
  );
}
