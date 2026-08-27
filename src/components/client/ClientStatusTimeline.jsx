import { getTimeline } from '../../data/clientData';

export default function ClientStatusTimeline({ call }) {
  const steps = getTimeline(call);

  return (
    <ol className="client-timeline" aria-label="Progresso do atendimento">
      {steps.map((step) => (
        <li
          key={step.label}
          className={`${step.reached ? 'is-reached' : ''}${step.current ? ' is-current' : ''}`}
        >
          <span className="client-timeline__marker" aria-hidden="true">
            {step.reached && !step.current ? '✓' : step.current ? '●' : '○'}
          </span>
          <span className="client-timeline__label">{step.label}</span>
        </li>
      ))}
    </ol>
  );
}
