import StatusBadge from '../../components/StatusBadge';
import ProfileAvatar from '../../components/ProfileAvatar';

export default function OperatorProfile({ technician, technicianStatus }) {
  return (
    <>
      <section className="operator-page-heading"><div><p className="eyebrow eyebrow--dark">Dados demonstrativos</p><h1>Perfil</h1></div></section>
      <section className="app-card operator-profile-card">
        <div className="operator-profile-card__identity"><ProfileAvatar name={technician.name} src={technician.avatar} size="lg" decorative /><div><h2>{technician.name}</h2><p>{technician.employeeId}</p><StatusBadge value={technicianStatus} /></div></div>
        <dl className="operator-profile-grid">
          <div><dt>Região</dt><dd>{technician.region}</dd></div>
          <div><dt>Turno</dt><dd>{technician.shift}</dd></div>
          <div><dt>Atendimentos realizados</dt><dd>{technician.completedServices}</dd></div>
          <div><dt>Chamados concluídos</dt><dd>{technician.completionRate}%</dd></div>
          <div className="is-wide"><dt>Especialidades</dt><dd><ul>{technician.specialties.map((specialty) => <li key={specialty}>{specialty}</li>)}</ul></dd></div>
        </dl>
      </section>
    </>
  );
}
