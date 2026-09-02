import { getClientById, getElevatorById, technicians } from './mockData.js';
import { calculatePriority } from '../utils/priorityScore.js';

export const operatorTechnician = {
  ...technicians.find((technician) => technician.id === 'TEC-010'),
  employeeId: 'OT-OPR-1042',
  shift: '07:00–16:00',
  specialties: ['Resgate e emergência', 'Manutenção preventiva', 'Portas e acessos'],
  completedServices: 184,
  completionRate: 96,
  location: { latitude: -23.5754, longitude: -46.6518, label: 'Localização demonstrativa — Zona Sul' },
};

export const operatorOccurrenceMetadata = {
  'OCC-2026-009': {
    serviceNumber: 'HOP-1047', distanceKm: 2.4, etaMinutes: 7, latitude: -23.5888, longitude: -46.6345,
    riskToLife: true, criticalFacility: true, elevatorStopped: true, recurrence: true,
    clientNotes: 'Equipe clínica informa três pessoas na cabine e solicita atendimento prioritário.',
    diagnosis: { demoCode: 'MVP-SN-017', system: 'Sensores e nivelamento', source: 'Detecção automática simulada do equipamento', probableOrigin: 'Sensor de nivelamento', probability: 86, suspectedRegions: ['sensors', 'base'], summary: 'Possível inconsistência na leitura de posição da cabine. Verificar presencialmente antes de qualquer conclusão.' },
  },
  'OCC-2026-002': {
    serviceNumber: 'HOP-1049', distanceKm: 5.8, etaMinutes: 16, latitude: -23.5951, longitude: -46.6842,
    elevatorStopped: true, recurrence: true, clientNotes: 'Cabine isolada no térreo pela equipe predial.',
    diagnosis: { demoCode: 'MVP-TR-004', system: 'Tração', source: 'Telemetria simulada do equipamento', probableOrigin: 'Conjunto de tração', probability: 71, suspectedRegions: ['machine'], summary: 'Possível indisponibilidade no conjunto superior. Confirmar as condições no local.' },
  },
  'OCC-2026-003': {
    serviceNumber: 'HOP-1050', distanceKm: 7.1, etaMinutes: 19, latitude: -23.6016, longitude: -46.7193,
    partialFailure: true, recurrence: true, clientNotes: 'Moradores foram orientados a utilizar o elevador do bloco ao lado.',
    diagnosis: { demoCode: 'MVP-PT-021', system: 'Portas', source: 'Detecção automática simulada do equipamento', probableOrigin: 'Sistema de portas', probability: 82, suspectedRegions: ['doors', 'sensors'], summary: 'Possível falha no ciclo de fechamento ou na leitura do sensor da porta.' },
  },
  'OCC-2026-005': {
    serviceNumber: 'HOP-1051', distanceKm: 9.6, etaMinutes: 24, latitude: -23.5055, longitude: -46.6258,
    partialFailure: true, clientNotes: 'Falha concentrada na chamada do piso G1.',
    diagnosis: { demoCode: 'MVP-EL-012', system: 'Painel de controle', source: 'Telemetria simulada do equipamento', probableOrigin: 'Painel de controle', probability: 68, suspectedRegions: ['control'], summary: 'Possível interrupção no processamento da chamada do pavimento. Necessária verificação local.' },
  },
  'OCC-2026-007': {
    serviceNumber: 'HOP-1052', distanceKm: 4.3, etaMinutes: 12, latitude: -23.5434, longitude: -46.6422,
    partialFailure: true, clientNotes: 'Painel volta a responder após alguns segundos.',
    diagnosis: { demoCode: 'MVP-SN-008', system: 'Sensores', source: 'Detecção automática simulada do equipamento', probableOrigin: 'Sensor de comando', probability: 64, suspectedRegions: ['sensors', 'control'], summary: 'Possível leitura intermitente entre o painel e os sensores de comando.' },
  },
  'OCC-SIM-001': {
    serviceNumber: 'HOP-1053', distanceKm: 1.8, etaMinutes: 6, latitude: -23.5644, longitude: -46.6542,
    riskToLife: true, criticalFacility: true, elevatorStopped: true, recurrence: true,
    clientNotes: 'Responsável local manteve contato com o passageiro e isolou o equipamento.',
    diagnosis: { demoCode: 'MVP-PT-028', system: 'Portas', source: 'Detecção automática simulada do equipamento', probableOrigin: 'Sistema de portas', probability: 84, suspectedRegions: ['doors', 'sensors'], summary: 'Possível falha no travamento ou na leitura do conjunto de portas.' },
  },
};

const formatDayMonth = (daysAgo, base = new Date()) => {
  const d = new Date(base.getTime() - daysAgo * 86400000);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const createQuickHistory = (now = new Date()) => ({
  'ELV-012': [`${formatDayMonth(6, now)} — Falha de porta — Resolvido`, `${formatDayMonth(20, now)} — Sensor de nivelamento — Resolvido`, `${formatDayMonth(45, now)} — Manutenção preventiva`],
  'ELV-005': [`${formatDayMonth(8, now)} — Painel de chamada — Resolvido`, `${formatDayMonth(25, now)} — Manutenção preventiva`, `${formatDayMonth(50, now)} — Ajuste de porta — Resolvido`],
  'ELV-007': [`${formatDayMonth(5, now)} — Falha de porta — Resolvido`, `${formatDayMonth(22, now)} — Manutenção preventiva`],
  'ELV-011': [`${formatDayMonth(7, now)} — Chamada do G2 — Resolvido`, `${formatDayMonth(28, now)} — Manutenção preventiva`],
  'ELV-018': [`${formatDayMonth(11, now)} — Painel interno — Resolvido`, `${formatDayMonth(32, now)} — Manutenção preventiva`],
});

export const quickHistoryByElevator = createQuickHistory();


export const buildOperatorOccurrence = (occurrence, now = new Date()) => {
  const client = getClientById(occurrence.clientId);
  const templateMetadata = operatorOccurrenceMetadata[occurrence.id] || {};
  const metadata = {
    distanceKm: 0,
    etaMinutes: 0,
    ...templateMetadata,
    ...(occurrence.metadata || {}),
    diagnosis: {
      demoCode: 'MVP-ND-000',
      system: 'Sistema não identificado',
      source: 'Dados demonstrativos do equipamento',
      probableOrigin: 'Verificação necessária no local',
      probability: 0,
      suspectedRegions: [],
      summary: 'Não há diagnóstico preliminar disponível para este registro.',
      ...(templateMetadata.diagnosis || {}),
      ...(occurrence.metadata?.diagnosis || {}),
    },
  };
  const baseElevator = getElevatorById(occurrence.elevatorId);
  const elevator = metadata.elevatorStopped ? { ...baseElevator, status: 'parado' } : baseElevator;
  const priority = calculatePriority({ occurrence, client, elevator, metadata, now });

  return { ...occurrence, client, elevator, metadata, priority };
};

export const createSimulatedOccurrence = (now = new Date()) =>
  buildOperatorOccurrence({
    id: 'OCC-SIM-001',
    elevatorId: 'ELV-002',
    clientId: 'CLI-001',
    address: 'Av. Paulista, 1450 — Bloco A',
    time: now.toISOString(),
    description: 'Passageiro preso e cabine parada entre pavimentos.',
    severity: 'crítica',
    status: 'aberta',
    technicianId: operatorTechnician.id,
    trappedPeople: 1,
    locationContext: 'Hospital com circulação assistencial contínua.',
  }, now);
