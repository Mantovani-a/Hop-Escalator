import { getProfilePhotoPath } from '../utils/profileAvatar.js';

export const technicians = [
  { id: 'TEC-001', name: 'Ana Ribeiro', status: 'disponível', specialty: 'Portas e acessos', region: 'Centro', distanceKm: 2.4, currentService: null },
  { id: 'TEC-002', name: 'Bruno Martins', status: 'em atendimento', specialty: 'Resgate e emergência', region: 'Zona Sul', distanceKm: 5.8, currentService: 'OCC-2026-001' },
  { id: 'TEC-003', name: 'Carla Mendes', status: 'em deslocamento', specialty: 'Sistemas elétricos', region: 'Zona Oeste', distanceKm: 8.1, currentService: 'OCC-2026-006' },
  { id: 'TEC-004', name: 'Diego Alves', status: 'disponível', specialty: 'Manutenção preventiva', region: 'Zona Norte', distanceKm: 3.7, currentService: null },
  { id: 'TEC-005', name: 'Elisa Nogueira', status: 'em atendimento', specialty: 'Comandos e painéis', region: 'Centro', distanceKm: 1.9, currentService: 'OCC-2026-004' },
  { id: 'TEC-006', name: 'Felipe Rocha', status: 'indisponível', specialty: 'Mecânica geral', region: 'Zona Leste', distanceKm: 12.6, currentService: null },
  { id: 'TEC-007', name: 'Gabriela Lima', status: 'disponível', specialty: 'Resgate e emergência', region: 'Zona Sul', distanceKm: 6.3, currentService: null },
  { id: 'TEC-008', name: 'Henrique Costa', status: 'disponível', specialty: 'Sistemas elétricos', region: 'ABC Paulista', distanceKm: 9.4, currentService: null },
  { id: 'TEC-009', name: 'Isabela Freitas', status: 'em atendimento', specialty: 'Portas e acessos', region: 'Zona Oeste', distanceKm: 4.6, currentService: 'OCC-2026-012' },
  { id: 'TEC-010', name: 'João Carlos', status: 'disponível', specialty: 'Resgate e manutenção preventiva', region: 'Zona Norte', distanceKm: 2.4, currentService: null },
  { id: 'TEC-011', name: 'Karen Oliveira', status: 'indisponível', specialty: 'Comandos e painéis', region: 'Centro', distanceKm: 10.8, currentService: null },
  { id: 'TEC-012', name: 'Lucas Barros', status: 'em deslocamento', specialty: 'Mecânica geral', region: 'Zona Leste', distanceKm: 5.1, currentService: 'OCC-2026-015' },
].map((technician) => ({
  ...technician,
  avatar: getProfilePhotoPath(technician.name, 'operators'),
}));

export const clients = [
  { id: 'CLI-001', name: 'Hospital Santa Helena', type: 'Hospital', address: 'Av. Paulista, 1450 — Bela Vista', contact: 'Mariana Alves' },
  { id: 'CLI-002', name: 'Edifício Nexus Corporate', type: 'Prédio comercial', address: 'R. Funchal, 520 — Vila Olímpia', contact: 'Rafael Siqueira' },
  { id: 'CLI-003', name: 'Condomínio Parque das Flores', type: 'Condomínio', address: 'R. das Acácias, 88 — Morumbi', contact: 'Sônia Matos' },
  { id: 'CLI-004', name: 'Hotel Horizonte Paulista', type: 'Hotel', address: 'Al. Santos, 960 — Jardins', contact: 'Carlos Tavares' },
  { id: 'CLI-005', name: 'Shopping Vila Central', type: 'Shopping', address: 'Av. Cruzeiro do Sul, 3100 — Santana', contact: 'Beatriz Campos' },
  { id: 'CLI-006', name: 'Hospital Infantil Bem-Estar', type: 'Hospital', address: 'R. Vergueiro, 2210 — Vila Mariana', contact: 'Dr. Paulo Neri' },
  { id: 'CLI-007', name: 'Centro Empresarial Atlas', type: 'Prédio comercial', address: 'Av. Rebouças, 2850 — Pinheiros', contact: 'Nádia Reis' },
  { id: 'CLI-008', name: 'Residencial Bosque Alto', type: 'Condomínio', address: 'R. Dona Tecla, 410 — Guarulhos', contact: 'Eduardo Viana' },
  { id: 'CLI-009', name: 'Hotel Estação Premium', type: 'Hotel', address: 'R. dos Timbiras, 540 — República', contact: 'Patrícia Luz' },
  { id: 'CLI-010', name: 'Shopping Pátio Leste', type: 'Shopping', address: 'Av. Aricanduva, 5555 — Aricanduva', contact: 'André Meireles' },
];

