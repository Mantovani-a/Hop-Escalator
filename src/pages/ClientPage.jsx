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
      <div className="client-call-item__head">
        <strong className="text-primary">{call.protocol || 'Chamado'}</strong>
        <StatusBadge value={status} />
      </div>
      <h3 className="fs-5 my-2">{elevator?.displayName || call.elevatorId}</h3>
      <p className="text-secondary mb-3">{call.detectedFailure || call.description}</p>
      <small className="text-secondary">{formatDateTime(call.time)}</small>
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

  const allCalls = useMemo(
    () => operationState.occurrences
      .filter((call) => call.clientId === clientEstablishment.id)
      .sort((first, second) => new Date(second.time) - new Date(first.time)),
    [operationState],
  );

  const statusFor = (call) => getClientStatus(call);
  const activeCalls = allCalls.filter((call) => statusFor(call) !== OPERATION_STATUS.RESOLVED);
  const resolvedCalls = allCalls.filter((call) => statusFor(call) === OPERATION_STATUS.RESOLVED);
  const latestActiveCall = activeCalls[0];

  const displayedElevators = clientElevators.map((elevator) => {
    const trackedCall = activeCalls.find((call) => call.elevatorId === elevator.id);
    if (!trackedCall) {
      return {
        ...elevator,
        clientStatus: 'Operação normal',
        activeCall: null,
      };
    }
    const clientStatus = trackedCall.workflowStatus === OPERATION_STATUS.RESOLVED
      ? 'Operação normal'
      : getClientStatus(trackedCall);
    return {
      ...elevator,
      clientStatus,
      system: trackedCall.system || elevator.system,
      activeCall: trackedCall.workflowStatus !== OPERATION_STATUS.RESOLVED ? trackedCall : null,
    };
  });

  const submitSupport = (form) => {
    setSubmitError(false);
    try {
      const now = new Date();
      const elevator = form.elevator || getDisplayElevator(form.elevatorId) || displayedElevators[0];
      const id = `OCC-CLIENT-${now.getTime()}`;
      const protocol = operationState.occurrences.some((item) => item.protocol === 'HOP-1048')
        ? `HOP-${String(now.getTime()).slice(-4)}`
        : 'HOP-1048';

      const trappedCountNum = form.trappedPeople === 'Sim' ? (Number(form.trappedCount) || 1) : 0;
      const occurrence = {
        id,
        elevatorId: elevator.id,
        clientId: clientEstablishment.id,
        address: elevator.address || clientEstablishment.address,
        time: now.toISOString(),
        description: form.observation || (form.trappedPeople === 'Sim'
          ? `Passageiro(s) preso(s) na cabine (${trappedCountNum} pessoa${trappedCountNum > 1 ? 's' : ''}).`
          : `Intercorrência relatada pelo cliente no ${elevator.displayName}.`),
        status: 'aberta',
        technicianId: null,
        trappedPeople: trappedCountNum,
        locationContext: `${clientEstablishment.type} com operação assistencial contínua.`,
      };

      const metadata = {
        riskToLife: form.risk === 'Sim',
        criticalFacility: clientEstablishment.type === 'Hospital',
        elevatorStopped: form.functioning === 'Não está funcionando',
        partialFailure: form.functioning === 'Sim, mas com dificuldade',
        serviceNumber: protocol,
        clientNotes: [form.riskNote, form.observation].filter(Boolean).join(' — '),
        distanceKm: 2.4,
        etaMinutes: 7,
        latitude: -23.5688,
        longitude: -46.6487,
        recurrence: false,
        diagnosis: {
          demoCode: 'MVP-CLIENT-REPORT',
          system: elevator.system || 'Geral',
          source: 'Registro direto pelo cliente do estabelecimento',
          probableOrigin: form.trappedPeople === 'Sim' ? 'Resgate prioritário / Portas' : 'Sistema do elevador',
          probability: 90,
          suspectedRegions: ['doors', 'controller', 'cabin'],
          summary: form.observation || 'Ocorrência aberta pelo cliente responsável com validação de passageiros presos e risco.',
        },
      };

      const baseElevator = getElevatorById(elevator.id) || elevator;
      const priority = calculatePriority({
        occurrence,
        client: clientEstablishment,
        elevator: { ...baseElevator, status: metadata.elevatorStopped ? 'parado' : baseElevator.status },
        metadata,
        now,
      });

      const call = {
        ...occurrence,
        protocol,
        detectedFailure: form.observation || `Relato de intercorrência no ${elevator.displayName}`,
        system: elevator.system || 'Cabine / Portas',
        functioning: form.functioning,
        trappedPeopleAnswer: form.trappedPeople,
        trappedCount: form.trappedCount,
        riskAnswer: form.risk,
        observation: form.observation,
        riskNote: form.riskNote,
        priority,
        severity: priority.classification,
        workflowStatus: OPERATION_STATUS.WAITING_ASSIGNMENT,
        metadata,
        origin: 'client',
        completedAt: null,
        duration: null,
        finalDiagnosis: null,
        solution: null,
      };

      addOperationOccurrence(call);
      setNewCallId(id);
      window.location.hash = `/client/call/${id}`;
    } catch {
      setSubmitError(true);
    }
  };

  const pageTitle = (kicker, title) => (
    <header className="page-header mb-4">
      <div>
        <p className="page-header__subtitle">{kicker}</p>
        <h1 className="page-header__title">{title}</h1>
      </div>
    </header>
  );

  const renderHome = () => {
    const operatingCount = displayedElevators.filter((e) => e.clientStatus === 'Operação normal').length;
    const attentionCount = displayedElevators.filter((e) => e.clientStatus !== 'Operação normal').length;

    return (
      <>
        <section className="client-welcome mb-4">
          <div>
            <p className="client-kicker">Gestão de Elevadores</p>
            <h1>Olá, {clientUser.firstName}</h1>
            <p>Acompanhe em tempo real e gerencie os elevadores do {clientEstablishment.name}.</p>
          </div>
          <span className="client-establishment-type">{clientEstablishment.type}</span>
        </section>

        <section className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3 mb-4" aria-label="Resumo dos equipamentos">
          <div className="col">
            <article className="app-card p-3 d-flex flex-column justify-content-between h-100">
              <span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Total cadastrado</span>
              <strong className="text-primary my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{displayedElevators.length}</strong>
              <small className="text-secondary">elevadores monitorados</small>
            </article>
          </div>
          <div className="col">
            <article className="app-card p-3 d-flex flex-column justify-content-between h-100">
              <span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Operando normal</span>
              <strong className="text-success my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{operatingCount}</strong>
              <small className="text-secondary">sem intercorrências</small>
            </article>
          </div>
          <div className="col">
            <article className="app-card p-3 d-flex flex-column justify-content-between h-100">
              <span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Em atendimento</span>
              <strong className="text-primary my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{attentionCount}</strong>
              <small className="text-secondary">equipe técnica alocada</small>
            </article>
          </div>
          <div className="col">
            <article className="app-card p-3 d-flex flex-column justify-content-between h-100">
              <span className="text-secondary fw-semibold" style={{ fontSize: '0.78rem' }}>Chamados ativos</span>
              <strong className="text-primary my-1" style={{ fontSize: 'clamp(1.45rem, 3.5vw, 1.95rem)', lineHeight: 1.1, fontWeight: 800 }}>{activeCalls.length}</strong>
              <small className="text-secondary">na Central HOP</small>
            </article>
          </div>
        </section>

        {/* Seção Nobre e Dedicada de Registro de Ocorrência */}
        <section className="app-card client-register-card p-4 p-md-5 mb-5" aria-labelledby="register-title">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4">
            <div className="client-register-card__content">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="client-register-badge">ABERTURA DE CHAMADO</span>
                <span className="text-secondary small">· Registro pelo Cliente</span>
              </div>
              <h2 className="fs-3 fw-bold mb-2" id="register-title">
                Registrar Nova Ocorrência
              </h2>
              <p className="text-secondary mb-3" style={{ maxWidth: '640px' }}>
                Notou alguma intercorrência, pessoas presas ou parada de equipamento? Registre o chamado diretamente para que o sistema HOP priorize o atendimento imediato na Central de Operações.
              </p>
              <div className="d-flex flex-wrap align-items-center gap-2">
                <span className="text-secondary small fw-semibold">Reportar direto em:</span>
                {displayedElevators.map((elv) => (
                  <button
                    key={elv.id}
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill fw-semibold"
                    onClick={() => { window.location.hash = `/client/support/${elv.id}`; }}
                  >
                    {elv.displayName}
                  </button>
                ))}
              </div>
            </div>

            <div className="d-flex flex-column align-items-stretch align-items-lg-end gap-2 flex-shrink-0">
              <button
                className="btn btn-primary btn-lg px-4 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                type="button"
                onClick={() => { window.location.hash = '/client/support'; }}
              >
                <span>✚</span>
                <span>REGISTRAR OCORRÊNCIA</span>
              </button>
              <small className="text-secondary text-center text-lg-end">
                Priorização assistida com cálculo de gravidade
              </small>
            </div>
          </div>

          {latestActiveCall && (
            <div className="client-register-ongoing-note mt-4 pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary-subtle text-primary fw-bold">Em andamento</span>
                <span className="small">
                  Chamado <strong>{latestActiveCall.protocol}</strong> ({getDisplayElevator(latestActiveCall.elevatorId)?.displayName || latestActiveCall.elevatorId}) — {statusFor(latestActiveCall)}
                </span>
              </div>
              <a
                href={`#/client/call/${latestActiveCall.id}`}
                className="btn btn-sm btn-outline-primary fw-bold"
              >
                Acompanhar chamado →
              </a>
            </div>
          )}
        </section>

        <section className="client-section mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <div>
              <p className="page-header__subtitle mb-0">Equipamentos</p>
              <h2 className="fs-5 mb-0">Seus elevadores</h2>
            </div>
            <a href="#/client/elevators" className="fw-bold text-decoration-none" style={{ fontSize: '0.86rem' }}>
              Ver todos ({displayedElevators.length})
            </a>
          </div>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {displayedElevators.map((elevator) => (
              <div className="col" key={elevator.id}>
                <ClientElevatorCard
                  elevator={elevator}
                  activeCall={elevator.activeCall}
                  onSupport={(id) => { window.location.hash = `/client/support/${id}`; }}
                  onViewCall={(callId) => { window.location.hash = `/client/call/${callId}`; }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="client-section">
          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <div>
              <p className="page-header__subtitle mb-0">Acompanhamento</p>
              <h2 className="fs-5 mb-0">Chamados recentes</h2>
            </div>
            <a href="#/client/calls" className="fw-bold text-decoration-none" style={{ fontSize: '0.86rem' }}>
              Ver todos os chamados
            </a>
          </div>
          {activeCalls.length > 0 ? (
            <div className="row row-cols-1 row-cols-md-2 g-4">
              {activeCalls.slice(0, 2).map((call) => (
                <div className="col" key={call.id}>
                  <CallCard call={call} />
                </div>
              ))}
            </div>
          ) : (
            <div className="app-card p-4 text-center text-secondary">
              <p className="mb-0">Nenhum chamado pendente no momento. Todos os elevadores operam normalmente.</p>
            </div>
          )}
        </section>
      </>
    );
  };

  const renderElevators = () => (
    <>
      {pageTitle('Equipamentos cadastrados', 'Elevadores')}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        {displayedElevators.map((elevator) => (
          <div className="col" key={elevator.id}>
            <ClientElevatorCard
              elevator={elevator}
              activeCall={elevator.activeCall}
              onSupport={(id) => { window.location.hash = `/client/support/${id}`; }}
              onViewCall={(callId) => { window.location.hash = `/client/call/${callId}`; }}
            />
          </div>
        ))}
      </div>
    </>
  );

  const renderCalls = () => (
    <>
      {pageTitle('Acompanhamento de solicitações', 'Chamados')}
      <section className="mb-5">
        <h2 className="fs-5 mb-3 pb-2 border-bottom">Em andamento</h2>
        {activeCalls.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {activeCalls.map((call) => (
              <div className="col" key={call.id}>
                <CallCard call={call} />
              </div>
            ))}
          </div>
        ) : (
          <div className="app-card p-4 text-secondary">
            <p className="mb-0">Nenhum chamado em andamento no momento.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="fs-5 mb-3 pb-2 border-bottom">Concluídos</h2>
        {resolvedCalls.length > 0 ? (
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {resolvedCalls.map((call) => (
              <div className="col" key={call.id}>
                <CallCard call={call} />
              </div>
            ))}
          </div>
        ) : (
          <div className="app-card p-4 text-secondary">
            <p className="mb-0">Nenhum chamado concluído registrado ainda.</p>
          </div>
        )}
      </section>
    </>
  );

  const renderProfile = () => (
    <>
      {pageTitle('Conta do estabelecimento', 'Perfil')}
      <article className="app-card client-profile-card p-4 p-md-5">
        <div className="d-flex flex-wrap align-items-center gap-4 pb-4 border-bottom">
          <ProfileAvatar name={clientUser.name} src={clientUser.avatar} category="clients" size="lg" decorative />
          <div>
            <h2 className="fs-4 mb-1">{clientUser.name}</h2>
            <p className="text-secondary mb-0">{clientUser.role}</p>
          </div>
        </div>
        <dl className="client-review-list mt-4">
          <div><dt>Estabelecimento</dt><dd>{clientEstablishment.name}</dd></div>
          <div><dt>Tipo do local</dt><dd>{clientEstablishment.type}</dd></div>
          <div><dt>Endereço</dt><dd>{clientEstablishment.address}</dd></div>
          <div><dt>Equipamentos</dt><dd>{clientElevators.length} elevadores cadastrados</dd></div>
        </dl>
        <div className="mt-4">
          <FeedbackMessage title="Dados do local aplicados automaticamente">
            O tipo <strong>Hospital</strong> é ponderado com maior peso no algoritmo HOP Priority. Você não precisa redigitar esse contexto a cada solicitação.
          </FeedbackMessage>
        </div>
      </article>
    </>
  );

  const renderCallDetail = (call) => {
    const elevator = getDisplayElevator(call.elevatorId);
    const status = statusFor(call);
    const workflow = call.workflowStatus;
    const isResolved = status === OPERATION_STATUS.RESOLVED;
    const assignedTechnician = getTechnicianById(call.assignedTechnicianId || call.technicianId);

    return (
      <>
        <a className="client-back-link mb-3 text-decoration-none fw-bold d-inline-block" href="#/client/calls">
          ← Voltar para chamados
        </a>
        {newCallId === call.id && (
          <div className="client-success-banner mb-4" role="status">
            <span aria-hidden="true">✓</span>
            <div>
              <strong>Ocorrência registrada com sucesso</strong>
              <p>As informações foram enviadas para a Central de Operações e a prioridade foi calculada.</p>
            </div>
          </div>
        )}
        <section className="app-card client-call-detail p-4 p-md-5">
          <header className="d-flex flex-wrap align-items-start justify-content-between gap-3 pb-4 border-bottom">
            <div>
              <p className="page-header__subtitle mb-1">Chamado {call.protocol}</p>
              <h1 className="page-header__title mb-1">{elevator?.displayName || call.elevatorId}</h1>
              <p className="text-secondary mb-0">{call.detectedFailure || call.description}</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <StatusBadge value={call.priority?.classification || 'atenção'} type="severity" />
              <StatusBadge value={status} />
            </div>
          </header>

          <div className="client-confirmation-grid my-4">
            <div>
              <span>Protocolo</span>
              <strong>{call.protocol}</strong>
            </div>
            <div>
              <span>Horário</span>
              <strong>{formatDateTime(call.time)}</strong>
            </div>
            <div>
              <span>Prioridade</span>
              <strong>{call.priority?.classification || 'Normal'} ({call.priority?.score || 0} pts)</strong>
            </div>
            <div>
              <span>Status atual</span>
              <strong>{status}</strong>
            </div>
          </div>

          <div className="client-priority-copy mb-4 p-3 rounded">
            <strong>
              {call.priority?.classification === 'crítica'
                ? 'Atendimento classificado como crítico.'
                : `Sua solicitação recebeu prioridade ${call.priority?.classification || 'moderada'}.`}
            </strong>
            <p className="mb-0 mt-1">
              A prioridade considera as respostas enviadas ({call.trappedPeople > 0 ? `${call.trappedPeople} pessoa(s) presa(s)` : 'sem pessoas presas'}) e o contexto do estabelecimento ({clientEstablishment.type}).
            </p>
          </div>

          <div className="client-detail-columns row g-4 mt-2">
            <div className="col-12 col-lg-7">
              <h2 className="fs-5 mb-3">Acompanhamento do chamado</h2>
              <ClientStatusTimeline call={call} />
            </div>
            <div className="col-12 col-lg-5">
              <h2 className="fs-5 mb-3">Técnico responsável</h2>
              {assignedTechnician ? (
                <div className="client-technician-card p-3 d-flex align-items-center gap-3">
                  <ProfileAvatar name={assignedTechnician.name} src={assignedTechnician.avatar} category="operators" size="lg" decorative />
                  <div>
                    <p className="page-header__subtitle mb-1">
                      {workflow === OPERATION_STATUS.TRAVELING
                        ? 'Técnico a caminho'
                        : workflow === OPERATION_STATUS.ON_SITE
                          ? 'Técnico no local'
                          : workflow === OPERATION_STATUS.MAINTENANCE
                            ? 'Técnico realizando atendimento'
                            : isResolved
                              ? 'Atendimento concluído'
                              : 'Técnico atribuído'}
                    </p>
                    <h3 className="fs-5 mb-1">{assignedTechnician.name}</h3>
                    {workflow === OPERATION_STATUS.TRAVELING && (
                      <p className="text-secondary mb-0" style={{ fontSize: '0.84rem' }}>
                        Chegada estimada: {call.metadata?.etaMinutes || 7} min
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="client-waiting-card p-3 d-flex align-items-start gap-3">
                  <span className="fs-4 text-primary" aria-hidden="true">◎</span>
                  <div>
                    <strong>Aguardando atribuição</strong>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.84rem' }}>
                      A Central de Operações está selecionando o técnico mais próximo e qualificado.
                    </p>
                  </div>
                </div>
              )}
              {isResolved && call.completedAt && (
                <div className="client-completed-note mt-3 p-3 rounded" style={{ backgroundColor: 'var(--color-severity-low-soft)', color: 'var(--color-severity-low-text)' }}>
                  <strong>Atendimento concluído em {formatDateTime(call.completedAt)}.</strong>
                  {call.solution && <p className="mb-0 mt-1">Solução: {call.solution}</p>}
                </div>
              )}
            </div>
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
  else if (route === '/client/support') {
    content = (
      <ClientSupportFlow
        elevators={displayedElevators}
        establishment={clientEstablishment}
        onCancel={() => { window.location.hash = '/client'; }}
        onSubmit={submitSupport}
        submitError={submitError}
      />
    );
  } else if (route.startsWith('/client/support/')) {
    const elevatorId = route.split('/').pop();
    const elevator = getDisplayElevator(elevatorId);
    content = elevator ? (
      <ClientSupportFlow
        elevator={elevator}
        elevators={displayedElevators}
        establishment={clientEstablishment}
        onCancel={() => { window.location.hash = '/client'; }}
        onSubmit={submitSupport}
        submitError={submitError}
      />
    ) : (
      <div className="client-error-message p-4" role="alert">
        <strong>Elevador não encontrado.</strong>
        <span>Verifique a lista de elevadores e tente novamente.</span>
      </div>
    );
  } else if (route.startsWith('/client/call/')) {
    const callId = route.split('/').pop();
    const call = allCalls.find((item) => item.id === callId);
    content = call ? (
      renderCallDetail(call)
    ) : (
      <div className="client-error-message p-4" role="alert">
        <strong>Chamado não encontrado.</strong>
        <span>Volte para a lista de chamados e tente novamente.</span>
      </div>
    );
  } else {
    content = (
      <div className="client-error-message p-4" role="alert">
        <strong>Página não encontrada.</strong>
        <span>Use o menu para voltar ao início do HOP Client.</span>
      </div>
    );
  }

  return (
    <ClientShell route={route} user={clientUser} establishment={clientEstablishment}>
      {content}
    </ClientShell>
  );
}
