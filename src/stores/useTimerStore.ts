import { create } from 'zustand';
import { ActiveSession } from '@/types';
import { Storage } from '@/lib/storage';
import { LOCAL_STORAGE_KEYS, TIMER_CONFIG } from '@/lib/constants';
import { calculateElapsedTime } from '@/lib/time-utils';

interface PendingRecoveryData {
  timeUntilClose: number; 
  timeTotal: number;      
  session: ActiveSession;
}

interface TimerStore {
  activeSession: ActiveSession | null;
  isRunning: boolean; 
  isPaused: boolean;
  needsRecoveryDecision: boolean;
  pendingRecoveryData: PendingRecoveryData | null;

  startTimer: (taskId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  tick: () => void; 
  resetTimer: () => void;
  getElapsedSeconds: () => number;
  getCurrentTaskInfo: () => { taskId: string; elapsedSeconds: number } | null;
  applyRecoveryDecision: (choice: 'until-close' | 'full-time') => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({

  activeSession: null,
  isRunning: false,
  isPaused: false,
  needsRecoveryDecision: false,
  pendingRecoveryData: null,


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
   * Este tick sirve para:
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

  /**
   * Aplicar decisión del usuario sobre tiempo a recuperar
   */
  applyRecoveryDecision: (choice: 'until-close' | 'full-time') => {
    const { pendingRecoveryData } = get();

    if (!pendingRecoveryData) {
      return;
    }

    const now = Date.now();
    let finalSession = { ...pendingRecoveryData.session };

    if (choice === 'until-close') {
      // Opción 1: Pausar desde lastTickTimestamp hasta ahora
      const lastTick = pendingRecoveryData.session.lastTickTimestamp;
      
      finalSession = {
        ...finalSession,
        pauseSegments: [
          ...finalSession.pauseSegments,
          { start: lastTick, end: now }
        ],
        lastTickTimestamp: now,
      };
    } else {
      // Opción 2: Contar tiempo completo (no agregar pausa)
      finalSession = {
        ...finalSession,
        lastTickTimestamp: now,
      };
    }

    // Recuperar sesión en estado pausado
    set({
      activeSession: finalSession,
      isRunning: false,
      isPaused: true,
      needsRecoveryDecision: false,
      pendingRecoveryData: null,
    });

    Storage.setItem(LOCAL_STORAGE_KEYS.ACTIVE_SESSION, finalSession);
  },
}));

/**
 * Al cargar la app, intentar recuperar una sesión activa guardada
 * 
 * Implementa 3 casos:
 * 1. isPaused = true: Recuperar directamente sin modal
 * 2. isRunning + gap < 3 min: Auto-recuperar sin modal
 * 3. isRunning + gap >= 3 min: Mostrar modal de decisión
 */
const recoverSession = () => {
  const saved = Storage.getItem<ActiveSession>(LOCAL_STORAGE_KEYS.ACTIVE_SESSION);

  if (!saved) {
    return;
  }

  const session = saved;
  const now = Date.now();
  const gap = now - session.lastTickTimestamp;

  // CASO 1: Usuario pausó manualmente antes de cerrar
  // Recuperar directamente sin preguntar
  if (session.pauseSegments.length > 0) {
    const lastSegment = session.pauseSegments[session.pauseSegments.length - 1];
    
    if (lastSegment.end === undefined) {
      // Hay una pausa abierta, significa que el usuario pausó manualmente
      useTimerStore.setState({
        activeSession: session,
        isRunning: false,
        isPaused: true,
        needsRecoveryDecision: false,
        pendingRecoveryData: null,
      });
      return;
    }
  }

  // CASO 2: Timer corriendo + gap pequeño (< 3 minutos)
  // Auto-recuperar en estado pausado sin modal
  if (gap < TIMER_CONFIG.BACKGROUND_DETECTION_THRESHOLD) {
    useTimerStore.setState({
      activeSession: {
        ...session,
        lastTickTimestamp: now,
      },
      isRunning: false,
      isPaused: true,
      needsRecoveryDecision: false,
      pendingRecoveryData: null,
    });
    return;
  }

  // CASO 3: Timer corriendo + gap grande (>= 3 minutos)
  // Mostrar modal para que usuario decida
  const timeUntilClose = calculateElapsedTime(
    session.startTime,
    session.pauseSegments,
    session.lastTickTimestamp
  );

  const timeTotal = calculateElapsedTime(
    session.startTime,
    session.pauseSegments,
    now
  );

  useTimerStore.setState({
    activeSession: null, // No cargar hasta que usuario decida
    isRunning: false,
    isPaused: false,
    needsRecoveryDecision: true,
    pendingRecoveryData: {
      timeUntilClose,
      timeTotal,
      session,
    },
  });
};

// Ejecutar recuperación al cargar el módulo
recoverSession();