export const elevators = [
  { id: 'ELV-001', identification: 'Torre A • Elevador 01', clientId: 'CLI-001', model: 'Linha hospitalar H-01', address: 'Av. Paulista, 1450 — Bloco A', status: 'operando', lastMaintenance: '2026-08-12' },
  { id: 'ELV-002', identification: 'Torre A • Elevador 02', clientId: 'CLI-001', model: 'Linha hospitalar H-01', address: 'Av. Paulista, 1450 — Bloco A', status: 'em atendimento', lastMaintenance: '2026-08-11' },
  { id: 'ELV-003', identification: 'Torre B • Elevador serviço', clientId: 'CLI-001', model: 'Carga assistida C-02', address: 'Av. Paulista, 1450 — Bloco B', status: 'operando', lastMaintenance: '2026-08-08' },
  { id: 'ELV-004', identification: 'Nexus • Cabine 01', clientId: 'CLI-002', model: 'Passageiros P-12', address: 'R. Funchal, 520 — Torre única', status: 'operando', lastMaintenance: '2026-08-05' },
  { id: 'ELV-005', identification: 'Nexus • Cabine 02', clientId: 'CLI-002', model: 'Passageiros P-12', address: 'R. Funchal, 520 — Torre única', status: 'parado', lastMaintenance: '2026-08-05' },
  { id: 'ELV-006', identification: 'Bloco Ipê • Elevador social', clientId: 'CLI-003', model: 'Residencial R-08', address: 'R. das Acácias, 88 — Bloco Ipê', status: 'operando', lastMaintenance: '2026-07-29' },
  { id: 'ELV-007', identification: 'Bloco Cedro • Elevador social', clientId: 'CLI-003', model: 'Residencial R-08', address: 'R. das Acácias, 88 — Bloco Cedro', status: 'atenção', lastMaintenance: '2026-07-29' },
  { id: 'ELV-008', identification: 'Horizonte • Elevador hóspedes 01', clientId: 'CLI-004', model: 'Passageiros P-10', address: 'Al. Santos, 960 — Lobby', status: 'operando', lastMaintenance: '2026-08-14' },
  { id: 'ELV-009', identification: 'Horizonte • Elevador hóspedes 02', clientId: 'CLI-004', model: 'Passageiros P-10', address: 'Al. Santos, 960 — Lobby', status: 'em atendimento', lastMaintenance: '2026-08-14' },
  { id: 'ELV-010', identification: 'Vila Central • Elevador panorâmico', clientId: 'CLI-005', model: 'Panorâmico V-04', address: 'Av. Cruzeiro do Sul, 3100 — Praça central', status: 'operando', lastMaintenance: '2026-08-10' },
  { id: 'ELV-011', identification: 'Vila Central • Elevador estacionamento', clientId: 'CLI-005', model: 'Passageiros P-14', address: 'Av. Cruzeiro do Sul, 3100 — Setor B', status: 'atenção', lastMaintenance: '2026-08-09' },
  { id: 'ELV-012', identification: 'Bem-Estar • Elevador 01', clientId: 'CLI-006', model: 'Linha hospitalar H-02', address: 'R. Vergueiro, 2210 — Ala norte', status: 'operando', lastMaintenance: '2026-08-16' },
  { id: 'ELV-013', identification: 'Bem-Estar • Elevador 02', clientId: 'CLI-006', model: 'Linha hospitalar H-02', address: 'R. Vergueiro, 2210 — Ala sul', status: 'operando', lastMaintenance: '2026-08-16' },
  { id: 'ELV-014', identification: 'Atlas • Cabine 01', clientId: 'CLI-007', model: 'Passageiros P-15', address: 'Av. Rebouças, 2850 — Torre A', status: 'parado', lastMaintenance: '2026-08-03' },
  { id: 'ELV-015', identification: 'Atlas • Cabine 02', clientId: 'CLI-007', model: 'Passageiros P-15', address: 'Av. Rebouças, 2850 — Torre A', status: 'operando', lastMaintenance: '2026-08-03' },
  { id: 'ELV-016', identification: 'Bosque Alto • Bloco 1', clientId: 'CLI-008', model: 'Residencial R-06', address: 'R. Dona Tecla, 410 — Bloco 1', status: 'operando', lastMaintenance: '2026-07-31' },
  { id: 'ELV-017', identification: 'Bosque Alto • Bloco 2', clientId: 'CLI-008', model: 'Residencial R-06', address: 'R. Dona Tecla, 410 — Bloco 2', status: 'operando', lastMaintenance: '2026-07-31' },
  { id: 'ELV-018', identification: 'Estação Premium • Social', clientId: 'CLI-009', model: 'Passageiros P-09', address: 'R. dos Timbiras, 540 — Recepção', status: 'atenção', lastMaintenance: '2026-08-07' },
  { id: 'ELV-019', identification: 'Pátio Leste • Elevador central', clientId: 'CLI-010', model: 'Passageiros P-16', address: 'Av. Aricanduva, 5555 — Átrio', status: 'operando', lastMaintenance: '2026-08-13' },
  { id: 'ELV-020', identification: 'Pátio Leste • Elevador garagem', clientId: 'CLI-010', model: 'Passageiros P-16', address: 'Av. Aricanduva, 5555 — Garagem G2', status: 'em atendimento', lastMaintenance: '2026-08-13' },
];

