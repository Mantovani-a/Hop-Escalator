const scoreRanges = [
  { min: 80, label: 'crítica' },
  { min: 55, label: 'alta' },
  { min: 30, label: 'atenção' },
  { min: 0, label: 'baixa' },
];

const formatElapsedTime = (minutes) => {
  if (minutes < 60) return `${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
};

const classifyPriority = (score) =>
  scoreRanges.find((range) => score >= range.min)?.label || 'baixa';

export const calculatePriority = ({ occurrence, client, elevator, metadata = {}, now = new Date() }) => {
  let score = 5;
  const reasons = [];
  const openedAt = new Date(occurrence.time);
  const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - openedAt.getTime()) / 60000));

  if (occurrence.trappedPeople > 0) {
    score += 40;
    reasons.push(`${occurrence.trappedPeople} ${occurrence.trappedPeople === 1 ? 'passageiro preso' : 'passageiros presos'}`);
  }

  if (metadata.riskToLife) {
    score += 20;
    reasons.push('Risco à vida informado');
  }

  if (client?.type === 'Hospital' || metadata.criticalFacility) {
    score += 15;
    reasons.push('Instalação crítica: hospital');
  }

  if (elevator?.status === 'parado' || metadata.elevatorStopped) {
    score += 15;
    reasons.push('Elevador totalmente inoperante');
  } else if (metadata.partialFailure) {
    score += 8;
    reasons.push('Falha parcial de funcionamento');
  }

  if (elapsedMinutes >= 120) score += 15;
  else if (elapsedMinutes >= 30) score += 10;
  else if (elapsedMinutes >= 10) score += 5;

  reasons.push(`Ocorrência aberta há ${formatElapsedTime(elapsedMinutes)}`);

  if (metadata.recurrence) {
    score += 10;
    reasons.push('Reincidência recente no equipamento');
  }

  const normalizedScore = Math.min(100, Math.max(0, score));
  return {
    score: normalizedScore,
    classification: classifyPriority(normalizedScore),
    reasons,
    elapsedMinutes,
  };
};
