/**
 * Tipos enriquecidos con información adicional para UI
 */

import type { Session } from './entities';

/**
 * Sesión enriquecida con información completa para mostrar en UI
 */
export interface SessionWithDetails extends Session {
  taskName: string;
  projectName: string;
  clientName: string;
  projectPath: string; // "Cliente > Proyecto > Tarea"
  projectColor?: string;
}
