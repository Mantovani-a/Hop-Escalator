import {
  clientGeoPositions,
  technicianGeoPositions,
  getEstablishmentGeoPoint,
  getTechnicianGeoPoint,
} from '../data/geoCoordinates.js';

const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const executionStatuses = new Set([
  'Aceito',
  'Em deslocamento',
  'No local',
  'Em manutenção',
  'A caminho da retirada',
  'Retornando ao cliente',
]);

const activeOccurrenceFor = (occurrence) => occurrence.workflowStatus !== 'Resolvido'
  && occurrence.operationalStatus !== 'Resolvido'
  && occurrence.status !== 'resolvida';

export const calculateHaversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getTechnicianCoords = (technician) => {
  if (technician?.lat != null && technician?.lng != null) {
    return [technician.lat, technician.lng];
  }
  if (technician?.id && technicianGeoPositions[technician.id]) {
    const pos = technicianGeoPositions[technician.id];
    return [pos.lat, pos.lng];
  }
  return getTechnicianGeoPoint(technician);
};

const getOccurrenceCoords = (occurrence) => {
  if (occurrence?.lat != null && occurrence?.lng != null) {
    return [occurrence.lat, occurrence.lng];
  }
  const clientId = occurrence?.clientId || occurrence?.client?.id;
  if (clientId && clientGeoPositions[clientId]) {
    const pos = clientGeoPositions[clientId];
    return [pos.lat, pos.lng];
  }
  return getEstablishmentGeoPoint(clientId);
};

const getSpecialtyMatch = (technician, occurrence) => {
  const specialty = normalize(technician?.specialty);
  const problem = normalize([
    occurrence?.description,
    occurrence?.detectedFailure,
    ...(occurrence?.metadata?.reportedProblems || []),
    occurrence?.metadata?.diagnosis?.probableOrigin,
  ].filter(Boolean).join(' '));

  if ((occurrence?.trappedPeople || 0) > 0) {
    return specialty.includes('resgate')
      ? { score: 34, reason: 'Especialidade compatível com resgate e emergência' }
      : { score: 0, reason: 'Atendimento emergencial fora da especialidade principal' };
  }
  if ((problem.includes('porta') || problem.includes('acesso')) && specialty.includes('porta')) {
    return { score: 27, reason: 'Especialidade compatível com portas e acessos' };
  }
  if ((problem.includes('painel') || problem.includes('botao') || problem.includes('comando'))
    && (specialty.includes('painel') || specialty.includes('comando') || specialty.includes('eletric'))) {
    return { score: 27, reason: 'Especialidade compatível com comandos e painéis' };
  }
  if ((problem.includes('eletric') || problem.includes('energia')) && specialty.includes('eletric')) {
    return { score: 27, reason: 'Especialidade compatível com sistemas elétricos' };
  }
  if ((problem.includes('ruido') || problem.includes('tracao') || problem.includes('mecanic')) && specialty.includes('mec')) {
    return { score: 24, reason: 'Especialidade compatível com mecânica e tração' };
  }
  if ((problem.includes('preventiv') || problem.includes('nivelamento')) && specialty.includes('preventiv')) {
    return { score: 22, reason: 'Especialidade compatível com manutenção preventiva' };
  }
  return { score: 8, reason: 'Perfil técnico geral compatível com o atendimento' };
};

export const rankTechniciansForDispatch = (occurrence, technicians, activeOccurrences = []) => technicians
  .map((technician) => {
    const assignedOccurrences = activeOccurrences.filter((item) => {
      const technicianId = item.technicianId || item.assignedTechnicianId;
      return technicianId === technician.id && activeOccurrenceFor(item);
    });
    const executing = assignedOccurrences.some((item) => executionStatuses.has(item.workflowStatus || item.operationalStatus));
    const load = assignedOccurrences.length || (technician.currentService ? 1 : 0);
    const available = technician.status === 'disponível' && !executing && load < 2;
    const specialty = getSpecialtyMatch(technician, occurrence);

    const [techLat, techLng] = getTechnicianCoords(technician);
    const [occLat, occLng] = getOccurrenceCoords(occurrence);
    let distanceKm = 10;
    if (techLat != null && techLng != null && occLat != null && occLng != null) {
      distanceKm = Math.round(calculateHaversineDistanceKm(techLat, techLng, occLat, occLng) * 10) / 10;
    } else if (technician.distanceKm != null) {
      distanceKm = Number(technician.distanceKm);
    }

    const proximityScore = Math.max(0, 28 - distanceKm * 2.6);
    // Penalidade para técnicos que já possuem ocorrências em aberto/atribuídas
    const loadPenalty = load * 15;
    const score = Math.max(0, Math.round(40 + specialty.score + proximityScore - loadPenalty));
    const loadReason = load === 0
      ? 'Sem chamados em aberto'
      : `Penalidade de carga: -${loadPenalty} pts (${load} chamado${load > 1 ? 's' : ''} em aberto)`;

    return {
      technician: {
        ...technician,
        distanceKm,
      },
      available,
      score,
      load,
      distanceKm,
      reasons: [
        'Disponível para despacho',
        specialty.reason,
        `Distância real de ${distanceKm.toFixed(1).replace('.', ',')} km (Haversine)`,
        loadReason,
      ],
    };
  })
  .filter((candidate) => candidate.available)
  .sort((first, second) => second.score - first.score
    || first.distanceKm - second.distanceKm
    || first.technician.name.localeCompare(second.technician.name));

export const getTechnicianRecommendation = (occurrence, technicians, activeOccurrences = []) =>
  rankTechniciansForDispatch(occurrence, technicians, activeOccurrences)[0] || null;

export const recommendTechnician = (occurrence, technicians, activeOccurrences = []) => {
  const candidate = getTechnicianRecommendation(occurrence, technicians, activeOccurrences);
  if (!candidate) return null;
  return {
    ...candidate.technician,
    distanceKm: candidate.distanceKm,
    dispatchScore: candidate.score,
  };
};
