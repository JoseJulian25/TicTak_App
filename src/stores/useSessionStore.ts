import { create } from 'zustand';
import { Session } from '@/types';
import { Storage } from '@/lib/storage';
import { LOCAL_STORAGE_KEYS, MIN_SESSION_DURATION_SECONDS } from '@/lib/constants';
import { getDayStart, getDayEnd } from '@/lib/time-utils';

interface SessionStore {
  sessions: Session[];
  
  loadSessions: () => void;
  getSessions: () => Session[];
  getSessionsToday: () => Session[];
  getSessionsByTask: (taskId: string) => Session[];
  getSessionsByDateRange: (from: Date, to: Date) => Session[];
  saveSession: (session: Omit<Session, 'id' | 'createdAt'>) => Session | null;
  updateSession: (id: string, data: Partial<Omit<Session, 'id' | 'createdAt'>>) => boolean;
  deleteSession: (id: string) => boolean;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: [],

  loadSessions: () => {
    const saved = Storage.getItem<Session[]>(LOCAL_STORAGE_KEYS.SESSIONS);
    
    if (!saved || !Array.isArray(saved)) {
      set({ sessions: [] });
      return;
    }

    const sessions = saved.map((session) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
      createdAt: new Date(session.createdAt),
    }));

    set({ sessions });
  },

  getSessions: () => {
    return get().sessions;
  },

  getSessionsToday: () => {
    const today = new Date();
    const dayStart = getDayStart(today);
    const dayEnd = getDayEnd(today);

    return get().sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
  },


  getSessionsByTask: (taskId: string) => {
    return get().sessions.filter((session) => session.taskId === taskId);
  },


  getSessionsByDateRange: (from: Date, to: Date) => {
    const fromStart = getDayStart(from);
    const toEnd = getDayEnd(to);

    return get().sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= fromStart && sessionDate <= toEnd;
    });
  },

  saveSession: (sessionData) => {

    if (sessionData.duration < MIN_SESSION_DURATION_SECONDS) {
      console.warn(`Sesión demasiado corta. Mínimo: ${MIN_SESSION_DURATION_SECONDS}s`);
      return null;
    }

    if (sessionData.startTime >= sessionData.endTime) {
      console.warn('startTime debe ser anterior a endTime');
      return null;
    }

    const newSession: Session = {
      ...sessionData,
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    // Agregar a la lista
    const updatedSessions = [...get().sessions, newSession];
    set({ sessions: updatedSessions });

    Storage.setItem(LOCAL_STORAGE_KEYS.SESSIONS, updatedSessions);

    console.log('Sesión guardada:', newSession);
    return newSession;
  },

  updateSession: (id, data) => {
    const state = get();
    const sessionIndex = state.sessions.findIndex((s) => s.id === id);

    if (sessionIndex === -1) {
      console.warn('Sesión no encontrada:', id);
      return false;
    }

    const updatedSession = {
      ...state.sessions[sessionIndex],
      ...data,
    };

    if (data.duration !== undefined && data.duration < MIN_SESSION_DURATION_SECONDS) {
      console.warn(`Duración inválida. Mínimo: ${MIN_SESSION_DURATION_SECONDS}s`);
      return false;
    }

    const updatedSessions = [...state.sessions];
    updatedSessions[sessionIndex] = updatedSession;
    set({ sessions: updatedSessions });

    Storage.setItem(LOCAL_STORAGE_KEYS.SESSIONS, updatedSessions);

    console.log('Sesión actualizada:', updatedSession);
    return true;
  },

  deleteSession: (id) => {
    const state = get();
    const sessionExists = state.sessions.some((s) => s.id === id);

    if (!sessionExists) {
      console.warn('Sesión no encontrada:', id);
      return false;
    }

    const updatedSessions = state.sessions.filter((s) => s.id !== id);
    set({ sessions: updatedSessions });

    Storage.setItem(LOCAL_STORAGE_KEYS.SESSIONS, updatedSessions);

    console.log('Sesión eliminada:', id);
    return true;
  },
}));

useSessionStore.getState().loadSessions();
