import { useState } from 'react';

const outcomeOptions = [
  ['resolved', 'Concluído — problema resolvido'],
  ['part', 'Pendente — necessita peça'],
  ['support', 'Pendente — necessita suporte da central'],
];

const resultOptions = ['Hipótese confirmada', 'Hipótese descartada', 'Outra causa identificada'];
const conditionOptions = ['Operação restabelecida', 'Funcionamento parcial', 'Equipamento permanece indisponível'];

export default function OperatorCompletionForm({ onCancel, onComplete }) {
  const [outcome, setOutcome] = useState('');
  const [form, setForm] = useState({ result: '', action: '', condition: '', part: '', quantity: 1, urgency: 'Normal', diagnosis: '', observation: '' });
  const [validation, setValidation] = useState('');
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!outcome) return setValidation('Selecione o resultado do atendimento.');
    if (outcome === 'resolved' && (!form.result || !form.action.trim() || !form.condition)) return setValidation('Preencha o resultado, a ação realizada e a condição final.');
    if (outcome === 'part' && (!form.part.trim() || Number(form.quantity) < 1 || !form.diagnosis.trim())) return setValidation('Informe a peça, a quantidade e o diagnóstico da substituição.');
    if (outcome === 'support' && !form.diagnosis.trim()) return setValidation('Descreva o motivo do pedido de suporte.');
    onComplete({ ...form, outcome, action: form.action.trim(), part: form.part.trim(), diagnosis: form.diagnosis.trim(), observation: form.observation.trim() });
  };

  return (
    <form className="operator-outcome-form d-grid gap-3 mt-4 pt-4 border-top" onSubmit={submit}>
      <fieldset className="border-0 p-0 m-0">
        <legend className="fs-6 fw-bold mb-2">Resultado desta visita</legend>
        <div className="d-grid gap-2">
          {outcomeOptions.map(([value, label]) => <label className={`operator-outcome-option${outcome === value ? ' is-selected' : ''}`} key={value}><input type="radio" name="service-outcome" checked={outcome === value} onChange={() => { setOutcome(value); setValidation(''); }} /><span>{label}</span></label>)}
        </div>
      </fieldset>

      {outcome === 'resolved' && <>
        <div><label className="form-label fw-bold" htmlFor="completion-result">Resultado do diagnóstico</label><select id="completion-result" className="form-select" value={form.result} onChange={(event) => update('result', event.target.value)}><option value="">Selecione</option>{resultOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
        <div><label className="form-label fw-bold" htmlFor="completion-action">Ação realizada</label><textarea id="completion-action" className="form-control" rows="3" maxLength="300" value={form.action} onChange={(event) => update('action', event.target.value)} /></div>
        <div><label className="form-label fw-bold" htmlFor="completion-condition">Condição final do equipamento</label><select id="completion-condition" className="form-select" value={form.condition} onChange={(event) => update('condition', event.target.value)}><option value="">Selecione</option>{conditionOptions.map((option) => <option key={option}>{option}</option>)}</select></div>
      </>}

      {outcome === 'part' && <>
        <div><label className="form-label fw-bold" htmlFor="required-part">Peça necessária</label><input id="required-part" className="form-control" maxLength="120" value={form.part} onChange={(event) => update('part', event.target.value)} placeholder="Ex.: Sensor de porta" /></div>
        <div className="row g-3"><div className="col-5"><label className="form-label fw-bold" htmlFor="part-quantity">Quantidade</label><input id="part-quantity" className="form-control" type="number" min="1" max="99" value={form.quantity} onChange={(event) => update('quantity', event.target.value)} /></div><div className="col-7"><label className="form-label fw-bold" htmlFor="part-urgency">Urgência</label><select id="part-urgency" className="form-select" value={form.urgency} onChange={(event) => update('urgency', event.target.value)}><option>Normal</option><option>Alta</option><option>Crítica</option></select></div></div>
        <div><label className="form-label fw-bold" htmlFor="part-diagnosis">Diagnóstico / motivo da substituição</label><textarea id="part-diagnosis" className="form-control" rows="3" maxLength="400" value={form.diagnosis} onChange={(event) => update('diagnosis', event.target.value)} /></div>
        <div><label className="form-label fw-bold" htmlFor="part-observation">Observação <span className="fw-normal text-secondary">(opcional)</span></label><textarea id="part-observation" className="form-control" rows="2" maxLength="300" value={form.observation} onChange={(event) => update('observation', event.target.value)} /></div>
      </>}

      {outcome === 'support' && <>
        <div><label className="form-label fw-bold" htmlFor="support-reason">Motivo do suporte</label><textarea id="support-reason" className="form-control" rows="3" maxLength="400" value={form.diagnosis} onChange={(event) => update('diagnosis', event.target.value)} /></div>
        <div><label className="form-label fw-bold" htmlFor="support-observation">Observação adicional <span className="fw-normal text-secondary">(opcional)</span></label><textarea id="support-observation" className="form-control" rows="2" maxLength="300" value={form.observation} onChange={(event) => update('observation', event.target.value)} /></div>
      </>}

      {validation && <p className="text-danger fw-bold mb-0" role="alert">{validation}</p>}
      <div className="d-flex flex-wrap gap-2"><button className="btn btn-outline-secondary flex-fill" type="button" onClick={onCancel}>CANCELAR</button><button className="btn btn-primary flex-fill" type="submit">{outcome === 'part' ? 'REGISTRAR NECESSIDADE DE PEÇA' : outcome === 'support' ? 'REGISTRAR PEDIDO DE SUPORTE' : 'CONFIRMAR ENCERRAMENTO'}</button></div>
    </form>
  );
}
