import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import ControlOperationsMap from '../../components/control/ControlOperationsMap';
import { formatElapsedMinutes } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function ControlOverview({ occurrences, technicians, onSelectOccurrence, onSelectTechnician }) {
  const active = occurrences.filter((occurrence) => occurrence.operationalStatus !== OPERATION_STATUS.RESOLVED);
  const critical = active.filter((occurrence) => occurrence.priority.classification === 'crítica');
  const available = technicians.filter((technician) => technician.status === 'disponível').length;
  const attending = technicians.filter((technician) => technician.status === 'em atendimento').length;
  const scenarioOccurrence = occurrences.find((occurrence) => occurrence.protocol === 'HOP-1048');
  const highlightedActive = scenarioOccurrence && scenarioOccurrence.operationalStatus !== OPERATION_STATUS.RESOLVED
    ? [scenarioOccurrence, ...active.filter((occurrence) => occurrence.id !== scenarioOccurrence.id)]
    : active;
  const priorityItems = highlightedActive.slice(0, 5);
  const scenarioAlert = scenarioOccurrence
    ? `${scenarioOccurrence.technician?.name || 'Sem técnico'} — ${scenarioOccurrence.operationalStatus} em HOP-1048`
    : 'Cenário HOP-1048 pronto para abertura pelo HOP Client';
  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__subtitle">Visão geral em tempo real</p>
          <h1 className="page-header__title">Central de Operações</h1>
        </div>
        <span className="badge app-card text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">Turno atual · 07:00–16:00</span>
      </header>

      <section className="control-alert-strip" aria-label="Alertas operacionais">
        <div className="control-alert-strip__item">
          <span className="d-inline-flex align-items-center justify-content-center border border-danger text-danger rounded-circle fw-bold" style={{ width: '1.2rem', height: '1.2rem', fontSize: '0.75rem' }} aria-hidden="true">!</span>
          <strong>{critical.length} ocorrências críticas exigem acompanhamento</strong>
        </div>
        <div className="control-alert-strip__item">
          <span>3 elevadores com falhas recorrentes</span>
        </div>
        <div className="control-alert-strip__item">
          <span>{scenarioAlert}</span>
        </div>
      </section>

      <section className="control-metrics-grid" aria-label="Indicadores principais">
        <MetricCard label="Ocorrências abertas" value={active.length} detail="na operação atual" />
        <MetricCard label="Críticas" value={critical.length} detail="prioridade imediata" tone="critical" />
        <MetricCard label="Técnicos disponíveis" value={available} detail={`de ${technicians.length} profissionais`} tone="success" />
        <MetricCard label="Em atendimento" value={attending} detail="técnicos no local" />
        <MetricCard label="Resposta média" value="11 min" detail="dado demonstrativo" />
      </section>

      <div className="control-overview-layout">
        <div>
          <ControlOperationsMap
            technicians={technicians}
            occurrences={highlightedActive}
            onSelectTechnician={onSelectTechnician}
            onSelectOccurrence={onSelectOccurrence}
          />
        </div>

        <div>
          <section className="control-priority-panel" aria-labelledby="priority-panel-title">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
              <div>
                <p className="page-header__subtitle mb-0">Atenção imediata</p>
                <h2 className="fs-5 mb-0" id="priority-panel-title">Ocorrências prioritárias</h2>
              </div>
              <a href="#/control/occurrences" className="text-decoration-none fw-bold text-secondary" style={{ fontSize: '0.78rem' }}>Ver fila</a>
            </div>

            <div className="control-priority-list">
              {priorityItems.map((occurrence) => (
                <button
                  key={occurrence.id}
                  type="button"
                  className="control-priority-item"
                  onClick={() => onSelectOccurrence(occurrence.id)}
                >
                  <header>
                    <strong>{occurrence.protocol}</strong>
                    <span>
                      <StatusBadge value={occurrence.priority.classification} type="severity" />
                      <b className="ms-2">{occurrence.priority.score}</b>
                    </span>
                  </header>
                  <h3>{occurrence.client.name}</h3>
                  <p>{occurrence.description}</p>
                  <footer>
                    <span>{occurrence.technician?.name || 'Sem técnico'} · {occurrence.operationalStatus}</span>
                    <small>{formatElapsedMinutes(occurrence.priority.elapsedMinutes)}</small>
                  </footer>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
