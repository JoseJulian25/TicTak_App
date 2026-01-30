// ========================================
// TIPOS PARA EL MÓDULO DE TEMPORIZADOR
// ========================================

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
  description?: string;
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
