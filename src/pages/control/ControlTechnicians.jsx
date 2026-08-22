import { useState } from 'react';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';

const filters = [['all','Todos'],['disponível','Disponíveis'],['em deslocamento','Em deslocamento'],['em atendimento','Em atendimento'],['indisponível','Indisponíveis']];

export default function ControlTechnicians({ technicians, onSelectTechnician }) {
  const [filter, setFilter] = useState('all');
  const filtered = technicians.filter((technician) => filter === 'all' || technician.status === filter);
  return (
    <>
      <section className="d-flex flex-column flex-sm-row align-items-start align-items-sm-end justify-content-sm-between gap-4 pb-4 border-bottom"><div><p className="eyebrow eyebrow--dark">Operação de campo</p><h1>Equipe de Campo</h1></div><span className="badge bg-white text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">{technicians.filter((item) => item.status === 'disponível').length} disponíveis</span></section>
      <div className="d-flex gap-2 my-4 pb-2 overflow-x-auto" role="group" aria-label="Filtrar técnicos">
        {filters.map(([id, label]) => (
          <button key={id} className={`btn rounded-pill fw-bold text-nowrap flex-shrink-0 ${filter === id ? 'btn-primary bg-opacity-10 text-primary border-primary' : 'btn-outline-secondary text-secondary bg-white border-light-subtle'}`} style={{ minHeight: '42px', fontSize: '0.8rem' }} type="button" onClick={() => setFilter(id)}>{label}</button>
        ))}
      </div>
      <section className="row g-4">
        {filtered.map((technician) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={technician.id}>
            <button
              className="btn btn-link text-decoration-none text-start p-4 w-100 h-100 bg-white border rounded shadow-sm-hover position-relative"
              style={{ borderTop: technician.id === 'TEC-010' ? '4px solid var(--color-primary)' : '1px solid var(--color-border)', color: 'var(--color-text)', minHeight: '270px' }}
              type="button"
              onClick={() => onSelectTechnician(technician.id)}
            >
              <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <ProfileAvatar name={technician.name} src={technician.avatar} size="md" decorative />
                <StatusBadge value={technician.status} />
              </header>
              <h2 className="fs-5 mb-1 text-dark">{technician.name}</h2>
              <p className="text-secondary mb-4" style={{ fontSize: '0.82rem' }}>{technician.specialty}</p>
              <dl className="d-grid gap-3 pt-4 border-top m-0">
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.66rem' }}>Região</dt><dd className="fw-bold mb-0 text-dark" style={{ fontSize: '0.8rem' }}>{technician.region}</dd></div>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.66rem' }}>Atendimento atual</dt><dd className="fw-bold mb-0 text-dark" style={{ fontSize: '0.8rem' }}>{technician.currentOccurrence?.protocol || 'Sem chamado'}</dd></div>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.66rem' }}>Distância</dt><dd className="fw-bold mb-0 text-dark" style={{ fontSize: '0.8rem' }}>{technician.distanceKm.toFixed(1).replace('.', ',')} km</dd></div>
              </dl>
              {technician.id === 'TEC-010' && <small className="position-absolute text-primary fw-bold" style={{ right: '1.5rem', bottom: '1rem', fontSize: '0.68rem' }}>Técnico principal da demonstração</small>}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
