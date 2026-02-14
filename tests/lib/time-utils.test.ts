import { formatSecondsToHHMMSS, formatDuration, getDayStart, formatDurationShort, getTotalPausedTime, calculateElapsedTime } from '@/lib/time-utils';

describe('time-utils', () => {
  describe('formatSecondsToHHMMSS', () => {
    it('formatea 0 segundos correctamente', () => {
      expect(formatSecondsToHHMMSS(0)).toBe('00:00:00');
    });

    it('formatea segundos menores a 1 minuto', () => {
      expect(formatSecondsToHHMMSS(45)).toBe('00:00:45');
    });

    it('formatea 1 minuto y 5 segundos', () => {
      expect(formatSecondsToHHMMSS(65)).toBe('00:01:05');
    });

    it('formatea 1 hora, 1 minuto y 1 segundo', () => {
      expect(formatSecondsToHHMMSS(3661)).toBe('01:01:01');
    });

    it('formatea tiempos largos correctamente', () => {
      expect(formatSecondsToHHMMSS(86500)).toBe(''); // 24 horas
    });

  });
});

describe('formatDuration', () => {
  it('formatea 0 milisegundos correctamente', () => {
    expect(formatDuration(0)).toBe('0s');
  });

  it('formatea 2 horas y 15 minutos', () => {
    expect(formatDuration(8100)).toBe('2h 15m');
  });
});

describe('getDayStart', () => {
  it('devuelve el inicio del día para una fecha dada', () => {
    const date = new Date('2026-01-24T14:30:00');
    const dayStart = getDayStart(date);
    expect(dayStart.toISOString()).toBe('2026-01-24T00:00:00.000Z');
  });
});

describe('formatDurationShort', () => {
  it('formatea 1 hora y 15 minutos correctamente', () => {
    expect(formatDurationShort(4500)).toBe('1:15');
  });
});

// ========================================
// TESTS PARA CÁLCULO DE TIEMPO REAL
// ========================================

describe('getTotalPausedTime', () => {
  it('retorna 0 cuando no hay pausas', () => {
    expect(getTotalPausedTime([])).toBe(0);
  });

  it('calcula correctamente una pausa cerrada', () => {
    const segments = [
      { start: 1000, end: 5000 } // 4 segundos
    ];
    expect(getTotalPausedTime(segments)).toBe(4000);
  });

  it('calcula correctamente múltiples pausas cerradas', () => {
    const segments = [
      { start: 1000, end: 3000 },   // 2 segundos
      { start: 5000, end: 10000 }   // 5 segundos
    ];
    expect(getTotalPausedTime(segments)).toBe(7000); // 7 segundos total
  });

  it('calcula correctamente pausa abierta (end=undefined)', () => {
    const now = Date.now();
    const segments = [
      { start: now - 5000, end: undefined } // Pausa iniciada hace 5 segundos
    ];
    const result = getTotalPausedTime(segments);
    // Debe ser aproximadamente 5000ms (±100ms por tolerancia de ejecución)
    expect(result).toBeGreaterThanOrEqual(4900);
    expect(result).toBeLessThanOrEqual(5100);
  });

  it('maneja mezcla de pausas cerradas y abiertas', () => {
    const now = Date.now();
    const segments = [
      { start: 1000, end: 3000 },          // 2 segundos cerrada
      { start: now - 3000, end: undefined } // 3 segundos abierta
    ];
    const result = getTotalPausedTime(segments);
    // Debe ser aproximadamente 5000ms
    expect(result).toBeGreaterThanOrEqual(4900);
    expect(result).toBeLessThanOrEqual(5100);
  });
});

describe('calculateElapsedTime', () => {
  it('calcula tiempo sin pausas correctamente', () => {
    const startTime = 1000000;
    const endTime = 1060000; // 60 segundos después
    const pauseSegments: Array<{ start: number; end?: number }> = [];
    
    expect(calculateElapsedTime(startTime, pauseSegments, endTime)).toBe(60);
  });

  it('calcula tiempo con una pausa cerrada', () => {
    const startTime = 1000000;
    const endTime = 1070000; // 70 segundos después
    const pauseSegments = [
      { start: 1030000, end: 1040000 } // Pausa de 10 segundos
    ];
    
    // 70 segundos totales - 10 segundos pausados = 60 segundos
    expect(calculateElapsedTime(startTime, pauseSegments, endTime)).toBe(60);
  });

  it('calcula tiempo con múltiples pausas', () => {
    const startTime = 1000000;
    const endTime = 1120000; // 120 segundos después
    const pauseSegments = [
      { start: 1020000, end: 1030000 },  // 10 segundos
      { start: 1050000, end: 1080000 }   // 30 segundos
    ];
    
    // 120 segundos - 40 segundos pausados = 80 segundos
    expect(calculateElapsedTime(startTime, pauseSegments, endTime)).toBe(80);
  });

  it('usa Date.now() cuando no se provee endTime', () => {
    const startTime = Date.now() - 10000; // Hace 10 segundos
    const pauseSegments: Array<{ start: number; end?: number }> = [];
    
    const result = calculateElapsedTime(startTime, pauseSegments);
    // Debe ser aproximadamente 10 segundos
    expect(result).toBeGreaterThanOrEqual(9);
    expect(result).toBeLessThanOrEqual(11);
  });

  it('retorna 0 cuando el tiempo es negativo (validación)', () => {
    const startTime = 1000000;
    const endTime = 999000; // Anterior al inicio (caso edge raro)
    const pauseSegments: Array<{ start: number; end?: number }> = [];
    
    expect(calculateElapsedTime(startTime, pauseSegments, endTime)).toBe(0);
  });

  it('maneja pausa abierta correctamente', () => {
    const now = Date.now();
    const startTime = now - 20000; // Hace 20 segundos
    const pauseSegments = [
      { start: now - 5000, end: undefined } // Pausa abierta hace 5 segundos
    ];
    
    const result = calculateElapsedTime(startTime, pauseSegments);
    // 20 segundos totales - 5 segundos pausados = 15 segundos
    expect(result).toBeGreaterThanOrEqual(14);
    expect(result).toBeLessThanOrEqual(16);
  });
});
