import { useState } from 'react';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';

const filters = [['all','Todos'],['disponível','Disponíveis'],['em deslocamento','Em deslocamento'],['em atendimento','Em atendimento'],['indisponível','Indisponíveis']];

export default function ControlTechnicians({ technicians, onSelectTechnician }) {
  const [filter, setFilter] = useState('all');
  const filtered = technicians.filter((technician) => filter === 'all' || technician.status === filter);
  return (
    <>
      <section className="control-page-heading"><div><p className="eyebrow eyebrow--dark">Operação de campo</p><h1>Equipe de Campo</h1></div><span className="control-shift">{technicians.filter((item) => item.status === 'disponível').length} disponíveis</span></section>
      <div className="control-filter-bar" role="group" aria-label="Filtrar técnicos">{filters.map(([id,label]) => <button key={id} className={filter === id ? 'is-active' : ''} type="button" onClick={() => setFilter(id)}>{label}</button>)}</div>
      <section className="control-technician-grid">{filtered.map((technician) => <button key={technician.id} className={`control-technician-card${technician.id === 'TEC-010' ? ' is-featured' : ''}`} type="button" onClick={() => onSelectTechnician(technician.id)}><header><ProfileAvatar name={technician.name} src={technician.avatar} size="md" decorative /><StatusBadge value={technician.status} /></header><h2>{technician.name}</h2><p>{technician.specialty}</p><dl><div><dt>Região</dt><dd>{technician.region}</dd></div><div><dt>Atendimento atual</dt><dd>{technician.currentOccurrence?.protocol || 'Sem chamado'}</dd></div><div><dt>Distância</dt><dd>{technician.distanceKm.toFixed(1).replace('.', ',')} km</dd></div></dl>{technician.id === 'TEC-010' && <small className="control-featured-label">Técnico principal da demonstração</small>}</button>)}</section>
    </>
  );
}
