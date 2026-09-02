import { operatorOccurrenceMetadata } from './operatorData.js';
import {
  elevators,
  getClientById,
  getElevatorById,
  getTechnicianById,
  occurrences,
  technicians,
} from './mockData.js';
import { calculatePriority } from '../utils/priorityScore.js';
import { getProfilePhotoPath } from '../utils/profileAvatar.js';
import { OPERATION_STATUS } from './operationStore.js';

export const controlUser = {
  id: 'CONTROL-USER-001',
  name: 'Fernanda Lima',
  initials: 'FL',
  role: 'Supervisora de Operações',
  avatar: getProfilePhotoPath('Fernanda Lima', 'leadership'),
};

const mapCoordinates = [
  [-23.5505, -46.6333], [-23.5631, -46.6544], [-23.5792, -46.6814], [-23.5244, -46.6672],
  [-23.5977, -46.6765], [-23.5438, -46.6155], [-23.6162, -46.7011], [-23.5108, -46.6279],
  [-23.5717, -46.6224], [-23.5859, -46.6598], [-23.5363, -46.7046], [-23.6048, -46.6377],
];

const workflowFromStatus = (occurrence) => {
  if (occurrence.workflowStatus) return occurrence.workflowStatus;
  if (occurrence.status === 'em deslocamento') return OPERATION_STATUS.TRAVELING;
  if (occurrence.status === 'em atendimento') return OPERATION_STATUS.MAINTENANCE;
  if (occurrence.status === 'resolvida') return OPERATION_STATUS.RESOLVED;
  return occurrence.technicianId ? OPERATION_STATUS.TECHNICIAN_ASSIGNED : OPERATION_STATUS.WAITING_ASSIGNMENT;
};

const getOperationalStatus = (workflowStatus, hasTechnician = true) => {
  if (workflowStatus) return workflowStatus;
  return hasTechnician ? OPERATION_STATUS.TECHNICIAN_ASSIGNED : OPERATION_STATUS.WAITING_ASSIGNMENT;
};

const buildMetadata = (occurrence, index, elevator) => {
  const existing = occurrence.metadata || operatorOccurrenceMetadata[occurrence.id] || {};
  const [latitude, longitude] = mapCoordinates[index % mapCoordinates.length];
  return {
    serviceNumber: occurrence.protocol || existing.serviceNumber || `HOP-${1040 + index}`,
    distanceKm: existing.distanceKm ?? (2.1 + (index % 8) * 1.3),
    etaMinutes: existing.etaMinutes ?? (6 + (index % 7) * 3),
    latitude: existing.latitude ?? latitude,
    longitude: existing.longitude ?? longitude,
    riskToLife: existing.riskToLife ?? occurrence.trappedPeople > 0,
    criticalFacility: existing.criticalFacility ?? getClientById(occurrence.clientId)?.type === 'Hospital',
    elevatorStopped: existing.elevatorStopped ?? elevator?.status === 'parado',
    partialFailure: existing.partialFailure ?? ['atenção', 'baixa'].includes(occurrence.severity),
    recurrence: existing.recurrence ?? occurrences.filter((item) => item.elevatorId === occurrence.elevatorId).length >= 2,
    clientNotes: existing.clientNotes || occurrence.observation || occurrence.locationContext,
    diagnosis: existing.diagnosis,
  };
};

export const buildControlOccurrences = (operationState, now = new Date()) => {
  const sharedOccurrences = operationState?.occurrences || [];
  return sharedOccurrences.map((occurrence, index) => {
    const client = getClientById(occurrence.clientId);
    const baseElevator = getElevatorById(occurrence.elevatorId);
    const metadata = buildMetadata(occurrence, index, baseElevator);
    const elevator = metadata.elevatorStopped ? { ...baseElevator, status: 'parado' } : baseElevator;
    const workflowStatus = workflowFromStatus(occurrence);
    const technicianId = occurrence.technicianId || occurrence.assignedTechnicianId || null;
    const technician = technicianId ? getTechnicianById(technicianId) : null;
    const priority = calculatePriority({ occurrence, client, elevator, metadata, now });
    return {
      ...occurrence,
      client,
      elevator,
      metadata,
      priority,
      protocol: metadata.serviceNumber,
      technicianId,
      technician,
      workflowStatus,
      operationalStatus: getOperationalStatus(workflowStatus, Boolean(technicianId)),
    };
  }).sort((first, second) => second.priority.score - first.priority.score);
};

export const buildControlTechnicians = (controlOccurrences, operatorShiftActive = true) => technicians.map((technician, index) => {
  const currentOccurrence = controlOccurrences.find((occurrence) =>
    occurrence.technicianId === technician.id && occurrence.operationalStatus !== OPERATION_STATUS.RESOLVED);
  let status = technician.status;
  if (technician.id === 'TEC-010' && !currentOccurrence) status = 'disponível';
  if (currentOccurrence?.operationalStatus === OPERATION_STATUS.ACCEPTED) status = 'em atendimento';
  if (currentOccurrence?.operationalStatus === OPERATION_STATUS.TRAVELING) status = 'em deslocamento';
  if ([OPERATION_STATUS.ON_SITE, OPERATION_STATUS.MAINTENANCE].includes(currentOccurrence?.operationalStatus)) status = 'em atendimento';
  if (technician.id === 'TEC-010' && !operatorShiftActive) status = 'indisponível';
  return {
    ...technician,
    status,
    currentOccurrence,
    completedToday: 1 + (index % 4),
    recentHistory: [
      `${10 + (index % 4)}:${index % 2 ? '35' : '10'} — Atendimento concluído`,
      `Ontem — ${technician.specialty}`,
    ],
    mapPosition: { x: 15 + ((index * 17) % 72), y: 18 + ((index * 23) % 64) },
  };
});

export const buildElevatorOverview = (controlOccurrences = []) => elevators.map((elevator) => {
  const related = controlOccurrences.filter((occurrence) => occurrence.elevatorId === elevator.id);
  const lastOccurrence = [...related].sort((first, second) => new Date(second.time) - new Date(first.time))[0];
  const activeOccurrence = related.find((occurrence) => occurrence.operationalStatus !== OPERATION_STATUS.RESOLVED);
  return {
    ...elevator,
    status: activeOccurrence?.elevator?.status || elevator.status,
    client: getClientById(elevator.clientId),
    lastOccurrence,
    recentOccurrenceCount: related.length + (elevator.id === 'ELV-007' ? 2 : 0),
    recurrent: related.length >= 2 || elevator.id === 'ELV-007',
  };
});
