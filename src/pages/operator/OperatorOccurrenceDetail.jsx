import FeedbackMessage from '../../components/FeedbackMessage';
import ProfileAvatar from '../../components/ProfileAvatar';
import OperatorStateMessage from '../../components/operator/OperatorStateMessage';
import PriorityIndicator from '../../components/operator/PriorityIndicator';
import StatusBadge from '../../components/StatusBadge';
import { operatorTechnician, quickHistoryByElevator } from '../../data/operatorData';
import { getWorkflowStep } from '../../utils/operatorWorkflow';
import { formatDate, formatDateTime } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function OperatorOccurrenceDetail({ occurrence, workflowStatus, onAdvance }) {
  if (!occurrence) {
    return <OperatorStateMessage type="error" title="Não foi possível carregar a ocorrência">Verifique se o chamado ainda está atribuído a João Carlos e tente novamente.</OperatorStateMessage>;
  }

  const workflowStep = getWorkflowStep(workflowStatus);
  const isResolved = workflowStatus === OPERATION_STATUS.RESOLVED;

  return (
    <>
      <a className="operator-back-link" href="#/operator/occurrences"><span aria-hidden="true">←</span> Voltar para ocorrências</a>
      <section className="operator-detail-heading">
        <div><p className="eyebrow eyebrow--dark">{occurrence.protocol || occurrence.metadata.serviceNumber}</p><h1>{occurrence.client.name}</h1><p>{occurrence.description}</p></div>
        <div className="operator-detail-heading__status"><PriorityIndicator priority={occurrence.priority} /><StatusBadge value={workflowStatus} /></div>
      </section>

      {isResolved && <FeedbackMessage tone="success" title="Ocorrência resolvida">Este atendimento foi finalizado por João Carlos e já consta no histórico.</FeedbackMessage>}

      <div className="operator-detail-layout">
        <div className="operator-detail-content">
          <section className="app-card operator-detail-section" aria-labelledby="local-title">
            <h2 id="local-title">Local</h2>
            <dl className="operator-info-grid">
              <div><dt>Estabelecimento</dt><dd>{occurrence.client.name}</dd></div>
              <div><dt>Tipo</dt><dd>{occurrence.client.type}</dd></div>
              <div className="is-wide"><dt>Endereço</dt><dd>{occurrence.address}</dd></div>
              <div><dt>Distância</dt><dd>{occurrence.metadata.distanceKm.toFixed(1).replace('.', ',')} km</dd></div>
            </dl>
          </section>

          <section className="app-card operator-detail-section" aria-labelledby="elevator-title">
            <h2 id="elevator-title">Elevador</h2>
            <dl className="operator-info-grid">
              <div><dt>Identificação</dt><dd>{occurrence.elevator.identification}</dd></div>
              <div><dt>Modelo cadastrado</dt><dd>{occurrence.elevator.model}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge value={occurrence.elevator.status} /></dd></div>
              <div><dt>Última manutenção</dt><dd>{formatDate(occurrence.elevator.lastMaintenance)}</dd></div>
            </dl>
          </section>

          <section className="app-card operator-detail-section" aria-labelledby="occurrence-title">
            <h2 id="occurrence-title">Ocorrência</h2>
            <dl className="operator-info-grid">
              <div className="is-wide"><dt>Problema detectado</dt><dd>{occurrence.description}</dd></div>
              <div className="is-wide"><dt>Descrição do local</dt><dd>{occurrence.locationContext}</dd></div>
              <div><dt>Horário</dt><dd>{formatDateTime(occurrence.time)}</dd></div>
              <div><dt>Pessoas presas</dt><dd>{occurrence.trappedPeople || 'Nenhuma informada'}</dd></div>
              <div><dt>Risco informado</dt><dd>{occurrence.metadata.riskToLife ? 'Sim — prioridade imediata' : 'Não informado'}</dd></div>
              <div className="is-wide"><dt>Informações do cliente</dt><dd>{occurrence.metadata.clientNotes}</dd></div>
            </dl>
          </section>

          <section className="app-card operator-detail-section" aria-labelledby="history-title">
            <h2 id="history-title">Histórico rápido</h2>
            <ul className="operator-quick-history">{(quickHistoryByElevator[occurrence.elevatorId] || ['Sem registros recentes para este equipamento.']).map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>

        <aside className="app-card operator-priority-explanation" aria-labelledby="priority-title">
          <p className="eyebrow eyebrow--dark">HOP Priority Score</p>
          <h2 id="priority-title">Prioridade {occurrence.priority.score}/100</h2>
          <p>Motivos considerados no cálculo:</p>
          <ul>{occurrence.priority.reasons.map((reason) => <li key={reason}><span aria-hidden="true">✓</span>{reason}</li>)}</ul>
          <div className="operator-responsible"><ProfileAvatar name={operatorTechnician.name} src={operatorTechnician.avatar} size="md" decorative /><div><span>Técnico responsável</span><strong>{operatorTechnician.name}</strong></div></div>
          {!isResolved && <button className="btn btn-primary btn-lg w-100" type="button" onClick={() => onAdvance(occurrence.id)}>{workflowStep.action}</button>}
          {isResolved && <a className="btn btn-outline-primary w-100" href="#/operator/history">Ver no histórico</a>}
        </aside>
      </div>
    </>
  );
}
