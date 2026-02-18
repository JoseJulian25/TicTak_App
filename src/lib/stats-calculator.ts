/**
 * Funciones puras de cálculo de estadísticas globales para el módulo de Stats.
 * Agnósticas de React y de stores — reciben datos como parámetros y retornan
 * valores derivados. Diseñadas para ser usadas desde `useStatsView`.
 */

import { Session, Task, Project, Client } from "@/types";
import type {
  Period,
  DistribTab,
  PeriodRange,
  PeriodMetric,
  PeriodInsightData,
  DistribItem,
  DistribData,
  RecentSession,
  HeatmapDay,
  StreakResult,
} from "@/types";
import { getDayStart, getDayEnd, formatDuration } from "./time-utils";
import { filterSessionsByDateRange } from "./session-filters";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const MONTHS_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-400",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-yellow-500",
  "bg-red-400",
];

const PERIOD_SUFFIX: Record<Period, string> = {
  today:  "hoy",
  week:   "esta semana",
  month:  "este mes",
  year:   "este año",
  custom: "en período",
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

/** Suma la duración de un array de sesiones y convierte a horas. */
const sumHours = (s: Session[]) =>
  s.reduce((acc, x) => acc + x.duration, 0) / 3600;

/** Formatea horas como "0h", "45m" o "3.5h". */
const fmtH = (h: number) =>
  h === 0 ? "0h" : h < 1 ? `${Math.round(h * 60)}m` : `${h.toFixed(1)}h`;

/** Clave de día en formato YYYY-MM-DD. */
const dayKey = (d: Date) => getDayStart(d).toISOString().slice(0, 10);

/** Días completos entre dos fechas (normalizadas a inicio de día). */
const daysBetween = (a: Date, b: Date) =>
  Math.round((getDayStart(b).getTime() - getDayStart(a).getTime()) / 86_400_000);

/** Agrupa sesiones sumando horas por clave derivada. Retorna null-keys ignoradas. */
function groupByKey<K>(sessions: Session[], getKey: (s: Session) => K | null): Map<K, number> {
  const map = new Map<K, number>();
  for (const s of sessions) {
    const k = getKey(s);
    if (k !== null) map.set(k, (map.get(k) ?? 0) + s.duration / 3600);
  }
  return map;
}

/** Retorna la entrada con el valor más alto del Map, o null si está vacío. */
function topEntry<K>(map: Map<K, number>): [K, number] | null {
  let best: [K, number] | null = null;
  for (const e of map) if (!best || e[1] > best[1]) best = e;
  return best;
}

/** Número de semana ISO (1–53). */
function isoWeek(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const y = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - y.getTime()) / 86_400_000 + 1) / 7);
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

/** Color Tailwind estable derivado del id (hash → paleta fija). */
export function getEntityColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

/** Convierte un período predefinido en rango { from, to }. */
export function getPeriodRange(period: Exclude<Period, "custom">): PeriodRange {
  const now = new Date();
  if (period === "today")
    return { from: getDayStart(now), to: getDayEnd(now) };
  if (period === "month") {
    return {
      from: getDayStart(new Date(now.getFullYear(), now.getMonth(), 1)),
      to:   getDayEnd(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (period === "year") {
    return {
      from: getDayStart(new Date(now.getFullYear(), 0, 1)),
      to:   getDayEnd(new Date(now.getFullYear(), 11, 31)),
    };
  }
  // week: lunes → domingo
  const diff = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const mon  = new Date(now); mon.setDate(now.getDate() + diff);
  const sun  = new Date(mon); sun.setDate(mon.getDate() + 6);
  return { from: getDayStart(mon), to: getDayEnd(sun) };
}

/** Formatea fecha como "Hoy" | "Ayer" | "Lun 10 Feb" | "10 Feb 2026". */
export function formatSessionDate(date: Date): string {
  const diff = daysBetween(date, new Date());
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  const d = date.getDate(), m = MONTHS_SHORT[date.getMonth()];
  return diff < 7 ? `${DAYS_SHORT[date.getDay()]} ${d} ${m}` : `${d} ${m} ${date.getFullYear()}`;
}

// ─── calcGlobalStreak ─────────────────────────────────────────────────────────

/** Racha actual y mejor racha de días consecutivos con actividad. */
export function calcGlobalStreak(sessions: Session[]): StreakResult {
  if (!sessions.length) return { current: 0, best: 0 };

  const days = [...new Set(sessions.map((s) => dayKey(s.startTime)))].sort();
  let best = 1, run = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetween(new Date(days[i - 1]), new Date(days[i])) === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }

  const today = dayKey(new Date());
  const yest  = dayKey(new Date(Date.now() - 86_400_000));
  let current = 0;
  if (days.includes(today) || days.includes(yest)) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      if (daysBetween(new Date(days[i]), new Date(days[i + 1])) === 1) current++;
      else break;
    }
  }
  return { current, best };
}

