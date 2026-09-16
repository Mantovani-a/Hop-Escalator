import { useState } from 'react';
import MetricCard from '../../components/MetricCard';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';
import ControlOperationsMap from '../../components/control/ControlOperationsMap';
import { formatElapsedMinutes } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function ControlOverview({ occurrences, technicians, onSelectOccurrence, onSelectTechnician }) {
  const [selectedMapItem, setSelectedMapItem] = useState(null);
  const active = occurrences.filter((occurrence) => occurrence.operationalStatus !== OPERATION_STATUS.RESOLVED);
  const critical = active.filter((occurrence) => occurrence.priority?.classification === 'crítica');
  const available = technicians.filter((technician) => technician.status === 'disponível').length;
  const attending = technicians.filter((technician) => technician.status === 'em atendimento').length;
  const scenarioOccurrence = occurrences.find((occurrence) => occurrence.protocol === 'HOP-1048');
  const highlightedActive = scenarioOccurrence && scenarioOccurrence.operationalStatus !== OPERATION_STATUS.RESOLVED
    ? [scenarioOccurrence, ...active.filter((occurrence) => occurrence.id !== scenarioOccurrence.id)]
    : active;
  const priorityItems = highlightedActive.slice(0, 3);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__subtitle">Visão geral em tempo real</p>
          <h1 className="page-header__title">Central de Operações</h1>
        </div>
        <span className="hop-badge px-3 py-2">Turno atual · 07:00–16:00</span>
      </header>

      <section className="control-metrics-grid" aria-label="Indicadores principais">
        <MetricCard label="Ocorrências críticas" value={critical.length} detail="prioridade imediata" tone="critical" />
        <MetricCard label="Chamados abertos" value={active.length} detail="em andamento na central" />
        <MetricCard label="Técnicos disponíveis" value={available} detail={`de ${technicians.length} profissionais`} tone="success" />
        <MetricCard label="Em atendimento" value={attending} detail="equipes em campo" tone="violet" />
      </section>

      <div className="control-overview-layout">
        <div>
          <ControlOperationsMap
            technicians={technicians}
            occurrences={highlightedActive}
            onSelectTechnician={onSelectTechnician}
            onSelectOccurrence={onSelectOccurrence}
            onMarkerSelect={setSelectedMapItem}
          />
        </div>

        <div>
          <section className="app-card control-priority-panel" aria-labelledby="priority-panel-title">
            <div className="d-flex align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
              <div>
                <p className="page-header__subtitle mb-0">Atenção imediata</p>
                <h2 className="fs-5 mb-0" id="priority-panel-title">Ocorrências prioritárias</h2>
              </div>
              <a href="#/control/occurrences" className="text-decoration-none fw-bold" style={{ fontSize: '0.78rem' }}>Ver fila</a>
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
                    <span className="d-inline-flex align-items-center gap-2">
                      <StatusBadge value={occurrence.priority?.classification || 'baixa'} type="severity" />
                      <b className="ms-2">{occurrence.priority?.score ?? 0}</b>
                    </span>
                  </header>
                  <h3>{occurrence.client?.name || 'Cliente'}</h3>
                  <p>{occurrence.description || 'Intercorrência reportada'}</p>
                  <footer>
                    <span>{occurrence.technician?.name || 'Sem técnico'} · {occurrence.operationalStatus}</span>
                    <small>{formatElapsedMinutes(occurrence.priority?.elapsedMinutes ?? 0)}</small>
                  </footer>
                </button>
              ))}
            </div>
          </section>
          <section className="app-card p-3 mt-4" aria-live="polite" aria-label="Detalhes do item selecionado no mapa">
            {selectedMapItem ? (
              <>
                <div className="d-flex align-items-center gap-3 mb-3">
                  {selectedMapItem.avatar && <ProfileAvatar name={selectedMapItem.avatarName || selectedMapItem.label} src={selectedMapItem.avatar} size="sm" decorative />}
                  <div><p className="page-header__subtitle mb-0">{selectedMapItem.typeLabel}</p><h2 className="fs-6 mb-0">{selectedMapItem.label}</h2></div>
                  {selectedMapItem.status && <span className="hop-badge ms-auto">{selectedMapItem.status}</span>}
                </div>
                <dl className="d-grid gap-2 mb-3">
                  {selectedMapItem.details?.map((detail) => <div className="d-flex justify-content-between gap-3 pb-2 border-bottom" key={detail.label}><dt className="text-secondary fw-normal" style={{ fontSize: '0.78rem' }}>{detail.label}</dt><dd className="fw-bold text-end mb-0" style={{ fontSize: '0.8rem' }}>{detail.value}</dd></div>)}
                </dl>
                {selectedMapItem.onOpen && <button className="btn btn-sm btn-outline-primary w-100" type="button" onClick={selectedMapItem.onOpen}>Abrir detalhes</button>}
              </>
            ) : <p className="text-secondary text-center mb-0 py-3">Selecione um item para obter mais detalhes</p>}
          </section>
        </div>
      </div>
    </>
  );
}
