import { Clock } from "lucide-react";

interface SessionSummaryProps {
  totalTime: number;
  sessionCount: number;
}

export function SessionSummary({ totalTime, sessionCount }: SessionSummaryProps) {
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
}
