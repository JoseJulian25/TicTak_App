/**
 * Tipos para el árbol jerárquico de proyectos
 * Usado en ProjectTreeSelector y navegación
 */

export type NodeType = "client" | "project" | "task";

/**
 * Nodo del árbol jerárquico de proyectos
 * Usado en ProjectTreeSelector y ProjectsView
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
  
  // Estadísticas básicas (siempre presentes)
  totalTime?: number; // Tiempo total en segundos
  sessionCount?: number; // Cantidad de sesiones
  
  // Estadísticas completas (solo cuando includeFullStats=true)
  lastActivity?: string; // "Hace 2 días" o "15/01/2026"
  tasksCompleted?: number; // Solo para projects
  totalTasks?: number; // Solo para projects
  projectCount?: number; // Solo para clients
  taskCount?: number; // Solo para clients
}
