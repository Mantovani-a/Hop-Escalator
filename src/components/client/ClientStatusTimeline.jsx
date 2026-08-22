import { getTimeline } from '../../data/clientData';

export default function ClientStatusTimeline({ call }) {
  return (
    <ol className="client-timeline" aria-label="Progresso do atendimento">
      {getTimeline(call).map((step) => (
        <li key={step.label} className={`${step.reached ? 'is-reached' : ''}${step.current ? ' is-current' : ''}`}>
          <span className="client-timeline__marker" aria-hidden="true">{step.reached && !step.current ? '✓' : step.current ? '●' : '○'}</span>
          <span>{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
