import { operatorOccurrenceMetadata } from './operatorData.js';
import { clients, elevators, createMockOccurrences } from './mockData.js';
import { calculatePriority } from '../utils/priorityScore.js';

const OPERATION_STORAGE_KEY = 'hop-shared-operation-v2';
const OPERATION_UPDATED_EVENT = 'hop-operation-updated';

let cachedRawState = null;
let cachedOperationState = null;

export const OPERATION_STATUS = {
  WAITING_ASSIGNMENT: 'Aguardando atribuição',
  TECHNICIAN_ASSIGNED: 'Técnico atribuído',
  ACCEPTED: 'Aceito',
  TRAVELING: 'Em deslocamento',
  ON_SITE: 'No local',
  MAINTENANCE: 'Em manutenção',
  RESOLVED: 'Resolvido',
};

const clientById = (id) => clients.find((client) => client.id === id);
const elevatorById = (id) => elevators.find((elevator) => elevator.id === id);

const initialWorkflowStatus = (occurrence) => {
  if (occurrence.status === 'resolvida') return OPERATION_STATUS.RESOLVED;
  if (occurrence.status === 'em deslocamento') return OPERATION_STATUS.TRAVELING;
  if (occurrence.status === 'em atendimento') return OPERATION_STATUS.MAINTENANCE;
  return occurrence.technicianId ? OPERATION_STATUS.TECHNICIAN_ASSIGNED : OPERATION_STATUS.WAITING_ASSIGNMENT;
};

const createSeedOccurrence = (occurrence, index, now) => {
  const seededOccurrence = occurrence.id === 'OCC-2026-009'
    ? { ...occurrence, technicianId: 'TEC-002' }
    : occurrence;
  const client = clientById(seededOccurrence.clientId);
  const elevator = elevatorById(seededOccurrence.elevatorId);
  const metadata = operatorOccurrenceMetadata[occurrence.id] || {};
  const priority = calculatePriority({ occurrence: seededOccurrence, client, elevator, metadata, now });
  const workflowStatus = initialWorkflowStatus(seededOccurrence);
  return {
    ...seededOccurrence,
    protocol: metadata.serviceNumber || `HOP-${1100 + index}`,
    metadata,
    priority,
    workflowStatus,
    origin: 'mock',
    completedAt: workflowStatus === OPERATION_STATUS.RESOLVED ? (occurrence.completedAt || occurrence.time) : null,
    duration: workflowStatus === OPERATION_STATUS.RESOLVED ? (occurrence.duration || 'Atendimento demonstrativo') : null,
  };
};

export const createInitialOperationState = (now = new Date()) => {
  const seedOccurrences = createMockOccurrences(now);
  return {
    version: 2,
    updatedAt: now.toISOString(),
    operatorShiftActive: true,
    occurrences: seedOccurrences.map((occurrence, index) => createSeedOccurrence(occurrence, index, now)),
  };
};

export const validateAndSanitizeOccurrence = (occ, index = 0, now = new Date()) => {
  if (!occ || typeof occ !== 'object') return null;
  const clientId = occ.clientId || 'CLI-001';
  const elevatorId = occ.elevatorId || 'ELV-001';
  const client = clientById(clientId) || clients[0];
  const elevator = elevatorById(elevatorId) || elevators[0];
  const templateMeta = operatorOccurrenceMetadata[occ.id] || {};
  const metadata = {
    distanceKm: 2.4,
    etaMinutes: 10,
    serviceNumber: `HOP-${1100 + index}`,
    ...templateMeta,
    ...(occ.metadata || {}),
  };

  const validPriority = occ.priority
    && typeof occ.priority.score === 'number'
    && typeof occ.priority.classification === 'string'
    && Array.isArray(occ.priority.reasons);

  const priority = validPriority
    ? occ.priority
    : calculatePriority({ occurrence: { ...occ, clientId, elevatorId }, client, elevator, metadata, now });

  const workflowStatus = occ.workflowStatus || initialWorkflowStatus(occ);

  return {
    ...occ,
    id: occ.id || `OCC-AUTO-${index}`,
    clientId,
    elevatorId,
    description: occ.description || 'Intercorrência reportada no equipamento.',
    protocol: occ.protocol || metadata.serviceNumber || `HOP-${1100 + index}`,
    time: occ.time || now.toISOString(),
    trappedPeople: Number(occ.trappedPeople) || 0,
    severity: occ.severity || priority.classification || 'baixa',
    status: occ.status || 'aberta',
    technicianId: occ.technicianId || null,
    origin: occ.origin || 'mock',
    metadata,
    priority,
    workflowStatus,
    completedAt: workflowStatus === OPERATION_STATUS.RESOLVED ? (occ.completedAt || occ.time || now.toISOString()) : null,
    duration: workflowStatus === OPERATION_STATUS.RESOLVED ? (occ.duration || 'Atendimento demonstrativo') : null,
  };
};

const normalizeState = (state, now = new Date()) => {
  const rawOccurrences = Array.isArray(state?.occurrences) ? state.occurrences : [];
  const occurrences = rawOccurrences
    .map((occ, idx) => validateAndSanitizeOccurrence(occ, idx, now))
    .filter(Boolean);

  return {
    version: 2,
    updatedAt: state?.updatedAt || now.toISOString(),
    operatorShiftActive: state?.operatorShiftActive !== false,
    occurrences: occurrences.length ? occurrences : createInitialOperationState(now).occurrences,
  };
};

const cacheState = (state) => {
  cachedOperationState = normalizeState(state);
  cachedRawState = JSON.stringify(cachedOperationState);
  return cachedOperationState;
};

