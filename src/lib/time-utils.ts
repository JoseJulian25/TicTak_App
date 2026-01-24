
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
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0));
}

export function getDayEnd(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999));
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

