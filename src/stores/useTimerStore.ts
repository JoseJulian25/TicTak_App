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

  /**
   * Pausar el timer
   * 
   * Agrega un nuevo segmento de pausa con start=ahora y end=undefined (abierto)
   * startTime NUNCA cambia, se mantiene el punto de referencia original
   */
  pauseTimer: () => {
    const state = get();

    if (!state.activeSession || !state.isRunning) {
      return;
    }

    const now = Date.now();
    const updatedSession: ActiveSession = {
      ...state.activeSession,
      pauseSegments: [
        ...state.activeSession.pauseSegments,
        { start: now, end: undefined } // Pausa abierta
      ],
      lastTickTimestamp: now,
    };

    set({
      activeSession: updatedSession,
      isRunning: false,
      isPaused: true,
    });

    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, updatedSession);
  },

  /**
   * Reanudar el timer pausado
   * 
   * Cierra el último segmento de pausa (pone end=ahora)
   * startTime NUNCA cambia, se mantiene el punto de referencia original
   */
  resumeTimer: () => {
    const state = get();

    if (!state.activeSession || !state.isPaused) {
      return;
    }

    const now = Date.now();
    const pauseSegments = [...state.activeSession.pauseSegments];
    
    // Cerrar el último segmento de pausa (si existe y está abierto)
    if (pauseSegments.length > 0) {
      const lastSegment = pauseSegments[pauseSegments.length - 1];
      if (lastSegment.end === undefined) {
        lastSegment.end = now;
      }
    }

    const updatedSession: ActiveSession = {
      ...state.activeSession,
      pauseSegments,
      lastTickTimestamp: now,
    };

    set({
      activeSession: updatedSession,
      isRunning: true,
      isPaused: false,
    });

    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, updatedSession);
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