import HopLogo from '../components/HopLogo';
import ThemeToggle from '../components/ThemeToggle';
import { resetOperationState } from '../data/operationStore';

const experiences = [
  {
    key: 'control',
    number: '01',
    name: 'HOP Control',
    audience: 'Lideranças e operação',
    description: 'Prioridades, equipes e situação operacional em uma visão centralizada.',
  },
  {
    key: 'operator',
    number: '02',
    name: 'HOP Operator',
    audience: 'Técnicos de campo',
    description: 'Fila de atendimento, rota e diagnóstico para a operação em campo.',
  },
  {
    key: 'client',
    number: '03',
    name: 'HOP Client',
    audience: 'Responsáveis locais',
    description: 'Elevadores, solicitação de suporte e acompanhamento do atendimento.',
  },
];

export default function HomePage() {
  const restoreDemoData = () => {
    if (!window.confirm('Restaurar ocorrências e estados para o início da demonstração?')) return;
    resetOperationState();
  };

  return (
    <main className="home-selector">
      <div className="home-selector__theme"><ThemeToggle /></div>
      <section className="container hop-container home-selector__content" aria-labelledby="experiences-title">
        <HopLogo size="home" />
        <div className="home-selector__heading">
          <h1 id="experiences-title">Escolha uma experiência</h1>
        </div>
        <div className="row g-3 home-experience-grid">
          {experiences.map((experience) => (
            <div className="col-12 col-md-4" key={experience.key}>
              <article className="experience-card h-100">
                <div className="experience-card__topline">
                  <span className="experience-index" aria-hidden="true">{experience.number}</span>
                </div>
                <span className="experience-audience">{experience.audience}</span>
                <h2>{experience.name}</h2>
                <p>{experience.description}</p>
                <a className="btn btn-primary w-100" href={`#/${experience.key}`}>
                  Acessar {experience.name}
                </a>
              </article>
            </div>
          ))}
        </div>
        <button className="home-reset-action" type="button" onClick={restoreDemoData}>
          Restaurar dados de demonstração
        </button>
      </section>
    </main>
  );
}
