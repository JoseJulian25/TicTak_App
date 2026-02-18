"use client";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderKanban,
  Users,
  CheckSquare,
  Flame,
  TrendingUp,
  CalendarDays,
  Zap,
} from "lucide-react";

import type { Period, DistribTab } from "@/types";
import { useStatsView } from "@/hooks/useStatsView";


const periodMetrics: Record<Period, { label: string; value: string; sub?: string }[]> = {
  today: [
    { label: "Hoy", value: "2.5h" },
    { label: "Ayer", value: "4.1h" },
    { label: "Esta semana", value: "18.3h" },
    { label: "Prom. diario", value: "3.8h" },
  ],
  week: [
    { label: "Total semana", value: "18.3h" },
    { label: "Mejor día", value: "6.2h", sub: "Jueves" },
    { label: "Sesiones", value: "14" },
    { label: "Prom. diario", value: "3.8h" },
  ],
  month: [
    { label: "Total mes", value: "76.2h" },
    { label: "Semanas activas", value: "4" },
    { label: "Mejor semana", value: "22.1h", sub: "Sem. 2" },
    { label: "Prom. diario", value: "3.8h" },
  ],
  year: [
    { label: "Total año", value: "612h" },
    { label: "Meses activos", value: "10" },
    { label: "Mejor mes", value: "89.4h", sub: "Octubre" },
    { label: "Prom. diario", value: "2.9h" },
  ],
  custom: [
    { label: "Total período", value: "34.7h" },
    { label: "Días activos", value: "9" },
    { label: "Mejor día", value: "5.4h" },
    { label: "Prom. diario", value: "3.9h" },
  ],
};

const periodInsights: Record<Period, { icon: React.ReactNode; label: string; value: string; sub: string }[]> = {
  today: [
    { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: "Sesión más larga", value: "2h 15m", sub: "Website Redesign" },
    { icon: <Flame className="h-4 w-4 text-orange-500" />, label: "Racha actual", value: "5 días", sub: "consecutivos" },
    { icon: <TrendingUp className="h-4 w-4 text-green-500" />, label: "Cliente del día", value: "Tech Corp", sub: "2.5h hoy" },
    { icon: <CalendarDays className="h-4 w-4 text-blue-500" />, label: "Sesiones hoy", value: "2", sub: "de 4 habituales" },
  ],
  week: [
    { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: "Día más productivo", value: "Jueves", sub: "6.2h" },
    { icon: <Flame className="h-4 w-4 text-orange-500" />, label: "Racha actual", value: "5 días", sub: "consecutivos" },
    { icon: <TrendingUp className="h-4 w-4 text-green-500" />, label: "Mejor proyecto", value: "Website Redesign", sub: "9.4h esta semana" },
    { icon: <CalendarDays className="h-4 w-4 text-blue-500" />, label: "Días trabajados", value: "5 de 7", sub: "lun–vie" },
  ],
  month: [
    { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: "Semana más productiva", value: "Sem. 2", sub: "22.1h" },
    { icon: <Flame className="h-4 w-4 text-orange-500" />, label: "Racha más larga", value: "12 días", sub: "del 3 al 15" },
    { icon: <TrendingUp className="h-4 w-4 text-green-500" />, label: "Cliente top", value: "BanReservas", sub: "32.5h este mes" },
    { icon: <CalendarDays className="h-4 w-4 text-blue-500" />, label: "Días trabajados", value: "20 de 28", sub: "este mes" },
  ],
  year: [
    { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: "Mes más productivo", value: "Octubre", sub: "89.4h" },
    { icon: <Flame className="h-4 w-4 text-orange-500" />, label: "Racha más larga", value: "23 días", sub: "oct–nov" },
    { icon: <TrendingUp className="h-4 w-4 text-green-500" />, label: "Cliente top", value: "Tech Corp", sub: "214h este año" },
    { icon: <CalendarDays className="h-4 w-4 text-blue-500" />, label: "Días trabajados", value: "187 de 365", sub: "este año" },
  ],
  custom: [
    { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: "Día más productivo", value: "Mar 4 Feb", sub: "5.4h" },
    { icon: <Flame className="h-4 w-4 text-orange-500" />, label: "Racha en período", value: "4 días", sub: "seguidos" },
    { icon: <TrendingUp className="h-4 w-4 text-green-500" />, label: "Proyecto top", value: "App Móvil", sub: "12h en período" },
    { icon: <CalendarDays className="h-4 w-4 text-blue-500" />, label: "Días activos", value: "9 de 14", sub: "en el rango" },
  ],
};

