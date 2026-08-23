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
      <header className="page-header">
        <div>
          <p className="page-header__subtitle">Visão operacional</p>
          <h1 className="page-header__title">Bom dia, João Carlos</h1>
        </div>
        <button className="btn btn-sm btn-outline-primary d-md-none" type="button" onClick={onSimulate}>Simular nova ocorrência</button>
      </header>

      <section className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4" aria-label="Resumo operacional">
        <div className="col"><article className="app-card p-3 d-flex flex-column justify-content-between h-100"><span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Próxima ocorrência</span><strong className="text-primary my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{nextOccurrence ? `${nextOccurrence.priority.score}/100` : '—'}</strong><small className="text-secondary text-truncate" style={{ fontSize: '0.74rem' }}>{nextOccurrence?.client.name || 'Fila livre'}</small></article></div>
        <div className="col"><article className="app-card p-3 d-flex flex-column justify-content-between h-100"><span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Chamados pendentes</span><strong className="text-primary my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{occurrences.length}</strong><small className="text-secondary text-truncate" style={{ fontSize: '0.74rem' }}>atribuídos a João Carlos</small></article></div>
        <div className="col"><article className="app-card p-3 d-flex flex-column justify-content-between h-100"><span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Ocorrências críticas</span><strong className="text-primary my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{criticalCount}</strong><small className="text-secondary text-truncate" style={{ fontSize: '0.74rem' }}>prioridade imediata</small></article></div>
        <div className="col"><article className="app-card p-3 d-flex flex-column justify-content-between h-100"><span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Concluídos hoje</span><strong className="text-primary my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{completedToday}</strong><small className="text-secondary text-truncate" style={{ fontSize: '0.74rem' }}>atendimentos finalizados</small></article></div>
      </section>

      {nextOccurrence ? (
        <section className="mt-4" aria-labelledby="next-occurrence-title">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom"><div><p className="page-header__subtitle mb-0">Atender primeiro</p><h2 className="fs-5 mb-0" id="next-occurrence-title">Próxima ocorrência</h2></div><a href={`#/operator/occurrence/${nextOccurrence.id}`} className="fw-bold text-decoration-none" style={{ fontSize: '0.82rem' }}>Ver detalhes</a></div>
          <article className="app-card row g-0" style={{ borderLeft: `5px solid var(--color-severity-${nextOccurrence.priority.classification === 'baixa' ? 'low' : nextOccurrence.priority.classification === 'atenção' ? 'attention' : nextOccurrence.priority.classification === 'alta' ? 'high' : 'critical'})`, padding: '1.5rem', boxShadow: 'var(--shadow-subtle)' }}>
            <div className="col-12 col-md-7 pe-md-4">
              <PriorityIndicator priority={nextOccurrence.priority} />
              <span className="d-block mt-3 text-secondary fw-bold text-uppercase" style={{ fontSize: '0.78rem' }}>{nextOccurrence.client.type} · {nextOccurrence.protocol || nextOccurrence.metadata.serviceNumber}</span>
              <h3 className="my-2" style={{ fontSize: 'clamp(1.55rem, 5vw, 2.15rem)' }}>{nextOccurrence.client.name}</h3>
              <p className="text-secondary mb-0">{nextOccurrence.address}</p>
              <div className="mt-4 pt-3 border-top d-grid gap-1 mb-4"><span className="text-secondary" style={{ fontSize: '0.82rem' }}>{nextOccurrence.elevator.identification}</span><strong style={{ fontSize: '1.08rem' }}>{nextOccurrence.description}</strong></div>
              <div className={`d-inline-flex align-items-center gap-2 px-3 py-2 rounded ${nextOccurrence.trappedPeople ? 'bg-danger text-white' : 'text-secondary'}`} style={{ backgroundColor: nextOccurrence.trappedPeople ? undefined : 'var(--color-surface-hover)', fontSize: '0.86rem', fontWeight: 750 }}>
                <span className="d-inline-flex align-items-center justify-content-center border border-current rounded-circle" style={{ width: '1.2rem', height: '1.2rem' }} aria-hidden="true">!</span>
                {nextOccurrence.trappedPeople
                  ? `${nextOccurrence.trappedPeople} ${nextOccurrence.trappedPeople === 1 ? 'passageiro preso' : 'passageiros presos'}`
                  : 'Nenhum passageiro preso informado'}
              </div>
            </div>
            <div className="col-12 col-md-5 d-flex flex-column gap-3 mt-4 mt-md-0 border-start-md ps-md-4" style={{ backgroundColor: 'var(--color-surface-soft)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <StatusBadge value={workflowStatuses[nextOccurrence.id]} />
              <button className="btn btn-primary btn-lg w-100" type="button" onClick={() => onAdvance(nextOccurrence.id)}>
                {getWorkflowStep(workflowStatuses[nextOccurrence.id]).action}
              </button>
              <dl className="d-grid gap-2 mb-0 mt-2">
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom"><dt className="text-secondary fw-normal mb-0" style={{ fontSize: '0.8rem' }}>Distância</dt><dd className="fw-bold mb-0 text-end" style={{ fontSize: '0.86rem' }}>{Number(nextOccurrence.metadata?.distanceKm ?? 0).toFixed(1).replace('.', ',')} km</dd></div>
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom"><dt className="text-secondary fw-normal mb-0" style={{ fontSize: '0.8rem' }}>Ocorrência</dt><dd className="fw-bold mb-0 text-end" style={{ fontSize: '0.86rem' }}>{formatElapsedMinutes(nextOccurrence.priority.elapsedMinutes)}</dd></div>
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom"><dt className="text-secondary fw-normal mb-0" style={{ fontSize: '0.8rem' }}>Horário</dt><dd className="fw-bold mb-0 text-end" style={{ fontSize: '0.86rem' }}>{formatDateTime(nextOccurrence.time)}</dd></div>
                <div className="d-flex justify-content-between align-items-center"><dt className="text-secondary fw-normal mb-0" style={{ fontSize: '0.8rem' }}>Técnico</dt><dd className="fw-bold mb-0 text-end"><span className="d-inline-flex align-items-center gap-2"><ProfileAvatar name={technician.name} src={technician.avatar} size="sm" decorative />{technician.name}</span></dd></div>
              </dl>
            </div>
          </article>
        </section>
      ) : (
        <OperatorStateMessage type="empty" title="Nenhuma ocorrência pendente">João Carlos está livre para receber um novo atendimento.</OperatorStateMessage>
      )}

      {occurrences.length > 1 && (
        <section className="mt-5" aria-labelledby="queue-preview-title">
          <div className="d-flex align-items-center justify-content-between mb-3"><div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Depois desta</p><h2 className="fs-5 mb-0" id="queue-preview-title">Fila priorizada</h2></div><a href="#/operator/occurrences" className="fw-bold text-decoration-none">Ver toda a fila</a></div>
          <div className="d-grid gap-2">
            {occurrences.slice(1, 4).map((occurrence) => <OccurrenceQueueItem key={occurrence.id} occurrence={occurrence} workflowStatus={workflowStatuses[occurrence.id]} />)}
          </div>
        </section>
      )}
    </>
  );
}
