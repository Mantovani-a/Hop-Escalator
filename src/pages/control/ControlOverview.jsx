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
      <section className="control-page-heading"><div><p className="eyebrow eyebrow--dark">Visão geral em tempo real</p><h1>Central de Operações</h1></div><span className="control-shift">Turno atual · 07:00–16:00</span></section>
      <section className="control-alert-strip" aria-label="Alertas operacionais"><strong><span aria-hidden="true">!</span> {critical.length} ocorrências críticas exigem acompanhamento</strong><span>3 elevadores apresentaram falhas recorrentes</span><span>{scenarioAlert}</span></section>
      <section className="control-metrics" aria-label="Indicadores principais">
        <MetricCard label="Ocorrências abertas" value={active.length} detail="na operação atual" />
        <MetricCard label="Críticas" value={critical.length} detail="prioridade imediata" tone="critical" />
        <MetricCard label="Técnicos disponíveis" value={available} detail={`de ${technicians.length} profissionais`} tone="success" />
        <MetricCard label="Em atendimento" value={attending} detail="técnicos no local" />
        <MetricCard label="Resposta média" value="11 min" detail="dado demonstrativo" />
      </section>
      <div className="control-overview-grid">
        <ControlOperationsMap technicians={technicians} occurrences={highlightedActive} onSelectTechnician={onSelectTechnician} onSelectOccurrence={onSelectOccurrence} />
        <section className="app-card control-priority-panel" aria-labelledby="priority-panel-title">
          <div className="section-heading control-section-heading"><div><p className="eyebrow eyebrow--dark">Atenção imediata</p><h2 id="priority-panel-title">Ocorrências prioritárias</h2></div><a href="#/control/occurrences">Ver fila</a></div>
          <div className="control-priority-list">{priorityItems.map((occurrence) => <button key={occurrence.id} type="button" onClick={() => onSelectOccurrence(occurrence.id)}><div><strong>{occurrence.protocol}</strong><span><StatusBadge value={occurrence.priority.classification} type="severity" /> <b>{occurrence.priority.score}</b></span></div><h3>{occurrence.client.name}</h3><p>{occurrence.description}</p><footer><span>{occurrence.technician?.name || 'Sem técnico'} · {occurrence.operationalStatus}</span><small>{formatElapsedMinutes(occurrence.priority.elapsedMinutes)}</small></footer></button>)}</div>
        </section>
      </div>
    </>
  );
}