const distribData: Record<Period, {
  projects: { name: string; sub: string; hours: number; color: string }[];
  clients: { name: string; sub: string; hours: number; color: string }[];
  tasks: { name: string; sub: string; hours: number; color: string }[];
}> = {
  today: {
    projects: [
      { name: "Website Redesign", sub: "Tech Corp", hours: 2.2, color: "bg-blue-500" },
      { name: "App Móvil", sub: "BanReservas", hours: 0.3, color: "bg-green-500" },
    ],
    clients: [
      { name: "Tech Corp", sub: "1 proyecto hoy", hours: 2.2, color: "bg-blue-500" },
      { name: "BanReservas", sub: "1 proyecto hoy", hours: 0.3, color: "bg-purple-500" },
    ],
    tasks: [
      { name: "Implementar nav components", sub: "Website Redesign", hours: 2.2, color: "bg-blue-500" },
      { name: "Revisión de diseño", sub: "App Móvil", hours: 0.3, color: "bg-green-500" },
    ],
  },
  week: {
    projects: [
      { name: "Website Redesign", sub: "Tech Corp", hours: 9.4, color: "bg-blue-500" },
      { name: "Sistema de Pagos", sub: "BanReservas", hours: 5.2, color: "bg-purple-500" },
      { name: "App Móvil", sub: "BanReservas", hours: 2.1, color: "bg-green-500" },
      { name: "Dashboard Analytics", sub: "Tech Corp", hours: 1.6, color: "bg-pink-500" },
    ],
    clients: [
      { name: "Tech Corp", sub: "2 proyectos", hours: 11.0, color: "bg-blue-500" },
      { name: "BanReservas", sub: "2 proyectos", hours: 7.3, color: "bg-purple-500" },
    ],
    tasks: [
      { name: "Desarrollo frontend", sub: "Website Redesign", hours: 5.2, color: "bg-blue-500" },
      { name: "API de transacciones", sub: "Sistema de Pagos", hours: 4.1, color: "bg-purple-500" },
      { name: "Pantallas principales", sub: "App Móvil", hours: 2.1, color: "bg-green-500" },
      { name: "Setup dashboard", sub: "Dashboard Analytics", hours: 1.6, color: "bg-pink-500" },
      { name: "Reunión cliente", sub: "Website Redesign", hours: 1.3, color: "bg-blue-400" },
    ],
  },
  month: {
    projects: [
      { name: "Website Redesign", sub: "Tech Corp", hours: 24.2, color: "bg-blue-500" },
      { name: "Sistema de Pagos", sub: "BanReservas", hours: 18.5, color: "bg-purple-500" },
      { name: "App Móvil", sub: "BanReservas", hours: 14.0, color: "bg-green-500" },
      { name: "Portfolio", sub: "Personal", hours: 6.7, color: "bg-orange-400" },
      { name: "Dashboard Analytics", sub: "Tech Corp", hours: 5.3, color: "bg-pink-500" },
      { name: "API Integraciones", sub: "Freelance", hours: 3.1, color: "bg-cyan-500" },
    ],
    clients: [
      { name: "BanReservas", sub: "2 proyectos", hours: 32.5, color: "bg-purple-500" },
      { name: "Tech Corp", sub: "2 proyectos", hours: 29.5, color: "bg-blue-500" },
      { name: "Personal", sub: "1 proyecto", hours: 6.7, color: "bg-orange-400" },
      { name: "Freelance", sub: "1 proyecto", hours: 3.1, color: "bg-cyan-500" },
    ],
    tasks: [
      { name: "Desarrollo frontend", sub: "Website Redesign", hours: 15.2, color: "bg-blue-500" },
      { name: "API de transacciones", sub: "Sistema de Pagos", hours: 12.3, color: "bg-purple-500" },
      { name: "Dashboard principal", sub: "App Móvil", hours: 8.5, color: "bg-green-500" },
      { name: "Wireframes y mockups", sub: "Website Redesign", hours: 9.0, color: "bg-blue-400" },
      { name: "Autenticación JWT", sub: "Sistema de Pagos", hours: 6.2, color: "bg-purple-400" },
      { name: "Portfolio personal", sub: "Portfolio", hours: 6.7, color: "bg-orange-400" },
    ],
  },
  year: {
    projects: [
      { name: "Website Redesign", sub: "Tech Corp", hours: 124.2, color: "bg-blue-500" },
      { name: "Sistema de Pagos", sub: "BanReservas", hours: 98.5, color: "bg-purple-500" },
      { name: "App Móvil", sub: "BanReservas", hours: 87.0, color: "bg-green-500" },
      { name: "Dashboard Analytics", sub: "Tech Corp", hours: 65.3, color: "bg-pink-500" },
      { name: "Portfolio", sub: "Personal", hours: 42.7, color: "bg-orange-400" },
      { name: "API Integraciones", sub: "Freelance", hours: 34.1, color: "bg-cyan-500" },
    ],
    clients: [
      { name: "Tech Corp", sub: "2 proyectos", hours: 214.0, color: "bg-blue-500" },
      { name: "BanReservas", sub: "2 proyectos", hours: 185.5, color: "bg-purple-500" },
      { name: "Personal", sub: "1 proyecto", hours: 142.7, color: "bg-orange-400" },
      { name: "Freelance", sub: "2 proyectos", hours: 69.8, color: "bg-cyan-500" },
    ],
    tasks: [
      { name: "Desarrollo frontend", sub: "Website Redesign", hours: 52.1, color: "bg-blue-500" },
      { name: "API de transacciones", sub: "Sistema de Pagos", hours: 45.3, color: "bg-purple-500" },
      { name: "Dashboard principal", sub: "App Móvil", hours: 38.5, color: "bg-green-500" },
      { name: "Arquitectura backend", sub: "Dashboard Analytics", hours: 31.2, color: "bg-pink-500" },
      { name: "Testing e2e", sub: "Sistema de Pagos", hours: 28.0, color: "bg-purple-400" },
    ],
  },
  custom: {
    projects: [
      { name: "App Móvil", sub: "BanReservas", hours: 12.0, color: "bg-green-500" },
      { name: "Website Redesign", sub: "Tech Corp", hours: 9.4, color: "bg-blue-500" },
      { name: "Sistema de Pagos", sub: "BanReservas", hours: 7.2, color: "bg-purple-500" },
      { name: "API Integraciones", sub: "Freelance", hours: 6.1, color: "bg-cyan-500" },
    ],
    clients: [
      { name: "BanReservas", sub: "2 proyectos", hours: 19.2, color: "bg-purple-500" },
      { name: "Tech Corp", sub: "1 proyecto", hours: 9.4, color: "bg-blue-500" },
      { name: "Freelance", sub: "1 proyecto", hours: 6.1, color: "bg-cyan-500" },
    ],
    tasks: [
      { name: "Pantallas principales", sub: "App Móvil", hours: 7.3, color: "bg-green-500" },
      { name: "Desarrollo frontend", sub: "Website Redesign", hours: 6.1, color: "bg-blue-500" },
      { name: "API de transacciones", sub: "Sistema de Pagos", hours: 5.4, color: "bg-purple-500" },
      { name: "Documentación", sub: "API Integraciones", hours: 4.2, color: "bg-cyan-500" },
    ],
  },
};