const readOperationState = () => {
  try {
    window.localStorage.removeItem('hop-shared-operation-v1');
    const stored = window.localStorage.getItem(OPERATION_STORAGE_KEY);
    if (stored === cachedRawState && cachedOperationState) return cachedOperationState;
    if (stored) {
      let parsed = null;
      try {
        parsed = JSON.parse(stored);
      } catch {
        parsed = null;
      }

      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.occurrences) && parsed.occurrences.length > 0) {
        const storedTime = new Date(parsed.updatedAt || 0).getTime();
        const isStale = Number.isNaN(storedTime) || (Date.now() - storedTime > 12 * 60 * 60 * 1000);

        if (!isStale) {
          const sanitizedState = normalizeState(parsed);
          cachedOperationState = sanitizedState;
          cachedRawState = JSON.stringify(sanitizedState);
          return cachedOperationState;
        }

        // Re-ancora as ocorrências de demonstração se forem de outro dia (>12h), mantendo o MVP sempre atualizado
        const freshState = createInitialOperationState(new Date());
        const clientCreated = (parsed.occurrences || [])
          .filter((item) => item?.origin !== 'mock')
          .map((item, idx) => validateAndSanitizeOccurrence(item, idx))
          .filter(Boolean);

        if (clientCreated.length) {
          freshState.occurrences = [...clientCreated, ...freshState.occurrences];
        }

        const cachedFresh = cacheState(freshState);
        try {
          window.localStorage.setItem(OPERATION_STORAGE_KEY, cachedRawState);
        } catch {
          /* mantém em memória */
        }
        return cachedFresh;
      }
    }

    // Se não há dados salvos ou estavam corrompidos, inicia com o estado limpo
    const initialState = createInitialOperationState();
    const cachedInitialState = cacheState(initialState);
    try {
      window.localStorage.setItem(OPERATION_STORAGE_KEY, cachedRawState);
    } catch {
      /* mantém em memória */
    }
    return cachedInitialState;
  } catch (err) {
    console.warn('HOP: Falha ao ler operationState do localStorage. Usando estado inicial limpo.', err);
    if (!cachedOperationState) cacheState(createInitialOperationState());
    return cachedOperationState;
  }
};

const writeOperationState = (state, { force = false } = {}) => {
  const nextState = { ...normalizeState(state), updatedAt: new Date().toISOString() };
  const currentState = readOperationState();
  if (!force
    && currentState.operatorShiftActive === nextState.operatorShiftActive
    && JSON.stringify(currentState.occurrences) === JSON.stringify(nextState.occurrences)) return currentState;
  const cachedNextState = cacheState(nextState);
  try {
    window.localStorage.setItem(OPERATION_STORAGE_KEY, cachedRawState);
  } catch {
    // O estado em memória mantém o MVP funcional quando o armazenamento do navegador está indisponível.
  }
  window.dispatchEvent(new CustomEvent(OPERATION_UPDATED_EVENT));
  return cachedNextState;
};

export const addOperationOccurrence = (occurrence) => {
  const state = readOperationState();
  return writeOperationState({ ...state, occurrences: [occurrence, ...state.occurrences.filter((item) => item.id !== occurrence.id)] });
};

export const updateOperationOccurrence = (occurrenceId, changes) => {
  const state = readOperationState();
  let changed = false;
  const occurrences = state.occurrences.map((occurrence) => {
    if (occurrence.id !== occurrenceId) return occurrence;
    const occurrenceChanges = typeof changes === 'function' ? changes(occurrence) : changes;
    if (!occurrenceChanges || Object.entries(occurrenceChanges).every(([key, value]) => Object.is(occurrence[key], value))) return occurrence;
    changed = true;
    return { ...occurrence, ...occurrenceChanges };
  });
  if (!changed) return state;
  return writeOperationState({ ...state, occurrences });
};

export const updateOperatorShift = (operatorShiftActive) => {
  const state = readOperationState();
  return writeOperationState({ ...state, operatorShiftActive: Boolean(operatorShiftActive) });
};

export const resetOperationState = () => {
  const initialState = createInitialOperationState();
  const obsoleteKeys = [
    'hop-client-calls', 'hop-client-created-occurrences', 'hop-operator-occurrence-statuses',
    'hop-operator-technician-status', 'hop-operator-completed-items', 'hop-control-occurrence-assignments',
    'hop-shared-operation-v1', 'hop-shared-operation-v2',
  ];
  try {
    obsoleteKeys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // A restauração ainda atualiza a fonte em memória.
  }
  return writeOperationState(initialState, { force: true });
};

export const subscribeOperationState = (callback) => {
  const handleCustomUpdate = () => callback();
  const handleStorageUpdate = (event) => {
    if (event.key !== OPERATION_STORAGE_KEY || event.newValue === cachedRawState) return;
    if (event.newValue) {
      try {
        cachedRawState = event.newValue;
        cachedOperationState = normalizeState(JSON.parse(event.newValue));
      } catch {
        cachedRawState = null;
        cachedOperationState = null;
      }
    }
    callback();
  };
  // Atualiza a cada 60s para manter tempos relativos sincronizados com precisão
  const intervalId = window.setInterval(callback, 60000);

  window.addEventListener(OPERATION_UPDATED_EVENT, handleCustomUpdate);
  window.addEventListener('storage', handleStorageUpdate);
  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener(OPERATION_UPDATED_EVENT, handleCustomUpdate);
    window.removeEventListener('storage', handleStorageUpdate);
  };
};


export const getOperationSnapshot = () => readOperationState();
