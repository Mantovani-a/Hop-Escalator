import { useState } from 'react';
import { functioningLabels } from '../../data/clientData';

const initialForm = { functioning: '', trappedPeople: '', risk: '', riskNote: '', observation: '' };

const ChoiceGroup = ({ legend, name, options, value, onChange }) => (
  <fieldset className="client-choice-group">
    <legend>{legend}</legend>
    <div className="client-choice-grid">
      {options.map((option) => (
        <label key={option} className={value === option ? 'is-selected' : ''}>
          <input type="radio" name={name} value={option} checked={value === option} onChange={() => onChange(option)} />
          <span className="client-choice-check" aria-hidden="true">{value === option ? '✓' : ''}</span>
          <span>{option}</span>
        </label>
      ))}
    </div>
  </fieldset>
);

export default function ClientSupportFlow({ elevator, establishment, onCancel, onSubmit, submitError }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [validation, setValidation] = useState('');
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const continueFlow = () => {
    const required = step === 1 ? form.functioning : step === 2 ? form.trappedPeople : form.risk;
    if (!required) {
      setValidation('Selecione uma opção para continuar.');
      return;
    }
    setValidation('');
    setStep((current) => Math.min(4, current + 1));
  };

  return (
    <section className="client-flow" aria-labelledby="support-title">
      <div className="client-flow__header">
        <div><p className="client-kicker">Solicitar suporte</p><h1 id="support-title">{elevator.displayName}</h1><p>{establishment.name} · {elevator.system}</p></div>
        <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>Cancelar</button>
      </div>

      <div className="client-stepper" aria-label={`Etapa ${step} de 4`}>
        {[1, 2, 3, 4].map((number) => <span key={number} className={number <= step ? 'is-active' : ''}>{number}</span>)}
      </div>

      <div className="app-card client-flow__card">
        {step === 1 && <ChoiceGroup legend="O elevador está funcionando?" name="functioning" options={['Sim, normalmente', 'Sim, mas com dificuldade', 'Não está funcionando']} value={form.functioning} onChange={(value) => update('functioning', value)} />}

        {step === 2 && (
          <>
            <ChoiceGroup legend="Existem pessoas presas dentro do elevador?" name="trappedPeople" options={['Sim', 'Não', 'Não sei']} value={form.trappedPeople} onChange={(value) => update('trappedPeople', value)} />
            {form.trappedPeople === 'Sim' && <div className="client-inline-alert" role="status"><strong>Atendimento prioritário</strong><span>Essa informação aumentará a prioridade da solicitação.</span></div>}
          </>
        )}

        {step === 3 && (
          <>
            <ChoiceGroup legend="Existe risco imediato para alguma pessoa?" name="risk" options={['Sim', 'Não', 'Não sei']} value={form.risk} onChange={(value) => update('risk', value)} />
            {form.risk === 'Sim' && <div><label className="form-label" htmlFor="risk-note">Descreva o risco em poucas palavras</label><input id="risk-note" className="form-control" maxLength="180" value={form.riskNote} onChange={(event) => update('riskNote', event.target.value)} placeholder="Ex.: uma pessoa precisa de atendimento médico." /></div>}
            <div><label className="form-label" htmlFor="client-observation">Conte o que está acontecendo <span>(opcional)</span></label><textarea id="client-observation" className="form-control" maxLength="400" value={form.observation} onChange={(event) => update('observation', event.target.value)} placeholder="Ex.: o elevador parou entre dois andares." /></div>
          </>
        )}

        {step === 4 && (
          <div>
            <p className="client-kicker">Etapa 4 de 4</p><h2>Revise as informações</h2>
            <dl className="client-review-list">
              <div><dt>Elevador</dt><dd>{elevator.displayName}</dd></div>
              <div><dt>Falha detectada</dt><dd>{elevator.system}</dd></div>
              <div><dt>Funcionamento</dt><dd>{functioningLabels[form.functioning]}</dd></div>
              <div><dt>Pessoas presas</dt><dd>{form.trappedPeople}</dd></div>
              <div><dt>Risco imediato</dt><dd>{form.risk}</dd></div>
              <div><dt>Local</dt><dd>{establishment.name} · {establishment.type}</dd></div>
              {form.observation && <div className="client-review-list__wide"><dt>Observação</dt><dd>{form.observation}</dd></div>}
            </dl>
            {submitError && <div className="client-error-message" role="alert"><strong>Não foi possível registrar a solicitação.</strong><span>Suas informações foram preservadas. Tente novamente.</span></div>}
          </div>
        )}

        {validation && <p className="client-validation" role="alert">{validation}</p>}
        <div className="client-flow__actions">
          {step > 1 && <button className="btn btn-outline-primary btn-lg" type="button" onClick={() => { setValidation(''); setStep((current) => current - 1); }}>VOLTAR E EDITAR</button>}
          {step < 4
            ? <button className="btn btn-primary btn-lg" type="button" onClick={continueFlow}>CONTINUAR</button>
            : <button className="btn btn-primary btn-lg" type="button" onClick={() => onSubmit(form)}>SOLICITAR SUPORTE</button>}
        </div>
      </div>
    </section>
  );
}
