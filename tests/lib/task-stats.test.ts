import { describe, it, expect } from "@jest/globals";
import {
  getTaskDetailStats,
  calculateStreaks,
  getUniqueDays,
  type TaskDetailStats,
} from "@/lib/task-stats";
import { Session } from "@/types/entities";

describe("task-stats", () => {
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

  describe("getUniqueDays", () => {
    it("debe retornar 0 para array vacío", () => {
      expect(getUniqueDays([])).toBe(0);
    });

    it("debe contar 1 día para sesiones en el mismo día", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-02-13T14:00:00"), 3600),
        createSession("3", "task1", new Date("2026-02-13T18:00:00"), 3600),
      ];
      expect(getUniqueDays(sessions)).toBe(1);
    });

    it("debe contar días únicos correctamente", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-02-12T10:00:00"), 3600),
        createSession("3", "task1", new Date("2026-02-11T10:00:00"), 3600),
        createSession("4", "task1", new Date("2026-02-11T15:00:00"), 3600), // Mismo día que #3
      ];
      expect(getUniqueDays(sessions)).toBe(3);
    });
  });

  describe("calculateStreaks", () => {
    it("debe retornar 0 para array vacío", () => {
      const result = calculateStreaks([]);
      expect(result.currentStreak).toBe(0);
      expect(result.bestStreak).toBe(0);
    });

    it("debe calcular racha actual desde hoy", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const sessions = [
        createSession("1", "task1", today, 3600),
        createSession("2", "task1", yesterday, 3600),
        createSession("3", "task1", twoDaysAgo, 3600),
      ];

      const result = calculateStreaks(sessions);
      expect(result.currentStreak).toBe(3);
      expect(result.bestStreak).toBe(3);
    });

    it("debe detectar racha rota", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
      const sixDaysAgo = new Date(today);
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);

      const sessions = [
        createSession("1", "task1", today, 3600),
        createSession("2", "task1", yesterday, 3600),
        // Gap de 3 días
        createSession("3", "task1", fiveDaysAgo, 3600),
        createSession("4", "task1", sixDaysAgo, 3600),
      ];

      const result = calculateStreaks(sessions);
      expect(result.currentStreak).toBe(2); // Solo hoy y ayer
      expect(result.bestStreak).toBe(2); // Ambas rachas son de 2 días
    });

    it("debe calcular mejor racha correctamente", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-02-11T10:00:00"), 3600), // Gap
        createSession("3", "task1", new Date("2026-02-10T10:00:00"), 3600),
        createSession("4", "task1", new Date("2026-02-09T10:00:00"), 3600),
        createSession("5", "task1", new Date("2026-02-08T10:00:00"), 3600),
        createSession("6", "task1", new Date("2026-02-07T10:00:00"), 3600),
      ];

      const result = calculateStreaks(sessions);
      expect(result.bestStreak).toBe(5); // 7-11 feb (5 días consecutivos)
    });

    it("debe manejar racha de 1 día", () => {
      // Usar fechas claramente en el pasado
      const sessions = [
        createSession("1", "task1", new Date("2026-01-15T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-01-10T10:00:00"), 3600),
        createSession("3", "task1", new Date("2026-01-07T10:00:00"), 3600),
      ];

      const result = calculateStreaks(sessions);
      expect(result.currentStreak).toBe(0); // Ninguna sesión reciente
      expect(result.bestStreak).toBe(1); // Ningún día es consecutivo
    });
  });

  describe("getTaskDetailStats", () => {
    it("debe retornar estadísticas vacías para array vacío", () => {
      const stats = getTaskDetailStats("task1", []);
      
      expect(stats.totalDuration).toBe(0);
      expect(stats.sessionCount).toBe(0);
      expect(stats.averageDuration).toBe(0);
      expect(stats.longestSession).toBeNull();
      expect(stats.shortestSession).toBeNull();
      expect(stats.currentStreak).toBe(0);
      expect(stats.bestStreak).toBe(0);
      expect(stats.daysWorked).toBe(0);
      expect(stats.lastSession).toBeNull();
    });

    it("debe filtrar sesiones por taskId", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T10:00:00"), 3600),
        createSession("2", "task2", new Date("2026-02-13T11:00:00"), 7200),
        createSession("3", "task1", new Date("2026-02-13T12:00:00"), 1800),
      ];

      const stats = getTaskDetailStats("task1", sessions);
      expect(stats.sessionCount).toBe(2);
      expect(stats.totalDuration).toBe(5400); // 3600 + 1800
    });

    it("debe calcular todas las métricas correctamente", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T10:00:00"), 3600), // 1h
        createSession("2", "task1", new Date("2026-02-12T10:00:00"), 7200), // 2h
        createSession("3", "task1", new Date("2026-02-11T10:00:00"), 1800), // 30m
      ];

      const stats = getTaskDetailStats("task1", sessions);

      expect(stats.sessionCount).toBe(3);
      expect(stats.totalDuration).toBe(12600); // 3.5h en segundos
      expect(stats.totalDurationFormatted).toBe("3h 30m");
      expect(stats.averageDuration).toBe(4200); // 1h 10m
      expect(stats.longestSession?.duration).toBe(7200);
      expect(stats.longestSession?.durationFormatted).toBe("2h");
      expect(stats.shortestSession?.duration).toBe(1800);
      expect(stats.shortestSession?.durationFormatted).toBe("30m");
      expect(stats.daysWorked).toBe(3);
      expect(stats.lastSession?.duration).toBe(3600);
    });

    it("debe identificar la última sesión correctamente", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-10T10:00:00"), 3600),
        createSession("2", "task1", new Date("2026-02-13T10:00:00"), 7200), // Más reciente
        createSession("3", "task1", new Date("2026-02-11T10:00:00"), 1800),
      ];

      const stats = getTaskDetailStats("task1", sessions);
      
      expect(stats.lastSession?.duration).toBe(7200);
      expect(stats.lastSession?.date).toEqual(new Date("2026-02-13T10:00:00"));
    });

    it("debe manejar una sola sesión", () => {
      const sessions = [
        createSession("1", "task1", new Date("2026-02-13T10:00:00"), 3600),
      ];

      const stats = getTaskDetailStats("task1", sessions);

      expect(stats.sessionCount).toBe(1);
      expect(stats.totalDuration).toBe(3600);
      expect(stats.averageDuration).toBe(3600);
      expect(stats.longestSession?.duration).toBe(3600);
      expect(stats.shortestSession?.duration).toBe(3600);
      expect(stats.daysWorked).toBe(1);
    });

    it("debe calcular rachas en contexto completo", () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const sessions = [
        createSession("1", "task1", today, 3600),
        createSession("2", "task1", yesterday, 3600),
        createSession("3", "task1", twoDaysAgo, 3600),
      ];

      const stats = getTaskDetailStats("task1", sessions);

      expect(stats.currentStreak).toBe(3);
      expect(stats.bestStreak).toBe(3);
      expect(stats.daysWorked).toBe(3);
    });
  });
});
