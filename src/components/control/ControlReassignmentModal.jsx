import { useRef, useState } from 'react';
import ProfileAvatar from '../ProfileAvatar';
import StatusBadge from '../StatusBadge';
import useDialogFocus from '../../hooks/useDialogFocus';

export default function ControlReassignmentModal({ occurrence, technicians, onCancel, onConfirm }) {
  const [selectedId, setSelectedId] = useState('');
  const modalRef = useRef(null);
  useDialogFocus(Boolean(occurrence), modalRef, onCancel);
  if (!occurrence) return null;
  const selected = technicians.find((technician) => technician.id === selectedId);
  return (
    <div className="control-modal-layer" role="dialog" aria-modal="true" aria-labelledby="reassignment-title">
      <div ref={modalRef} className="control-modal" tabIndex="-1">
        <header><div><p className="eyebrow eyebrow--dark">{occurrence.protocol}</p><h2 id="reassignment-title">Reatribuir técnico</h2></div><button type="button" onClick={onCancel} aria-label="Fechar">×</button></header>
        <p>Selecione um técnico disponível para assumir esta ocorrência.</p>
        <div className="control-reassignment-list">
          {technicians.map((technician) => <button key={technician.id} className={selectedId === technician.id ? 'is-selected' : ''} type="button" onClick={() => setSelectedId(technician.id)}><ProfileAvatar name={technician.name} src={technician.avatar} size="md" className="control-reassignment-avatar" decorative /><span><strong>{technician.name}</strong><small>{technician.region} · {technician.specialty}</small></span><span><StatusBadge value={technician.status} /><small>{technician.distanceKm.toFixed(1).replace('.', ',')} km</small></span></button>)}
        </div>
        {selected && <div className="control-confirm-copy" role="status">Reatribuir {occurrence.protocol} de {occurrence.technician?.name || 'sem técnico'} para <strong>{selected.name}</strong>?</div>}
        <footer><button className="btn btn-outline-secondary" type="button" onClick={onCancel}>Cancelar</button><button className="btn btn-primary" type="button" disabled={!selected} onClick={() => onConfirm(selected.id)}>Confirmar reatribuição</button></footer>
      </div>
    </div>
  );
}
