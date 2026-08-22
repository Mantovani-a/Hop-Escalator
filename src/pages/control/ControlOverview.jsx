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
      <section className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-sm-between gap-4 pb-4 border-bottom"><div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Visão geral em tempo real</p><h1 className="mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Central de Operações</h1></div><span className="badge bg-white text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">Turno atual · 07:00–16:00</span></section>
      <section className="d-grid gap-2 mt-4 p-4 border border-start-0 rounded bg-white shadow-sm" style={{ borderLeft: '4px solid var(--color-severity-critical) !important' }} aria-label="Alertas operacionais"><strong className="text-danger"><span className="d-inline-flex align-items-center justify-content-center border border-danger rounded-circle me-1" style={{ width: '1.2rem', height: '1.2rem' }} aria-hidden="true">!</span> {critical.length} ocorrências críticas exigem acompanhamento</strong><span className="text-secondary">3 elevadores apresentaram falhas recorrentes</span><span className="text-secondary">{scenarioAlert}</span></section>
      <section className="row g-3 mt-4" aria-label="Indicadores principais">
        <div className="col-12 col-sm-4 col-xl-2"><MetricCard label="Ocorrências abertas" value={active.length} detail="na operação atual" /></div>
        <div className="col-12 col-sm-4 col-xl-2"><MetricCard label="Críticas" value={critical.length} detail="prioridade imediata" tone="critical" /></div>
        <div className="col-12 col-sm-4 col-xl-2"><MetricCard label="Técnicos disponíveis" value={available} detail={`de ${technicians.length} profissionais`} tone="success" /></div>
        <div className="col-12 col-sm-4 col-xl-2"><MetricCard label="Em atendimento" value={attending} detail="técnicos no local" /></div>
        <div className="col-12 col-sm-4 col-xl-4"><MetricCard label="Resposta média" value="11 min" detail="dado demonstrativo" /></div>
      </section>
      <div className="row g-4 mt-5 align-items-start">
        <ControlOperationsMap technicians={technicians} occurrences={highlightedActive} onSelectTechnician={onSelectTechnician} onSelectOccurrence={onSelectOccurrence} />
        <div className="col-12 col-xl-4">
          <section className="card shadow-sm border-0 p-4 overflow-auto" style={{ maxHeight: "650px" }} aria-labelledby="priority-panel-title">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-4"><div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Atenção imediata</p><h2 className="fs-5 mb-0" id="priority-panel-title">Ocorrências prioritárias</h2></div><a href="#/control/occurrences" className="text-decoration-none fw-bold text-secondary" style={{ fontSize: '0.76rem' }}>Ver fila</a></div>
            <div className="d-grid gap-2">{priorityItems.map((occurrence) => <button key={occurrence.id} type="button" className="btn btn-light border text-start p-3 w-100" onClick={() => onSelectOccurrence(occurrence.id)}><div className="d-flex align-items-center justify-content-between mb-2"><strong>{occurrence.protocol}</strong><span><StatusBadge value={occurrence.priority.classification} type="severity" /> <b className="ms-2">{occurrence.priority.score}</b></span></div><h3 className="fs-6 mb-1 text-dark">{occurrence.client.name}</h3><p className="text-secondary mb-3 fs-6">{occurrence.description}</p><footer className="d-flex justify-content-between text-muted" style={{ fontSize: '0.75rem' }}><span>{occurrence.technician?.name || 'Sem técnico'} · {occurrence.operationalStatus}</span><small>{formatElapsedMinutes(occurrence.priority.elapsedMinutes)}</small></footer></button>)}</div>
          </section>
        </div>
      </div>
      
    </>
  );
}