const recentSessionsByPeriod: Record<Period, {
  id: string; date: string; time: string;
  task: string; project: string; client: string; duration: string;
}[]> = {
  today: [
    { id: "1", date: "Hoy", time: "09:15", task: "Implementar componentes de navegación", project: "Website Redesign", client: "Tech Corp", duration: "2h 15m" },
    { id: "2", date: "Hoy", time: "14:30", task: "Revisión de diseño con cliente", project: "App Móvil", client: "BanReservas", duration: "45m" },
  ],
  week: [
    { id: "1", date: "Hoy", time: "09:15", task: "Implementar componentes de navegación", project: "Website Redesign", client: "Tech Corp", duration: "2h 15m" },
    { id: "2", date: "Hoy", time: "14:30", task: "Revisión de diseño con cliente", project: "App Móvil", client: "BanReservas", duration: "45m" },
    { id: "3", date: "Ayer", time: "10:00", task: "Integración con API de pagos", project: "Sistema de Pagos", client: "BanReservas", duration: "3h 10m" },
    { id: "4", date: "Ayer", time: "15:45", task: "Corrección de bugs en formulario", project: "Website Redesign", client: "Tech Corp", duration: "1h 20m" },
    { id: "5", date: "Mié 12 Feb", time: "09:00", task: "Setup dashboard analytics", project: "Dashboard Analytics", client: "Tech Corp", duration: "2h 30m" },
  ],
  month: [
    { id: "1", date: "Hoy", time: "09:15", task: "Implementar componentes de navegación", project: "Website Redesign", client: "Tech Corp", duration: "2h 15m" },
    { id: "2", date: "Hoy", time: "14:30", task: "Revisión de diseño con cliente", project: "App Móvil", client: "BanReservas", duration: "45m" },
    { id: "3", date: "Ayer", time: "10:00", task: "Integración con API de pagos", project: "Sistema de Pagos", client: "BanReservas", duration: "3h 10m" },
    { id: "4", date: "Ayer", time: "15:45", task: "Corrección de bugs en formulario", project: "Website Redesign", client: "Tech Corp", duration: "1h 20m" },
    { id: "5", date: "Lun 10 Feb", time: "09:00", task: "Maquetado de pantallas principales", project: "App Móvil", client: "BanReservas", duration: "4h 05m" },
    { id: "6", date: "Lun 10 Feb", time: "13:30", task: "Setup inicial del proyecto", project: "Dashboard Analytics", client: "Tech Corp", duration: "2h 30m" },
    { id: "7", date: "Vie 7 Feb", time: "11:00", task: "Documentación técnica", project: "API Integraciones", client: "Freelance", duration: "1h 50m" },
  ],
  year: [
    { id: "1", date: "Hoy", time: "09:15", task: "Implementar componentes de navegación", project: "Website Redesign", client: "Tech Corp", duration: "2h 15m" },
    { id: "2", date: "Ayer", time: "10:00", task: "Integración con API de pagos", project: "Sistema de Pagos", client: "BanReservas", duration: "3h 10m" },
    { id: "3", date: "Lun 10 Feb", time: "09:00", task: "Maquetado de pantallas principales", project: "App Móvil", client: "BanReservas", duration: "4h 05m" },
    { id: "4", date: "Vie 7 Feb", time: "11:00", task: "Documentación técnica", project: "API Integraciones", client: "Freelance", duration: "1h 50m" },
    { id: "5", date: "Mar 4 Feb", time: "09:30", task: "Arquitectura backend", project: "Dashboard Analytics", client: "Tech Corp", duration: "5h 20m" },
  ],
  custom: [
    { id: "1", date: "Mar 4 Feb", time: "09:30", task: "Arquitectura backend", project: "Dashboard Analytics", client: "Tech Corp", duration: "5h 20m" },
    { id: "2", date: "Vie 7 Feb", time: "11:00", task: "Documentación técnica", project: "API Integraciones", client: "Freelance", duration: "1h 50m" },
    { id: "3", date: "Lun 10 Feb", time: "09:00", task: "Maquetado de pantallas", project: "App Móvil", client: "BanReservas", duration: "4h 05m" },
  ],
};

