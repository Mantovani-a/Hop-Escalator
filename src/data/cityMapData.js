import { OPERATION_STATUS } from './operationStore.js';

const establishmentCityPositions = {
  'CLI-001': { x: 755, y: 95 },
  'CLI-002': { x: 430, y: 95 },
  'CLI-003': { x: 95, y: 95 },
  'CLI-004': { x: 95, y: 344 },
  'CLI-005': { x: 430, y: 344 },
  'CLI-006': { x: 755, y: 344 },
  'CLI-007': { x: 430, y: 562 },
  'CLI-008': { x: 95, y: 562 },
  'CLI-009': { x: 755, y: 562 },
  'CLI-010': { x: 555, y: 344 },
};

export const technicianCityPositions = {
  'TEC-001': { x: 342, y: 145 }, 'TEC-002': { x: 662, y: 382 },
  'TEC-003': { x: 342, y: 258 }, 'TEC-004': { x: 160, y: 258 },
  'TEC-005': { x: 500, y: 258 }, 'TEC-006': { x: 830, y: 472 },
  'TEC-007': { x: 662, y: 562 }, 'TEC-008': { x: 160, y: 472 },
  'TEC-009': { x: 342, y: 70 },  'TEC-010': { x: 342, y: 472 },
  'TEC-011': { x: 662, y: 145 }, 'TEC-012': { x: 662, y: 258 },
};

const occurrenceOffsets = [
  { x: 38, y: 0 }, { x: -38, y: 0 }, { x: 38, y: 30 },
  { x: -38, y: 30 }, { x: 0, y: 34 }, { x: 0, y: -34 },
];

export const getEstablishmentCityPoint = (clientId) => establishmentCityPositions[clientId] || { x: 500, y: 350 };

export const getOccurrenceCityPoint = (occurrence, index = 0) => {
  const base = getEstablishmentCityPoint(occurrence.clientId);
  const offset = occurrenceOffsets[index % occurrenceOffsets.length];
  return { x: base.x + offset.x, y: base.y + offset.y };
};

export const getTechnicianCityPoint = (technician) => {
  const base = technicianCityPositions[technician.id] || { x: 500, y: 350 };
  const currentOccurrence = technician.currentOccurrence;
  if (!currentOccurrence) return base;
  const destination = getEstablishmentCityPoint(currentOccurrence.clientId);
  if (currentOccurrence.operationalStatus === OPERATION_STATUS.TRAVELING) {
    const progress = technician.id === 'TEC-010' ? 0.58 : 0.42;
    return {
      x: base.x + (destination.x - base.x) * progress,
      y: base.y + (destination.y - base.y) * progress,
    };
  }
  if ([OPERATION_STATUS.ON_SITE, OPERATION_STATUS.MAINTENANCE].includes(currentOccurrence.operationalStatus)) {
    return { x: destination.x - 20, y: destination.y + 18 };
  }
  return base;
};

export const buildCityRoute = (start, end) => [
  start,
  { x: start.x + (end.x - start.x) * 0.32, y: start.y - 54 },
  { x: start.x + (end.x - start.x) * 0.66, y: end.y + 42 },
  end,
];
