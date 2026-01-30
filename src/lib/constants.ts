export const LOCAL_STORAGE_KEYS = {
    CLIENTS:'clients',
    PERSONALS: 'personals',
    PROJECTS: 'projects',
    TASKS: 'tasks',
    SESSIONS: 'sessions',
    ACTIVE_SESSION: 'active_session',
}

export const PREFIXES_ID = {
    CLIENT: 'client',
    PROJECT: 'project',
    TASK: 'task'
}

export const MIN_SESSION_DURATION_SECONDS = 1;

// ID temporal para timers sin tarea asignada
export const UNNAMED_TASK_ID = '__unnamed__';

/**
 * Configuración del Timer
 */
export const TIMER_CONFIG = {
  // Umbral para detectar suspensión/cierre de app (3 minutos en ms)
  // Si el gap entre lastTickTimestamp y ahora es mayor a esto, se muestra modal
  BACKGROUND_DETECTION_THRESHOLD: 3 * 60 * 1000, // 3 minutos
  
  // Intervalo de ejecución del tick (1 segundo)
  TICK_INTERVAL: 1000,
  
  // Frecuencia de guardado en localStorage (cada tick)
  SAVE_FREQUENCY: 1000,
};