import { useMemo, useState } from 'react';
import CityMap from '../CityMap';
import StatusBadge from '../StatusBadge';
import { buildCityRoute, getEstablishmentCityPoint, technicianCityPositions } from '../../data/cityMapData';
import { operatorTechnician } from '../../data/operatorData';
import { normalizeToken } from '../../utils/presentation';

export default function RouteMap({ occurrence }) {
  const [locationState, setLocationState] = useState('demo');
  const origin = technicianCityPositions['TEC-010'];
  const destination = getEstablishmentCityPoint(occurrence.clientId);
  const route = useMemo(() => buildCityRoute(origin, destination), [destination.x, destination.y]);
  const markers = useMemo(() => [
    {
      id: 'operator-joao-carlos', type: 'technician', typeLabel: 'Técnico', x: origin.x, y: origin.y,
      symbol: 'JC', label: operatorTechnician.name, shortLabel: operatorTechnician.name, status: 'Em deslocamento', tone: 'em-deslocamento', featured: true,
      avatar: operatorTechnician.avatar, avatarName: operatorTechnician.name,
      details: [{ label: 'Ocorrência', value: occurrence.protocol || occurrence.metadata.serviceNumber }, { label: 'Destino', value: occurrence.client.name }],
    },
    {
      id: `operator-destination-${occurrence.clientId}`, type: 'destination', typeLabel: 'Próximo destino', x: destination.x, y: destination.y,
      symbol: '◆', label: occurrence.client.name, shortLabel: 'Destino', status: occurrence.priority.classification, tone: normalizeToken(occurrence.priority.classification), featured: true,
      details: [{ label: 'Elevador', value: occurrence.elevator.identification }, { label: 'Endereço', value: occurrence.address }, { label: 'ETA', value: `${occurrence.metadata.etaMinutes} min` }],
    },
  ], [destination.x, destination.y, occurrence]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('fallback');
      return;
    }
    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      () => setLocationState('live'),
      () => setLocationState('fallback'),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 },
    );
  };

  const locationMessages = {
    demo: 'Localização demonstrativa ativa',
    requesting: 'Solicitando localização do dispositivo…',
    live: 'Localização do dispositivo confirmada; rota demonstrativa mantida',
    fallback: 'Localização não disponível. A rota demonstrativa continua ativa.',
  };
  const distance = Number(occurrence.metadata?.distanceKm ?? 0).toFixed(1).replace('.', ',');
  const eta = occurrence.metadata?.etaMinutes ?? 0;

  return (
    <section className="app-card hop-route-card" aria-labelledby="route-map-title">
      <div className="hop-route-card__heading">
        <div><p className="eyebrow eyebrow--dark">Navegação integrada</p><h2 id="route-map-title">Rota até o atendimento</h2></div>
        <span className="hop-route-card__demo-label">Mapa demonstrativo</span>
      </div>
      <div className="operator-route-map-wrap">
        <CityMap
          compact
          showFilters={false}
          markers={markers}
          route={route}
          ariaLabel={`Rota demonstrativa de ${operatorTechnician.name} até ${occurrence.client.name}`}
          fallback={<><strong>{occurrence.client.name}</strong><p>{occurrence.address}</p><span>{distance} km · ETA {eta} min</span></>}
        />
        <article className="operator-route-summary">
          <span>Próximo destino</span>
          <strong>{occurrence.client.name}</strong>
          <small>{occurrence.elevator.identification}</small>
          <p>{distance} km · {eta} min</p>
          <StatusBadge value={occurrence.priority.classification} type="severity" />
        </article>
      </div>
      <div className="hop-route-footer">
        <div><strong>{occurrence.client.name}</strong><span>{occurrence.address}</span><small>{locationMessages[locationState]}</small></div>
        <button className="btn btn-outline-primary" type="button" onClick={requestLocation} disabled={locationState === 'requesting'}>Usar minha localização</button>
      </div>
    </section>
  );
}