// ─── calcPeriodMetrics ────────────────────────────────────────────────────────

/** 4 métricas numéricas para las tarjetas superiores, adaptadas al período. */
export function calcPeriodMetrics(sessions: Session[], period: Period, range: PeriodRange): PeriodMetric[] {
  const inRange   = filterSessionsByDateRange(sessions, range.from, range.to);
  const total     = sumHours(inRange);
  const rangeDays = Math.max(1, daysBetween(range.from, range.to) + 1);
  const avg       = fmtH(total / rangeDays);

  if (period === "today") {
    const yest = new Date(range.from); yest.setDate(yest.getDate() - 1);
    const wr   = getPeriodRange("week");
    return [
      { label: "Hoy",          value: fmtH(total) },
      { label: "Ayer",         value: fmtH(sumHours(filterSessionsByDateRange(sessions, getDayStart(yest), getDayEnd(yest)))) },
      { label: "Esta semana",  value: fmtH(sumHours(filterSessionsByDateRange(sessions, wr.from, wr.to))) },
      { label: "Prom. diario", value: avg },
    ];
  }
  if (period === "week") {
    const top = topEntry(groupByKey(inRange, (s) => dayKey(s.startTime)));
    return [
      { label: "Total semana",  value: fmtH(total) },
      { label: "Mejor día",     value: fmtH(top?.[1] ?? 0), sub: top ? DAYS_SHORT[new Date(top[0] + "T12:00:00").getDay()] : "—" },
      { label: "Sesiones",      value: String(inRange.length) },
      { label: "Prom. diario",  value: avg },
    ];
  }
  if (period === "month") {
    const byWeek = groupByKey(inRange, (s) => `${s.startTime.getFullYear()}-W${isoWeek(s.startTime)}`);
    const top    = topEntry(byWeek);
    return [
      { label: "Total mes",       value: fmtH(total) },
      { label: "Semanas activas", value: String(byWeek.size) },
      { label: "Mejor semana",    value: fmtH(top?.[1] ?? 0), sub: top ? `Sem. ${top[0].split("W")[1]}` : "—" },
      { label: "Prom. diario",    value: avg },
    ];
  }
  if (period === "year") {
    const byMonth = groupByKey(inRange, (s) => s.startTime.getMonth());
    const top     = topEntry(byMonth);
    return [
      { label: "Total año",      value: fmtH(total) },
      { label: "Meses activos",  value: String(byMonth.size) },
      { label: "Mejor mes",      value: fmtH(top?.[1] ?? 0), sub: top !== null ? MONTHS_SHORT[top[0]] : "—" },
      { label: "Prom. diario",   value: avg },
    ];
  }
  // custom
  const top = topEntry(groupByKey(inRange, (s) => dayKey(s.startTime)));
  return [
    { label: "Total período", value: fmtH(total) },
    { label: "Días activos",  value: String(new Set(inRange.map((s) => dayKey(s.startTime))).size) },
    { label: "Mejor día",     value: fmtH(top?.[1] ?? 0), sub: top ? formatSessionDate(new Date(top[0] + "T12:00:00")) : "—" },
    { label: "Prom. diario",  value: avg },
  ];
}

// ─── calcPeriodInsights ───────────────────────────────────────────────────────

