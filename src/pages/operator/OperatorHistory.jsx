import { useState } from 'react';
import OperatorStateMessage from '../../components/operator/OperatorStateMessage';
import ProfileAvatar from '../../components/ProfileAvatar';
import StatusBadge from '../../components/StatusBadge';
import { operatorTechnician } from '../../data/operatorData';
import { formatDateTime } from '../../utils/presentation';

const filters = [
  { id: 'today', label: 'Hoje', days: 0 },
  { id: 'week', label: 'Últimos 7 dias', days: 7 },
  { id: 'all', label: 'Todos', days: null },
];

export default function OperatorHistory({ historyItems }) {
  const [activeFilter, setActiveFilter] = useState('today');
  const selectedFilter = filters.find((filter) => filter.id === activeFilter);
  const now = new Date();
  const filteredItems = historyItems.filter((item) => {
    if (selectedFilter.days === null) return true;
    const completed = new Date(item.completedAt);
    if (selectedFilter.days === 0) return completed.toDateString() === now.toDateString();
    return now.getTime() - completed.getTime() <= selectedFilter.days * 86400000;
  });

  return (
    <>
      <section className="d-flex flex-column gap-2 mb-4">
        <div><p className="text-primary fw-bold text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>Atendimentos de João Carlos</p><h1 className="mb-0" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.6rem)' }}>Histórico</h1></div>
      </section>
      <div className="d-flex p-1 border rounded app-card mb-4 overflow-x-auto" style={{ maxWidth: '480px' }} aria-label="Filtrar histórico">
        {filters.map((filter) => <button className={`btn flex-grow-1 border-0 fw-bold text-nowrap rounded-sm ${filter.id === activeFilter ? 'btn-primary' : 'text-secondary bg-transparent'}`} style={{ fontSize: '0.84rem', minHeight: '42px' }} type="button" key={filter.id} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}
      </div>
      {filteredItems.length ? (
        <div className="d-grid gap-3">
          {filteredItems.map((item) => (
            <article className="app-card p-4 border-start rounded border-start border-4" style={{ borderLeftColor: 'var(--color-severity-low) !important' }} key={item.id}>
              <div className="mb-4">
                <StatusBadge value="Resolvido" />
                <span className="ms-2 text-secondary fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>{item.occurrence.protocol}</span>
                <h2 className="fs-5 mt-3 mb-1" style={{ color: 'var(--color-text)' }}>{item.occurrence.client.name}</h2>
                <p className="mb-0 text-secondary" style={{ fontSize: '0.88rem' }}>{item.occurrence.elevator.identification} · {item.occurrence.description}</p>
              </div>
              <dl className="row g-3 mb-0">
                <div className="col-12 col-md-4"><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Concluído</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{formatDateTime(item.completedAt)}</dd></div>
                <div className="col-12 col-md-4"><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Duração</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)' }}>{item.duration}</dd></div>
                <div className="col-12 col-md-4"><dt className="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.72rem' }}>Responsável</dt><dd className="fw-bold mb-0" style={{ color: 'var(--color-text)' }}><span className="d-inline-flex align-items-center gap-2"><ProfileAvatar name={operatorTechnician.name} src={operatorTechnician.avatar} size="sm" decorative />{operatorTechnician.name}</span></dd></div>
              </dl>
            </article>
          ))}
        </div>
      ) : (
        <OperatorStateMessage type="empty" title="Nenhum atendimento neste período">Altere o filtro para consultar outros chamados concluídos por João Carlos.</OperatorStateMessage>
      )}
    </>
  );
}
