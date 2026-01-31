import { create } from 'zustand';
import { ActiveSession } from '@/types';
import { Storage } from '@/lib/storage';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';
import { calculateElapsedTime } from '@/lib/time-utils';

interface TimerStore {
  activeSession: ActiveSession | null;
  isRunning: boolean; 
  isPaused: boolean; 

  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tick: () => void; 
  resetTimer: () => void;
  getElapsedSeconds: () => number;
  getCurrentTaskInfo: () => { taskId: string; elapsedSeconds: number } | null;
}

export const useTimerStore = create<TimerStore>((set, get) => ({

  activeSession: null,
  isRunning: false,
  isPaused: false,


  startTimer: (taskId: string) => {
    const state = get();

    if (state.activeSession && state.isRunning) {
      console.warn('Ya hay un timer activo. Pausa o guarda el actual primero.');
      return;
    }

    const now = Date.now();
    const newSession: ActiveSession = {
      taskId,
      startTime: now,
      pauseSegments: [],
      lastTickTimestamp: now,
    };

    set({
      activeSession: newSession,
      isRunning: true,
      isPaused: false,
    });

    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, newSession);
  },

  pauseTimer: () => {
    const state = get();

    if (!state.activeSession || !state.isRunning) {
      return;
    }

    const updatedSession: ActiveSession = {
      ...state.activeSession,
      pausedAt: new Date(),
    };

    set({
      activeSession: updatedSession,
      isRunning: false,
      isPaused: true,
    });

    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, {
      session: updatedSession,
      elapsedSeconds: state.elapsedSeconds,
    });
  },

  /**
   * Reanudar el timer pausado
   * 
   * Ajusta el startTime para que el cálculo de tiempo sea correcto
   */
  resumeTimer: () => {
    const state = get();

    if (!state.activeSession || !state.isPaused) {
      return;
    }

    // Ajustar el startTime: restar el tiempo ya transcurrido
    // Esto hace que al calcular (ahora - startTime) obtengamos el tiempo correcto
    const newStartTime = new Date(
      Date.now() - state.elapsedSeconds * 1000
    );

    const updatedSession: ActiveSession = {
      ...state.activeSession,
      startTime: newStartTime,
    };

    set({
      activeSession: updatedSession,
      isRunning: true,
      isPaused: false,
    });

    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, {
      session: updatedSession,
      elapsedSeconds: state.elapsedSeconds,
    });
  },

  /**
   * Actualizar lastTickTimestamp y persistir sesión
   * 
   * Este tick solo sirve para:
   * 1. Forzar re-render (actualizar UI)
   * 2. Actualizar heartbeat (lastTickTimestamp) para detección de gaps
   */
  tick: () => {
    const state = get();

    if (!state.isRunning || !state.activeSession) {
      return;
    }

    const now = Date.now();
    const updatedSession: ActiveSession = {
      ...state.activeSession,
      lastTickTimestamp: now,
    };

    set({ activeSession: updatedSession });

    // Persistir sesión con timestamp actualizado
    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, updatedSession);
  },

  resetTimer: () => {
    set({
      activeSession: null,
      isRunning: false,
      isPaused: false,
    });

    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, null);
  },


  /**
   * Calcula el tiempo transcurrido en tiempo real desde startTime
   * 
   * Esta función siempre calcula el tiempo correcto, incluso si la app
   * estuvo suspendida o en background.
   */
  getElapsedSeconds: () => {
    const state = get();

    if (!state.activeSession) {
      return 0;
    }

    return calculateElapsedTime(
      state.activeSession.startTime,
      state.activeSession.pauseSegments
    );
  },

  getCurrentTaskInfo: () => {
    const state = get();

    if (!state.activeSession) {
      return null;
    }

    return {
      taskId: state.activeSession.taskId,
      elapsedSeconds: get().getElapsedSeconds(),
    };
  },
}));

/**
 * Al cargar la app, intentar recuperar una sesión activa guardada
 * 
 */
const recoverSession = () => {
  const saved = Storage.getItem<{ session: ActiveSession; elapsedSeconds: number;}>(LOCAL_STORAGE_KEYS.ACTIVE_SESSION);

  if (!saved || !saved.session) {
    return;
  }

  const { session, elapsedSeconds } = saved;

  // Calcular tiempo real transcurrido desde que se inició
  const startTime = new Date(session.startTime).getTime();
  const now = Date.now();
  const realElapsed = Math.floor((now - startTime) / 1000);

  // Si hay pausedAt, usar el tiempo guardado en lugar del calculado
  const finalElapsed = session.pausedAt ? elapsedSeconds : realElapsed;

  // Restaurar en estado pausado por seguridad
  // El usuario puede reanudar manualmente si quiere
  useTimerStore.setState({
    activeSession: {
      ...session,
      pausedAt: session.pausedAt || new Date(),
    },
    elapsedSeconds: finalElapsed,
    isRunning: false,
    isPaused: true,
  });
};

// Ejecutar recuperación al cargar el módulo
recoverSession();