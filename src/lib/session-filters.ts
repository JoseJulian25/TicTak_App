import { Session } from "@/types/entities";
import { getDayStart, getDayEnd } from "./time-utils";

/**
 * Filtros de fecha predefinidos para sesiones
 */
export enum SessionDateFilter {
  ALL = "all",
  TODAY = "today",
  WEEK = "week",
  MONTH = "month",
  CUSTOM = "custom",
}

/**
 * Opciones de ordenamiento para sesiones
 */
export enum SessionSortBy {
  DATE_ASC = "date-asc",
  DATE_DESC = "date-desc",
  DURATION_ASC = "duration-asc",
  DURATION_DESC = "duration-desc",
}

/**
 * Filtra sesiones por un rango de fechas personalizado
 * 
 * @param sessions - Array de sesiones a filtrar
 * @param from - Fecha de inicio (inclusive)
 * @param to - Fecha de fin (inclusive)
 * @returns Sesiones dentro del rango
 */
export function filterSessionsByDateRange(
  sessions: Session[],
  from: Date,
  to: Date
): Session[] {
  const fromTime = getDayStart(from).getTime();
  const toTime = getDayEnd(to).getTime();

  return sessions.filter((session) => {
    const sessionTime = session.startTime.getTime();
    return sessionTime >= fromTime && sessionTime <= toTime;
  });
}

/**
 * Filtra sesiones usando un preset de rango de fecha
 * 
 * @param sessions - Array de sesiones a filtrar
 * @param preset - Preset de filtro (today, week, month, all)
 * @returns Sesiones filtradas según el preset
 */
export function filterSessionsByPreset(
  sessions: Session[],
  preset: SessionDateFilter
): Session[] {
  if (preset === SessionDateFilter.ALL) {
    return sessions;
  }

  const now = new Date();
  let from: Date;
  let to: Date = now;

  switch (preset) {
    case SessionDateFilter.TODAY:
      from = getDayStart(now);
      to = getDayEnd(now);
      break;

    case SessionDateFilter.WEEK:
      // Última semana (7 días hacia atrás desde hoy)
      from = new Date(now);
      from.setDate(from.getDate() - 6); // 6 días atrás + hoy = 7 días
      from = getDayStart(from);
      to = getDayEnd(now);
      break;

    case SessionDateFilter.MONTH:
      // Último mes (30 días hacia atrás desde hoy)
      from = new Date(now);
      from.setDate(from.getDate() - 29); // 29 días atrás + hoy = 30 días
      from = getDayStart(from);
      to = getDayEnd(now);
      break;

    default:
      return sessions;
  }

  return filterSessionsByDateRange(sessions, from, to);
}

/**
 * Ordena sesiones según el criterio especificado
 * 
 * @param sessions - Array de sesiones a ordenar
 * @param sortBy - Criterio de ordenamiento
 * @returns Sesiones ordenadas (nuevo array)
 */
export function sortSessions(
  sessions: Session[],
  sortBy: SessionSortBy
): Session[] {
  const sorted = [...sessions]; // Crear copia para no mutar el original

  switch (sortBy) {
    case SessionSortBy.DATE_ASC:
      return sorted.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    case SessionSortBy.DATE_DESC:
      return sorted.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

    case SessionSortBy.DURATION_ASC:
      return sorted.sort((a, b) => a.duration - b.duration);

    case SessionSortBy.DURATION_DESC:
      return sorted.sort((a, b) => b.duration - a.duration);

    default:
      return sorted;
  }
}

/**
 * Aplica filtros y ordenamiento a sesiones en un solo paso
 * 
 * @param sessions - Array de sesiones
 * @param dateFilter - Filtro de fecha (preset o custom)
 * @param sortBy - Criterio de ordenamiento
 * @param customRange - Rango personalizado (solo si dateFilter es CUSTOM)
 * @returns Sesiones filtradas y ordenadas
 */
export function applySessionFilters(
  sessions: Session[],
  dateFilter: SessionDateFilter,
  sortBy: SessionSortBy,
  customRange?: { from: Date; to: Date }
): Session[] {
  // Paso 1: Filtrar por fecha
  let filtered: Session[];
  
  if (dateFilter === SessionDateFilter.CUSTOM && customRange) {
    filtered = filterSessionsByDateRange(sessions, customRange.from, customRange.to);
  } else {
    filtered = filterSessionsByPreset(sessions, dateFilter);
  }

  // Paso 2: Ordenar
  const sorted = sortSessions(filtered, sortBy);

  return sorted;
}

/**
 * Agrupa sesiones por día
 * 
 * @param sessions - Array de sesiones (debe estar ordenado por fecha)
 * @returns Map con fecha normalizada como key y array de sesiones como value
 */
export function groupSessionsByDay(sessions: Session[]): Map<string, Session[]> {
  const grouped = new Map<string, Session[]>();

  for (const session of sessions) {
    const dayKey = getDayStart(session.startTime).toISOString();
    
    if (!grouped.has(dayKey)) {
      grouped.set(dayKey, []);
    }
    
    grouped.get(dayKey)!.push(session);
  }

  return grouped;
}

/**
 * Obtiene el label legible para un preset de filtro
 * 
 * @param preset - Preset de filtro
 * @returns Label en español
 */
export function getFilterLabel(preset: SessionDateFilter): string {
  switch (preset) {
    case SessionDateFilter.ALL:
      return "Todas";
    case SessionDateFilter.TODAY:
      return "Hoy";
    case SessionDateFilter.WEEK:
      return "Última semana";
    case SessionDateFilter.MONTH:
      return "Último mes";
    case SessionDateFilter.CUSTOM:
      return "Rango personalizado";
    default:
      return "Todas";
  }
}

/**
 * Obtiene el label legible para un criterio de ordenamiento
 * 
 * @param sortBy - Criterio de ordenamiento
 * @returns Label en español
 */
export function getSortLabel(sortBy: SessionSortBy): string {
  switch (sortBy) {
    case SessionSortBy.DATE_ASC:
      return "Fecha (más antigua)";
    case SessionSortBy.DATE_DESC:
      return "Fecha (más reciente)";
    case SessionSortBy.DURATION_ASC:
      return "Duración (menor)";
    case SessionSortBy.DURATION_DESC:
      return "Duración (mayor)";
    default:
      return "Fecha (más reciente)";
  }
}
