/**
 * Tipos para el árbol jerárquico de proyectos
 * Usado en ProjectTreeSelector y navegación
 */

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
