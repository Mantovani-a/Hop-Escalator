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

export const quickHistoryByElevator = {
  'ELV-012': ['12/08 — Falha de porta — Resolvido', '28/07 — Sensor de nivelamento — Resolvido', '03/06 — Manutenção preventiva'],
  'ELV-005': ['09/08 — Painel de chamada — Resolvido', '18/07 — Manutenção preventiva', '22/06 — Ajuste de porta — Resolvido'],
  'ELV-007': ['14/08 — Falha de porta — Resolvido', '29/07 — Manutenção preventiva'],
  'ELV-011': ['10/08 — Chamada do G2 — Resolvido', '24/07 — Manutenção preventiva'],
  'ELV-018': ['07/08 — Painel interno — Resolvido', '16/07 — Manutenção preventiva'],
};

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
