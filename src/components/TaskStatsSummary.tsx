import React from "react";
import { Flame, Trophy, Zap, Target, TrendingUp } from "lucide-react";
import type { TaskDetailStats } from "@/lib/task-stats";

interface TaskStatsSummaryProps {
  stats: TaskDetailStats;
}

interface StatRow {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}

/**
 * Formatea un objeto de sesión para mostrar duración y fecha
 */
function formatSession(session: { duration: number; date: Date; durationFormatted: string } | null): string {
  if (!session) return "—";
  
  const dateStr = session.date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  
  return `${session.durationFormatted} (${dateStr})`;
}

/**
 * Formatea un contador de racha con pluralización adecuada
 */
function formatStreak(days: number): string {
  if (days === 0) return "0 días";
  if (days === 1) return "1 día";
  return `${days} días consecutivos`;
}

/**
 * Formatea el contador de días trabajados con pluralización adecuada
 */
function formatDaysWorked(days: number): string {
  if (days === 0) return "0 días";
  if (days === 1) return "1 día";
  return `${days} días`;
}

/**
 * Componente TaskStatsSummary
 * 
 * Muestra una tarjeta de resumen con 5 estadísticas clave de rendimiento:
 * - Mejor racha
 * - Sesión más larga
 * - Sesión más corta
 * - Días trabajados
 * - Racha actual
 */
export default function TaskStatsSummary({ stats }: TaskStatsSummaryProps) {
  // Si no hay sesiones, mostrar estado vacío
  const hasData = stats.sessionCount > 0;

  const statRows: StatRow[] = [
    {
      icon: Flame,
      label: "Mejor racha",
      value: hasData ? formatStreak(stats.bestStreak) : "—",
      color: "text-orange-500",
    },
    {
      icon: Trophy,
      label: "Sesión más larga",
      value: hasData ? formatSession(stats.longestSession) : "—",
      color: "text-yellow-500",
    },
    {
      icon: Zap,
      label: "Sesión más corta",
      value: hasData ? formatSession(stats.shortestSession) : "—",
      color: "text-purple-500",
    },
    {
      icon: Target,
      label: "Días trabajados",
      value: hasData ? formatDaysWorked(stats.daysWorked) : "—",
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Racha actual",
      value: hasData ? formatStreak(stats.currentStreak) : "—",
      color: "text-green-500",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 mb-8 shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Estadísticas de Rendimiento
      </h2>
      <div className="space-y-3">
        {statRows.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stat.label}:
              </span>
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
