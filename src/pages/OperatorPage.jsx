import { useEffect, useMemo, useState } from 'react';
import OperatorShell from '../components/operator/OperatorShell';
import OperatorStateMessage from '../components/operator/OperatorStateMessage';
import NewOccurrenceAlert from '../components/operator/NewOccurrenceAlert';
import OperatorShiftClosed from '../components/operator/OperatorShiftClosed';
import {
  buildOperatorOccurrence,
  createSimulatedOccurrence,
  operatorTechnician,
} from '../data/operatorData';
import {
  addOperationOccurrence,
  OPERATION_STATUS,
  updateOperatorShift,
  updateOperationOccurrence,
} from '../data/operationStore';
import useOperationState from '../hooks/useOperationState';
import { getWorkflowStep } from '../utils/operatorWorkflow';
import OperatorDashboard from './operator/OperatorDashboard';
import OperatorHistory from './operator/OperatorHistory';
import OperatorOccurrenceDetail from './operator/OperatorOccurrenceDetail';
import OperatorOccurrences from './operator/OperatorOccurrences';
import OperatorProfile from './operator/OperatorProfile';
import OperatorServicePage from './operator/OperatorServicePage';

const playNewOccurrenceTone = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(720, audioContext.currentTime);
  gain.gain.setValueAtTime(0.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.18);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.18);
  oscillator.addEventListener('ended', () => audioContext.close());
};

