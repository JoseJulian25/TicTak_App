import { useMemo, memo } from "react";
import { Clock } from "lucide-react";
import { useSessionStore } from "@/stores/useSessionStore";
import { getDayStart, getDayEnd } from "@/lib/time-utils";

/**
 * Componente para mostrar resumen del trabajo de hoy
 */
export const SessionSummary = memo(function SessionSummary() {
  // Obtener todas las sesiones del store
  const sessions = useSessionStore((state) => state.sessions);

  // Calcular sesiones de hoy con useMemo para evitar recalcular en cada render
  const sessionsToday = useMemo(() => {
    const today = new Date();
    const dayStart = getDayStart(today);
    const dayEnd = getDayEnd(today);
    
    return sessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= dayStart && sessionDate <= dayEnd;
    });
  }, [sessions]);

  const totalTime = sessionsToday.reduce((sum, session) => sum + session.duration, 0);
  
  const sessionCount = sessionsToday.length;

  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);

  return (
    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4" />
        <span>
          Hoy: <span className="font-medium text-gray-900 dark:text-gray-100">{hours}h {minutes}m</span>
        </span>
      </div>
      <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
      <span>
        <span className="font-medium text-gray-900 dark:text-gray-100">{sessionCount}</span>{" "}
        {sessionCount === 1 ? "sesión" : "sesiones"}
      </span>
    </div>
  );
});
