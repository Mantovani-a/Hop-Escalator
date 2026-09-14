import { useMemo, useState } from 'react';
import LeafletMap from '../LeafletMap';
import StatusBadge from '../StatusBadge';
import {
  buildGeoRoute,
  getEstablishmentGeoPoint,
  technicianGeoPositions,
} from '../../data/geoCoordinates';
import { operatorTechnician } from '../../data/operatorData';
import { normalizeToken } from '../../utils/presentation';

export default function RouteMap({ occurrence }) {
  const [locationState, setLocationState] = useState('demo');
  const [liveOrigin, setLiveOrigin] = useState(null);

  const defaultOrigin = [
    technicianGeoPositions['TEC-010'].lat,
    technicianGeoPositions['TEC-010'].lng,
  ];

  const origin = liveOrigin || defaultOrigin;
  const destination = getEstablishmentGeoPoint(occurrence.clientId);

  const route = useMemo(
    () => buildGeoRoute(origin, destination),
    [origin[0], origin[1], destination[0], destination[1]]
  );

  const markers = useMemo(
    () => [
      {
        id: 'operator-joao-carlos',
        type: 'technician',
        typeLabel: 'Técnico',
        lat: origin[0],
        lng: origin[1],
        symbol: 'JC',
        label: operatorTechnician.name,
        shortLabel: operatorTechnician.name,
        status: 'Em deslocamento',
        tone: 'em-deslocamento',
        featured: true,
        avatar: operatorTechnician.avatar,
        avatarName: operatorTechnician.name,
        details: [
          { label: 'Ocorrência', value: occurrence.protocol || occurrence.metadata?.serviceNumber || 'HOP-1040' },
          { label: 'Destino', value: occurrence.client?.name || 'Cliente' },
        ],
      },
      {
        id: `operator-destination-${occurrence.clientId}`,
        type: 'destination',
        typeLabel: 'Próximo destino',
        lat: destination[0],
        lng: destination[1],
        symbol: '◆',
        label: occurrence.client?.name || 'Cliente',
        shortLabel: 'Destino',
        status: occurrence.priority?.classification || 'baixa',
        tone: normalizeToken(occurrence.priority?.classification || 'baixa'),
        featured: true,
        details: [
          { label: 'Elevador', value: occurrence.elevator?.identification || 'Elevador' },
          { label: 'Endereço', value: occurrence.address || 'Endereço não informado' },
          { label: 'ETA', value: `${occurrence.metadata?.etaMinutes ?? 10} min` },
        ],
      },
    ],
    [origin[0], origin[1], destination[0], destination[1], occurrence]
  );

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('fallback');
      return;
    }
    setLocationState('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLiveOrigin([position.coords.latitude, position.coords.longitude]);
        setLocationState('live');
      },
      () => setLocationState('fallback'),
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
    );
  };

  const locationMessages = {
    demo: 'Localização em rota estratégica ativa',
    requesting: 'Solicitando localização GPS do dispositivo…',
    live: 'Localização GPS do dispositivo confirmada; rota recalculada em tempo real',
    fallback: 'GPS não disponível. A rota demonstrativa continua ativa.',
  };

  const distance = Number(occurrence.metadata?.distanceKm ?? 0).toFixed(1).replace('.', ',');
  const eta = occurrence.metadata?.etaMinutes ?? 0;

  return (
    <section className="app-card hop-route-card" aria-labelledby="route-map-title">
      <div className="hop-route-card__heading">
        <div>
          <p className="eyebrow eyebrow--dark">Navegação integrada</p>
          <h2 id="route-map-title">Rota até o atendimento</h2>
        </div>
        <span className="hop-route-card__demo-label">Grande São Paulo · OpenStreetMap</span>
      </div>

      <div className="operator-route-map-wrap">
        <LeafletMap
          compact
          showFilters={false}
          center={origin}
          zoom={13}
          markers={markers}
          route={route}
          ariaLabel={`Rota de navegação de ${operatorTechnician.name} até ${occurrence.client?.name || 'Cliente'}`}
        />

        <article className="operator-route-summary">
          <span>Próximo destino</span>
          <strong>{occurrence.client?.name || 'Cliente'}</strong>
          <small>{occurrence.elevator?.identification || 'Elevador'}</small>
          <p>{distance} km · {eta} min</p>
          <StatusBadge value={occurrence.priority?.classification || 'baixa'} type="severity" />
        </article>
      </div>

      <div className="hop-route-footer">
        <div>
          <strong>{occurrence.client?.name || 'Cliente'}</strong>
          <span>{occurrence.address || 'Endereço não informado'}</span>
          <small>{locationMessages[locationState]}</small>
        </div>
        <button
          className="btn btn-outline-primary"
          type="button"
          onClick={requestLocation}
          disabled={locationState === 'requesting'}
        >
          Usar minha localização
        </button>
      </div>
    </section>
  );
}
