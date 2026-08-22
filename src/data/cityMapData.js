import { OPERATION_STATUS } from './operationStore.js';

const establishmentCityPositions = {
  'CLI-001': { x: 680, y: 300 },
  'CLI-002': { x: 485, y: 205 },
  'CLI-003': { x: 230, y: 185 },
  'CLI-004': { x: 760, y: 150 },
  'CLI-005': { x: 820, y: 505 },
  'CLI-006': { x: 555, y: 465 },
  'CLI-007': { x: 315, y: 365 },
  'CLI-008': { x: 155, y: 515 },
  'CLI-009': { x: 435, y: 575 },
  'CLI-010': { x: 875, y: 335 },
};

export const technicianCityPositions = {
  'TEC-001': { x: 405, y: 330 }, 'TEC-002': { x: 590, y: 505 },
  'TEC-003': { x: 335, y: 245 }, 'TEC-004': { x: 170, y: 260 },
  'TEC-005': { x: 515, y: 275 }, 'TEC-006': { x: 900, y: 570 },
  'TEC-007': { x: 720, y: 545 }, 'TEC-008': { x: 250, y: 580 },
  'TEC-009': { x: 420, y: 145 }, 'TEC-010': { x: 365, y: 430 },
  'TEC-011': { x: 640, y: 170 }, 'TEC-012': { x: 790, y: 405 },
};

const occurrenceOffsets = [
  { x: -18, y: -20 }, { x: 22, y: -12 }, { x: -24, y: 18 },
  { x: 18, y: 22 }, { x: 2, y: -30 }, { x: 30, y: 8 },
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
