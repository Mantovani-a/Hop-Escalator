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
      <a className="d-inline-flex align-items-center gap-2 mb-4 text-decoration-none fw-bold" style={{ minHeight: '44px' }} href="#/operator/occurrences"><span aria-hidden="true">&larr;</span> Voltar para ocorrências</a>
      <section className="d-flex flex-column gap-4 pb-4 mb-4 border-bottom">
        <div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>{occurrence.protocol || occurrence.metadata.serviceNumber}</p><h1 className="mb-2" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.7rem)' }}>{occurrence.client.name}</h1><p className="mb-0 text-secondary">{occurrence.description}</p></div>
        <div className="d-flex flex-wrap align-items-center gap-3"><PriorityIndicator priority={occurrence.priority} /><StatusBadge value={workflowStatus} /></div>
      </section>

      {isResolved && <FeedbackMessage tone="success" title="Ocorrência resolvida">Este atendimento foi finalizado por João Carlos e já consta no histórico.</FeedbackMessage>}

      <div className="d-flex flex-column flex-xl-row gap-4 align-items-start mt-4">
        <div className="d-flex flex-column gap-4 flex-grow-1" style={{ minWidth: 0 }}>
          <section className="app-card border rounded shadow-sm p-4" aria-labelledby="local-title">
            <h2 className="fs-5 mb-4" id="local-title">Local</h2>
            <dl className="d-grid gap-3 mb-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Estabelecimento</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.client.name}</dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Tipo</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.client.type}</dd></div>
              <div style={{ gridColumn: '1 / -1' }}><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Endereço</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.address}</dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Distância</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.metadata.distanceKm.toFixed(1).replace('.', ',')} km</dd></div>
            </dl>
          </section>

          <section className="app-card border rounded shadow-sm p-4" aria-labelledby="elevator-title">
            <h2 className="fs-5 mb-4" id="elevator-title">Elevador</h2>
            <dl className="d-grid gap-3 mb-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Identificação</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.elevator.identification}</dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Modelo cadastrado</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.elevator.model}</dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Status</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}><StatusBadge value={occurrence.elevator.status} /></dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Última manutenção</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{formatDate(occurrence.elevator.lastMaintenance)}</dd></div>
            </dl>
          </section>

          <section className="app-card border rounded shadow-sm p-4" aria-labelledby="occurrence-title">
            <h2 className="fs-5 mb-4" id="occurrence-title">Ocorrência</h2>
            <dl className="d-grid gap-3 mb-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              <div style={{ gridColumn: '1 / -1' }}><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Problema detectado</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.description}</dd></div>
              <div style={{ gridColumn: '1 / -1' }}><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Descrição do local</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.locationContext}</dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Horário</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{formatDateTime(occurrence.time)}</dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Pessoas presas</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.trappedPeople || 'Nenhuma informada'}</dd></div>
              <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Risco informado</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.metadata.riskToLife ? 'Sim — prioridade imediata' : 'Não informado'}</dd></div>
              <div style={{ gridColumn: '1 / -1' }}><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.7rem' }}>Informações do cliente</dt><dd className="fw-bold mb-0 text-break" style={{ color: 'var(--color-text)' }}>{occurrence.metadata.clientNotes}</dd></div>
            </dl>
          </section>

          <section className="app-card border rounded shadow-sm p-4" aria-labelledby="history-title">
            <h2 className="fs-5 mb-4" id="history-title">Histórico rápido</h2>
            <ul className="list-unstyled m-0 d-grid gap-2">{(quickHistoryByElevator[occurrence.elevatorId] || ['Sem registros recentes para este equipamento.']).map((item) => <li className="pb-2 border-bottom border-light" style={{ fontSize: '0.86rem' }} key={item}>{item}</li>)}</ul>
          </section>
        </div>

        <aside className="app-card border rounded shadow-sm p-4" style={{ width: 'min(100%, 380px)', flex: '0 0 auto', position: 'sticky', top: 'calc(var(--space-4) + 60px)' }} aria-labelledby="priority-title">
          <p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>HOP Priority Score</p>
          <h2 className="fs-4 mb-3" id="priority-title">Prioridade {occurrence.priority.score}/100</h2>
          <p className="text-secondary mb-2" style={{ fontSize: '0.86rem' }}>Motivos considerados no cálculo:</p>
          <ul className="list-unstyled d-grid gap-2 mb-4 pb-4 border-bottom">{occurrence.priority.reasons.map((reason) => <li className="d-flex align-items-center gap-2" style={{ fontSize: '0.84rem', fontWeight: 650 }} key={reason}><span className="d-inline-flex align-items-center justify-content-center flex-shrink-0 rounded-circle text-primary bg-primary bg-opacity-10" style={{ width: '1.4rem', height: '1.4rem', fontSize: '0.66rem' }} aria-hidden="true">✓</span>{reason}</li>)}</ul>
          <div className="d-flex align-items-center gap-3 pb-4 mb-4 border-bottom"><ProfileAvatar name={operatorTechnician.name} src={operatorTechnician.avatar} size="md" decorative /><div><span className="d-block text-secondary" style={{ fontSize: '0.78rem' }}>Técnico responsável</span><strong className="d-block" style={{ color: 'var(--color-text)' }}>{operatorTechnician.name}</strong></div></div>
          {!isResolved && <button className="btn btn-primary btn-lg w-100 fw-bold" type="button" onClick={() => onAdvance(occurrence.id)}>{workflowStep.action}</button>}
          {isResolved && <a className="btn btn-outline-primary w-100 fw-bold" href="#/operator/history">Ver no histórico</a>}
        </aside>
      </div>
    </>
  );
}
