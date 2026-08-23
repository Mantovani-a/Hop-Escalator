import { useState } from 'react';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';

const filters = [
  ['all', 'Todos'],
  ['disponível', 'Disponíveis'],
  ['em deslocamento', 'Em deslocamento'],
  ['em atendimento', 'Em atendimento'],
  ['indisponível', 'Indisponíveis']
];

export default function ControlTechnicians({ technicians, onSelectTechnician }) {
  const [filter, setFilter] = useState('all');
  const available = technicians.filter((t) => t.status === 'disponível').length;
  const sortedTechnicians = [...technicians].sort((a, b) => (b.id === 'TEC-010' ? 1 : -1));
  const filtered = sortedTechnicians.filter((technician) => filter === 'all' || technician.status === filter);

  return (
    <>
      <header className="page-header">
        <div>
          <p className="page-header__subtitle">Operação de campo</p>
          <h1 className="page-header__title">Equipe de Campo</h1>
        </div>
        <span className="badge app-card text-secondary border px-3 py-2 fs-6 rounded-pill fw-bold">{available} disponíveis</span>
      </header>
      
      <section className="d-flex flex-wrap gap-2 mt-4">
        <div className="d-flex align-items-center gap-2 me-3">
          <span className="d-inline-block rounded-pill" style={{ width: '2rem', height: '1rem', backgroundColor: 'var(--color-primary-action)' }} />
          <span className="text-secondary" style={{ fontSize: '0.78rem' }}>Destaque</span>
        </div>
        <div className="d-flex align-items-center gap-2 me-3"><StatusBadge value="disponível" /></div>
        <div className="d-flex align-items-center gap-2 me-3"><StatusBadge value="em deslocamento" /></div>
        <div className="d-flex align-items-center gap-2 me-3"><StatusBadge value="em atendimento" /></div>
        <div className="d-flex align-items-center gap-2"><StatusBadge value="indisponível" /></div>
      </section>
      
      <section className="row g-4 mt-2">
        {filtered.map((technician) => (
          <div className="col-12 col-sm-6 col-lg-4 col-xl-3" key={technician.id}>
            <button
              className={`btn btn-link text-decoration-none text-start p-4 w-100 h-100 app-card border rounded shadow-sm-hover position-relative d-flex flex-column align-items-stretch ${technician.id === 'TEC-010' ? 'border-primary' : ''}`}
              style={{ minHeight: '270px', borderTop: technician.id === 'TEC-010' ? '4px solid var(--color-primary-action)' : '1px solid var(--color-border)', color: 'var(--color-text)' }}
              type="button"
              onClick={() => onSelectTechnician(technician.id)}
            >
              <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 w-100">
                <ProfileAvatar name={technician.name} src={technician.avatar} size="md" decorative />
                <StatusBadge value={technician.status} />
              </header>
              <h2 className="fs-5 mb-1 w-100" style={{ color: 'var(--color-text)' }}>{technician.name}</h2>
              <p className="text-secondary mb-4 w-100" style={{ fontSize: '0.82rem' }}>{technician.specialty}</p>
              <dl className="d-grid gap-3 mt-auto pt-4 border-top m-0 w-100" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.66rem' }}>Região</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)', fontSize: '0.8rem' }}>{technician.region}</dd></div>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.66rem' }}>Atendimento atual</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)', fontSize: '0.8rem' }}>{technician.currentOccurrence?.protocol || 'Sem chamado'}</dd></div>
                <div><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.66rem' }}>Distância</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)', fontSize: '0.8rem' }}>{technician.distanceKm.toFixed(1).replace('.', ',')} km</dd></div>
              </dl>
              {technician.id === 'TEC-010' && <small className="position-absolute text-primary fw-bold" style={{ right: '1.5rem', bottom: '1rem', fontSize: '0.68rem' }}>Técnico principal da demonstração</small>}
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
