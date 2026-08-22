import { useEffect, useMemo, useState } from 'react';
import ClientElevatorCard from '../components/client/ClientElevatorCard';
import ClientShell from '../components/client/ClientShell';
import ClientStatusTimeline from '../components/client/ClientStatusTimeline';
import ClientSupportFlow from '../components/client/ClientSupportFlow';
import FeedbackMessage from '../components/FeedbackMessage';
import ProfileAvatar from '../components/ProfileAvatar';
import StatusBadge from '../components/StatusBadge';
import {
  clientElevators,
  clientEstablishment,
  clientUser,
  getClientStatus,
} from '../data/clientData';
import { OPERATION_STATUS, addOperationOccurrence } from '../data/operationStore';
import { getElevatorById, getTechnicianById } from '../data/mockData';
import useOperationState from '../hooks/useOperationState';
import { calculatePriority } from '../utils/priorityScore';
import { formatDateTime } from '../utils/presentation';

const getDisplayElevator = (elevatorId) => clientElevators.find((elevator) => elevator.id === elevatorId);

const CallCard = ({ call }) => {
  const elevator = getDisplayElevator(call.elevatorId);
  const status = getClientStatus(call);
  return (
    <a className="app-card client-call-item" href={`#/client/call/${call.id}`}>
      <div className="client-call-item__head"><strong>{call.protocol}</strong><StatusBadge value={status} /></div>
      <h3>{elevator?.displayName || call.elevatorId}</h3>
      <p>{call.detectedFailure || call.description}</p>
      <small>{formatDateTime(call.time)}</small>
    </a>
  );
};

