const normalize = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const executionStatuses = new Set([
  'Aceito',
  'Em deslocamento',
  'No local',
  'Em manutenção',
  'A caminho da retirada',
  'Retornando ao cliente',
]);

const activeOccurrenceFor = (occurrence) => occurrence.workflowStatus !== 'Resolvido'
  && occurrence.operationalStatus !== 'Resolvido';

const getSpecialtyMatch = (technician, occurrence) => {
  const specialty = normalize(technician?.specialty);
  const problem = normalize([
    occurrence?.description,
    occurrence?.detectedFailure,
    ...(occurrence?.metadata?.reportedProblems || []),
    occurrence?.metadata?.diagnosis?.probableOrigin,
  ].filter(Boolean).join(' '));

  if ((occurrence?.trappedPeople || 0) > 0) {
    return specialty.includes('resgate')
      ? { score: 34, reason: 'Especialidade compatível com resgate e emergência' }
      : { score: 0, reason: 'Atendimento emergencial fora da especialidade principal' };
  }
  if ((problem.includes('porta') || problem.includes('acesso')) && specialty.includes('porta')) {
    return { score: 27, reason: 'Especialidade compatível com portas e acessos' };
  }
  if ((problem.includes('painel') || problem.includes('botao') || problem.includes('comando'))
    && (specialty.includes('painel') || specialty.includes('comando') || specialty.includes('eletric'))) {
    return { score: 27, reason: 'Especialidade compatível com comandos e painéis' };
  }
  if ((problem.includes('eletric') || problem.includes('energia')) && specialty.includes('eletric')) {
    return { score: 27, reason: 'Especialidade compatível com sistemas elétricos' };
  }
  if ((problem.includes('ruido') || problem.includes('tracao') || problem.includes('mecanic')) && specialty.includes('mec')) {
    return { score: 24, reason: 'Especialidade compatível com mecânica e tração' };
  }
  if ((problem.includes('preventiv') || problem.includes('nivelamento')) && specialty.includes('preventiv')) {
    return { score: 22, reason: 'Especialidade compatível com manutenção preventiva' };
  }
  return { score: 8, reason: 'Perfil técnico geral compatível com o atendimento' };
};

export const rankTechniciansForDispatch = (occurrence, technicians, activeOccurrences = []) => technicians
  .map((technician) => {
    const assignedOccurrences = activeOccurrences.filter((item) => {
      const technicianId = item.technicianId || item.assignedTechnicianId;
      return technicianId === technician.id && activeOccurrenceFor(item);
    });
    const executing = assignedOccurrences.some((item) => executionStatuses.has(item.workflowStatus || item.operationalStatus));
    const load = assignedOccurrences.length;
    const available = technician.status === 'disponível' && !executing && load < 2;
    const specialty = getSpecialtyMatch(technician, occurrence);
    const distanceKm = Number(technician.distanceKm ?? occurrence?.metadata?.distanceKm ?? 10);
    const proximityScore = Math.max(0, 28 - distanceKm * 2.6);
    const loadScore = Math.max(0, 22 - load * 11);
    const score = Math.round(40 + specialty.score + proximityScore + loadScore);
    const loadReason = load === 0 ? 'Sem chamados ativos' : `Carga atual: ${load} chamado${load > 1 ? 's' : ''}`;

    return {
      technician,
      available,
      score,
      load,
      distanceKm,
      reasons: [
        'Disponível para despacho',
        specialty.reason,
        `Proximidade estimada de ${distanceKm.toFixed(1).replace('.', ',')} km`,
        loadReason,
      ],
    };
  })
  .filter((candidate) => candidate.available)
  .sort((first, second) => second.score - first.score
    || first.distanceKm - second.distanceKm
    || first.technician.name.localeCompare(second.technician.name));

export const getTechnicianRecommendation = (occurrence, technicians, activeOccurrences = []) =>
  rankTechniciansForDispatch(occurrence, technicians, activeOccurrences)[0] || null;

export const recommendTechnician = (occurrence, technicians, activeOccurrences = []) =>
  getTechnicianRecommendation(occurrence, technicians, activeOccurrences)?.technician || null;
