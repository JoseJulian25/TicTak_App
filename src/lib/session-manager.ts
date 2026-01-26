import { useSessionStore } from '@/stores/useSessionStore';
import { useTimerStore } from '@/stores/useTimerStore';
import { Session } from '@/types';
import { MIN_SESSION_DURATION_SECONDS } from './constants';

/**
 * Resultado de guardar una sesión activa
 */
export type SaveSessionResult = 
  | { success: true; session: Session }
  | { success: false; error: string };

export function saveActiveSession(notes?: string): SaveSessionResult {

  const timerInfo = useTimerStore.getState().getCurrentTaskInfo();
  
  if (!timerInfo) {
    return {
      success: false,
      error: 'No hay sesión activa para guardar',
    };
  }

  const { taskId, elapsedSeconds } = timerInfo;

  if (elapsedSeconds < MIN_SESSION_DURATION_SECONDS) {
    return {
      success: false,
      error: `La sesión debe durar al menos ${MIN_SESSION_DURATION_SECONDS} segundo(s)`,
    };
  }

  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - elapsedSeconds * 1000);

  const sessionData = {
    taskId,
    startTime,
    endTime,
    duration: elapsedSeconds,
    notes,
  };

  const savedSession = useSessionStore.getState().saveSession(sessionData);

  if (!savedSession) {
    return {
      success: false,
      error: 'Error al guardar la sesión en el store',
    };
  }

  useTimerStore.getState().resetTimer();

  return {
    success: true,
    session: savedSession,
  };
}

export function discardActiveSession(): boolean {
  const timerInfo = useTimerStore.getState().getCurrentTaskInfo();
  
  if (!timerInfo) {
    return false;
  }

  useTimerStore.getState().resetTimer();
  
  console.log('🗑️ Sesión activa descartada');
  return true;
}

export function hasActiveSession(): boolean {
  return useTimerStore.getState().getCurrentTaskInfo() !== null;
}
