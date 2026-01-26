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

/**
 * Guarda la sesión activa del timer como una sesión completada
 * 
 * Este es el punto de orquestación entre el timer activo y las sesiones guardadas:
 * 1. Obtiene información del timer actual
 * 2. Valida que sea una sesión válida
 * 3. Calcula startTime y endTime correctos
 * 4. Guarda en el store de sesiones
 * 5. Limpia el timer activo
 * 
 * @param notes - Notas opcionales para la sesión
 * @returns Resultado con la sesión guardada o error
 */
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

/**
 * Descarta la sesión activa sin guardarla
 * 
 * @returns true si había sesión activa y se descartó
 */
export function discardActiveSession(): boolean {
  const timerInfo = useTimerStore.getState().getCurrentTaskInfo();
  
  if (!timerInfo) {
    return false;
  }

  useTimerStore.getState().resetTimer();
  
  console.log('🗑️ Sesión activa descartada');
  return true;
}

/**
 * Verifica si hay una sesión activa en el timer
 * 
 */
export function hasActiveSession(): boolean {
  return useTimerStore.getState().getCurrentTaskInfo() !== null;
}
