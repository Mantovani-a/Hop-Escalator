import { quickHistoryByElevator } from '../../data/operatorData';
import { formatDate, formatDateTime } from '../../utils/presentation';
import StatusBadge from '../StatusBadge';

export default function TechnicalInfoPanel({ occurrence }) {
  const history = quickHistoryByElevator[occurrence.elevatorId] || ['Sem registros relacionados recentes.'];

  return (
    <section className="app-card operator-technical-panel" aria-labelledby="technical-panel-title">
      <div className="section-heading operator-section-heading"><div><p className="eyebrow eyebrow--dark">Consulta rápida</p><h2 id="technical-panel-title">Informações técnicas</h2></div></div>
      <div className="operator-technical-panel__grid">
        <article>
          <h3>Elevador</h3>
          <dl>
            <div><dt>Identificação</dt><dd>{occurrence.elevator.identification}</dd></div>
            <div><dt>Modelo demonstrativo</dt><dd>{occurrence.elevator.model}</dd></div>
            <div><dt>Estabelecimento</dt><dd>{occurrence.client.name}</dd></div>
            <div><dt>Última manutenção</dt><dd>{formatDate(occurrence.elevator.lastMaintenance)}</dd></div>
            <div><dt>Status registrado</dt><dd><StatusBadge value={occurrence.elevator.status} /></dd></div>
          </dl>
        </article>
        <article>
          <h3>Falha</h3>
          <dl>
            <div><dt>Código demonstrativo</dt><dd>{occurrence.metadata.diagnosis.demoCode}</dd></div>
            <div><dt>Sistema relacionado</dt><dd>{occurrence.metadata.diagnosis.system}</dd></div>
            <div><dt>Detecção</dt><dd>{formatDateTime(occurrence.time)}</dd></div>
            <div><dt>Origem dos dados</dt><dd>{occurrence.metadata.diagnosis.source}</dd></div>
            <div><dt>Descrição do cliente</dt><dd>{occurrence.metadata.clientNotes}</dd></div>
          </dl>
        </article>
        <article>
          <h3>Histórico relacionado</h3>
          <ul>{history.slice(0, 4).map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
    </section>
  );
}
