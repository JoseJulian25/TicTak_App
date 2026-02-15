import { Clock, BarChart3, Timer, Calendar, LucideIcon } from "lucide-react";
import type { TaskDetailStats } from "@/lib/task-stats";

interface TaskMetricsProps {
  stats: TaskDetailStats;
}

interface MetricCard {
  icon: LucideIcon;
  value: string;
  label: string;
  color: string;
  bgColor: string;
}

/**
 * Grid de métricas principales de una tarea
 * 
 * Muestra 4 cards con: Tiempo Total, Total Sesiones, Promedio/Sesión, Última Sesión
 */
export function TaskMetrics({ stats }: TaskMetricsProps) {
  // Formatear última sesión
  const lastSessionFormatted = stats.lastSession
    ? formatRelativeTime(stats.lastSession.date)
    : "Sin sesiones";

  // Configuración de las 4 métricas con íconos y colores
  const metrics: MetricCard[] = [
    {
      icon: Clock,
      value: stats.totalDurationFormatted,
      label: "Tiempo Total",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      icon: BarChart3,
      value: stats.sessionCount.toString(),
      label: "Total Sesiones",
      color: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      icon: Timer,
      value: stats.averageDurationFormatted,
      label: "Promedio/Sesión",
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      icon: Calendar,
      value: lastSessionFormatted,
      label: "Última Sesión",
      color: "text-orange-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm text-center"
        >
          <div className={`${metric.bgColor} rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3`}>
            <metric.icon className={`h-6 w-6 ${metric.color}`} />
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {metric.value}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}

/**
 * Formatea una fecha relativa (ej: "Hace 2 horas", "Ayer", "Hace 3 días")
 */
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) {
    return "Hace un momento";
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  } else if (diffDays === 1) {
    return "Ayer";
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else {
    // Formato de fecha para más de una semana
    const day = date.getDate();
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  }
}
