import { create } from 'zustand';
import { ActiveSession } from '@/types';
import { Storage } from '@/lib/storage';
import { LOCAL_STORAGE_KEYS } from '@/lib/constants';

interface TimerStore {
  activeSession: ActiveSession | null;
  elapsedSeconds: number; // Tiempo transcurrido en segundos
  isRunning: boolean; 
  isPaused: boolean; 

  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tick: () => void; // Incrementar segundos cada tick del interval
  resetTimer: () => void;
  getCurrentTaskInfo: () => { taskId: string; elapsedSeconds: number } | null;
}

export const useTimerStore = create<TimerStore>((set, get) => ({

  activeSession: null,
  elapsedSeconds: 0,
  isRunning: false,
  isPaused: false,

  /**
   * Iniciar un nuevo timer para una tarea
   * 
   */
  startTimer: (taskId: string) => {
    const state = get();

    // Validación: No permitir múltiples timers simultáneos
    if (state.activeSession && state.isRunning) {
      console.warn('Ya hay un timer activo. Pausa o guarda el actual primero.');
      return;
    }

    // Crear nueva sesión activa
    const newSession: ActiveSession = {
      taskId,
      startTime: new Date(),
      totalPausedTime: 0,
    };

    // Actualizar estado
    set({
      activeSession: newSession,
      elapsedSeconds: 0,
      isRunning: true,
      isPaused: false,
    });

    // 💾 Persistir en localStorage
    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, {
      session: newSession,
      elapsedSeconds: 0,
    });
  },

  /**
   * Pausar el timer actual
   * 
   * Guarda el momento en que se pausó para poder calcular
   * el tiempo correcto al reanudar
   */
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

    // 💾 Persistir estado pausado
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

    // 💾 Persistir
    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, {
      session: updatedSession,
      elapsedSeconds: state.elapsedSeconds,
    });
  },

  /**
   * Incrementar el contador de segundos (llamado cada segundo por el interval)
   */
  tick: () => {
    const state = get();

    if (!state.isRunning) {
      return;
    }

    const newElapsed = state.elapsedSeconds + 1;

    set({ elapsedSeconds: newElapsed });

    // Auto-guardar cada tick (cada segundo)
    if (state.activeSession) {
      Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, {
        session: state.activeSession,
        elapsedSeconds: newElapsed,
      });
    }
  },

  /**
   * Resetear el timer (limpiar todo)
   * 
   */
  resetTimer: () => {
    set({
      activeSession: null,
      elapsedSeconds: 0,
      isRunning: false,
      isPaused: false,
    });

    // 🗑️ Limpiar localStorage
    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, null);
  },

  /**
   * Obtener información del timer actual
   * 
   * Útil para componentes que necesitan saber qué tarea está siendo trackeada
   */
  getCurrentTaskInfo: () => {
    const state = get();

    if (!state.activeSession) {
      return null;
    }

    return {
      taskId: state.activeSession.taskId,
      elapsedSeconds: state.elapsedSeconds,
    };
  },
}));

/**
 * Al cargar la app, intentar recuperar una sesión activa guardada
 * 
 * Esto permite que si el usuario recarga la página, no pierda su progreso
 */
const recoverSession = () => {
  const saved = Storage.getItem<{
    session: ActiveSession;
    elapsedSeconds: number;
  }>(LOCAL_STORAGE_KEYS.ACTIVE_SESSION);

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

  console.log('✅ Sesión recuperada:', {
    taskId: session.taskId,
    elapsedSeconds: finalElapsed,
  });
};

// Ejecutar recuperación al cargar el módulo
recoverSession();