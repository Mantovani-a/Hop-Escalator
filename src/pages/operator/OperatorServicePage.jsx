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
      <a className="d-inline-flex align-items-center fw-bold text-decoration-none mb-3" href={`#/operator/occurrence/${occurrence.id}`} style={{ minHeight: '44px' }}><span className="me-2" aria-hidden="true">←</span> Ver ocorrência</a>
      <section className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center justify-content-lg-between gap-3 mb-5">
        <div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Atendimento #{occurrence.metadata.serviceNumber}</p><h1 className="mb-0 fs-3">{occurrence.client.name} <span className="text-secondary fw-normal d-block d-sm-inline mt-1 mt-sm-0 fs-5">• {occurrence.elevator.identification}</span></h1></div>
        <div className="d-flex flex-wrap align-items-center gap-3"><PriorityIndicator priority={occurrence.priority} /><StatusBadge value={workflowStatus} /></div>
      </section>

      <div className={`row g-4 align-items-start ${isMaintenance ? 'justify-content-center' : ''}`}>
        {!isMaintenance && <div className="col-12 col-xl-8"><RouteMap occurrence={occurrence} /></div>}
        <aside className={`${isMaintenance ? 'col-12 col-md-6 col-lg-5 col-xl-4' : 'col-12 col-lg-5 col-xl-4 d-flex flex-column gap-4 order-lg-last'} app-card p-4`} aria-labelledby="preliminary-diagnosis-title">
          <p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Dados recebidos do equipamento</p>
          <h2 className="fs-5 mb-4" id="preliminary-diagnosis-title">{isMaintenance ? 'Diagnóstico técnico completo' : 'Diagnóstico preliminar'}</h2>
          <dl className="d-grid gap-3 mb-4">
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Falha detectada</dt><dd className="fw-bold mb-0">{occurrence.description}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Código demonstrativo</dt><dd className="fw-bold mb-0">{diagnosis.demoCode}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Sistema relacionado</dt><dd className="fw-bold mb-0">{diagnosis.system}</dd></div>
            <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Componente provável</dt><dd className="fw-bold mb-0">{diagnosis.probableOrigin}</dd></div>
          </dl>
          <div className="d-flex align-items-center justify-content-between p-3 rounded mb-3" style={{ background: 'var(--color-primary-soft)', color: 'var(--color-primary)' }}><span className="fw-bold" style={{ fontSize: '0.86rem' }}>Confiança demonstrativa</span><strong className="fs-5">{diagnosis.probability}%</strong></div>
          <p className="text-secondary mb-3" style={{ fontSize: '0.88rem' }}>Hipótese baseada nos dados recebidos do equipamento e no histórico da ocorrência; requer verificação técnica.</p>
          <p className="text-secondary mb-4" style={{ fontSize: '0.88rem' }}>{diagnosis.summary}</p>
          {isMaintenance && (
            <div className="d-grid gap-4 mt-4 pt-4 border-top">
              <section><h3 className="fs-6 mb-3">Sinais detectados</h3><ul className="text-secondary m-0 ps-3" style={{ fontSize: '0.9rem' }}>{signals.map((signal) => <li className="mb-2" key={signal}>{signal}</li>)}</ul></section>
              <section><h3 className="fs-6 mb-3">Componentes relacionados</h3><ul className="text-secondary m-0 ps-3" style={{ fontSize: '0.9rem' }}>{affectedComponents.map((component) => <li className="mb-2" key={component}>{component}</li>)}</ul></section>
            </div>
          )}
          {workflowStep.action && <button className="btn btn-primary btn-lg w-100 mt-auto" type="button" onClick={() => onAdvance(occurrence.id)}>{workflowStep.action}</button>}
        </aside>
        <div className={isMaintenance ? 'col-12 col-md-6 col-lg-7 col-xl-8' : 'col-12 col-lg-7 col-xl-8'}>
          <TechnicalInfoPanel occurrence={occurrence} />
          <div className="mt-4"><Elevator2DModel diagnosis={diagnosis} severity={occurrence.priority.classification} /></div>
        </div>
      </div>
    </>
  );
}