// ─── UI helpers ──────────────────────────────────────────────────────────────

const INSIGHT_ICONS = [
  <Zap          key="zap"   className="h-4 w-4 text-yellow-500" />,
  <Flame        key="flame" className="h-4 w-4 text-orange-500" />,
  <TrendingUp   key="trend" className="h-4 w-4 text-green-500"  />,
  <CalendarDays key="cal"   className="h-4 w-4 text-blue-500"   />,
];

const heatmapColors = [
  "bg-gray-100 dark:bg-gray-800",
  "bg-green-200 dark:bg-green-900",
  "bg-green-400 dark:bg-green-700",
  "bg-green-500 dark:bg-green-600",
  "bg-green-600 dark:bg-green-500",
];

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const PERIOD_LABELS: Record<Period, string> = {
  today: "Hoy",
  week: "Esta semana",
  month: "Este mes",
  year: "Este año",
  custom: "Personalizado",
};

const DISTRIB_TABS: { key: DistribTab; label: string; icon: React.ReactNode }[] = [
  { key: "projects", label: "Proyectos", icon: <FolderKanban className="h-3.5 w-3.5" /> },
  { key: "clients", label: "Clientes", icon: <Users className="h-3.5 w-3.5" /> },
  { key: "tasks", label: "Tareas", icon: <CheckSquare className="h-3.5 w-3.5" /> },
];

