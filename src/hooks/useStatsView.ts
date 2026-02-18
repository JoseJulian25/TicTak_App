import { useMemo, useState } from "react";

import { useSessionStore }  from "@/stores/useSessionStore";
import { useTaskStore }     from "@/stores/useTaskStore";
import { useProjectStore }  from "@/stores/useProjectStore";
import { useClientStore }   from "@/stores/useClientStore";

import {
  getPeriodRange,
  calcPeriodMetrics,
  calcPeriodInsights,
  calcDistribution,
  calcHeatmapData,
  organizeHeatmapByWeeks,
  calcRecentSessions,
} from "@/lib/stats-calculator";

import type {
  Period,
  DistribTab,
  PeriodRange,
  PeriodMetric,
  PeriodInsightData,
  DistribData,
  DistribItem,
  RecentSession,
  HeatmapDay,
} from "@/types";


export interface StatsViewState {
  // UI state
  period:         Period;
  setPeriod:      (p: Period) => void;
  distribTab:     DistribTab;
  setDistribTab:  (t: DistribTab) => void;
  year:           number;
  setYear:        (y: number) => void;
  customFrom:     string;
  setCustomFrom:  (d: string) => void;
  customTo:       string;
  setCustomTo:    (d: string) => void;
  currentYear:    number;

  // Calculated data
  metrics:          PeriodMetric[];
  insights:         PeriodInsightData[];
  distribItems:     DistribItem[];
  totalDistribHours: number;
  maxDistribHours:  number;
  recentSessions:   RecentSession[];
  heatmapDays:      HeatmapDay[];
  heatmapWeeks:     (HeatmapDay & { isEmpty?: boolean })[][];
  totalYearHours:   number;
}

// Hook para calcular todos los datos necesarios para la vista de estadísticas (StatsView)
export function useStatsView(): StatsViewState {
  const currentYear = new Date().getFullYear();

  //UI state
  const [period,      setPeriod]      = useState<Period>("month");
  const [distribTab,  setDistribTab]  = useState<DistribTab>("projects");
  const [year,        setYear]        = useState(currentYear);
  const [customFrom,  setCustomFrom]  = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().slice(0, 10);
  });
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().slice(0, 10));

  // Store data
  const sessions = useSessionStore((s) => s.sessions);
  const tasks    = useTaskStore((s) => s.tasks);
  const projects = useProjectStore((s) => s.projects);
  const clients  = useClientStore((s) => s.clients);

  // Cálculos
  const activeRange = useMemo<PeriodRange>(() => {
    if (period === "custom") {
      return {
        from: new Date(customFrom + "T00:00:00"),
        to:   new Date(customTo   + "T23:59:59"),
      };
    }
    return getPeriodRange(period);
  }, [period, customFrom, customTo]);

  const metrics = useMemo<PeriodMetric[]>(
    () => calcPeriodMetrics(sessions, period, activeRange),
    [sessions, period, activeRange]
  );

  const insights = useMemo<PeriodInsightData[]>(
    () => calcPeriodInsights(sessions, tasks, projects, clients, period, activeRange),
    [sessions, tasks, projects, clients, period, activeRange]
  );

  const distribData = useMemo<DistribData>(
    () => calcDistribution(sessions, tasks, projects, clients, activeRange),
    [sessions, tasks, projects, clients, activeRange]
  );

  const distribItems     = distribData[distribTab];
  const totalDistribHours = useMemo(
    () => distribItems.reduce((s, i) => s + i.hours, 0),
    [distribItems]
  );
  const maxDistribHours = useMemo(
    () => Math.max(0, ...distribItems.map((i) => i.hours)),
    [distribItems]
  );

  const recentSessions = useMemo<RecentSession[]>(
    () => calcRecentSessions(sessions, tasks, projects, clients, activeRange),
    [sessions, tasks, projects, clients, activeRange]
  );

  const heatmapDays = useMemo<HeatmapDay[]>(
    () => calcHeatmapData(sessions, year),
    [sessions, year]
  );

  const heatmapWeeks = useMemo(
    () => organizeHeatmapByWeeks(heatmapDays),
    [heatmapDays]
  );

  const totalYearHours = useMemo(
    () => Math.round(heatmapDays.reduce((s, d) => s + d.hours, 0) * 10) / 10,
    [heatmapDays]
  );


  return {
    // UI state
    period,      setPeriod,
    distribTab,  setDistribTab,
    year,        setYear,
    customFrom,  setCustomFrom,
    customTo,    setCustomTo,
    currentYear,

    // Calculated data
    metrics,
    insights,  
    distribItems,
    totalDistribHours,
    maxDistribHours,
    recentSessions,
    heatmapDays,
    heatmapWeeks,
    totalYearHours,
  };
}
