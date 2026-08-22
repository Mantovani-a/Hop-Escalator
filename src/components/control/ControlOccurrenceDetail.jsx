import { useRef } from 'react';
import ProfileAvatar from '../ProfileAvatar';
import StatusBadge from '../StatusBadge';
import { formatDateTime, formatElapsedMinutes } from '../../utils/presentation';
import useDialogFocus from '../../hooks/useDialogFocus';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function ControlOccurrenceDetail({ occurrence, recommendedTechnician, onAssignRecommended, onClose, onReassign }) {
  const panelRef = useRef(null);
  useDialogFocus(Boolean(occurrence), panelRef, onClose);
  if (!occurrence) return null;
  const timeline = [
    ['Falha detectada', 0], ['Cliente complementou informações', 2], ['Prioridade calculada', 2],
    [occurrence.technician ? `${occurrence.technician.name} atribuído` : 'Aguardando atribuição', 3],
    [occurrence.workflowStatus === OPERATION_STATUS.TRAVELING ? 'Técnico iniciou deslocamento' : 'Status operacional atualizado', 4],
  ];
  return (
    <div className="control-panel-layer" role="dialog" aria-modal="true" aria-labelledby="control-occurrence-title">
      <button className="control-panel-backdrop" type="button" aria-label="Fechar detalhe" onClick={onClose} />
      <aside ref={panelRef} className="control-detail-panel" tabIndex="-1">
        <header><div><p className="eyebrow eyebrow--dark">{occurrence.protocol}</p><h2 id="control-occurrence-title">Detalhe da ocorrência</h2></div><button type="button" onClick={onClose} aria-label="Fechar">×</button></header>
        <div className="control-detail-panel__badges"><StatusBadge value={occurrence.priority.classification} type="severity" /><strong>{occurrence.priority.score}/100</strong><StatusBadge value={occurrence.operationalStatus} /></div>
        <section><h3>Ocorrência</h3><dl><div><dt>Problema</dt><dd>{occurrence.description}</dd></div><div><dt>Horário</dt><dd>{formatDateTime(occurrence.time)}</dd></div><div><dt>Tempo aberto</dt><dd>{formatElapsedMinutes(occurrence.priority.elapsedMinutes)}</dd></div><div><dt>Pessoas presas</dt><dd>{occurrence.trappedPeople || 'Nenhuma informada'}</dd></div><div><dt>Risco informado</dt><dd>{occurrence.metadata.riskToLife ? 'Sim' : 'Não'}</dd></div></dl><ul className="control-reasons">{occurrence.priority.reasons.map((reason) => <li key={reason}><span aria-hidden="true">✓</span>{reason}</li>)}</ul></section>
        <section><h3>Local e elevador</h3><dl><div><dt>Estabelecimento</dt><dd>{occurrence.client?.name}</dd></div><div><dt>Tipo</dt><dd>{occurrence.client?.type}</dd></div><div><dt>Endereço</dt><dd>{occurrence.address}</dd></div><div><dt>Elevador</dt><dd>{occurrence.elevator?.identification}</dd></div><div><dt>Modelo</dt><dd>{occurrence.elevator?.model}</dd></div></dl></section>
        <section><h3>Técnico</h3>{occurrence.technician ? <div className="control-assignee"><ProfileAvatar name={occurrence.technician.name} src={occurrence.technician.avatar} size="md" decorative /><div><strong>{occurrence.technician.name}</strong><small>{occurrence.operationalStatus} · {occurrence.metadata.distanceKm.toFixed(1).replace('.', ',')} km · ETA {occurrence.metadata.etaMinutes} min</small></div></div> : recommendedTechnician ? <div className="control-dispatch-recommendation"><p className="eyebrow eyebrow--dark">Técnico recomendado</p><div className="control-assignee"><ProfileAvatar name={recommendedTechnician.name} src={recommendedTechnician.avatar} size="md" decorative /><div><strong>{recommendedTechnician.name}</strong><small>Disponível · {recommendedTechnician.distanceKm.toFixed(1).replace('.', ',')} km · {recommendedTechnician.specialty}</small></div></div><button className="btn btn-primary w-100" type="button" onClick={onAssignRecommended}>ATRIBUIR JOÃO CARLOS</button></div> : <p className="control-empty-note">Nenhum técnico disponível para recomendação.</p>}<button className="btn btn-outline-primary w-100 mt-2" type="button" onClick={() => onReassign(occurrence)}>{occurrence.technician ? 'Reatribuir técnico' : 'Escolher outro técnico'}</button></section>
        <section><h3>Timeline</h3><ol className="control-event-timeline">{timeline.map(([label, offset], index) => <li key={label}><time>{new Intl.DateTimeFormat('pt-BR',{hour:'2-digit',minute:'2-digit'}).format(new Date(new Date(occurrence.time).getTime() + offset * 60000))}</time><span>{label}</span>{index < timeline.length - 1 && <i aria-hidden="true" />}</li>)}</ol></section>
      </aside>
    </div>
  );
}