/** 4 insight cards para el período. Los iconos se asignan en el hook/componente. */
export function calcPeriodInsights(
  sessions: Session[],
  tasks: Task[],
  projects: Project[],
  clients: Client[],
  period: Period,
  range: PeriodRange
): PeriodInsightData[] {
  const inRange = filterSessionsByDateRange(sessions, range.from, range.to);

  const resolveProject = (taskId: string) => {
    const t = tasks.find((x) => x.id === taskId);
    return t ? projects.find((p) => p.id === t.projectId) : undefined;
  };

  // Mejor día del rango
  const topDay   = topEntry(groupByKey(inRange, (s) => dayKey(s.startTime)));
  const topDayLabel = topDay ? formatSessionDate(new Date(topDay[0] + "T12:00:00")) : "—";

  // Racha
  const { current, best } = calcGlobalStreak(sessions);
  const streakStr = (n: number) => `${n} ${n === 1 ? "día" : "días"}`;

  // Cliente top
  const byClient     = groupByKey(inRange, (s) => resolveProject(s.taskId)?.clientId ?? null);
  const topClient    = topEntry(byClient);
  const topClientName  = topClient ? (clients.find((c) => c.id === topClient[0])?.name ?? "—") : "—";
  const topClientHours = topClient?.[1] ?? 0;

  // Días activos / rango
  const activeDays = new Set(inRange.map((s) => dayKey(s.startTime))).size;
  const rangeDays  = Math.max(1, daysBetween(range.from, range.to) + 1);

  // Productivity insight (varía por período)
  let productivity: PeriodInsightData;
  if (period === "month") {
    const top = topEntry(groupByKey(inRange, (s) => `W${isoWeek(s.startTime)}`));
    productivity = { label: "Semana más productiva", value: top?.[0] ?? "—", sub: top ? fmtH(top[1]) : "" };
  } else if (period === "year") {
    const top = topEntry(groupByKey(inRange, (s) => s.startTime.getMonth()));
    productivity = { label: "Mes más productivo", value: top !== null ? MONTHS_SHORT[top[0]] : "—", sub: top ? fmtH(top[1]) : "" };
  } else {
    productivity = { label: "Día más productivo", value: topDayLabel, sub: fmtH(topDay?.[1] ?? 0) };
  }

  const streak: PeriodInsightData = (period === "today" || period === "week")
    ? { label: "Racha actual",    value: streakStr(current), sub: "consecutivos" }
    : { label: "Racha más larga", value: streakStr(best),    sub: period === "custom" ? "en el período" : "consecutivos" };

  const clientInsight: PeriodInsightData = {
    label: period === "today" ? "Cliente del día" : "Cliente top",
    value: topClientName,
    sub:   topClientHours > 0 ? `${fmtH(topClientHours)} ${PERIOD_SUFFIX[period]}` : "Sin actividad",
  };

  const daysInsight: PeriodInsightData = period === "today"
    ? { label: "Sesiones hoy",    value: String(inRange.length), sub: "registradas" }
    : { label: "Días trabajados", value: `${activeDays} de ${rangeDays}`, sub: PERIOD_SUFFIX[period] };

  return [productivity, streak, clientInsight, daysInsight];
}

// ─── calcDistribution ─────────────────────────────────────────────────────────

