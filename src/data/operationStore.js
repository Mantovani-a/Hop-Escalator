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

const normalizeState = (state) => ({
  version: 2,
  updatedAt: state?.updatedAt || new Date().toISOString(),
  operatorShiftActive: state?.operatorShiftActive !== false,
  occurrences: Array.isArray(state?.occurrences) ? state.occurrences : [],
});

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
      const parsed = JSON.parse(stored);
      const storedTime = new Date(parsed.updatedAt || 0).getTime();
      const isStale = Number.isNaN(storedTime) || (Date.now() - storedTime > 12 * 60 * 60 * 1000);

      if (!isStale) {
        cachedRawState = stored;
        cachedOperationState = normalizeState(parsed);
        return cachedOperationState;
      }

      // Re-ancora as ocorrências de demonstração se forem de outro dia (>12h), mantendo o MVP sempre atualizado
      const freshState = createInitialOperationState(new Date());
      const clientCreated = (parsed.occurrences || []).filter((item) => item.origin !== 'mock');
      if (clientCreated.length) {
        freshState.occurrences = [...clientCreated, ...freshState.occurrences];
      }
      return cacheState(freshState);
    }
    const initialState = createInitialOperationState();
    const cachedInitialState = cacheState(initialState);
    window.localStorage.setItem(OPERATION_STORAGE_KEY, cachedRawState);
    return cachedInitialState;
  } catch {
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
