import LeafletMap from '../LeafletMap';
import StatusBadge from '../StatusBadge';
import { clients, elevators } from '../../data/mockData';
import {
  buildGeoRoute,
  getEstablishmentGeoPoint,
  getOccurrenceGeoPoint,
  getTechnicianGeoPoint,
  technicianGeoPositions,
} from '../../data/geoCoordinates';
import { formatElapsedMinutes, normalizeToken } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function ControlOperationsMap({
  technicians,
  occurrences,
  onSelectTechnician,
  onSelectOccurrence,
}) {
  const activeOccurrences = occurrences.slice(0, 16);

  // 1. Marcadores dos Técnicos
  const technicianMarkers = technicians.map((technician) => {
    const point = getTechnicianGeoPoint(technician);
    const current = technician.currentOccurrence;
    return {
      id: `technician-${technician.id}`,
      type: 'technician',
      typeLabel: 'Técnico',
      lat: point[0],
      lng: point[1],
      symbol: technician.name.split(' ').map((part) => part[0]).slice(0, 2).join(''),
      label: technician.name,
      shortLabel: technician.id === 'TEC-010' ? 'João Carlos' : technician.name.split(' ')[0],
      featured: technician.id === 'TEC-010',
      status: technician.status,
      tone: normalizeToken(technician.status),
      avatar: technician.avatar,
      avatarName: technician.name,
      details: [
        { label: 'Região', value: technician.region || '—' },
        { label: 'Ocorrência', value: current?.protocol || 'Sem chamado ativo' },
        { label: 'Destino', value: current?.client?.name || 'Aguardando despacho' },
        { label: 'ETA', value: current?.metadata?.etaMinutes != null ? `${current.metadata.etaMinutes} min` : '—' },
      ],
      onOpen: () => onSelectTechnician(technician.id),
    };
  });

  // 2. Marcadores das Ocorrências
  const occurrenceMarkers = activeOccurrences.map((occurrence, index) => {
    const point = getOccurrenceGeoPoint(occurrence, index);
    const priorityClass = occurrence.priority?.classification || 'média';
    return {
      id: `occurrence-${occurrence.id}`,
      type: 'occurrence',
      typeLabel: 'Ocorrência',
      lat: point[0],
      lng: point[1],
      symbol: '!',
      label: occurrence.protocol,
      shortLabel: occurrence.protocol,
      featured: priorityClass === 'crítica',
      status: `${priorityClass} · ${occurrence.operationalStatus || ''}`,
      tone: normalizeToken(priorityClass),
      details: [
        { label: 'Local', value: occurrence.client?.name || 'Local não informado' },
        { label: 'Elevador', value: occurrence.elevator?.identification || 'Equipamento' },
        { label: 'Problema', value: occurrence.description || 'Sem descrição' },
        { label: 'Técnico', value: occurrence.technician?.name || 'Aguardando atribuição' },
        { label: 'Tempo', value: formatElapsedMinutes(occurrence.priority?.elapsedMinutes || 0) },
      ],
      onOpen: () => onSelectOccurrence(occurrence.id),
    };
  });

  // 3. Marcadores dos Estabelecimentos / Prédios
  const establishmentMarkers = clients.map((client) => {
    const point = getEstablishmentGeoPoint(client.id);
    const clientElevators = elevators.filter((elevator) => elevator.clientId === client.id);
    const activeAtClient = occurrences.filter((occurrence) => occurrence.clientId === client.id);

    let category = 'corporate';
    const lowerType = (client.type || '').toLowerCase();
    if (lowerType.includes('hospital')) category = 'hospital';
    else if (lowerType.includes('shopping')) category = 'shopping';
    else if (lowerType.includes('hotel')) category = 'hotel';
    else if (lowerType.includes('condomínio') || lowerType.includes('residencial')) category = 'residential';

    return {
      id: `establishment-${client.id}`,
      type: 'establishment',
      category,
      typeLabel: 'Estabelecimento',
      lat: point[0],
      lng: point[1],
      symbol: client.type.slice(0, 1),
      label: client.name,
      shortLabel: client.name,
      status: client.type,
      details: [
        { label: 'Endereço', value: client.address },
        { label: 'Categoria', value: client.type },
        { label: 'Elevadores', value: String(clientElevators.length) },
        { label: 'Ativas', value: String(activeAtClient.length) },
        { label: 'Estado geral', value: activeAtClient.some((item) => item.priority?.classification === 'crítica') ? 'Atenção imediata' : 'Monitorado' },
      ],
    };
  });

  // Rota ativa do técnico João Carlos em atendimento
  const joao = technicians.find((technician) => technician.id === 'TEC-010');
  const joaoOccurrence = joao?.currentOccurrence;
  const joaoRoute = joaoOccurrence?.operationalStatus === OPERATION_STATUS.TRAVELING && joaoOccurrence?.clientId
    ? buildGeoRoute(
        [technicianGeoPositions['TEC-010'].lat, technicianGeoPositions['TEC-010'].lng],
        getEstablishmentGeoPoint(joaoOccurrence.clientId)
      )
    : [];

  return (
    <section className="app-card control-map-card" aria-labelledby="operations-map-title">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
        <div>
          <p className="page-header__subtitle mb-0">Situação em campo</p>
          <h2 className="fs-5 mb-0" id="operations-map-title">Mapa operacional</h2>
        </div>
        <span className="text-secondary" style={{ fontSize: '0.78rem' }}>
          Grande São Paulo · Monitoramento em Tempo Real
        </span>
      </div>

      <LeafletMap
        markers={[...establishmentMarkers, ...occurrenceMarkers, ...technicianMarkers]}
        route={joaoRoute}
      />

      <div className="control-map-statuses">
        <StatusBadge value="disponível" />
        <StatusBadge value="em deslocamento" />
        <StatusBadge value="em atendimento" />
        <StatusBadge value="indisponível" />
      </div>
    </section>
  );
}