/** Agrupa sesiones por proyecto/cliente/tarea, ordena desc, máx. 6 items. */
export function calcDistribution(
  sessions: Session[],
  tasks: Task[],
  projects: Project[],
  clients: Client[],
  range: PeriodRange
): DistribData {
  const inRange = filterSessionsByDateRange(sessions, range.from, range.to);

  const taskOf    = (id: string) => tasks.find((t) => t.id === id);
  const projectOf = (id: string) => projects.find((p) => p.id === id);

  const byProject = groupByKey(inRange, (s) => taskOf(s.taskId)?.projectId ?? null);
  const byClient  = groupByKey(inRange, (s) => projectOf(taskOf(s.taskId)?.projectId ?? "")?.clientId ?? null);
  const byTask    = groupByKey(inRange, (s) => s.taskId);

  // Proyectos por cliente (para el subtitle de clientes)
  const projPerClient = new Map<string, Set<string>>();
  for (const s of inRange) {
    const p = projectOf(taskOf(s.taskId)?.projectId ?? "");
    if (p) {
      if (!projPerClient.has(p.clientId)) projPerClient.set(p.clientId, new Set());
      projPerClient.get(p.clientId)!.add(p.id);
    }
  }

  const toItems = (
    map: Map<string, number>,
    name: (id: string) => string,
    sub: (id: string) => string
  ): DistribItem[] =>
    [...map.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([id, h]) => ({
        id,
        name:  name(id),
        sub:   sub(id),
        hours: Math.round(h * 10) / 10,
        color: getEntityColor(id),
      }));

  return {
    projects: toItems(byProject,
      (id) => projectOf(id)?.name ?? id,
      (id) => clients.find((c) => c.id === projectOf(id)?.clientId)?.name ?? ""
    ),
    clients: toItems(byClient,
      (id) => clients.find((c) => c.id === id)?.name ?? id,
      (id) => { const n = projPerClient.get(id)?.size ?? 0; return `${n} proyecto${n !== 1 ? "s" : ""}`; }
    ),
    tasks: toItems(byTask,
      (id) => taskOf(id)?.name ?? id,
      (id) => projectOf(taskOf(id)?.projectId ?? "")?.name ?? ""
    ),
  };
}

// ─── calcHeatmapData ──────────────────────────────────────────────────────────

/** 365 días del año con horas reales de sesiones y nivel de intensidad (0–4). */
export function calcHeatmapData(sessions: Session[], year: number): HeatmapDay[] {
  const byDay = groupByKey(
    sessions.filter((s) => s.startTime.getFullYear() === year),
    (s) => dayKey(s.startTime)
  );
  const result: HeatmapDay[] = [];
  for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
    const date  = new Date(d).toISOString().slice(0, 10);
    const hours = Math.round((byDay.get(date) ?? 0) * 10) / 10;
    const level = (hours === 0 ? 0 : hours < 2 ? 1 : hours < 4 ? 2 : hours < 6 ? 3 : 4) as HeatmapDay["level"];
    result.push({ date, hours, level });
  }
  return result;
}

/** Agrupa HeatmapDay[] en columnas semanales (7 días por columna). */
export function organizeHeatmapByWeeks(data: HeatmapDay[]): (HeatmapDay & { isEmpty?: boolean })[][] {
  if (!data.length) return [];
  const empty = { date: "", hours: 0, level: 0 as const, isEmpty: true };
  const weeks: (HeatmapDay & { isEmpty?: boolean })[][] = [];
  let week: (HeatmapDay & { isEmpty?: boolean })[] = Array(new Date(data[0].date).getDay()).fill(empty);
  for (const day of data) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(empty)]);
  return weeks;
}

// ─── calcRecentSessions ───────────────────────────────────────────────────────

/** Sesiones del período enriquecidas con nombres, ordenadas desc, con límite. */
export function calcRecentSessions(
  sessions: Session[],
  tasks: Task[],
  projects: Project[],
  clients: Client[],
  range: PeriodRange,
  limit = 20
): RecentSession[] {
  return filterSessionsByDateRange(sessions, range.from, range.to)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
    .slice(0, limit)
    .map((s) => {
      const task    = tasks.find((t) => t.id === s.taskId);
      const project = projects.find((p) => p.id === task?.projectId);
      const client  = clients.find((c) => c.id === project?.clientId);
      const hh = s.startTime.getHours().toString().padStart(2, "0");
      const mm = s.startTime.getMinutes().toString().padStart(2, "0");
      return {
        id:       s.id,
        date:     formatSessionDate(s.startTime),
        time:     `${hh}:${mm}`,
        task:     task?.name    ?? "Tarea eliminada",
        project:  project?.name ?? "Proyecto eliminado",
        client:   client?.name  ?? "Cliente eliminado",
        duration: formatDuration(s.duration),
      };
    });
}
