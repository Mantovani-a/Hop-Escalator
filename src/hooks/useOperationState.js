import { useSyncExternalStore } from 'react';
import { createInitialOperationState, getOperationSnapshot, subscribeOperationState } from '../data/operationStore.js';

export default function useOperationState() {
  return useSyncExternalStore(subscribeOperationState, getOperationSnapshot, createInitialOperationState);
}
