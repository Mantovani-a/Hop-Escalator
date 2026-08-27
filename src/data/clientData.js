import { clients, elevators } from './mockData.js';
import { OPERATION_STATUS } from './operationStore.js';

export const clientEstablishment = clients.find((client) => client.id === 'CLI-001');

export const clientUser = {
  id: 'CLIENT-USER-001',
  name: 'Mariana Alves',
  firstName: 'Mariana',
  role: 'Responsável pelos elevadores',
  clientId: clientEstablishment.id,
  avatar: clientEstablishment.contactAvatar,
};

const elevatorPresentation = {
  'ELV-001': { displayName: 'Elevador 01', clientStatus: 'Operação normal', system: null, lastCheck: 'Hoje, 09:42' },
  'ELV-002': { displayName: 'Elevador 02', clientStatus: 'Técnico a caminho', system: 'Nivelamento', lastCheck: 'Hoje, 08:18' },
  'ELV-003': { displayName: 'Elevador 03', clientStatus: 'Operação normal', system: null, lastCheck: 'Hoje, 10:06' },
};

export const clientElevators = elevators
  .filter((elevator) => elevator.clientId === clientUser.clientId)
  .map((elevator) => ({ ...elevator, ...elevatorPresentation[elevator.id] }));

export const functioningLabels = {
  'Sim, normalmente': 'Funcionando normalmente',
  'Sim, mas com dificuldade': 'Funcionamento parcial',
  'Não está funcionando': 'Parado',
};

const workflowOrder = Object.values(OPERATION_STATUS);

export const getClientStatus = (call) => {
  const workflowStatus = call.workflowStatus || OPERATION_STATUS.WAITING_ASSIGNMENT;
  if (workflowStatus === OPERATION_STATUS.RESOLVED) return 'Resolvido';
  if (workflowStatus === OPERATION_STATUS.MAINTENANCE) return 'Técnico realizando atendimento';
  if (workflowStatus === OPERATION_STATUS.ON_SITE) return 'Atendimento no local';
  if (workflowStatus === OPERATION_STATUS.TRAVELING) return 'Técnico a caminho';
  if ([OPERATION_STATUS.TECHNICIAN_ASSIGNED, OPERATION_STATUS.ACCEPTED].includes(workflowStatus)) return 'Técnico designado';
  return OPERATION_STATUS.WAITING_ASSIGNMENT;
};

export const getTimeline = (call) => {
  const workflowStatus = call.workflowStatus || OPERATION_STATUS.WAITING_ASSIGNMENT;
  const workflowIndex = workflowOrder.indexOf(workflowStatus);
  const assigned = workflowIndex >= 1 || Boolean(call.assignedTechnicianId || call.technicianId);
  const steps = [
    { label: 'Solicitação recebida', reached: true },
    { label: 'Ocorrência priorizada', reached: true },
    { label: 'Técnico atribuído', reached: assigned },
    { label: 'Técnico em deslocamento', reached: workflowIndex >= 3 },
    { label: 'Atendimento no local', reached: workflowIndex >= 4 },
    { label: 'Resolvido', reached: workflowIndex >= 6 },
  ];
  const currentIndex = Math.max(0, steps.reduce((last, step, index) => (step.reached ? index : last), 0));
  return steps.map((step, index) => ({ ...step, current: index === currentIndex && workflowStatus !== OPERATION_STATUS.RESOLVED }));
};
