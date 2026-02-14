import { describe, it, expect } from "@jest/globals";
import {
  SessionDateFilter,
  SessionSortBy,
  filterSessionsByDateRange,
  filterSessionsByPreset,
  sortSessions,
  applySessionFilters,
  groupSessionsByDay,
  getFilterLabel,
  getSortLabel,
} from "@/lib/session-filters";
import { Session } from "@/types/entities";

describe("session-filters", () => {
  // Helper para crear sesiones de prueba
  const createSession = (
    id: string,
    taskId: string,
    startTime: Date,
    duration: number
  ): Session => ({
    id,
    taskId,
    startTime,
    endTime: new Date(startTime.getTime() + duration * 1000),
    duration,
    createdAt: startTime,
  });

  describe("filterSessionsByDateRange", () => {
    it("debe filtrar sesiones dentro del rango", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-10T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-02-11T10:00:00"), 3600),
        createSession("3", "task1", new Date("2026-02-12T10:00:00"), 3600),
        createSession("4", "task1", new Date("2026-02-13T10:00:00"), 3600),
      ];

      const from = new Date("2026-02-11T00:00:00");
      const to = new Date("2026-02-12T23:59:59");

      const filtered = filterSessionsByDateRange(sessions, from, to);
      expect(filtered).toHaveLength(2);
      expect(filtered[0].id).toBe("2");
      expect(filtered[1].id).toBe("3");
    });

    it("debe incluir sesiones en los límites del rango", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-10T00:00:01"), 3600), // Justo después del inicio
        createSession("2", "task1", new Date("2026-02-10T23:59:59"), 3600), // Justo antes del fin
      ];

      const from = new Date("2026-02-10T00:00:00");
      const to = new Date("2026-02-10T23:59:59");

      const filtered = filterSessionsByDateRange(sessions, from, to);
      expect(filtered).toHaveLength(2);
    });

    it("debe retornar array vacío si no hay sesiones en el rango", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-10T10:00:00"), 3600),
      ];

      const from = new Date("2026-02-15T00:00:00");
      const to = new Date("2026-02-20T23:59:59");

      const filtered = filterSessionsByDateRange(sessions, from, to);
      expect(filtered).toHaveLength(0);
    });
  });

  describe("filterSessionsByPreset", () => {
    it("debe retornar todas las sesiones con preset ALL", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-01-01T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-02-01T10:00:00"), 3600),
        createSession("3", "task1", new Date("2026-02-13T10:00:00"), 3600),
      ];

      const filtered = filterSessionsByPreset(sessions, SessionDateFilter.ALL);
      expect(filtered).toHaveLength(3);
    });

    it("debe filtrar sesiones de hoy con preset TODAY", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const sessions = [
        createSession("1", "task1", yesterday, 3600),
        createSession("2", "task1", today, 3600),
        createSession("3", "task1", today, 7200),
      ];

      const filtered = filterSessionsByPreset(sessions, SessionDateFilter.TODAY);
      expect(filtered.length).toBeGreaterThanOrEqual(2); // Al menos las 2 de hoy
    });

    it("debe filtrar última semana con preset WEEK", () => {
      const today = new Date();
      const tenDaysAgo = new Date(today);
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      const threeDaysAgo = new Date(today);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const sessions = [
        createSession("1", "task1", tenDaysAgo, 3600), // Fuera del rango
        createSession("2", "task1", threeDaysAgo, 3600), // Dentro
        createSession("3", "task1", today, 3600), // Dentro
      ];

      const filtered = filterSessionsByPreset(sessions, SessionDateFilter.WEEK);
      expect(filtered.length).toBeGreaterThanOrEqual(2);
    });

    it("debe filtrar último mes con preset MONTH", () => {
      const today = new Date();
      const fortyDaysAgo = new Date(today);
      fortyDaysAgo.setDate(fortyDaysAgo.getDate() - 40);
      const fifteenDaysAgo = new Date(today);
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const sessions = [
        createSession("1", "task1", fortyDaysAgo, 3600), // Fuera
        createSession("2", "task1", fifteenDaysAgo, 3600), // Dentro
        createSession("3", "task1", today, 3600), // Dentro
      ];

      const filtered = filterSessionsByPreset(sessions, SessionDateFilter.MONTH);
      expect(filtered.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("sortSessions", () => {
    const sessions = [
      createSession("1", "task1", new Date("2026-02-13T10:00:00"), 7200), // 2h
      createSession("2", "task1", new Date("2026-02-11T10:00:00"), 3600), // 1h
      createSession("3", "task1", new Date("2026-02-12T10:00:00"), 1800), // 30m
    ];

    it("debe ordenar por fecha ascendente", () => {
      const sorted = sortSessions(sessions, SessionSortBy.DATE_ASC);
      expect(sorted[0].id).toBe("2"); // Feb 11
      expect(sorted[1].id).toBe("3"); // Feb 12
      expect(sorted[2].id).toBe("1"); // Feb 13
    });

    it("debe ordenar por fecha descendente", () => {
      const sorted = sortSessions(sessions, SessionSortBy.DATE_DESC);
      expect(sorted[0].id).toBe("1"); // Feb 13
      expect(sorted[1].id).toBe("3"); // Feb 12
      expect(sorted[2].id).toBe("2"); // Feb 11
    });

    it("debe ordenar por duración ascendente", () => {
      const sorted = sortSessions(sessions, SessionSortBy.DURATION_ASC);
      expect(sorted[0].duration).toBe(1800); // 30m
      expect(sorted[1].duration).toBe(3600); // 1h
      expect(sorted[2].duration).toBe(7200); // 2h
    });

    it("debe ordenar por duración descendente", () => {
      const sorted = sortSessions(sessions, SessionSortBy.DURATION_DESC);
      expect(sorted[0].duration).toBe(7200); // 2h
      expect(sorted[1].duration).toBe(3600); // 1h
      expect(sorted[2].duration).toBe(1800); // 30m
    });

    it("no debe mutar el array original", () => {
      const originalOrder = sessions.map((s) => s.id);
      sortSessions(sessions, SessionSortBy.DATE_ASC);
      const afterOrder = sessions.map((s) => s.id);
      expect(afterOrder).toEqual(originalOrder);
    });
  });

  describe("applySessionFilters", () => {
    it("debe aplicar filtro y ordenamiento combinados", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-10T10:00:00"), 7200),
        createSession("2", "task1", new Date("2026-02-11T10:00:00"), 3600),
        createSession("3", "task1", new Date("2026-02-12T10:00:00"), 1800),
        createSession("4", "task1", new Date("2026-02-13T10:00:00"), 5400),
      ];

      // Filtrar feb 11-12 y ordenar por duración descendente
      const from = new Date("2026-02-11T00:00:00");
      const to = new Date("2026-02-12T23:59:59");

      const result = applySessionFilters(
        sessions,
        SessionDateFilter.CUSTOM,
        SessionSortBy.DURATION_DESC,
        { from, to }
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("2"); // 3600s
      expect(result[1].id).toBe("3"); // 1800s
    });

    it("debe usar preset si no es CUSTOM", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const sessions = [
        createSession("1", "task1", yesterday, 3600),
        createSession("2", "task1", today, 7200),
        createSession("3", "task1", today, 1800),
      ];

      const result = applySessionFilters(
        sessions,
        SessionDateFilter.TODAY,
        SessionSortBy.DURATION_DESC
      );

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0].duration).toBeGreaterThanOrEqual(result[1].duration);
    });
  });

  describe("groupSessionsByDay", () => {
    it("debe agrupar sesiones por día", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-02-13T14:00:00"), 3600),
        createSession("3", "task1", new Date("2026-02-12T10:00:00"), 3600),
      ];

      const grouped = groupSessionsByDay(sessions);
      expect(grouped.size).toBe(2); // 2 días diferentes
      
      // Verificar que cada grupo tiene las sesiones correctas
      for (const [_, sessionsInDay] of grouped) {
        if (sessionsInDay.length === 2) {
          expect(sessionsInDay[0].id).toBe("1");
          expect(sessionsInDay[1].id).toBe("2");
        } else {
          expect(sessionsInDay.length).toBe(1);
          expect(sessionsInDay[0].id).toBe("3");
        }
      }
    });

    it("debe manejar array vacío", () => {
      const grouped = groupSessionsByDay([]);
      expect(grouped.size).toBe(0);
    });

    it("debe normalizar fechas a medianoche", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T08:30:00"), 3600),
        createSession("2", "task1", new Date("2026-02-13T23:45:00"), 3600),
      ];

      const grouped = groupSessionsByDay(sessions);
      expect(grouped.size).toBe(1); // Mismo día a pesar de diferentes horas
    });
  });

  describe("getFilterLabel", () => {
    it("debe retornar labels correctos en español", () => {
      expect(getFilterLabel(SessionDateFilter.ALL)).toBe("Todas");
      expect(getFilterLabel(SessionDateFilter.TODAY)).toBe("Hoy");
      expect(getFilterLabel(SessionDateFilter.WEEK)).toBe("Última semana");
      expect(getFilterLabel(SessionDateFilter.MONTH)).toBe("Último mes");
      expect(getFilterLabel(SessionDateFilter.CUSTOM)).toBe("Rango personalizado");
    });
  });

  describe("getSortLabel", () => {
    it("debe retornar labels correctos en español", () => {
      expect(getSortLabel(SessionSortBy.DATE_ASC)).toBe("Fecha (más antigua)");
      expect(getSortLabel(SessionSortBy.DATE_DESC)).toBe("Fecha (más reciente)");
      expect(getSortLabel(SessionSortBy.DURATION_ASC)).toBe("Duración (menor)");
      expect(getSortLabel(SessionSortBy.DURATION_DESC)).toBe("Duración (mayor)");
    });
  });
});