export default function OperatorPage({ route = '/operator' }) {
  const operationState = useOperationState();
  const simulatedOccurrence = useMemo(() => createSimulatedOccurrence(), []);
  const [alertOpen, setAlertOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  const allOccurrences = useMemo(
    () => operationState.occurrences
      .filter((occurrence) => occurrence.technicianId === operatorTechnician.id)
      .map((occurrence) => {
        const operatorOccurrence = buildOperatorOccurrence(occurrence);
        return {
          ...operatorOccurrence,
          ...occurrence,
          priority: occurrence.priority || operatorOccurrence.priority,
          metadata: { ...operatorOccurrence.metadata, ...occurrence.metadata },
        };
      }),
    [operationState.occurrences],
  );

  const statusFor = (occurrenceId) => allOccurrences.find((occurrence) => occurrence.id === occurrenceId)?.workflowStatus
    || OPERATION_STATUS.TECHNICIAN_ASSIGNED;
  const pendingOccurrences = allOccurrences
    .filter((occurrence) => statusFor(occurrence.id) !== OPERATION_STATUS.RESOLVED)
    .sort((first, second) => second.priority.score - first.priority.score);
  const activeOccurrence = pendingOccurrences.find((occurrence) => [
    OPERATION_STATUS.TRAVELING,
    OPERATION_STATUS.ON_SITE,
    OPERATION_STATUS.MAINTENANCE,
  ].includes(occurrence.workflowStatus));
  const technicianStatus = activeOccurrence?.workflowStatus === OPERATION_STATUS.TRAVELING
    ? 'em deslocamento'
    : activeOccurrence
      ? 'em atendimento'
      : 'disponível';

  const advanceOccurrence = (occurrenceId) => {
    const currentStatus = statusFor(occurrenceId);
    const nextStatus = getWorkflowStep(currentStatus).nextStatus;
    if (!nextStatus) return;
    const occurrence = allOccurrences.find((item) => item.id === occurrenceId);
    const completion = nextStatus === OPERATION_STATUS.RESOLVED
      ? {
          completedAt: new Date().toISOString(),
          duration: '1h 06min',
          finalDiagnosis: occurrence?.metadata?.diagnosis?.probableOrigin
            ? `Hipótese confirmada após verificação: ${occurrence.metadata.diagnosis.probableOrigin}.`
            : 'Falha verificada durante o atendimento em campo.',
          solution: 'Sistema verificado e operação restabelecida em segurança.',
          status: 'resolvida',
        }
      : {};
    updateOperationOccurrence(occurrenceId, {
      workflowStatus: nextStatus,
      technicianId: operatorTechnician.id,
      ...completion,
    });
    if ([OPERATION_STATUS.TRAVELING, OPERATION_STATUS.MAINTENANCE].includes(nextStatus)) {
      window.location.hash = `/operator/service/${occurrenceId}`;
    } else if (nextStatus === OPERATION_STATUS.RESOLVED) {
      window.location.hash = '/operator';
    }
  };

  const openSimulation = () => {
    playNewOccurrenceTone();
    setAlertOpen(true);
  };

  const addSimulatedOccurrence = (workflowStatus) => {
    addOperationOccurrence({
      ...simulatedOccurrence,
      protocol: simulatedOccurrence.metadata.serviceNumber,
      workflowStatus,
      technicianId: operatorTechnician.id,
      origin: 'simulação',
    });
    setAlertOpen(false);
    window.location.hash = workflowStatus === OPERATION_STATUS.TRAVELING
      ? `/operator/service/${simulatedOccurrence.id}`
      : `/operator/occurrence/${simulatedOccurrence.id}`;
  };

  const historyItems = allOccurrences
    .filter((occurrence) => occurrence.workflowStatus === OPERATION_STATUS.RESOLVED)
    .map((occurrence) => ({
      id: `SHARED-${occurrence.id}`,
      occurrenceId: occurrence.id,
      occurrence,
      completedAt: occurrence.completedAt || occurrence.time,
      duration: occurrence.duration || 'Atendimento demonstrativo',
    }))
    .sort((first, second) => new Date(second.completedAt) - new Date(first.completedAt));
  const completedToday = historyItems.filter((item) => new Date(item.completedAt).toDateString() === new Date().toDateString()).length;
  const workflowStatuses = Object.fromEntries(allOccurrences.map((occurrence) => [occurrence.id, statusFor(occurrence.id)]));

  let pageContent;
  if (route === '/operator') {
    pageContent = (
      <OperatorDashboard
        technician={operatorTechnician}
        technicianStatus={technicianStatus}
        occurrences={pendingOccurrences}
        workflowStatuses={workflowStatuses}
        onAdvance={advanceOccurrence}
        completedToday={completedToday}
        isLoading={isLoading}
        onSimulate={openSimulation}
      />
    );
  } else if (route === '/operator/occurrences') {
    pageContent = <OperatorOccurrences occurrences={pendingOccurrences} workflowStatuses={workflowStatuses} isLoading={isLoading} />;
  } else if (route === '/operator/history') {
    pageContent = <OperatorHistory historyItems={historyItems} />;
  } else if (route === '/operator/profile') {
    pageContent = <OperatorProfile technician={operatorTechnician} technicianStatus={technicianStatus} />;
  } else if (route.startsWith('/operator/service/')) {
    const occurrenceId = route.split('/').pop();
    const selectedOccurrence = allOccurrences.find((occurrence) => occurrence.id === occurrenceId);
    pageContent = <OperatorServicePage occurrence={selectedOccurrence} workflowStatus={statusFor(occurrenceId)} onAdvance={advanceOccurrence} />;
  } else if (route.startsWith('/operator/occurrence/')) {
    const occurrenceId = route.split('/').pop();
    const selectedOccurrence = allOccurrences.find((occurrence) => occurrence.id === occurrenceId);
    pageContent = <OperatorOccurrenceDetail occurrence={selectedOccurrence} workflowStatus={statusFor(occurrenceId)} onAdvance={advanceOccurrence} />;
  } else {
    pageContent = <OperatorStateMessage type="error" title="Página do HOP Operator não encontrada">Use o menu lateral para voltar a uma seção disponível.</OperatorStateMessage>;
  }

  if (operationState.operatorShiftActive === false) {
    return <OperatorShiftClosed onStartShift={() => updateOperatorShift(true)} />;
  }

  return (
    <OperatorShell
      route={route}
      technician={operatorTechnician}
      onEndShift={() => {
        updateOperatorShift(false);
        window.location.hash = '/operator';
      }}
      onSimulate={openSimulation}
    >
      {pageContent}
      <NewOccurrenceAlert
        occurrence={simulatedOccurrence}
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        onAccept={() => addSimulatedOccurrence(OPERATION_STATUS.TRAVELING)}
        onView={() => addSimulatedOccurrence(OPERATION_STATUS.TECHNICIAN_ASSIGNED)}
      />
    </OperatorShell>
  );
}