export const occurrences = [
  { id: 'OCC-2026-001', elevatorId: 'ELV-002', clientId: 'CLI-001', address: 'Av. Paulista, 1450 — Bloco A', time: '2026-08-21T08:12:00-03:00', description: 'Passageiro preso entre o 4º e o 5º andar.', severity: 'crítica', status: 'em atendimento', technicianId: 'TEC-002', trappedPeople: 1, locationContext: 'Hospital com circulação assistencial contínua.' },
  { id: 'OCC-2026-002', elevatorId: 'ELV-005', clientId: 'CLI-002', address: 'R. Funchal, 520 — Torre única', time: '2026-08-21T08:27:00-03:00', description: 'Elevador parado no pavimento térreo sem passageiros.', severity: 'alta', status: 'aberta', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Pico de entrada de colaboradores.' },
  { id: 'OCC-2026-003', elevatorId: 'ELV-007', clientId: 'CLI-003', address: 'R. das Acácias, 88 — Bloco Cedro', time: '2026-08-21T07:54:00-03:00', description: 'Porta fecha parcialmente e reabre em seguida.', severity: 'atenção', status: 'aberta', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Condomínio residencial com segundo elevador disponível.' },
  { id: 'OCC-2026-004', elevatorId: 'ELV-009', clientId: 'CLI-004', address: 'Al. Santos, 960 — Lobby', time: '2026-08-21T07:40:00-03:00', description: 'Ruído metálico anormal durante a subida.', severity: 'alta', status: 'em atendimento', technicianId: 'TEC-005', trappedPeople: 0, locationContext: 'Hotel com alta movimentação no período da manhã.' },
  { id: 'OCC-2026-005', elevatorId: 'ELV-011', clientId: 'CLI-005', address: 'Av. Cruzeiro do Sul, 3100 — Setor B', time: '2026-08-21T06:48:00-03:00', description: 'Funcionamento parcial; chamada do piso G1 não responde.', severity: 'atenção', status: 'aberta', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Shopping antes da abertura ao público.' },
  { id: 'OCC-2026-006', elevatorId: 'ELV-014', clientId: 'CLI-007', address: 'Av. Rebouças, 2850 — Torre A', time: '2026-08-21T08:02:00-03:00', description: 'Interrupção de energia e falha no retorno automático.', severity: 'crítica', status: 'em deslocamento', technicianId: 'TEC-003', trappedPeople: 0, locationContext: 'Edifício comercial iniciando expediente.' },
  { id: 'OCC-2026-007', elevatorId: 'ELV-018', clientId: 'CLI-009', address: 'R. dos Timbiras, 540 — Recepção', time: '2026-08-21T06:25:00-03:00', description: 'Painel de chamada apresenta resposta intermitente.', severity: 'baixa', status: 'aberta', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Hotel com equipe local orientada.' },
  { id: 'OCC-2026-008', elevatorId: 'ELV-020', clientId: 'CLI-010', address: 'Av. Aricanduva, 5555 — Garagem G2', time: '2026-08-21T05:58:00-03:00', description: 'Porta da cabine não conclui o fechamento no G2.', severity: 'alta', status: 'em atendimento', technicianId: 'TEC-012', trappedPeople: 0, locationContext: 'Acesso de fornecedores antes da abertura.' },
  { id: 'OCC-2026-009', elevatorId: 'ELV-012', clientId: 'CLI-006', address: 'R. Vergueiro, 2210 — Ala norte', time: '2026-08-21T08:35:00-03:00', description: 'Parada inesperada com equipe clínica dentro da cabine.', severity: 'crítica', status: 'aberta', technicianId: 'TEC-010', trappedPeople: 3, locationContext: 'Hospital infantil; acesso prioritário à ala cirúrgica.' },
  { id: 'OCC-2026-010', elevatorId: 'ELV-006', clientId: 'CLI-003', address: 'R. das Acácias, 88 — Bloco Ipê', time: '2026-08-20T18:42:00-03:00', description: 'Solicitação preventiva para verificar nivelamento no térreo.', severity: 'baixa', status: 'agendada', technicianId: 'TEC-004', trappedPeople: 0, locationContext: 'Visita acordada com a administração do condomínio.' },
  { id: 'OCC-2026-011', elevatorId: 'ELV-010', clientId: 'CLI-005', address: 'Av. Cruzeiro do Sul, 3100 — Praça central', time: '2026-08-21T07:18:00-03:00', description: 'Ruído leve percebido na abertura da porta do 2º piso.', severity: 'baixa', status: 'resolvida', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Ocorrência verificada após o fechamento.' },
  { id: 'OCC-2026-012', elevatorId: 'ELV-004', clientId: 'CLI-002', address: 'R. Funchal, 520 — Torre única', time: '2026-08-20T16:55:00-03:00', description: 'Indicador de pavimento apagado no interior da cabine.', severity: 'atenção', status: 'em atendimento', technicianId: 'TEC-009', trappedPeople: 0, locationContext: 'Cabine operante; sinalização auxiliar disponível.' },
  { id: 'OCC-2026-013', elevatorId: 'ELV-015', clientId: 'CLI-007', address: 'Av. Rebouças, 2850 — Torre A', time: '2026-08-20T15:30:00-03:00', description: 'Funcionamento parcial durante chamadas simultâneas.', severity: 'atenção', status: 'resolvida', technicianId: 'TEC-008', trappedPeople: 0, locationContext: 'Fluxo comercial moderado no momento do chamado.' },
  { id: 'OCC-2026-014', elevatorId: 'ELV-017', clientId: 'CLI-008', address: 'R. Dona Tecla, 410 — Bloco 2', time: '2026-08-20T14:06:00-03:00', description: 'Porta com fechamento mais lento que o habitual.', severity: 'baixa', status: 'resolvida', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Condomínio com acessibilidade prioritária.' },
  { id: 'OCC-2026-015', elevatorId: 'ELV-019', clientId: 'CLI-010', address: 'Av. Aricanduva, 5555 — Átrio', time: '2026-08-21T08:18:00-03:00', description: 'Oscilação no painel e reinício da cabine durante operação.', severity: 'alta', status: 'em deslocamento', technicianId: 'TEC-012', trappedPeople: 0, locationContext: 'Shopping em preparação para abertura.' },
  { id: 'OCC-2026-016', elevatorId: 'ELV-003', clientId: 'CLI-001', address: 'Av. Paulista, 1450 — Bloco B', time: '2026-08-20T12:47:00-03:00', description: 'Solicitação preventiva após transporte de equipamento.', severity: 'baixa', status: 'resolvida', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Elevador de serviço do hospital.' },
  { id: 'OCC-2026-017', elevatorId: 'ELV-008', clientId: 'CLI-004', address: 'Al. Santos, 960 — Lobby', time: '2026-08-20T11:22:00-03:00', description: 'Interrupção breve de energia; operação restabelecida.', severity: 'atenção', status: 'resolvida', technicianId: 'TEC-005', trappedPeople: 0, locationContext: 'Gerador do hotel acionado normalmente.' },
  { id: 'OCC-2026-018', elevatorId: 'ELV-013', clientId: 'CLI-006', address: 'R. Vergueiro, 2210 — Ala sul', time: '2026-08-20T10:14:00-03:00', description: 'Ruído anormal relatado durante viagem ao 6º andar.', severity: 'alta', status: 'resolvida', technicianId: 'TEC-008', trappedPeople: 0, locationContext: 'Uso hospitalar com rota alternativa disponível.' },
  { id: 'OCC-2026-019', elevatorId: 'ELV-016', clientId: 'CLI-008', address: 'R. Dona Tecla, 410 — Bloco 1', time: '2026-08-19T19:36:00-03:00', description: 'Botão do 7º andar com resposta intermitente.', severity: 'baixa', status: 'agendada', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Manutenção combinada para o período de menor uso.' },
  { id: 'OCC-2026-020', elevatorId: 'ELV-001', clientId: 'CLI-001', address: 'Av. Paulista, 1450 — Bloco A', time: '2026-08-19T17:02:00-03:00', description: 'Desnível leve percebido na parada do 3º andar.', severity: 'atenção', status: 'resolvida', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Área de internação com fluxo controlado.' },
  { id: 'OCC-2026-021', elevatorId: 'ELV-005', clientId: 'CLI-002', address: 'R. Funchal, 520 — Torre única', time: '2026-08-18T13:28:00-03:00', description: 'Porta com falha após objeto bloquear o sensor.', severity: 'alta', status: 'resolvida', technicianId: 'TEC-009', trappedPeople: 0, locationContext: 'Equipe predial isolou a cabine até a chegada técnica.' },
  { id: 'OCC-2026-022', elevatorId: 'ELV-018', clientId: 'CLI-009', address: 'R. dos Timbiras, 540 — Recepção', time: '2026-08-18T09:12:00-03:00', description: 'Elevador parado temporariamente no 9º andar.', severity: 'alta', status: 'resolvida', technicianId: 'TEC-006', trappedPeople: 0, locationContext: 'Hóspedes direcionados ao segundo elevador.' },
  { id: 'OCC-2026-023', elevatorId: 'ELV-007', clientId: 'CLI-003', address: 'R. das Acácias, 88 — Bloco Cedro', time: '2026-08-17T21:05:00-03:00', description: 'Passageiro preso por aproximadamente quatro minutos.', severity: 'crítica', status: 'resolvida', technicianId: 'TEC-002', trappedPeople: 1, locationContext: 'Porteiro manteve contato com o passageiro durante o apoio.' },
  { id: 'OCC-2026-024', elevatorId: 'ELV-011', clientId: 'CLI-005', address: 'Av. Cruzeiro do Sul, 3100 — Setor B', time: '2026-08-17T16:44:00-03:00', description: 'Solicitação preventiva para inspeção antes de evento.', severity: 'baixa', status: 'resolvida', technicianId: 'TEC-010', trappedPeople: 0, locationContext: 'Evento programado para o fim de semana.' },
  { id: 'OCC-2026-025', elevatorId: 'ELV-020', clientId: 'CLI-010', address: 'Av. Aricanduva, 5555 — Garagem G2', time: '2026-08-16T18:20:00-03:00', description: 'Falha de comunicação no painel externo do G1.', severity: 'atenção', status: 'resolvida', technicianId: 'TEC-003', trappedPeople: 0, locationContext: 'Cabine permaneceu fora de operação durante a verificação.' },
];

export const getClientById = (clientId) => clients.find((client) => client.id === clientId);
export const getElevatorById = (elevatorId) => elevators.find((elevator) => elevator.id === elevatorId);
export const getTechnicianById = (technicianId) => technicians.find((technician) => technician.id === technicianId);
