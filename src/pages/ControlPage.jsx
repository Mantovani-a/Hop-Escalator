import { useEffect, useMemo, useState } from 'react';
import ControlOccurrenceDetail from '../components/control/ControlOccurrenceDetail';
import ControlReassignmentModal from '../components/control/ControlReassignmentModal';
import ControlShell from '../components/control/ControlShell';
import ControlTechnicianDetail from '../components/control/ControlTechnicianDetail';
import {
  buildControlOccurrences,
  buildControlTechnicians,
  buildElevatorOverview,
  controlUser,
} from '../data/controlData';
import { OPERATION_STATUS, updateOperationOccurrence } from '../data/operationStore';
import useOperationState from '../hooks/useOperationState';
import { recommendTechnician } from '../utils/dispatchRecommendation';
import ControlAnalytics from './control/ControlAnalytics';
import ControlElevators from './control/ControlElevators';
import ControlOccurrences from './control/ControlOccurrences';
import ControlOverview from './control/ControlOverview';
import ControlTechnicians from './control/ControlTechnicians';

export default function ControlPage({ route = '/control' }) {
  const operationState = useOperationState();
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);
  const [reassignmentId, setReassignmentId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setReassignmentId(null);
        setSelectedOccurrenceId(null);
        setSelectedTechnicianId(null);
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  const controlOccurrences = useMemo(() => buildControlOccurrences(operationState), [operationState]);
  const controlTechnicians = useMemo(
    () => buildControlTechnicians(controlOccurrences, operationState.operatorShiftActive),
    [controlOccurrences, operationState.operatorShiftActive],
  );
  const elevatorOverview = useMemo(() => buildElevatorOverview(controlOccurrences), [controlOccurrences]);
  const selectedOccurrence = controlOccurrences.find((item) => item.id === selectedOccurrenceId);
  const selectedTechnician = controlTechnicians.find((item) => item.id === selectedTechnicianId);
  const reassignmentOccurrence = controlOccurrences.find((item) => item.id === reassignmentId);
  const availableTechnicians = controlTechnicians.filter((item) => item.status === 'disponível' && item.id !== reassignmentOccurrence?.technicianId);
  const recommendedTechnician = selectedOccurrence && !selectedOccurrence.technicianId
    ? recommendTechnician(selectedOccurrence, controlTechnicians)
    : null;

  const confirmReassignment = (technicianId) => {
    const occurrence = reassignmentOccurrence;
    if (!occurrence) return;
    updateOperationOccurrence(occurrence.id, {
      technicianId,
      assignedTechnicianId: technicianId,
      assignedAt: new Date().toISOString(),
      workflowStatus: OPERATION_STATUS.TECHNICIAN_ASSIGNED,
    });
    setReassignmentId(null);
  };

  const assignRecommendedTechnician = () => {
    if (!selectedOccurrence || !recommendedTechnician) return;
    updateOperationOccurrence(selectedOccurrence.id, {
      technicianId: recommendedTechnician.id,
      assignedTechnicianId: recommendedTechnician.id,
      assignedAt: new Date().toISOString(),
      workflowStatus: OPERATION_STATUS.TECHNICIAN_ASSIGNED,
    });
  };

  let pageContent;
  if (route === '/control') pageContent = <ControlOverview occurrences={controlOccurrences} technicians={controlTechnicians} onSelectOccurrence={setSelectedOccurrenceId} onSelectTechnician={setSelectedTechnicianId} />;
  else if (route === '/control/occurrences') pageContent = <ControlOccurrences occurrences={controlOccurrences} onSelectOccurrence={setSelectedOccurrenceId} />;
  else if (route === '/control/technicians') pageContent = <ControlTechnicians technicians={controlTechnicians} onSelectTechnician={setSelectedTechnicianId} />;
  else if (route === '/control/elevators') pageContent = <ControlElevators elevators={elevatorOverview} />;
  else if (route === '/control/analytics') pageContent = <ControlAnalytics occurrences={controlOccurrences} />;
  else pageContent = <div className="control-empty-note" role="alert"><strong>Página do HOP Control não encontrada.</strong><span>Use o menu lateral para voltar à Central de Operações.</span></div>;

  return (
    <ControlShell route={route} user={controlUser}>
      {pageContent}
      <ControlOccurrenceDetail occurrence={selectedOccurrence} recommendedTechnician={recommendedTechnician} onAssignRecommended={assignRecommendedTechnician} onClose={() => setSelectedOccurrenceId(null)} onReassign={(occurrence) => setReassignmentId(occurrence.id)} />
      <ControlTechnicianDetail technician={selectedTechnician} onClose={() => setSelectedTechnicianId(null)} />
      <ControlReassignmentModal occurrence={reassignmentOccurrence} technicians={availableTechnicians} onCancel={() => setReassignmentId(null)} onConfirm={confirmReassignment} />
    </ControlShell>
  );
}
