/**
 * Tipos relacionados con el temporizador activo
 */

/**
 * Segmento de pausa en una sesión activa
 */
export interface PauseSegment {
  start: number;
  end?: number; 
}

/**
 * Sesión activa (timer en curso)
 * 
 * Usa timestamps (number) en lugar de Date para calcular tiempo real transcurrido
 * incluso cuando la app está suspendida o en background.
 */
export interface ActiveSession {
  taskId: string;
  startTime: number;
  pauseSegments: PauseSegment[];
  lastTickTimestamp: number; 
}
