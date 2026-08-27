import StatusBadge from '../StatusBadge';

const statusValue = (status) => ({
  'Operação normal': 'operando',
  'Técnico a caminho': 'em deslocamento',
  'Técnico realizando atendimento': 'em atendimento',
  'Atendimento no local': 'em atendimento',
  'Falha detectada': 'atenção',
  'Atenção': 'atenção',
  'Aguardando atribuição': 'aberta',
}[status] || status);

export default function ClientElevatorCard({ elevator, onSupport, onViewCall, activeCall }) {
  const hasActiveCall = Boolean(activeCall && activeCall.workflowStatus !== 'Resolvido');

  return (
    <article className="app-card client-elevator-card d-flex flex-column justify-content-between h-100 p-4">
      <div>
        <div className="client-elevator-card__head d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center gap-2">
            <span className="client-elevator-icon" aria-hidden="true">↕</span>
            <div>
              <span className="client-kicker d-block mb-0">{elevator.identification?.split(' • ')[0] || 'Elevador'}</span>
              <h3 className="client-elevator-card__name mb-0 fs-5">{elevator.displayName}</h3>
            </div>
          </div>
          <StatusBadge
            value={statusValue(elevator.clientStatus)}
            type={hasActiveCall ? 'status' : 'status'}
          />
        </div>

        <div className="client-elevator-card__info my-3">
          <p className="client-elevator-card__status mb-1">
            <span className="text-secondary">Condição:</span>{' '}
            <strong>{elevator.clientStatus || 'Operação normal'}</strong>
          </p>
          <p className="text-secondary small mb-0">
            {elevator.identification || elevator.model || 'Elevador de passageiros'}
          </p>
          {hasActiveCall && activeCall.protocol && (
            <div className="client-active-call-pill mt-2 p-2 rounded bg-primary-subtle text-primary small d-flex align-items-center justify-content-between">
              <span>Chamado ativo: <strong>{activeCall.protocol}</strong></span>
              <span className="fw-bold">→</span>
            </div>
          )}
        </div>
      </div>

      <div className="client-elevator-card__footer pt-3 border-top mt-auto">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <small className="text-secondary">Última checagem: {elevator.lastCheck || 'Hoje'}</small>
        </div>
        {hasActiveCall ? (
          <button
            className="btn btn-sm btn-primary w-100 fw-bold"
            type="button"
            onClick={() => onViewCall(activeCall.id)}
          >
            Acompanhar chamado
          </button>
        ) : (
          <button
            className="btn btn-sm btn-outline-primary w-100 fw-semibold"
            type="button"
            onClick={() => onSupport(elevator.id)}
          >
            Reportar problema
          </button>
        )}
      </div>
    </article>
  );
}
