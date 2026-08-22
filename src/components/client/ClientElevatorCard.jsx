import StatusBadge from '../StatusBadge';

const statusValue = (status) => ({
  'Operação normal': 'operando',
  'Técnico a caminho': 'em deslocamento',
  'Falha detectada': 'crítica',
  Atenção: 'atenção',
}[status] || status);

export default function ClientElevatorCard({ elevator, onSupport }) {
  return (
    <article className={`app-card client-elevator-card${elevator.detectedFailure ? ' client-elevator-card--alert' : ''}`}>
      <div className="client-elevator-card__head">
        <span className="client-elevator-icon" aria-hidden="true">↕</span>
        <StatusBadge value={statusValue(elevator.clientStatus)} type={elevator.clientStatus === 'Falha detectada' ? 'severity' : 'status'} />
      </div>
      <div>
        <p className="client-kicker">{elevator.identification.split(' • ')[0]}</p>
        <h3>{elevator.displayName}</h3>
        <p className="client-elevator-card__status"><strong>{elevator.clientStatus}</strong>{elevator.system && <> · {elevator.system}</>}</p>
      </div>
      <div className="client-elevator-card__footer">
        <small>Última verificação: {elevator.lastCheck}</small>
        {elevator.detectedFailure && !elevator.supportRequested && <button className="btn btn-primary" type="button" onClick={() => onSupport(elevator.id)}>Solicitar suporte</button>}
      </div>
    </article>
  );
}
