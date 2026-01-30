
// Helper: Convierte segundos totales a componentes de tiempo
function getTimeParts(totalSeconds: number) {
    return {
        hours: Math.floor(totalSeconds / 3600),
        minutes: Math.floor((totalSeconds % 3600) / 60),
        seconds: totalSeconds % 60
    };
}

// Helper: Pad con ceros a la izquierda
const pad = (num: number) => String(num).padStart(2, '0');

export function formatSecondsToHHMMSS(totalSeconds: number): string {
    if (!validSecondsInDay(totalSeconds)) return '';
    
    const { hours, minutes, seconds } = getTimeParts(totalSeconds);
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function formatDuration(totalSeconds: number): string {
    if (!validSecondsInDay(totalSeconds)) return '';

    const { hours, minutes, seconds } = getTimeParts(totalSeconds);
    const parts = [];

    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
}

export function getDayStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function getDayEnd(date: Date): Date {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}

export function isToday(date: Date): boolean {
    const today = new Date();
    return date.getUTCFullYear() === today.getUTCFullYear() &&
           date.getUTCMonth() === today.getUTCMonth() &&
           date.getUTCDate() === today.getUTCDate();
}

export function calculateDurationInSeconds(start: Date, end: Date): number {
    const diffMs = end.getTime() - start.getTime();
    return Math.floor(diffMs / 1000);
}

export function formatDurationShort(totalSeconds: number): string {
    if (!validSecondsInDay(totalSeconds)) return '';
    
    const { hours, minutes } = getTimeParts(totalSeconds);
    return `${hours}:${pad(minutes)}`;
}

function validSecondsInDay(totalSeconds: number): boolean {
    const SECONDS_IN_DAY = 86400;
    return totalSeconds >= 0 && totalSeconds < SECONDS_IN_DAY;
}

// ========================================
// HELPERS PARA CÁLCULO DE TIEMPO REAL
// ========================================

/**
 * Calcula el tiempo total pausado desde un array de segmentos de pausa
 * 
 * @param pauseSegments - Array de segmentos con {start, end?}
 * @returns Tiempo total pausado en milisegundos
 * 
 * Si un segmento tiene end=undefined (pausa abierta), usa Date.now() como fin
 */
export function getTotalPausedTime(pauseSegments: Array<{ start: number; end?: number }>): number {
    if (!pauseSegments || pauseSegments.length === 0) {
        return 0;
    }

    const now = Date.now();
    
    return pauseSegments.reduce((total, segment) => {
        const endTime = segment.end ?? now; // Si está abierto, usar ahora
        const duration = endTime - segment.start;
        return total + duration;
    }, 0);
}

/**
 * Calcula el tiempo transcurrido desde startTime, restando el tiempo pausado
 * 
 * @param startTime - Timestamp de inicio (en ms)
 * @param pauseSegments - Array de pausas
 * @param endTime - Timestamp de fin (opcional, usa Date.now() si no se provee)
 * @returns Tiempo transcurrido en segundos
 */
export function calculateElapsedTime(
    startTime: number,
    pauseSegments: Array<{ start: number; end?: number }>,
    endTime?: number
): number {
    const finalEndTime = endTime ?? Date.now();
    
    const totalTime = finalEndTime - startTime;
    
    const pausedTime = getTotalPausedTime(pauseSegments);
    
    const effectiveTime = totalTime - pausedTime;
    
    return Math.max(0, Math.floor(effectiveTime / 1000));
}

