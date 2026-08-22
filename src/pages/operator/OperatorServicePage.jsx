import OperatorStateMessage from '../../components/operator/OperatorStateMessage';
import Elevator2DModel, { elevatorRegions } from '../../components/operator/Elevator2DModel';
import PriorityIndicator from '../../components/operator/PriorityIndicator';
import RouteMap from '../../components/operator/RouteMap';
import TechnicalInfoPanel from '../../components/operator/TechnicalInfoPanel';
import StatusBadge from '../../components/StatusBadge';
import { getWorkflowStep } from '../../utils/operatorWorkflow';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function OperatorServicePage({ occurrence, workflowStatus, onAdvance }) {
  if (!occurrence) {
    return <OperatorStateMessage type="error" title="Não foi possível abrir o atendimento">Volte para a fila e selecione novamente a ocorrência atribuída.</OperatorStateMessage>;
  }

  const workflowStep = getWorkflowStep(workflowStatus);
  const isMaintenance = [OPERATION_STATUS.ON_SITE, OPERATION_STATUS.MAINTENANCE, OPERATION_STATUS.RESOLVED].includes(workflowStatus);
  const diagnosis = occurrence.metadata.diagnosis;
  const affectedComponents = (diagnosis.suspectedRegions || [])
    .map((regionId) => elevatorRegions.find((region) => region.id === regionId)?.label)
    .filter(Boolean);
  const signals = [
    diagnosis.source,
    occurrence.metadata.elevatorStopped ? 'Equipamento informou indisponibilidade total' : 'Equipamento informou funcionamento parcial ou intermitente',
    occurrence.metadata.recurrence ? 'Histórico indica reincidência relacionada' : 'Sem reincidência recente sinalizada',
  ];
  return (
    <>
      <a className="operator-back-link" href={`#/operator/occurrence/${occurrence.id}`}><span aria-hidden="true">←</span> Ver ocorrência</a>
      <section className="operator-service-heading">
        <div><p className="eyebrow eyebrow--dark">Atendimento #{occurrence.metadata.serviceNumber}</p><h1>{occurrence.client.name} <span>• {occurrence.elevator.identification}</span></h1></div>
        <div className="operator-service-heading__status"><PriorityIndicator priority={occurrence.priority} /><StatusBadge value={workflowStatus} /></div>
      </section>

      <div className={`operator-service-layout${isMaintenance ? ' is-maintenance' : ''}`}>
        {!isMaintenance && <RouteMap occurrence={occurrence} />}
        <aside className="app-card operator-diagnosis-preview" aria-labelledby="preliminary-diagnosis-title">
          <p className="eyebrow eyebrow--dark">Dados recebidos do equipamento</p>
          <h2 id="preliminary-diagnosis-title">{isMaintenance ? 'Diagnóstico técnico completo' : 'Diagnóstico preliminar'}</h2>
          <dl>
            <div><dt>Falha detectada</dt><dd>{occurrence.description}</dd></div>
            <div><dt>Código demonstrativo</dt><dd>{diagnosis.demoCode}</dd></div>
            <div><dt>Sistema relacionado</dt><dd>{diagnosis.system}</dd></div>
            <div><dt>Componente provável</dt><dd>{diagnosis.probableOrigin}</dd></div>
          </dl>
          <div className="operator-diagnosis-probability"><span>Confiança demonstrativa</span><strong>{diagnosis.probability}%</strong></div>
          <p>Hipótese baseada nos dados recebidos do equipamento e no histórico da ocorrência; requer verificação técnica.</p>
          <p>{diagnosis.summary}</p>
          {isMaintenance && (
            <div className="operator-diagnostic-details">
              <section><h3>Sinais detectados</h3><ul>{signals.map((signal) => <li key={signal}>{signal}</li>)}</ul></section>
              <section><h3>Componentes relacionados</h3><ul>{affectedComponents.map((component) => <li key={component}>{component}</li>)}</ul></section>
            </div>
          )}
          {workflowStep.action && <button className="btn btn-primary btn-lg w-100" type="button" onClick={() => onAdvance(occurrence.id)}>{workflowStep.action}</button>}
        </aside>
        <TechnicalInfoPanel occurrence={occurrence} />
        <Elevator2DModel diagnosis={diagnosis} severity={occurrence.priority.classification} />
      </div>
    </>
  );
}
