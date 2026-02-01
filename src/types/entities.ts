/**
 * Entidades base del sistema
 * Cliente > Proyecto > Tarea > Sesión
 */

/**
 * Cliente - Nivel superior de la jerarquía
 */
export interface Client {
  id: string;
  name: string;
  color?: string; // Color para visualización (opcional)
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

/**
 * Proyecto - Pertenece a un Cliente
 */
export interface Project {
  id: string;
  name: string;
  clientId: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

/**
 * Tarea - Pertenece a un Proyecto
 */
export interface Task {
  id: string;
  name: string;
  projectId: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
}

/**
 * Sesión de tiempo - Tiempo trabajado en una Tarea
 */
export interface Session {
  id: string;
  taskId: string;
  startTime: Date;
  endTime: Date;
  duration: number; // en segundos
  notes?: string;
  createdAt: Date;
}
