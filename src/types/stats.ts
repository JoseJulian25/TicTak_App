/**
 * Tipos del módulo de Estadísticas.
 * Usados por `stats-calculator.ts`, `useStatsView.ts` y `StatsView.tsx`.
 */

export type Period = "today" | "week" | "month" | "year" | "custom";
export type DistribTab = "projects" | "clients" | "tasks";

export interface PeriodRange {
  from: Date;
  to: Date;
}

export interface PeriodMetric {
  label: string;
  value: string;
  sub?: string;
}

export interface PeriodInsightData {
  label: string;
  value: string;
  sub: string;
}

export interface DistribItem {
  id: string;
  name: string;
  sub: string;
  hours: number;
  color: string;
}

export interface DistribData {
  projects: DistribItem[];
  clients: DistribItem[];
  tasks: DistribItem[];
}

export interface RecentSession {
  id: string;
  date: string;
  time: string;
  task: string;
  project: string;
  client: string;
  duration: string;
}

export interface HeatmapDay {
  date: string;
  hours: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface StreakResult {
  current: number;
  best: number;
}
