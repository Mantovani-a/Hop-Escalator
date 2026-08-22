import { useEffect, useRef } from 'react';
import PriorityIndicator from './PriorityIndicator';

export default function NewOccurrenceAlert({ occurrence, open, onClose, onAccept, onView }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="operator-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="app-card operator-alert-panel" role="dialog" aria-modal="true" aria-labelledby="new-occurrence-title">
        <button ref={closeButtonRef} className="operator-alert-panel__close" type="button" aria-label="Fechar alerta" onClick={onClose}>×</button>
        <p className="eyebrow eyebrow--dark">Nova atribuição</p>
        <h2 id="new-occurrence-title">Nova ocorrência atribuída a João Carlos</h2>
        <PriorityIndicator priority={occurrence.priority} />
        <div className="operator-alert-panel__summary">
          <strong>{occurrence.client.name}</strong>
          <span>{occurrence.elevator.identification}</span>
          <p>{occurrence.description}</p>
        </div>
        <div className="operator-alert-panel__actions">
          <button className="btn btn-primary btn-lg" type="button" onClick={onAccept}>ACEITAR OCORRÊNCIA</button>
          <button className="btn btn-outline-primary btn-lg" type="button" onClick={onView}>Visualizar detalhes</button>
        </div>
      </section>
    </div>
  );
}
