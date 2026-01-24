import { Clock } from "lucide-react";

interface Session {
  id: string;
  projectName: string;
  projectPath: string;
  duration: number; // en segundos
  startTime: Date;
  endTime: Date;
}

interface SessionHistoryProps {
  sessions: Session[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-4xl mt-12 px-4 md:px-0">
      <div className="mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-300">
        <Clock className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Historial de Hoy</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No hay sesiones registradas hoy
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4"
              >
                {/* Project indicator */}
                <div className="w-1 h-16 rounded-full bg-gradient-to-b from-blue-500 to-purple-600 hidden sm:block" />
                
                {/* Project info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-gray-100 mb-1 truncate">
                    {session.projectName}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 truncate">
                    {session.projectPath}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTime(session.startTime)} - {formatTime(session.endTime)}
                  </div>
                </div>

                {/* Duration */}
                <div className="text-left sm:text-right">
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formatDuration(session.duration)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
