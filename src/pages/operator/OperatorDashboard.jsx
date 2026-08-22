import OperatorStateMessage from '../../components/operator/OperatorStateMessage';
import OccurrenceQueueItem from '../../components/operator/OccurrenceQueueItem';
import PriorityIndicator from '../../components/operator/PriorityIndicator';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';
import { getWorkflowStep } from '../../utils/operatorWorkflow';
import { formatDateTime, formatElapsedMinutes } from '../../utils/presentation';

export default function OperatorDashboard({
  technician,
  occurrences,
  workflowStatuses,
  onAdvance,
  completedToday,
  isLoading,
  onSimulate,
}) {
  const nextOccurrence = occurrences[0];
  const criticalCount = occurrences.filter((occurrence) => occurrence.priority.classification === 'crítica').length;

  if (isLoading) {
    return <OperatorStateMessage type="loading" title="Carregando ocorrências atribuídas">Aguarde enquanto organizamos a fila de João Carlos por prioridade.</OperatorStateMessage>;
  }

  return (
    <>
      <section className="operator-page-heading operator-page-heading--dashboard">
        <div><p className="eyebrow eyebrow--dark">Visão operacional</p><h1>Bom dia, João Carlos</h1></div>
        <button className="btn btn-sm btn-outline-primary operator-simulate-mobile" type="button" onClick={onSimulate}>Simular nova ocorrência</button>
      </section>

      <section className="operator-summary-grid" aria-label="Resumo operacional">
        <article><span>Próxima ocorrência</span><strong>{nextOccurrence ? `${nextOccurrence.priority.score}/100` : '—'}</strong><small>{nextOccurrence?.client.name || 'Fila livre'}</small></article>
        <article><span>Chamados pendentes</span><strong>{occurrences.length}</strong><small>atribuídos a João Carlos</small></article>
        <article><span>Ocorrências críticas</span><strong>{criticalCount}</strong><small>prioridade imediata</small></article>
        <article><span>Concluídos hoje</span><strong>{completedToday}</strong><small>atendimentos finalizados</small></article>
      </section>

      {nextOccurrence ? (
        <section className="operator-dashboard-section" aria-labelledby="next-occurrence-title">
          <div className="section-heading operator-section-heading"><div><p className="eyebrow eyebrow--dark">Atender primeiro</p><h2 id="next-occurrence-title">Próxima ocorrência</h2></div><a href={`#/operator/occurrence/${nextOccurrence.id}`}>Ver detalhes</a></div>
          <article className={`app-card operator-next-card operator-next-card--${nextOccurrence.priority.classification}`}>
            <div>
              <PriorityIndicator priority={nextOccurrence.priority} />
              <span className="operator-next-card__type">{nextOccurrence.client.type} · {nextOccurrence.protocol || nextOccurrence.metadata.serviceNumber}</span>
              <h3>{nextOccurrence.client.name}</h3>
              <p className="operator-next-card__address">{nextOccurrence.address}</p>
              <div className="operator-next-card__problem"><span>{nextOccurrence.elevator.identification}</span><strong>{nextOccurrence.description}</strong></div>
              <div className={`operator-passenger-alert${nextOccurrence.trappedPeople ? ' has-passengers' : ''}`}>
                <span aria-hidden="true">!</span>
                {nextOccurrence.trappedPeople
                  ? `${nextOccurrence.trappedPeople} ${nextOccurrence.trappedPeople === 1 ? 'passageiro preso' : 'passageiros presos'}`
                  : 'Nenhum passageiro preso informado'}
              </div>
            </div>
            <div className="operator-next-card__action">
              <StatusBadge value={workflowStatuses[nextOccurrence.id]} />
              <button className="btn btn-primary btn-lg w-100" type="button" onClick={() => onAdvance(nextOccurrence.id)}>
                {getWorkflowStep(workflowStatuses[nextOccurrence.id]).action}
              </button>
              <dl>
                <div><dt>Distância</dt><dd>{Number(nextOccurrence.metadata?.distanceKm ?? 0).toFixed(1).replace('.', ',')} km</dd></div>
                <div><dt>Ocorrência</dt><dd>{formatElapsedMinutes(nextOccurrence.priority.elapsedMinutes)}</dd></div>
                <div><dt>Horário</dt><dd>{formatDateTime(nextOccurrence.time)}</dd></div>
                <div><dt>Técnico</dt><dd><span className="profile-inline"><ProfileAvatar name={technician.name} src={technician.avatar} size="sm" decorative />{technician.name}</span></dd></div>
              </dl>
            </div>
          </article>
        </section>
      ) : (
        <OperatorStateMessage type="empty" title="Nenhuma ocorrência pendente">João Carlos está livre para receber um novo atendimento.</OperatorStateMessage>
      )}

      {occurrences.length > 1 && (
        <section className="operator-dashboard-section" aria-labelledby="queue-preview-title">
          <div className="section-heading operator-section-heading"><div><p className="eyebrow eyebrow--dark">Depois desta</p><h2 id="queue-preview-title">Fila priorizada</h2></div><a href="#/operator/occurrences">Ver toda a fila</a></div>
          <div className="operator-queue-list">
            {occurrences.slice(1, 4).map((occurrence) => <OccurrenceQueueItem key={occurrence.id} occurrence={occurrence} workflowStatus={workflowStatuses[occurrence.id]} />)}
          </div>
        </section>
      )}
    </>
  );
}
