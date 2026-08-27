import { useState } from 'react';
import { functioningLabels } from '../../data/clientData';

const initialForm = {
  elevatorId: '',
  functioning: '',
  trappedPeople: '',
  trappedCount: '1',
  risk: '',
  riskNote: '',
  observation: '',
};

const ChoiceGroup = ({ legend, name, options, value, onChange }) => (
  <fieldset className="client-choice-group">
    <legend className="client-choice-legend">{legend}</legend>
    <div className="client-choice-grid">
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <label key={option} className={`client-choice-label${isSelected ? ' is-selected' : ''}`}>
            <input
              type="radio"
              name={name}
              value={option}
              checked={isSelected}
              onChange={() => onChange(option)}
            />
            <span className="client-choice-check" aria-hidden="true">
              {isSelected ? '✓' : ''}
            </span>
            <span className="client-choice-text">{option}</span>
          </label>
        );
      })}
    </div>
  </fieldset>
);

export default function ClientSupportFlow({
  elevator,
  elevators = [],
  establishment,
  onCancel,
  onSubmit,
  submitError,
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({
    ...initialForm,
    elevatorId: elevator?.id || elevators[0]?.id || 'ELV-003',
  }));
  const [validation, setValidation] = useState('');

  const currentElevator = elevator || elevators.find((e) => e.id === form.elevatorId) || elevators[0] || {
    id: 'ELV-003',
    displayName: 'Elevador 03',
    identification: 'Torre B • Elevador de serviço',
  };

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const continueFlow = () => {
    if (step === 1) {
      if (!form.elevatorId) {
        setValidation('Selecione qual elevador apresenta o problema.');
        return;
      }
      if (!form.functioning) {
        setValidation('Informe a condição de funcionamento do elevador.');
        return;
      }
    }
    if (step === 2 && !form.trappedPeople) {
      setValidation('Informe se há pessoas presas no elevador.');
      return;
    }
    if (step === 3 && !form.risk) {
      setValidation('Informe se existe risco imediato.');
      return;
    }

    setValidation('');
    setStep((current) => Math.min(4, current + 1));
  };

  return (
    <section className="client-flow" aria-labelledby="support-title">
      <div className="client-flow__header d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
        <div>
          <p className="client-kicker mb-1">Central do Cliente · Abertura de Chamado</p>
          <h1 className="page-header__title mb-1" id="support-title">Registrar Ocorrência</h1>
          <p className="text-secondary mb-0">
            {establishment.name} · {currentElevator?.displayName || 'Elevador'}
          </p>
        </div>
        <button className="btn btn-outline-secondary" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>

      <div className="client-stepper mb-4" aria-label={`Etapa ${step} de 4`}>
        {[
          { num: 1, label: 'Equipamento' },
          { num: 2, label: 'Passageiros' },
          { num: 3, label: 'Gravidade' },
          { num: 4, label: 'Revisão' },
        ].map((item) => (
          <div
            key={item.num}
            className={`client-stepper-step${item.num <= step ? ' is-active' : ''}${item.num === step ? ' is-current' : ''}`}
          >
            <span className="client-stepper-bar" />
            <span className="client-stepper-label">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="app-card client-flow__card p-4 p-md-5 mt-2">
        {step === 1 && (
          <div className="d-flex flex-column gap-4">
            {elevators.length > 1 && (
              <div>
                <label className="form-label fw-bold text-uppercase client-kicker mb-2">
                  Qual elevador apresenta a ocorrência?
                </label>
                <div className="row g-2">
                  {elevators.map((elv) => {
                    const isSelected = form.elevatorId === elv.id;
                    return (
                      <div className="col-12 col-sm-4" key={elv.id}>
                        <button
                          type="button"
                          className={`btn w-100 p-3 text-start border rounded-3 d-flex flex-column justify-content-between h-100 ${
                            isSelected ? 'border-primary bg-primary-subtle text-primary fw-bold shadow-sm' : 'border-secondary-subtle bg-body'
                          }`}
                          onClick={() => update('elevatorId', elv.id)}
                        >
                          <div className="d-flex justify-content-between align-items-center w-100 mb-1">
                            <span className="fs-6 fw-bold">{elv.displayName}</span>
                            {isSelected && <span className="badge bg-primary">Selecionado</span>}
                          </div>
                          <small className="text-secondary">{elv.identification || elv.address}</small>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <ChoiceGroup
              legend="Como está o funcionamento do elevador no momento?"
              name="functioning"
              options={[
                'Sim, normalmente',
                'Sim, mas com dificuldade',
                'Não está funcionando',
              ]}
              value={form.functioning}
              onChange={(value) => update('functioning', value)}
            />
          </div>
        )}

        {step === 2 && (
          <>
            <ChoiceGroup
              legend="Existem passageiros presos dentro da cabine?"
              name="trappedPeople"
              options={['Sim', 'Não', 'Não sei / A verificar']}
              value={form.trappedPeople}
              onChange={(value) => update('trappedPeople', value)}
            />
            {form.trappedPeople === 'Sim' && (
              <div className="client-inline-alert mt-4" role="status">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="fs-5" aria-hidden="true">🚨</span>
                  <strong>Atendimento de Resgate Prioritário</strong>
                </div>
                <p className="mb-3">
                  Essa informação acionará imediatamente o alerta de resgate com pontuação máxima de prioridade na Central de Operações.
                </p>
                <div>
                  <label className="form-label fw-bold mb-1" htmlFor="trapped-count">
                    Quantidade de pessoas presas (aproximada):
                  </label>
                  <select
                    id="trapped-count"
                    className="form-select w-auto"
                    value={form.trappedCount}
                    onChange={(e) => update('trappedCount', e.target.value)}
                  >
                    <option value="1">1 pessoa</option>
                    <option value="2">2 pessoas</option>
                    <option value="3">3 pessoas</option>
                    <option value="4">4 ou mais pessoas</option>
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <ChoiceGroup
              legend="Existe risco imediato à saúde ou segurança de alguém?"
              name="risk"
              options={['Sim', 'Não', 'Não sei']}
              value={form.risk}
              onChange={(value) => update('risk', value)}
            />
            {form.risk === 'Sim' && (
              <div className="mt-4">
                <label className="form-label fw-bold" htmlFor="risk-note">
                  Descreva o risco em poucas palavras
                </label>
                <input
                  id="risk-note"
                  className="form-control"
                  maxLength="180"
                  value={form.riskNote}
                  onChange={(event) => update('riskNote', event.target.value)}
                  placeholder="Ex.: passageiro necessita de atendimento médico urgente ou idoso debilitado."
                />
              </div>
            )}
            <div className="mt-4">
              <label className="form-label fw-bold" htmlFor="client-observation">
                O que foi observado? <span className="text-secondary fw-normal">(opcional)</span>
              </label>
              <textarea
                id="client-observation"
                className="form-control"
                rows="3"
                maxLength="400"
                value={form.observation}
                onChange={(event) => update('observation', event.target.value)}
                placeholder="Ex.: o elevador parou entre o 3º e o 4º andar com ruído na porta."
              />
            </div>
          </>
        )}

        {step === 4 && (
          <div>
            <p className="client-kicker mb-1">Etapa 4 de 4 · Confirmação</p>
            <h2 className="fs-4 mb-3">Revise os dados antes do envio</h2>
            <dl className="client-review-list">
              <div>
                <dt>Elevador</dt>
                <dd>{currentElevator.displayName} ({currentElevator.identification || 'Hospital Santa Helena'})</dd>
              </div>
              <div>
                <dt>Local</dt>
                <dd>{establishment.name} · {establishment.type}</dd>
              </div>
              <div>
                <dt>Funcionamento</dt>
                <dd>{functioningLabels[form.functioning] || form.functioning}</dd>
              </div>
              <div>
                <dt>Pessoas presas</dt>
                <dd>
                  {form.trappedPeople === 'Sim'
                    ? `Sim (${form.trappedCount} ${Number(form.trappedCount) === 1 ? 'pessoa' : 'pessoas'})`
                    : form.trappedPeople}
                </dd>
              </div>
              <div>
                <dt>Risco imediato</dt>
                <dd>{form.risk}</dd>
              </div>
              {form.riskNote && (
                <div className="client-review-list__wide">
                  <dt>Detalhe do risco</dt>
                  <dd className="text-danger fw-bold">{form.riskNote}</dd>
                </div>
              )}
              {form.observation && (
                <div className="client-review-list__wide">
                  <dt>Observações</dt>
                  <dd>{form.observation}</dd>
                </div>
              )}
            </dl>

            <div className="p-3 mt-4 rounded border bg-light d-flex align-items-center gap-3">
              <span className="fs-3 text-primary">⚡</span>
              <p className="mb-0" style={{ fontSize: '0.88rem' }}>
                Ao registrar, o sistema HOP calculará automaticamente a pontuação de prioridade com base nos dados do <strong>{establishment.name}</strong> ({establishment.type}) e enviará imediatamente para a Central de Operações.
              </p>
            </div>

            {submitError && (
              <div className="client-error-message mt-4" role="alert">
                <strong>Não foi possível registrar a solicitação.</strong>
                <span>Suas informações foram preservadas. Tente novamente.</span>
              </div>
            )}
          </div>
        )}

        {validation && <p className="client-validation" role="alert">{validation}</p>}

        <div className="client-flow__actions mt-4 pt-3 border-top d-flex flex-wrap gap-3">
          {step > 1 && (
            <button
              className="btn btn-outline-primary btn-lg flex-fill"
              type="button"
              onClick={() => {
                setValidation('');
                setStep((current) => current - 1);
              }}
            >
              VOLTAR E EDITAR
            </button>
          )}
          {step < 4 ? (
            <button className="btn btn-primary btn-lg flex-fill" type="button" onClick={continueFlow}>
              CONTINUAR
            </button>
          ) : (
            <button
              className="btn btn-primary btn-lg flex-fill fw-bold"
              type="button"
              onClick={() => onSubmit({ ...form, elevator: currentElevator })}
            >
              REGISTRAR OCORRÊNCIA
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
