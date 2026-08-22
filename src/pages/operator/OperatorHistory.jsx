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
      <section className="operator-page-heading">
        <div><p className="eyebrow eyebrow--dark">Atendimentos de João Carlos</p><h1>Histórico</h1></div>
      </section>
      <div className="operator-filter-group" aria-label="Filtrar histórico">
        {filters.map((filter) => <button className={filter.id === activeFilter ? 'is-active' : ''} type="button" key={filter.id} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}
      </div>
      {filteredItems.length ? (
        <div className="operator-history-list">
          {filteredItems.map((item) => (
            <article className="app-card operator-history-item" key={item.id}>
              <div><StatusBadge value="Resolvido" /><span className="operator-history-item__protocol">{item.occurrence.protocol}</span><h2>{item.occurrence.client.name}</h2><p>{item.occurrence.elevator.identification} · {item.occurrence.description}</p></div>
              <dl><div><dt>Concluído</dt><dd>{formatDateTime(item.completedAt)}</dd></div><div><dt>Duração</dt><dd>{item.duration}</dd></div><div><dt>Responsável</dt><dd><span className="profile-inline"><ProfileAvatar name={operatorTechnician.name} src={operatorTechnician.avatar} size="sm" decorative />{operatorTechnician.name}</span></dd></div></dl>
            </article>
          ))}
        </div>
      ) : (
        <OperatorStateMessage type="empty" title="Nenhum atendimento neste período">Altere o filtro para consultar outros chamados concluídos por João Carlos.</OperatorStateMessage>
      )}
    </>
  );
}
