import OperatorStateMessage from '../../components/operator/OperatorStateMessage';
import OccurrenceQueueItem from '../../components/operator/OccurrenceQueueItem';

export default function OperatorOccurrences({ occurrences, workflowStatuses, isLoading }) {
  return (
    <>
      <section className="operator-page-heading">
        <div><p className="eyebrow eyebrow--dark">Atendimentos de João Carlos</p><h1>Ocorrências</h1></div>
        <span className="operator-page-count">{occurrences.length} pendentes</span>
      </section>
      {isLoading ? (
        <OperatorStateMessage type="loading" title="Carregando a fila">Estamos atualizando a ordem de prioridade das ocorrências.</OperatorStateMessage>
      ) : occurrences.length ? (
        <div className="operator-queue-list">{occurrences.map((occurrence) => <OccurrenceQueueItem key={occurrence.id} occurrence={occurrence} workflowStatus={workflowStatuses[occurrence.id]} />)}</div>
      ) : (
        <OperatorStateMessage type="empty" title="Nenhuma ocorrência pendente">Todos os atendimentos atribuídos a João Carlos foram concluídos.</OperatorStateMessage>
      )}
    </>
  );
}
