import {
  getEntityColor,
  getPeriodRange,
  formatSessionDate,
  calcGlobalStreak,
  calcPeriodMetrics,
  calcPeriodInsights,
  calcDistribution,
  calcHeatmapData,
  calcRecentSessions,
} from "@/lib/stats-calculator";
import type { Session, Task, Project, Client } from "@/types";

// ─── Helpers para crear fixtures ──────────────────────────────────────────────

function makeSession(
  id: string,
  taskId: string,
  startTime: Date,
  durationSeconds: number
): Session {
  return {
    id,
    taskId,
    startTime,
    endTime:   new Date(startTime.getTime() + durationSeconds * 1000),
    duration:  durationSeconds,
    notes:     "",
    createdAt: startTime,
  };
}

function makeTask(id: string, name: string, projectId: string): Task {
  return { id, name, projectId, isCompleted: false, isArchived: false };
}

function makeProject(id: string, name: string, clientId: string): Project {
  return { id, name, clientId, color: "#000", isArchived: false };
}

function makeClient(id: string, name: string): Client {
  return { id, name, color: "#000", isArchived: false };
}

// Fecha fija para tests: miércoles 11 Feb 2026
const DAY = (offset: number) => new Date(2026, 1, 11 + offset, 10, 0, 0);

// ─── getEntityColor ───────────────────────────────────────────────────────────

