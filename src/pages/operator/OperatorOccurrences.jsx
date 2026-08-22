import OperatorStateMessage from '../../components/operator/OperatorStateMessage';
import OccurrenceQueueItem from '../../components/operator/OccurrenceQueueItem';

export default function OperatorOccurrences({ occurrences, workflowStatuses, isLoading }) {
  return (
    <>
      <section className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-3 mb-4">
        <div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Atendimentos de João Carlos</p><h1 className="mb-0" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.6rem)' }}>Ocorrências</h1></div>
        <span className="d-inline-flex align-items-center justify-content-center px-3 py-2 rounded-pill text-primary bg-primary bg-opacity-10 fw-bold" style={{ fontSize: '0.8rem' }}>{occurrences.length} pendentes</span>
      </section>
      {isLoading ? (
        <OperatorStateMessage type="loading" title="Carregando a fila">Estamos atualizando a ordem de prioridade das ocorrências.</OperatorStateMessage>
      ) : occurrences.length ? (
        <div className="d-grid gap-3">{occurrences.map((occurrence) => <OccurrenceQueueItem key={occurrence.id} occurrence={occurrence} workflowStatus={workflowStatuses[occurrence.id]} />)}</div>
      ) : (
        <OperatorStateMessage type="empty" title="Nenhuma ocorrência pendente">Todos os atendimentos atribuídos a João Carlos foram concluídos.</OperatorStateMessage>
      )}
    </>
  );
}
