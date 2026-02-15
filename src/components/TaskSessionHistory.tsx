import React from "react";
import { Clock, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSessionFilters } from "@/hooks/useSessionFilters";
import { groupSessionsByDay, SessionDateFilter, SessionSortBy, getFilterLabel, getSortLabel } from "@/lib/session-filters";
import type { Session } from "@/types/entities";

interface TaskSessionHistoryProps {
  /** Sesiones de la tarea */
  sessions: Session[];
  /** Callback opcional cuando se edita una sesión */
  onEditSession?: (session: Session) => void;
  /** Callback opcional cuando se elimina una sesión */
  onDeleteSession?: (sessionId: string) => void;
}

/**
 * Formatea un objeto Date a hora (HH:MM)
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Formatea la duración en segundos a formato legible (Xh Ym)
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Formatea una fecha para el separador de día
 */
function formatDayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const sessionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (sessionDay.getTime() === today.getTime()) {
    return "Hoy";
  }
  
  if (sessionDay.getTime() === yesterday.getTime()) {
    return "Ayer";
  }
  
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

/**
 * Componente TaskSessionHistory
 * 
 * Muestra el historial de sesiones de una tarea con:
 * - Filtros por fecha (Todas, Hoy, Esta semana, Este mes)
 * - Ordenamiento (por fecha o duración, ascendente o descendente)
 * - Agrupación por día
 * - Acciones de editar/eliminar por sesión
 */
export default function TaskSessionHistory({ 
  sessions, 
  onEditSession, 
  onDeleteSession 
}: TaskSessionHistoryProps) {
  const {
    dateFilter,
    sortBy,
    filteredSessions,
    setDateFilter,
    setSortBy,
  } = useSessionFilters(sessions);

  // Agrupar sesiones por día
  const groupedSessions = React.useMemo(() => {
    return groupSessionsByDay(filteredSessions);
  }, [filteredSessions]);

  // Convertir el Map a array para renderizar
  const dayGroups = React.useMemo(() => {
    return Array.from(groupedSessions.entries()).map(([dateKey, sessions]) => ({
      date: new Date(dateKey),
      sessions,
    }));
  }, [groupedSessions]);

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Historial de Sesiones
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Filtro por fecha */}
          <Select 
            value={dateFilter} 
            onValueChange={(value) => setDateFilter(value as SessionDateFilter)}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SessionDateFilter.ALL}>
                {getFilterLabel(SessionDateFilter.ALL)}
              </SelectItem>
              <SelectItem value={SessionDateFilter.TODAY}>
                {getFilterLabel(SessionDateFilter.TODAY)}
              </SelectItem>
              <SelectItem value={SessionDateFilter.WEEK}>
                {getFilterLabel(SessionDateFilter.WEEK)}
              </SelectItem>
              <SelectItem value={SessionDateFilter.MONTH}>
                {getFilterLabel(SessionDateFilter.MONTH)}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Ordenamiento */}
          <Select 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as SessionSortBy)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SessionSortBy.DATE_DESC}>
                {getSortLabel(SessionSortBy.DATE_DESC)}
              </SelectItem>
              <SelectItem value={SessionSortBy.DATE_ASC}>
                {getSortLabel(SessionSortBy.DATE_ASC)}
              </SelectItem>
              <SelectItem value={SessionSortBy.DURATION_DESC}>
                {getSortLabel(SessionSortBy.DURATION_DESC)}
              </SelectItem>
              <SelectItem value={SessionSortBy.DURATION_ASC}>
                {getSortLabel(SessionSortBy.DURATION_ASC)}
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Contador de resultados */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Mostrando {filteredSessions.length} de {sessions.length}
          </span>
        </div>
      </div>

      {/* Lista de sesiones agrupadas por día */}
      {dayGroups.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay sesiones que mostrar
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {dayGroups.map((dayGroup, index) => (
              <div key={index}>
                {/* Separador de día */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    {formatDayLabel(dayGroup.date)}
                  </span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Items de sesión */}
                <div className="space-y-2">
                  {dayGroup.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </span>
                          {session.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {session.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between md:justify-end gap-4">
                          <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatDuration(session.duration)}
                          </span>
                          <div className="flex items-center gap-2">
                            {onEditSession && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => onEditSession(session)}
                              >
                                <Edit className="h-4 w-4 text-gray-500 hover:text-blue-500" />
                              </Button>
                            )}
                            {onDeleteSession && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => onDeleteSession(session.id)}
                              >
                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