export default function ClientPage({ route = '/client' }) {
  const operationState = useOperationState();
  const [newCallId, setNewCallId] = useState(null);
  const [submitError, setSubmitError] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  const allCalls = useMemo(() => operationState.occurrences
    .filter((call) => call.clientId === clientEstablishment.id)
    .sort((first, second) => new Date(second.time) - new Date(first.time)), [operationState]);
  const statusFor = (call) => getClientStatus(call);
  const activeCalls = allCalls.filter((call) => statusFor(call) !== OPERATION_STATUS.RESOLVED);
  const resolvedCalls = allCalls.filter((call) => statusFor(call) === OPERATION_STATUS.RESOLVED);
  const scenarioRecord = allCalls.find((call) => call.protocol === 'HOP-1048');
  const displayedElevators = clientElevators.map((elevator) => {
    const trackedCall = elevator.id === 'ELV-003'
      ? scenarioRecord
      : activeCalls.find((call) => call.elevatorId === elevator.id);
    if (!trackedCall) return elevator;
    const clientStatus = trackedCall.workflowStatus === OPERATION_STATUS.RESOLVED
      ? 'Operação normal'
      : getClientStatus(trackedCall);
    return {
      ...elevator,
      clientStatus,
      system: trackedCall.system || elevator.system,
      detectedFailure: trackedCall.workflowStatus !== OPERATION_STATUS.RESOLVED,
      supportRequested: true,
    };
  });

  const submitSupport = (elevator, form) => {
    setSubmitError(false);
    try {
      const now = new Date();
      const id = `OCC-CLIENT-${now.getTime()}`;
      const protocol = operationState.occurrences.some((item) => item.protocol === 'HOP-1048')
        ? `HOP-${String(now.getTime()).slice(-4)}`
        : 'HOP-1048';
      const occurrence = {
        id, elevatorId: elevator.id, clientId: clientEstablishment.id, address: elevator.address,
        time: now.toISOString(), description: form.observation || `Falha detectada no ${elevator.system.toLowerCase()}.`,
        status: 'aberta', technicianId: null, trappedPeople: form.trappedPeople === 'Sim' ? 1 : 0,
        locationContext: `${clientEstablishment.type} com operação assistencial contínua.`,
      };
      const metadata = {
        riskToLife: form.risk === 'Sim', criticalFacility: clientEstablishment.type === 'Hospital',
        elevatorStopped: form.functioning === 'Não está funcionando', partialFailure: form.functioning === 'Sim, mas com dificuldade',
        serviceNumber: protocol, clientNotes: [form.riskNote, form.observation].filter(Boolean).join(' — '),
        distanceKm: 2.4, etaMinutes: 7, latitude: -23.5688, longitude: -46.6487, recurrence: true,
        diagnosis: { demoCode: 'MVP-PT-CLIENT', system: 'Portas', source: 'Detecção automática simulada do equipamento', probableOrigin: 'Sistema de portas', probability: 82, suspectedRegions: ['doors', 'sensors'], summary: 'Possível falha no ciclo de fechamento. A hipótese deve ser verificada no local.' },
      };
      const baseElevator = getElevatorById(elevator.id);
      const priority = calculatePriority({ occurrence, client: clientEstablishment, elevator: { ...baseElevator, status: metadata.elevatorStopped ? 'parado' : baseElevator.status }, metadata, now });
      const call = {
        ...occurrence, protocol, detectedFailure: `Possível falha no ${elevator.system.toLowerCase()}`,
        system: elevator.system, functioning: form.functioning, trappedPeopleAnswer: form.trappedPeople, riskAnswer: form.risk,
        observation: form.observation, riskNote: form.riskNote, priority, severity: priority.classification,
        workflowStatus: OPERATION_STATUS.WAITING_ASSIGNMENT, metadata, origin: 'client',
        completedAt: null, duration: null, finalDiagnosis: null, solution: null,
      };
      addOperationOccurrence(call);
      setNewCallId(id);
      window.location.hash = `/client/call/${id}`;
    } catch {
      setSubmitError(true);
    }
  };

  const pageTitle = (eyebrow, title, description) => (
    <header className="client-page-title"><div><p className="client-kicker">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div></header>
  );

  const scenarioCall = activeCalls.find((call) => call.protocol === 'HOP-1048');

  const renderHome = () => {
    const normalCount = displayedElevators.filter((elevator) => elevator.clientStatus === 'Operação normal').length;
    return (
      <>
        <section className="client-welcome">
          <div><p className="client-kicker">{clientEstablishment.name}</p><h1>Olá, {clientUser.firstName}</h1></div>
          <span className="client-establishment-type">{clientEstablishment.type}</span>
        </section>
        <section className="client-summary" aria-label="Resumo dos elevadores">
          <article><span>Elevadores cadastrados</span><strong>{displayedElevators.length}</strong></article>
          <article><span>Operando normalmente</span><strong>{normalCount}</strong></article>
          <article><span>Elevadores com alerta</span><strong>{displayedElevators.length - normalCount}</strong></article>
          <article><span>Chamados em andamento</span><strong>{activeCalls.length}</strong></article>
        </section>
        <section className="client-failure-alert" aria-labelledby="failure-title">
          <div className="client-failure-alert__icon" aria-hidden="true">!</div>
          <div><p className="client-kicker">{scenarioRecord?.workflowStatus === OPERATION_STATUS.RESOLVED ? 'Atendimento concluído' : scenarioCall ? 'Solicitação em andamento' : 'Falha detectada automaticamente'}</p><h2 id="failure-title">{scenarioRecord?.workflowStatus === OPERATION_STATUS.RESOLVED ? 'O atendimento do Elevador 03 foi concluído' : scenarioCall ? 'Acompanhe o atendimento do Elevador 03' : 'Detectamos um problema no Elevador 03'}</h2><p>{scenarioRecord?.workflowStatus === OPERATION_STATUS.RESOLVED ? 'A ocorrência foi resolvida e os detalhes permanecem disponíveis no histórico.' : scenarioCall ? 'A Central de Operações e o técnico responsável estão atualizando esta mesma solicitação.' : 'O equipamento informou uma possível falha no sistema da porta. Precisamos de algumas informações para definir a prioridade do atendimento.'}</p></div>
          <button className="btn btn-primary btn-lg" type="button" onClick={() => { window.location.hash = scenarioRecord ? `/client/call/${scenarioRecord.id}` : '/client/support/ELV-003'; }}>{scenarioRecord ? 'ACOMPANHAR SOLICITAÇÃO' : 'INFORMAR SITUAÇÃO'}</button>
        </section>
        <section className="client-section">
          <div className="section-heading client-section__head"><div><h2>Seus elevadores</h2></div><a href="#/client/elevators">Ver todos</a></div>
          <div className="client-elevator-grid">{displayedElevators.map((elevator) => <ClientElevatorCard key={elevator.id} elevator={elevator} onSupport={(id) => { window.location.hash = `/client/support/${id}`; }} />)}</div>
        </section>
        <section className="client-section">
          <div className="section-heading client-section__head"><div><h2>Chamado em andamento</h2></div><a href="#/client/calls">Ver chamados</a></div>
          <div className="client-call-grid">{activeCalls.slice(0, 2).map((call) => <CallCard key={call.id} call={call} />)}</div>
        </section>
      </>
    );
  };

  const renderElevators = () => (
    <>{pageTitle('Equipamentos', 'Elevadores',)}<div className="client-elevator-grid">{displayedElevators.map((elevator) => <ClientElevatorCard key={elevator.id} elevator={elevator} onSupport={(id) => { window.location.hash = `/client/support/${id}`; }} />)}</div></>
  );

  const renderCalls = () => (
    <>{pageTitle('Acompanhamento', 'Chamados',)}<section className="client-section client-section--first"><div className="section-heading client-section__head"><div><h2>Em andamento</h2></div></div><div className="client-call-grid">{activeCalls.map((call) => <CallCard key={call.id} call={call} />)}</div></section><section className="client-section"><div className="section-heading client-section__head"><div><h2>Concluídos</h2></div></div><div className="client-call-grid">{resolvedCalls.map((call) => <CallCard key={call.id} call={call} />)}</div></section></>
  );

  const renderProfile = () => (
    <>{pageTitle('Conta do estabelecimento', 'Perfil',)}<article className="app-card client-profile-card"><div className="client-profile-card__identity"><ProfileAvatar name={clientUser.name} src={clientUser.avatar} size="lg" decorative /><div><h2>{clientUser.name}</h2><p>{clientUser.role}</p></div></div><dl className="client-review-list"><div><dt>Estabelecimento</dt><dd>{clientEstablishment.name}</dd></div><div><dt>Tipo do local</dt><dd>{clientEstablishment.type}</dd></div><div><dt>Endereço</dt><dd>{clientEstablishment.address}</dd></div><div><dt>Equipamentos</dt><dd>{clientElevators.length} elevadores cadastrados</dd></div></dl><FeedbackMessage title="Dados do local aplicados automaticamente">O tipo Hospital é considerado na prioridade. Mariana não precisa informar esse contexto novamente.</FeedbackMessage></article></>
  );

  const renderCallDetail = (call) => {
    const elevator = getDisplayElevator(call.elevatorId);
    const status = statusFor(call);
    const workflow = call.workflowStatus;
    const isResolved = status === OPERATION_STATUS.RESOLVED;
    const assignedTechnician = getTechnicianById(call.assignedTechnicianId || call.technicianId);
    return (
      <>
        <a className="client-back-link" href="#/client/calls">← Voltar para chamados</a>
        {newCallId === call.id && <div className="client-success-banner" role="status"><span aria-hidden="true">✓</span><div><strong>Solicitação registrada</strong><p>As informações foram enviadas e a prioridade foi calculada.</p></div></div>}
        <section className="app-card client-call-detail">
          <header><div><p className="client-kicker">Chamado {call.protocol}</p><h1>{elevator?.displayName}</h1><p>{call.detectedFailure || call.description}</p></div><div className="client-call-detail__badges"><StatusBadge value={call.priority.classification} type="severity" /><StatusBadge value={status} /></div></header>
          <div className="client-confirmation-grid"><div><span>Protocolo</span><strong>{call.protocol}</strong></div><div><span>Horário</span><strong>{formatDateTime(call.time)}</strong></div><div><span>Prioridade</span><strong>{call.priority.classification}</strong></div><div><span>Status atual</span><strong>{status}</strong></div></div>
          <div className="client-priority-copy"><strong>{call.priority.classification === 'crítica' ? 'Atendimento classificado como crítico.' : `Sua solicitação recebeu prioridade ${call.priority.classification}.`}</strong><p>A prioridade considera as respostas enviadas e o contexto do estabelecimento.</p></div>
          <div className="client-detail-columns">
            <section><h2>Acompanhamento</h2><ClientStatusTimeline call={call} /></section>
            <aside>
              {assignedTechnician ? <div className="client-technician-card"><ProfileAvatar name={assignedTechnician.name} src={assignedTechnician.avatar} size="lg" decorative /><div><p className="client-kicker">{workflow === OPERATION_STATUS.TRAVELING ? 'Técnico a caminho' : workflow === OPERATION_STATUS.ON_SITE ? 'Técnico no local' : workflow === OPERATION_STATUS.MAINTENANCE ? 'Técnico realizando atendimento' : isResolved ? 'Atendimento concluído' : 'Técnico atribuído'}</p><h2>{assignedTechnician.name}</h2>{workflow === OPERATION_STATUS.TRAVELING && <p>Chegada estimada: {call.metadata?.etaMinutes || 7} min</p>}</div></div> : <div className="client-waiting-card"><span aria-hidden="true">◎</span><div><strong>Aguardando atribuição</strong><p>A Central de Operações está selecionando o técnico mais adequado.</p></div></div>}
              {isResolved && call.completedAt && <p className="client-completed-note">Atendimento concluído em {formatDateTime(call.completedAt)}.{call.solution && <> Solução: {call.solution}</>}</p>}
            </aside>
          </div>
        </section>
      </>
    );
  };

  let content;
  if (route === '/client') content = renderHome();
  else if (route === '/client/elevators') content = renderElevators();
  else if (route === '/client/calls') content = renderCalls();
  else if (route === '/client/profile') content = renderProfile();
  else if (route.startsWith('/client/support/')) {
    const elevator = getDisplayElevator(route.split('/').pop());
    content = elevator ? <ClientSupportFlow elevator={elevator} establishment={clientEstablishment} onCancel={() => { window.location.hash = '/client'; }} onSubmit={(form) => submitSupport(elevator, form)} submitError={submitError} /> : <p>Elevador não encontrado.</p>;
  } else if (route.startsWith('/client/call/')) {
    const call = allCalls.find((item) => item.id === route.split('/').pop());
    content = call ? renderCallDetail(call) : <div className="client-error-message" role="alert"><strong>Chamado não encontrado.</strong><span>Volte para a lista de chamados e tente novamente.</span></div>;
  } else content = <div className="client-error-message" role="alert"><strong>Página não encontrada.</strong><span>Use a navegação para voltar ao início.</span></div>;

  return <ClientShell route={route} user={clientUser} establishment={clientEstablishment}>{content}</ClientShell>;
}
