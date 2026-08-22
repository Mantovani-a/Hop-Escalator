import { useState } from 'react';
import useDialogFocus from '../../hooks/useDialogFocus';
import { clients, elevators } from '../../data/mockData';
import { addOperationOccurrence } from '../../data/operationStore';

export default function ControlNewOccurrenceModal({ onClose }) {
  const dialogRef = useDialogFocus(onClose);
  const [clientId, setClientId] = useState('');
  const [elevatorId, setElevatorId] = useState('');
  const [description, setDescription] = useState('Falha técnica');
  const [trappedPeople, setTrappedPeople] = useState(0);

  const availableElevators = clientId ? elevators.filter(e => e.clientId === clientId) : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clientId || !elevatorId) return;

    const newId = `OCC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    
    addOperationOccurrence({
      id: newId,
      clientId,
      elevatorId,
      time: new Date().toISOString(),
      description,
      trappedPeople: description === 'Passageiros presos' ? (trappedPeople || 1) : 0,
      status: 'aberta',
    });

    onClose();
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div
        className="bg-white rounded shadow-lg overflow-hidden d-flex flex-column"
        style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-occurrence-title"
        ref={dialogRef}
      >
        <div className="d-flex align-items-center justify-content-between p-4 border-bottom">
          <h2 className="fs-5 mb-0" id="new-occurrence-title">Registrar Nova Ocorrência</h2>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Fechar modal"
          />
        </div>
        <div className="p-4 overflow-y-auto">
          <form id="new-occurrence-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="clientId" className="form-label">Estabelecimento / Cliente</label>
              <select
                id="clientId"
                className="form-select"
                value={clientId}
                onChange={(e) => { setClientId(e.target.value); setElevatorId(''); }}
                required
              >
                <option value="">Selecione o estabelecimento...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-3">
              <label htmlFor="elevatorId" className="form-label">Equipamento (Elevador)</label>
              <select
                id="elevatorId"
                className="form-select"
                value={elevatorId}
                onChange={(e) => setElevatorId(e.target.value)}
                required
                disabled={!clientId}
              >
                <option value="">Selecione o elevador...</option>
                {availableElevators.map(elevator => (
                  <option key={elevator.id} value={elevator.id}>{elevator.identification}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">Descrição do Problema</label>
              <select
                id="description"
                className="form-select"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              >
                <option value="Falha técnica">Falha técnica</option>
                <option value="Elevador parado">Elevador parado</option>
                <option value="Passageiros presos">Passageiros presos</option>
                <option value="Porta não fecha">Porta não fecha</option>
                <option value="Luz interna apagada">Luz interna apagada</option>
                <option value="Ruído estranho">Ruído estranho</option>
              </select>
            </div>

            {description === 'Passageiros presos' && (
              <div className="mb-3">
                <label htmlFor="trappedPeople" className="form-label">Número de Passageiros Presos</label>
                <input
                  type="number"
                  id="trappedPeople"
                  className="form-control"
                  min="1"
                  max="20"
                  value={trappedPeople || 1}
                  onChange={(e) => setTrappedPeople(parseInt(e.target.value, 10) || 1)}
                  required
                />
              </div>
            )}
          </form>
        </div>
        <div className="d-flex justify-content-end gap-2 p-4 border-top mt-auto bg-light">
          <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" form="new-occurrence-form" className="btn btn-primary">
            Registrar Ocorrência
          </button>
        </div>
      </div>
    </div>
  );
}
