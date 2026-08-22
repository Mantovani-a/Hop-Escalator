import { useRef } from 'react';
import ProfileAvatar from '../ProfileAvatar';
import StatusBadge from '../StatusBadge';
import useDialogFocus from '../../hooks/useDialogFocus';

export default function ControlTechnicianDetail({ technician, onClose }) {
  const panelRef = useRef(null);
  useDialogFocus(Boolean(technician), panelRef, onClose);
  if (!technician) return null;
  return (
    <div className="control-panel-layer" role="dialog" aria-modal="true" aria-labelledby="technician-detail-title">
      <button className="control-panel-backdrop" type="button" aria-label="Fechar detalhe" onClick={onClose} />
      <aside ref={panelRef} className="control-detail-panel" tabIndex="-1">
        <header><div><p className="eyebrow eyebrow--dark">{technician.id}</p><h2 id="technician-detail-title">Detalhe do técnico</h2></div><button type="button" onClick={onClose} aria-label="Fechar">×</button></header>
        <div className="control-technician-hero"><ProfileAvatar name={technician.name} src={technician.avatar} size="lg" decorative /><div><h3>{technician.name}</h3><StatusBadge value={technician.status} /></div></div>
        <section><h3>Operação atual</h3><dl><div><dt>Região</dt><dd>{technician.region}</dd></div><div><dt>Especialidade</dt><dd>{technician.specialty}</dd></div><div><dt>Ocorrência atual</dt><dd>{technician.currentOccurrence?.protocol || 'Sem atendimento atribuído'}</dd></div><div><dt>Concluídos hoje</dt><dd>{technician.completedToday}</dd></div></dl></section>
        {technician.currentOccurrence && <section className="control-current-service"><p className="eyebrow eyebrow--dark">Atendimento atual</p><strong>{technician.currentOccurrence.client.name}</strong><span>{technician.currentOccurrence.elevator.identification}</span><span>{technician.currentOccurrence.description}</span><small>{technician.currentOccurrence.metadata.distanceKm.toFixed(1).replace('.', ',')} km · ETA {technician.currentOccurrence.metadata.etaMinutes} min</small></section>}
        <section><h3>Histórico recente</h3><ul className="control-history-list">{technician.recentHistory.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </aside>
    </div>
  );
}
