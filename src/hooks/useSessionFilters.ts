import { useState, useMemo } from "react";
import type { Session } from "@/types/entities";
import {
  SessionDateFilter,
  SessionSortBy,
  applySessionFilters,
} from "@/lib/session-filters";

/**
 * Resultado del hook useSessionFilters
 */
export interface UseSessionFiltersResult {
  filteredSessions: Session[];
  dateFilter: SessionDateFilter;
  sortBy: SessionSortBy;
  customRange: { from: Date; to: Date } | undefined;
  filteredCount: number;
  totalCount: number;
  setDateFilter: (filter: SessionDateFilter) => void;
  setSortBy: (sort: SessionSortBy) => void;
  setCustomRange: (from: Date, to: Date) => void;
  clearFilters: () => void;
}

/**
 * Hook para manejar el estado de filtros y ordenamiento de sesiones
 * 
 * @param sessions - Array de sesiones a filtrar
 * @returns Estado de filtros, sesiones filtradas y funciones para modificar filtros
 */
export function useSessionFilters(sessions: Session[]): UseSessionFiltersResult {
  // Estados de filtros
  const [dateFilter, setDateFilter] = useState<SessionDateFilter>(SessionDateFilter.ALL);
  const [sortBy, setSortBy] = useState<SessionSortBy>(SessionSortBy.DATE_DESC);

  const [customRange, setCustomRangeState] = useState<
    { from: Date; to: Date } | undefined
  >(undefined);

  // Aplicar filtros y ordenamiento
  const filteredSessions = useMemo(() => {
    return applySessionFilters(sessions, dateFilter, sortBy, customRange);
  }, [sessions, dateFilter, sortBy, customRange]);

  // Función para establecer rango personalizado
  const setCustomRange = (from: Date, to: Date) => {
    setCustomRangeState({ from, to });
    setDateFilter(SessionDateFilter.CUSTOM);
  };

  // Función para limpiar todos los filtros
  const clearFilters = () => {
    setDateFilter(SessionDateFilter.ALL);
    setSortBy(SessionSortBy.DATE_DESC);
    setCustomRangeState(undefined);
  };

  return {
    filteredSessions,
    dateFilter,
    sortBy,
    customRange,
    filteredCount: filteredSessions.length,
    totalCount: sessions.length,
    setDateFilter,
    setSortBy,
    setCustomRange,
    clearFilters,
  };
}
