import { useMemo, useRef, useState } from 'react';
import MetricCard from '../../components/MetricCard';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';
import ControlOperationsMap from '../../components/control/ControlOperationsMap';
import useDialogFocus from '../../hooks/useDialogFocus';
import { formatElapsedMinutes } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

const criticalWaitingStatuses = new Set([
  OPERATION_STATUS.WAITING_ASSIGNMENT,
  OPERATION_STATUS.TECHNICIAN_ASSIGNED,
  OPERATION_STATUS.ACCEPTED,
]);

const RESOLVED_URGENT_STORAGE_KEY = 'hop-control-resolved-urgent-v2';

const readResolvedAlerts = () => {
  try {
    window.localStorage.removeItem('hop-control-dismissed-urgent-v1');
    window.localStorage.removeItem('hop-control-resolved-urgent-v1');
    const stored = JSON.parse(window.localStorage.getItem(RESOLVED_URGENT_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const writeResolvedAlerts = (items) => {
  const normalized = [...new Set(items)].slice(-100);
  try {
    window.localStorage.setItem(RESOLVED_URGENT_STORAGE_KEY, JSON.stringify(normalized));
  } catch {
    // A resolução continua válida durante a sessão quando o armazenamento está indisponível.
  }
  return normalized;
};

const buildOccurrenceAlert = (occurrence) => {
  const elapsed = occurrence.priority?.elapsedMinutes ?? 0;
  if (occurrence.metadata?.requiresReassignment || occurrence.metadata?.assignedTechnicianUnavailable) return {
    title: `${occurrence.technician?.name || 'Técnico atribuído'} ficou indisponível com atendimento em aberto`,
    detail: `${occurrence.protocol} · ${occurrence.client?.name}`,
    action: 'Reatribuir',
    actionType: 'reassign',
    tone: 'critical',
    rank: 100,
    alertKey: `${occurrence.id}:technician-unavailable:${occurrence.technicianId || 'none'}:${occurrence.assignedAt || occurrence.time}`,
  };
  if (!occurrence.technicianId) return {
    title: `${occurrence.protocol} está sem técnico atribuído`,
    detail: `${occurrence.client?.name} · ${occurrence.elevator?.identification || 'Elevador'}`,
    action: 'Reatribuir',
    actionType: 'reassign',
    tone: occurrence.priority?.classification === 'crítica' ? 'critical' : 'attention',
    rank: occurrence.priority?.classification === 'crítica' ? 95 : 76,
    alertKey: `${occurrence.id}:unassigned:${occurrence.metadata?.automaticDispatch?.attemptedAt || occurrence.time}`,
  };
  if (occurrence.operationalStatus === OPERATION_STATUS.WAITING_PART) return {
    title: `Nova demanda de peça para ${occurrence.protocol}`,
    detail: `${occurrence.partRequest?.part || 'Peça solicitada'} · ${occurrence.client?.name}`,
    action: 'Ver demanda',
    tone: 'attention',
    rank: 88,
    alertKey: `${occurrence.id}:waiting-part:${occurrence.partRequest?.requestedAt || occurrence.time}`,
  };
  if (occurrence.operationalStatus === OPERATION_STATUS.PART_AVAILABLE) return {
    title: `Peça disponível e atendimento ainda não retomado`,
    detail: `${occurrence.protocol} · ${occurrence.client?.name}`,
    action: 'Retomar',
    tone: 'attention',
    rank: 84,
    alertKey: `${occurrence.id}:part-available:${occurrence.partRequest?.availableAt || occurrence.time}`,
  };
  if (occurrence.priority?.classification === 'crítica'
    && criticalWaitingStatuses.has(occurrence.operationalStatus)
    && elapsed >= 30) return {
    title: `${occurrence.protocol} crítica aguarda além do limite`,
    detail: `${occurrence.client?.name} · ${occurrence.technician?.name || 'Sem técnico'}`,
    action: 'Ver ocorrência',
    tone: 'critical',
    rank: 90,
    alertKey: `${occurrence.id}:critical-wait:${occurrence.workflowHistory?.at(-1)?.at || occurrence.assignedAt || occurrence.time}`,
  };
  return null;
};

const buildRecurrenceAlerts = (occurrences, active) => {
  const byElevator = new Map();
  occurrences.forEach((occurrence) => {
    if (!occurrence.elevatorId) return;
    const group = byElevator.get(occurrence.elevatorId) || [];
    group.push(occurrence);
    byElevator.set(occurrence.elevatorId, group);
  });

  return [...byElevator.entries()].flatMap(([elevatorId, related]) => {
    const activeOccurrence = active.find((occurrence) => occurrence.elevatorId === elevatorId);
    if (!activeOccurrence || related.length < 2) return [];
    return [{
      occurrence: activeOccurrence,
      title: `${activeOccurrence.elevator?.identification || 'Elevador'} é reincidente em múltiplas falhas`,
      detail: `${activeOccurrence.client?.name} · ${related.length} ocorrências registradas`,
      action: 'Ver histórico',
      actionType: 'elevator-history',
      elevatorId,
      tone: 'attention',
      rank: 70,
      alertKey: `recurrence-${elevatorId}-${related.length}`,
    }];
  });
};

export default function ControlOverview({ occurrences, technicians, onSelectOccurrence, onSelectTechnician, onReassignOccurrence }) {
  const [selectedMapItem, setSelectedMapItem] = useState(null);
  const [resolvedAlertKeys, setResolvedAlertKeys] = useState(readResolvedAlerts);
  const [alertToResolve, setAlertToResolve] = useState(null);
  const alertResolutionRef = useRef(null);
  useDialogFocus(Boolean(alertToResolve), alertResolutionRef, () => setAlertToResolve(null));
  const active = useMemo(
    () => occurrences.filter((occurrence) => occurrence.operationalStatus !== OPERATION_STATUS.RESOLVED),
    [occurrences],
  );
  const critical = active.filter((occurrence) => occurrence.priority?.classification === 'crítica');
  const available = technicians.filter((technician) => technician.status === 'disponível').length;
  const attending = technicians.filter((technician) => technician.status === 'em atendimento').length;
  const allUrgentItems = useMemo(() => {
    const operationalAlerts = active.map((occurrence) => {
      const alert = buildOccurrenceAlert(occurrence);
      return alert ? { occurrence, ...alert } : null;
    }).filter(Boolean);
    return [...operationalAlerts, ...buildRecurrenceAlerts(occurrences, active)]
      .sort((first, second) => second.rank - first.rank);
  }, [active, occurrences]);
  const resolvedSet = useMemo(() => new Set(resolvedAlertKeys), [resolvedAlertKeys]);
  const urgentItems = allUrgentItems.filter((item) => !resolvedSet.has(item.alertKey)).slice(0, 8);

  const resolveAlert = () => {
    if (!alertToResolve) return;
    setResolvedAlertKeys((current) => writeResolvedAlerts([...current, alertToResolve.alertKey]));
    setAlertToResolve(null);
  };

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
        <div className="control-overview-map">
          <ControlOperationsMap
            technicians={technicians}
            occurrences={active}
            onSelectTechnician={onSelectTechnician}
            onSelectOccurrence={onSelectOccurrence}
            onMarkerSelect={setSelectedMapItem}
          />

          {selectedMapItem && (
            <section className="app-card control-map-selection" aria-live="polite" aria-label="Detalhes do item selecionado no mapa">
              <div className="d-flex align-items-center gap-3 mb-3">
                {selectedMapItem.avatar && <ProfileAvatar name={selectedMapItem.avatarName || selectedMapItem.label} src={selectedMapItem.avatar} size="sm" decorative />}
                <div><p className="page-header__subtitle mb-0">{selectedMapItem.typeLabel}</p><h2 className="fs-6 mb-0">{selectedMapItem.label}</h2></div>
                {selectedMapItem.status && <StatusBadge value={selectedMapItem.status} className="ms-auto" />}
              </div>
              <dl className="d-grid gap-2 mb-3">
                {selectedMapItem.details?.map((detail) => <div className="d-flex justify-content-between gap-3 pb-2 border-bottom" key={detail.label}><dt className="text-secondary fw-normal" style={{ fontSize: '0.78rem' }}>{detail.label}</dt><dd className="fw-bold text-end mb-0" style={{ fontSize: '0.8rem' }}>{detail.value}</dd></div>)}
              </dl>
              {selectedMapItem.onOpen && <button className="btn btn-sm btn-outline-primary w-100" type="button" onClick={selectedMapItem.onOpen}>Abrir detalhes</button>}
            </section>
          )}
        </div>

        <section className="app-card control-urgent" aria-labelledby="control-urgent-title">
          <header className="control-urgent__header">
            <div>
              <p className="page-header__subtitle mb-0">Supervisão operacional</p>
              <h2 id="control-urgent-title">Urgente</h2>
            </div>
            <span>{urgentItems.length} alerta{urgentItems.length === 1 ? '' : 's'}</span>
          </header>
          {urgentItems.length ? (
            <div className="control-urgent__list">
              {urgentItems.map(({ occurrence, title, detail, action, actionType, elevatorId, tone, alertKey }) => (
                <article className={`control-urgent__item control-urgent__item--${tone}`} key={alertKey}>
                  <div className="control-urgent__content">
                    <strong>{title}</strong>
                    <small>{detail}</small>
                  </div>
                  <button className="control-urgent__resolve" type="button" aria-label={`Marcar pendência como resolvida: ${title}`} title="Marcar como resolvida" onClick={() => setAlertToResolve({ title, detail, alertKey })}>×</button>
                  <footer>
                    <time>{formatElapsedMinutes(occurrence.priority?.elapsedMinutes ?? 0)}</time>
                    <button className="control-urgent__action" type="button" onClick={() => {
                      if (actionType === 'reassign') onReassignOccurrence(occurrence.id);
                      else if (actionType === 'elevator-history') window.location.hash = `#/control/elevators?history=${encodeURIComponent(elevatorId)}`;
                      else onSelectOccurrence(occurrence.id);
                    }}>{action}</button>
                  </footer>
                </article>
              ))}
            </div>
          ) : <p className="control-urgent__empty">Nenhuma pendência urgente ativa. O despacho automático segue monitorado.</p>}
        </section>
      </div>
      {alertToResolve && (
        <div className="control-modal-layer" role="dialog" aria-modal="true" aria-labelledby="resolve-alert-title">
          <div ref={alertResolutionRef} className="control-modal control-alert-resolution" tabIndex="-1">
            <header><div><p className="eyebrow eyebrow--dark">Urgente</p><h2 id="resolve-alert-title">Marcar pendência como resolvida?</h2></div><button type="button" aria-label="Fechar" onClick={() => setAlertToResolve(null)}>×</button></header>
            <p><strong>{alertToResolve.title}</strong><br />{alertToResolve.detail}</p>
            <p>O alerta sairá do painel. A ocorrência e o histórico do equipamento serão preservados.</p>
            <footer><button className="btn btn-outline-secondary" type="button" onClick={() => setAlertToResolve(null)}>Cancelar</button><button className="btn btn-primary" type="button" onClick={resolveAlert}>Confirmar resolução</button></footer>
          </div>
        </div>
      )}
    </>
  );
}
