import OperatorStateMessage from '../../components/operator/OperatorStateMessage';
import OccurrenceQueueItem from '../../components/operator/OccurrenceQueueItem';

export default function OperatorOccurrences({ occurrences, workflowStatuses, isLoading }) {
  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__subtitle">Atendimentos de João Carlos</p>
          <h1 className="page-header__title">Ocorrências</h1>
        </div>
        <span className="badge app-card text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">{occurrences.length} pendentes</span>
      </header>
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
