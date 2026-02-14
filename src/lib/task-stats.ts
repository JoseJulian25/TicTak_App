import { Session } from "@/types/entities";
import { formatDuration } from "./time-utils";

/**
 * Estadísticas detalladas de una tarea
 */
export interface TaskDetailStats {
  /** Duración total en segundos */
  totalDuration: number;
  /** Duración total formateada (ej: "2h 30m") */
  totalDurationFormatted: string;
  /** Número total de sesiones */
  sessionCount: number;
  /** Duración promedio por sesión en segundos */
  averageDuration: number;
  /** Duración promedio formateada */
  averageDurationFormatted: string;
  /** Sesión más larga */
  longestSession: {
    duration: number;
    durationFormatted: string;
    date: Date;
  } | null;
  /** Sesión más corta */
  shortestSession: {
    duration: number;
    durationFormatted: string;
    date: Date;
  } | null;
  /** Racha actual de días consecutivos trabajados */
  currentStreak: number;
  /** Mejor racha de días consecutivos */
  bestStreak: number;
  /** Días únicos con sesiones */
  daysWorked: number;
  /** Última sesión registrada */
  lastSession: {
    date: Date;
    duration: number;
    durationFormatted: string;
  } | null;
}

/**
 * Calcula todas las estadísticas detalladas de una tarea
 * 
 * @param taskId - ID de la tarea
 * @param sessions - Array de todas las sesiones de la tarea
 * @returns Objeto con todas las estadísticas calculadas
 */
export function getTaskDetailStats(taskId: string, sessions: Session[]): TaskDetailStats {
  // Filtrar sesiones de esta tarea
  const taskSessions = sessions.filter((s) => s.taskId === taskId);

  // Si no hay sesiones, retornar estadísticas vacías
  if (taskSessions.length === 0) {
    return {
      totalDuration: 0,
      totalDurationFormatted: "0s",
      sessionCount: 0,
      averageDuration: 0,
      averageDurationFormatted: "0s",
      longestSession: null,
      shortestSession: null,
      currentStreak: 0,
      bestStreak: 0,
      daysWorked: 0,
      lastSession: null,
    };
  }

  // Ordenar sesiones por fecha (más reciente primero para algunas operaciones)
  const sortedSessions = [...taskSessions].sort(
    (a, b) => b.startTime.getTime() - a.startTime.getTime()
  );

  // Calcular duración total
  const totalDuration = taskSessions.reduce((sum, s) => sum + s.duration, 0);
  const totalDurationFormatted = formatDuration(totalDuration);

  // Calcular promedio
  const sessionCount = taskSessions.length;
  const averageDuration = Math.floor(totalDuration / sessionCount);
  const averageDurationFormatted = formatDuration(averageDuration);

  // Encontrar sesión más larga
  const longestSessionData = taskSessions.reduce((longest, current) =>
    current.duration > longest.duration ? current : longest
  );
  const longestSession = {
    duration: longestSessionData.duration,
    durationFormatted: formatDuration(longestSessionData.duration),
    date: longestSessionData.startTime,
  };

  // Encontrar sesión más corta
  const shortestSessionData = taskSessions.reduce((shortest, current) =>
    current.duration < shortest.duration ? current : shortest
  );
  const shortestSession = {
    duration: shortestSessionData.duration,
    durationFormatted: formatDuration(shortestSessionData.duration),
    date: shortestSessionData.startTime,
  };

  // Calcular rachas
  const { currentStreak, bestStreak } = calculateStreaks(taskSessions);

  // Calcular días únicos trabajados
  const daysWorked = getUniqueDays(taskSessions);

  // Última sesión
  const lastSessionData = sortedSessions[0]; // Ya está ordenado por más reciente
  const lastSession = {
    date: lastSessionData.startTime,
    duration: lastSessionData.duration,
    durationFormatted: formatDuration(lastSessionData.duration),
  };

  return {
    totalDuration,
    totalDurationFormatted,
    sessionCount,
    averageDuration,
    averageDurationFormatted,
    longestSession,
    shortestSession,
    currentStreak,
    bestStreak,
    daysWorked,
    lastSession,
  };
}

/**
 * Calcula la racha actual y la mejor racha de días consecutivos trabajados
 * 
 * @param sessions - Array de sesiones
 * @returns Objeto con currentStreak y bestStreak
 */
export function calculateStreaks(sessions: Session[]): {
  currentStreak: number;
  bestStreak: number;
} {
  if (sessions.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Obtener días únicos ordenados (más reciente primero)
  const uniqueDays = Array.from(
    new Set(
      sessions.map((s) => {
        const date = new Date(s.startTime);
        const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        return normalized.getTime();
      })
    )
  ).sort((a, b) => b - a); // Más reciente primero

  if (uniqueDays.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Calcular racha actual (desde hoy hacia atrás)
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayTime = todayNormalized.getTime();

  let currentStreak = 0;
  let expectedDayTime = todayTime;

  for (const dayTime of uniqueDays) {
    if (dayTime === expectedDayTime) {
      currentStreak++;
      // Retroceder un día (86400000 ms = 24 horas)
      expectedDayTime -= 86400000;
    } else if (dayTime < expectedDayTime) {
      // Hay un gap, la racha se rompe
      break;
    }
    // Si dayTime > expectedDayTime, ignorar (sesiones futuras)
  }

  // Calcular mejor racha (máxima racha de días consecutivos)
  let bestStreak = 0;
  let tempStreak = 1;

  for (let i = 0; i < uniqueDays.length - 1; i++) {
    const currentDay = uniqueDays[i];
    const nextDay = uniqueDays[i + 1];
    const diff = currentDay - nextDay;

    // 86400000 ms = 24 horas
    if (diff === 86400000) {
      // Días consecutivos
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      // Racha rota, reiniciar
      tempStreak = 1;
    }
  }

  // Considerar la última racha temporal
  bestStreak = Math.max(bestStreak, tempStreak);

  return { currentStreak, bestStreak };
}

/**
 * Obtiene el número de días únicos con al menos una sesión
 * 
 * @param sessions - Array de sesiones
 * @returns Número de días únicos trabajados
 */
export function getUniqueDays(sessions: Session[]): number {
  if (sessions.length === 0) {
    return 0;
  }

  const uniqueDays = new Set(
    sessions.map((s) => {
      const date = new Date(s.startTime);
      // Normalizar a medianoche para contar días únicos
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    })
  );

  return uniqueDays.size;
}
