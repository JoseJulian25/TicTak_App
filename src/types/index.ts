// ========================================
// TIPOS PARA EL MÓDULO DE TEMPORIZADOR
// ========================================

// ----------------------------------------
// Entidades Principales
// ----------------------------------------

/**
 * Cliente - Nivel superior de la jerarquía
 */
export interface Client {
  id: string;
  name: string;
  color?: string; // Color para visualización (opcional)
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

// ----------------------------------------
// Sesiones de Trabajo
// ----------------------------------------

/**
 * Sesión completada y guardada
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

/**
 * Sesión activa (timer en curso)
 */
export interface ActiveSession {
  taskId: string;
  startTime: Date;
  pausedAt?: Date; // Si está pausado
  totalPausedTime: number; // Tiempo total pausado en segundos
}

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

// ----------------------------------------
// Árbol de Proyectos (para selector)
// ----------------------------------------

export type NodeType = "client" | "project" | "task";

/**
 * Nodo del árbol jerárquico de proyectos
 * Usado en ProjectTreeSelector
 */
export interface TreeNode {
  id: string;
  name: string;
  type: NodeType;
  children?: TreeNode[];
  parentId?: string;
  
  // Metadata adicional
  color?: string;
  isCompleted?: boolean; // Solo para tasks
  isArchived?: boolean;
  
  // Estadísticas (opcional, para mostrar en el árbol)
  totalTime?: number; // Tiempo total en segundos
  sessionCount?: number; // Cantidad de sesiones
}

// ----------------------------------------
// Inputs para Crear Entidades
// ----------------------------------------

export interface CreateClientInput {
  name: string;
  color?: string;
}

export interface CreateProjectInput {
  name: string;
  clientId: string;
  description?: string;
  color?: string;
}

export interface CreateTaskInput {
  name: string;
  projectId: string;
  description?: string;
}

// ----------------------------------------
// Inputs para Actualizar Entidades
// ----------------------------------------

export interface UpdateClientInput {
  name?: string;
  color?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  isCompleted?: boolean;
}
