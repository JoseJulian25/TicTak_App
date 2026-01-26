import { useMemo } from "react";
import { Clock, Trash2, Loader2 } from "lucide-react";
import { useSessionStore } from "@/stores/useSessionStore";
import { useEnrichedSessions } from "@/hooks/useEnrichedSessions";
import { formatDuration, getDayStart, getDayEnd } from "@/lib/time-utils";
import { toast } from "sonner";

/**
 * Componente para mostrar el historial de sesiones del día
 * 
 * Obtiene sesiones de hoy desde el store y las enriquece
 */
export function SessionHistory() {
  // Obtener todas las sesiones del store
  const sessions = useSessionStore((state) => state.sessions);
  const deleteSession = useSessionStore((state) => state.deleteSession);
  
  // Calcular sesiones de hoy con useMemo
  const sessionsToday = useMemo(() => {
    const today = new Date();
    const dayStart = getDayStart(today);
    const dayEnd = getDayEnd(today);
    
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
  }, [sessions]);
  
  // Enriquecer sesiones con información completa
  const enrichedSessions = useEnrichedSessions(sessionsToday);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = (sessionId: string, taskName: string) => {
    if (confirm(`¿Estás seguro de eliminar la sesión de "${taskName}"?`)) {
      const success = deleteSession(sessionId);
      if (success) {
        toast.success('Sesión eliminada', {
          description: `La sesión de "${taskName}" ha sido eliminada`,
        });
      } else {
        toast.error('Error al eliminar', {
          description: 'No se pudo eliminar la sesión',
        });
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mt-12 px-4 md:px-0">
      <div className="mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Clock className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Historial de Hoy</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {enrichedSessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No hay sesiones registradas hoy</p>
            <p className="text-sm mt-1">Inicia el timer para trackear tu tiempo</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {enrichedSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Project indicator with color */}
                <div 
                  className="w-1 h-16 rounded-full hidden sm:block" 
                  style={{ 
                    background: session.projectColor 
                      ? `linear-gradient(to bottom, ${session.projectColor}, ${session.projectColor}dd)` 
                      : 'linear-gradient(to bottom, #3b82f6, #8b5cf6)' 
                  }}
                />
                
                {/* Project info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {session.taskName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                    {session.projectPath}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </div>
                  {session.notes && (
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">
                      "{session.notes}"
                    </div>
                  )}
                </div>

                {/* Duration and actions */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {formatDuration(session.duration)}
                    </div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(session.id, session.taskName)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
                    title="Eliminar sesión"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