export function StatsView() {
  const {
    period,      setPeriod,
    distribTab,  setDistribTab,
    year,        setYear,
    customFrom,  setCustomFrom,
    customTo,    setCustomTo,
    currentYear,
    metrics,
    insights,
    distribItems,
    totalDistribHours,
    maxDistribHours,
    recentSessions,
    heatmapWeeks,
    totalYearHours,
  } = useStatsView();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-300 space-y-6">

      {/* Header + Period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Estadísticas</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Resumen de tu actividad y tiempo trabajado</p>
        </div>

        {/* Period pills */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                period === p
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {period === "custom" && (
        <div className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 w-fit">
          <span className="text-xs text-gray-500">Desde</span>
          <input
            type="date"
            value={customFrom}
            onChange={(e) => setCustomFrom(e.target.value)}
            className="text-sm text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none"
          />
          <span className="text-xs text-gray-400">→</span>
          <span className="text-xs text-gray-500">Hasta</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => setCustomTo(e.target.value)}
            className="text-sm text-gray-800 dark:text-gray-200 bg-transparent border-none outline-none"
          />
        </div>
      )}

      {/* Section 1 — Dynamic time metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map(({ label, value, sub }) => (
          <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Section 2 — Insights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {insights.map(({ label, value, sub }, i) => (
          <div key={label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-4 flex items-start gap-3">
            <div className="mt-0.5 shrink-0">{INSIGHT_ICONS[i]}</div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 truncate">{label}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{value}</p>
              <p className="text-xs text-gray-400 truncate">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section 3 — Heatmap */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Actividad del año</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">{totalYearHours}h registradas en {year}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setYear(year - 1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-10 text-center">{year}</span>
            <button
              onClick={() => setYear(year + 1)}
              disabled={year >= currentYear}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-flex gap-1 min-w-max">
            <div className="flex flex-col gap-1 pr-2 pt-4">
              {DAYS.map((day, i) =>
                i % 2 === 1 ? (
                  <div key={day} className="h-3 text-[10px] text-gray-400 dark:text-gray-600 leading-3">{day}</div>
                ) : (
                  <div key={day} className="h-3" />
                )
              )}
            </div>
            <div className="flex gap-1">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {wi % 4 === 0 && week[0]?.date ? (
                    <div className="h-3 text-[10px] text-gray-400 dark:text-gray-600 leading-3">
                      {MONTHS[new Date(week[0].date).getMonth()]}
                    </div>
                  ) : (
                    <div className="h-3" />
                  )}
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={day.date ? `${day.date}: ${day.hours}h` : ""}
                      className={`w-3 h-3 rounded-sm transition-opacity hover:opacity-70 cursor-default ${
                        day.date ? heatmapColors[day.level] : "bg-transparent"
                      }`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-4 justify-end">
          <span className="text-[10px] text-gray-400">Menos</span>
          {heatmapColors.map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-gray-400">Más</span>
        </div>
      </div>

      {/* Section 4 — Distribution + Recent sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — Distribution tabs */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          {/* Tab header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {DISTRIB_TABS.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setDistribTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    distribTab === key
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400">{totalDistribHours.toFixed(1)}h</span>
          </div>

          {/* Distribution list */}
          <div className="space-y-4">
            {distribItems.map((item) => {
              const pct = Math.round((item.hours / maxDistribHours) * 100);
              const share = Math.round((item.hours / totalDistribHours) * 100);
              return (
                <div key={item.name}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="min-w-0">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate block">{item.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{item.sub}</span>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.hours}h</span>
                      <span className="text-xs text-gray-400 ml-1.5">{share}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right — Recent sessions */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="h-4 w-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Actividad reciente</h2>
          </div>

          {recentSessions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Sin actividad en este período</p>
          ) : (
            <div className="space-y-1">
              {recentSessions.map((session, i) => {
                const showDateDivider = i === 0 || recentSessions[i - 1].date !== session.date;
                return (
                  <div key={session.id}>
                    {showDateDivider && (
                      <div className={`text-xs font-medium text-gray-400 dark:text-gray-500 ${i !== 0 ? "mt-4" : ""} mb-2`}>
                        {session.date}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{session.task}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {session.project}<span className="mx-1">·</span>{session.client}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{session.duration}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{session.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
