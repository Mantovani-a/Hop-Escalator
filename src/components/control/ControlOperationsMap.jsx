import CityMap from '../CityMap';
import StatusBadge from '../StatusBadge';
import { clients, elevators } from '../../data/mockData';
import {
  buildCityRoute,
  getEstablishmentCityPoint,
  getOccurrenceCityPoint,
  getTechnicianCityPoint,
  technicianCityPositions,
} from '../../data/cityMapData';
import { formatElapsedMinutes, normalizeToken } from '../../utils/presentation';
import { OPERATION_STATUS } from '../../data/operationStore';

export default function ControlOperationsMap({ technicians, occurrences, onSelectTechnician, onSelectOccurrence }) {
  const activeOccurrences = occurrences.slice(0, 16);
  const technicianMarkers = technicians.map((technician) => {
    const point = getTechnicianCityPoint(technician);
    const current = technician.currentOccurrence;
    return {
      id: `technician-${technician.id}`,
      type: 'technician',
      typeLabel: 'Técnico',
      x: point.x,
      y: point.y,
      symbol: technician.name.split(' ').map((part) => part[0]).slice(0, 2).join(''),
      label: technician.name,
      shortLabel: technician.id === 'TEC-010' ? 'João Carlos' : technician.name.split(' ')[0],
      featured: technician.id === 'TEC-010',
      status: technician.status,
      tone: normalizeToken(technician.status),
      avatar: technician.avatar,
      avatarName: technician.name,
      details: [
        { label: 'Região', value: technician.region },
        { label: 'Ocorrência', value: current?.protocol || 'Sem chamado ativo' },
        { label: 'Destino', value: current?.client?.name || 'Aguardando despacho' },
        { label: 'ETA', value: current ? `${current.metadata.etaMinutes} min` : '—' },
      ],
      onOpen: () => onSelectTechnician(technician.id),
    };
  });

  const occurrenceMarkers = activeOccurrences.map((occurrence, index) => {
    const point = getOccurrenceCityPoint(occurrence, index);
    return {
      id: `occurrence-${occurrence.id}`,
      type: 'occurrence',
      typeLabel: 'Ocorrência',
      x: point.x,
      y: point.y,
      symbol: '!',
      label: occurrence.protocol,
      shortLabel: occurrence.protocol,
      featured: occurrence.protocol === 'HOP-1048',
      status: `${occurrence.priority.classification} · ${occurrence.operationalStatus}`,
      tone: normalizeToken(occurrence.priority.classification),
      details: [
        { label: 'Local', value: occurrence.client.name },
        { label: 'Elevador', value: occurrence.elevator.identification },
        { label: 'Problema', value: occurrence.description },
        { label: 'Técnico', value: occurrence.technician?.name || 'Aguardando atribuição' },
        { label: 'Tempo', value: formatElapsedMinutes(occurrence.priority.elapsedMinutes) },
      ],
      onOpen: () => onSelectOccurrence(occurrence.id),
    };
  });

  const establishmentMarkers = clients.map((client) => {
    const point = getEstablishmentCityPoint(client.id);
    const clientElevators = elevators.filter((elevator) => elevator.clientId === client.id);
    const activeAtClient = occurrences.filter((occurrence) => occurrence.clientId === client.id);
    return {
      id: `establishment-${client.id}`,
      type: 'establishment',
      typeLabel: 'Estabelecimento',
      x: point.x,
      y: point.y,
      symbol: client.type.slice(0, 1),
      label: client.name,
      shortLabel: client.name,
      status: client.type,
      details: [
        { label: 'Categoria', value: client.type },
        { label: 'Elevadores', value: String(clientElevators.length) },
        { label: 'Ativas', value: String(activeAtClient.length) },
        { label: 'Estado geral', value: activeAtClient.some((item) => item.priority.classification === 'crítica') ? 'Atenção imediata' : 'Monitorado' },
      ],
    };
  });

  const joao = technicians.find((technician) => technician.id === 'TEC-010');
  const joaoOccurrence = joao?.currentOccurrence;
  const joaoRoute = joaoOccurrence?.operationalStatus === OPERATION_STATUS.TRAVELING
    ? buildCityRoute(technicianCityPositions['TEC-010'], getEstablishmentCityPoint(joaoOccurrence.clientId))
    : [];

  return (
    <section className="app-card control-map-card" aria-labelledby="operations-map-title">
      <div className="d-flex align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
        <div>
          <p className="page-header__subtitle mb-0">Situação em campo</p>
          <h2 className="fs-5 mb-0" id="operations-map-title">Mapa operacional</h2>
        </div>
        <span className="text-secondary" style={{ fontSize: '0.78rem' }}>Nova Aurora · cidade demonstrativa</span>
      </div>
      <CityMap markers={[...establishmentMarkers, ...occurrenceMarkers, ...technicianMarkers]} route={joaoRoute} />
      <div className="control-map-statuses">
        <StatusBadge value="disponível" />
        <StatusBadge value="em deslocamento" />
        <StatusBadge value="em atendimento" />
        <StatusBadge value="indisponível" />
      </div>
    </section>
  );
}