describe("getEntityColor", () => {
  it("devuelve una clase Tailwind bg-*", () => {
    expect(getEntityColor("abc")).toMatch(/^bg-/);
  });

  it("el mismo id siempre devuelve el mismo color", () => {
    expect(getEntityColor("proj-1")).toBe(getEntityColor("proj-1"));
  });

  it("ids distintos pueden producir colores distintos (no siempre iguales)", () => {
    const colors = ["id-1", "id-2", "id-3", "id-4", "id-5"].map(getEntityColor);
    const unique = new Set(colors);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ─── getPeriodRange ───────────────────────────────────────────────────────────

describe("getPeriodRange", () => {
  it("today: from y to son el mismo día", () => {
    const { from, to } = getPeriodRange("today");
    expect(from.toDateString()).toBe(to.toDateString());
  });

  it("week: from es lunes y to es domingo", () => {
    const { from, to } = getPeriodRange("week");
    expect(from.getDay()).toBe(1); // lunes
    expect(to.getDay()).toBe(0);   // domingo
  });

  it("week: abarca exactamente 7 días (lun a dom inclusive)", () => {
    const { from, to } = getPeriodRange("week");
    // lunes 00:00 → domingo 23:59 = 7 días del calendario
    const diff = Math.round((to.getTime() - from.getTime()) / 86_400_000);
    expect(diff).toBe(7);
    expect(from.getHours()).toBe(0);
    expect(to.getHours()).toBe(23);
  });

  it("month: from es día 1 y to es el último día del mes", () => {
    const { from, to } = getPeriodRange("month");
    expect(from.getDate()).toBe(1);
    expect(to.getDate()).toBe(new Date(to.getFullYear(), to.getMonth() + 1, 0).getDate());
  });

  it("year: from es 1 ene y to es 31 dic", () => {
    const { from, to } = getPeriodRange("year");
    expect(from.getMonth()).toBe(0);
    expect(from.getDate()).toBe(1);
    expect(to.getMonth()).toBe(11);
    expect(to.getDate()).toBe(31);
  });
});

// ─── formatSessionDate ────────────────────────────────────────────────────────

describe("formatSessionDate", () => {
  const now = new Date();

  it('devuelve "Hoy" para la fecha actual', () => {
    expect(formatSessionDate(now)).toBe("Hoy");
  });

  it('devuelve "Ayer" para ayer', () => {
    const ayer = new Date(now);
    ayer.setDate(now.getDate() - 1);
    expect(formatSessionDate(ayer)).toBe("Ayer");
  });

  it("devuelve formato corto para menos de 7 días", () => {
    const hace3 = new Date(now);
    hace3.setDate(now.getDate() - 3);
    const result = formatSessionDate(hace3);
    // Debe contener el día del mes y el mes abreviado, pero no el año
    expect(result).not.toContain(String(hace3.getFullYear()));
    expect(result.length).toBeGreaterThan(3);
  });

  it("devuelve formato largo con año para más de 7 días", () => {
    const hace10 = new Date(now);
    hace10.setDate(now.getDate() - 10);
    expect(formatSessionDate(hace10)).toContain(String(hace10.getFullYear()));
  });
});

// ─── calcGlobalStreak ─────────────────────────────────────────────────────────

describe("calcGlobalStreak", () => {
  it("devuelve { current: 0, best: 0 } con sesiones vacías", () => {
    expect(calcGlobalStreak([])).toEqual({ current: 0, best: 0 });
  });

  it("racha de 1 con una sola sesión hoy", () => {
    const session = makeSession("s1", "t1", new Date(), 3600);
    const { current } = calcGlobalStreak([session]);
    expect(current).toBe(1);
  });

  it("calcula correctamente la mejor racha", () => {
    const sessions = [
      makeSession("s1", "t1", DAY(0), 3600),
      makeSession("s2", "t1", DAY(-1), 3600),
      makeSession("s3", "t1", DAY(-2), 3600),
      makeSession("s4", "t1", DAY(-5), 3600), // rompe la racha
    ];
    const { best } = calcGlobalStreak(sessions);
    expect(best).toBe(3);
  });

  it("no cuenta días sin sesión en la racha", () => {
    const now = new Date();
    const today  = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);
    const hace2  = new Date(today); hace2.setDate(today.getDate() - 2); // hueco de 1 día
    const sessions = [
      makeSession("s1", "t1", today, 3600),
      makeSession("s2", "t1", hace2, 3600),
    ];
    const { current } = calcGlobalStreak(sessions);
    expect(current).toBe(1); // racha rota, solo cuenta hoy
  });
});

// ─── calcPeriodMetrics ────────────────────────────────────────────────────────

describe("calcPeriodMetrics", () => {
  const range = { from: DAY(-6), to: DAY(0) };
  const sessions = [
    makeSession("s1", "t1", DAY(0),  7200),  // 2h hoy
    makeSession("s2", "t1", DAY(-1), 3600),  // 1h ayer
    makeSession("s3", "t1", DAY(-3), 5400),  // 1.5h hace 3 días
  ];

  it("devuelve 4 métricas", () => {
    expect(calcPeriodMetrics(sessions, "week", range)).toHaveLength(4);
  });

  it("con 0 sesiones devuelve valores '0h' sin errores", () => {
    const metrics = calcPeriodMetrics([], "month", range);
    expect(metrics).toHaveLength(4);
    expect(metrics[0].value).toBe("0h");
  });

  it("suma correctamente las horas del período", () => {
    const metrics = calcPeriodMetrics(sessions, "week", range);
    // 2h + 1h + 1.5h = 4.5h → "4.5h"
    expect(metrics[0].value).toBe("4.5h");
  });

  it("cuenta correctamente las sesiones en period=week", () => {
    const metrics = calcPeriodMetrics(sessions, "week", range);
    const sesionesMetric = metrics.find((m) => m.label === "Sesiones");
    expect(sesionesMetric?.value).toBe("3");
  });
});

// ─── calcDistribution ────────────────────────────────────────────────────────

describe("calcDistribution", () => {
  const client  = makeClient("c1", "ClienteA");
  const project = makeProject("p1", "ProyectoA", "c1");
  const task    = makeTask("t1", "TareaA", "p1");

  const range = { from: DAY(-7), to: DAY(0) };
  const sessions = [
    makeSession("s1", "t1", DAY(0),  7200),
    makeSession("s2", "t1", DAY(-1), 3600),
  ];

  it("devuelve arrays vacíos con 0 sesiones", () => {
    const result = calcDistribution([], [task], [project], [client], range);
    expect(result.projects).toHaveLength(0);
    expect(result.clients).toHaveLength(0);
    expect(result.tasks).toHaveLength(0);
  });

  it("agrupa correctamente por proyecto", () => {
    const result = calcDistribution(sessions, [task], [project], [client], range);
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].name).toBe("ProyectoA");
    expect(result.projects[0].hours).toBe(3); // 2h + 1h
  });

  it("agrupa correctamente por cliente", () => {
    const result = calcDistribution(sessions, [task], [project], [client], range);
    expect(result.clients[0].name).toBe("ClienteA");
  });

  it("agrupa correctamente por tarea", () => {
    const result = calcDistribution(sessions, [task], [project], [client], range);
    expect(result.tasks[0].name).toBe("TareaA");
  });

  it("ordena por horas descendente y limita a 6", () => {
    const tasks = Array.from({ length: 8 }, (_, i) =>
      makeTask(`t${i}`, `Tarea ${i}`, "p1")
    );
    const manySessions = tasks.map((t, i) =>
      makeSession(`s${i}`, t.id, DAY(-i), (i + 1) * 3600)
    );
    const result = calcDistribution(manySessions, tasks, [project], [client], range);
    expect(result.tasks.length).toBeLessThanOrEqual(6);
    // ordenadas desc
    for (let i = 1; i < result.tasks.length; i++) {
      expect(result.tasks[i - 1].hours).toBeGreaterThanOrEqual(result.tasks[i].hours);
    }
  });
});

// ─── calcHeatmapData ──────────────────────────────────────────────────────────

describe("calcHeatmapData", () => {
  it("genera 365 días para un año no bisiesto", () => {
    expect(calcHeatmapData([], 2025)).toHaveLength(365);
  });

  it("genera 366 días para un año bisiesto", () => {
    expect(calcHeatmapData([], 2024)).toHaveLength(366);
  });

  it("nivel 0 sin sesiones", () => {
    const days = calcHeatmapData([], 2026);
    expect(days.every((d) => d.level === 0)).toBe(true);
  });

  it("asigna horas y nivel correctamente", () => {
    const session = makeSession("s1", "t1", new Date(2026, 1, 11, 10, 0, 0), 3 * 3600); // 3h → nivel 2
    const days = calcHeatmapData([session], 2026);
    const day = days.find((d) => d.date === "2026-02-11");
    expect(day?.hours).toBe(3);
    expect(day?.level).toBe(2);
  });

  it("nivel 4 con 6h o más", () => {
    const session = makeSession("s1", "t1", new Date(2026, 1, 11, 9, 0, 0), 7 * 3600); // 7h
    const days = calcHeatmapData([session], 2026);
    const day = days.find((d) => d.date === "2026-02-11");
    expect(day?.level).toBe(4);
  });
});

// ─── calcRecentSessions ───────────────────────────────────────────────────────

describe("calcRecentSessions", () => {
  const client  = makeClient("c1", "ClienteA");
  const project = makeProject("p1", "ProyectoA", "c1");
  const task    = makeTask("t1", "TareaA", "p1");
  const range   = { from: DAY(-7), to: DAY(0) };

  it("devuelve array vacío sin sesiones", () => {
    expect(calcRecentSessions([], [task], [project], [client], range)).toHaveLength(0);
  });

  it("enriquece con nombre de tarea, proyecto y cliente", () => {
    const session = makeSession("s1", "t1", DAY(0), 3600);
    const result = calcRecentSessions([session], [task], [project], [client], range);
    expect(result[0].task).toBe("TareaA");
    expect(result[0].project).toBe("ProyectoA");
    expect(result[0].client).toBe("ClienteA");
  });

  it('usa fallback "Tarea eliminada" si no existe la tarea', () => {
    const session = makeSession("s1", "inexistente", DAY(0), 3600);
    const result = calcRecentSessions([session], [], [], [], range);
    expect(result[0].task).toBe("Tarea eliminada");
  });

  it("ordena por fecha descendente", () => {
    const sessions = [
      makeSession("s1", "t1", DAY(-2), 3600),
      makeSession("s2", "t1", DAY(0),  3600),
      makeSession("s3", "t1", DAY(-1), 3600),
    ];
    const result = calcRecentSessions(sessions, [task], [project], [client], range);
    expect(result[0].id).toBe("s2");
    expect(result[1].id).toBe("s3");
    expect(result[2].id).toBe("s1");
  });

  it("aplica el límite correctamente", () => {
    const sessions = Array.from({ length: 10 }, (_, i) =>
      makeSession(`s${i}`, "t1", DAY(-i), 3600)
    );
    const result = calcRecentSessions(sessions, [task], [project], [client], range, 5);
    expect(result).toHaveLength(5);
  });
});

// ─── calcPeriodInsights ───────────────────────────────────────────────────────

describe("calcPeriodInsights", () => {
  const client  = makeClient("c1", "ClienteA");
  const project = makeProject("p1", "ProyectoA", "c1");
  const task    = makeTask("t1", "TareaA", "p1");
  const range   = { from: DAY(-6), to: DAY(0) };

  it("siempre devuelve exactamente 4 insights", () => {
    const result = calcPeriodInsights([], [], [], [], "week", range);
    expect(result).toHaveLength(4);
  });

  it("con 0 sesiones no lanza errores", () => {
    expect(() =>
      calcPeriodInsights([], [task], [project], [client], "month", range)
    ).not.toThrow();
  });

  it("identifica el cliente top correctamente", () => {
    const sessions = [
      makeSession("s1", "t1", DAY(0),  7200),
      makeSession("s2", "t1", DAY(-1), 3600),
    ];
    const result = calcPeriodInsights(sessions, [task], [project], [client], "week", range);
    const clientInsight = result.find((r) => r.label.toLowerCase().includes("cliente"));
    expect(clientInsight?.value).toBe("ClienteA");
  });
});
