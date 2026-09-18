import { OPERATION_STATUS } from '../data/operationStore.js';

const workflowSteps = [
  { status: OPERATION_STATUS.WAITING_ASSIGNMENT, nextStatus: null, action: null },
  { status: OPERATION_STATUS.TECHNICIAN_ASSIGNED, nextStatus: OPERATION_STATUS.TRAVELING, action: 'ACEITAR OCORRÊNCIA' },
  { status: OPERATION_STATUS.ACCEPTED, nextStatus: OPERATION_STATUS.TRAVELING, action: 'ACEITAR OCORRÊNCIA' },
  { status: OPERATION_STATUS.TRAVELING, nextStatus: OPERATION_STATUS.MAINTENANCE, action: 'CHEGUEI AO LOCAL' },
  { status: OPERATION_STATUS.PART_AVAILABLE, nextStatus: OPERATION_STATUS.TRAVELING_TO_PICKUP, action: 'INICIAR RETIRADA' },
  { status: OPERATION_STATUS.TRAVELING_TO_PICKUP, nextStatus: OPERATION_STATUS.RETURNING_TO_CLIENT, action: 'PEÇA RETIRADA' },
  { status: OPERATION_STATUS.RETURNING_TO_CLIENT, nextStatus: OPERATION_STATUS.MAINTENANCE, action: 'CHEGUEI AO CLIENTE' },
  { status: OPERATION_STATUS.WAITING_PART, nextStatus: null, action: null },
  { status: OPERATION_STATUS.WAITING_SUPPORT, nextStatus: null, action: null },
  { status: OPERATION_STATUS.ON_SITE, nextStatus: OPERATION_STATUS.RESOLVED, action: 'FINALIZAR ATENDIMENTO' },
  { status: OPERATION_STATUS.MAINTENANCE, nextStatus: OPERATION_STATUS.RESOLVED, action: 'FINALIZAR ATENDIMENTO' },
  { status: OPERATION_STATUS.RESOLVED, nextStatus: null, action: null },
];

export const getWorkflowStep = (status = OPERATION_STATUS.TECHNICIAN_ASSIGNED) =>
  workflowSteps.find((step) => step.status === status) || workflowSteps[1];
