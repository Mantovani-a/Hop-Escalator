const specialtyScore = (technician, occurrence) => {
  const specialty = technician.specialty.toLowerCase();
  const description = occurrence.description.toLowerCase();
  if (occurrence.trappedPeople > 0 && specialty.includes('resgate')) return 35;
  if (description.includes('porta') && specialty.includes('porta')) return 25;
  if (description.includes('painel') && specialty.includes('pain')) return 25;
  return 5;
};

export const recommendTechnician = (occurrence, technicians) => technicians
  .filter((technician) => technician.status === 'disponível')
  .map((technician) => ({
    technician,
    dispatchScore: 100 - technician.distanceKm * 4 + specialtyScore(technician, occurrence)
      + (technician.region === 'Zona Norte' ? 4 : 0),
  }))
  .sort((first, second) => second.dispatchScore - first.dispatchScore)[0]?.technician || null;
