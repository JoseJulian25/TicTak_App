import { useMemo } from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useClientStore } from "@/stores/useClientStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { getTaskDetailStats, type TaskDetailStats } from "@/lib/task-stats";
import type { Task, Project, Client, Session } from "@/types/entities";

/**
 * Datos completos de una tarea con sus relaciones
 */
export interface TaskDetailData {
  task: Task;
  project: Project;
  client: Client;
  sessions: Session[];
  stats: TaskDetailStats;
}

/**
 * Resultado del hook useTaskDetail
 */
export interface UseTaskDetailResult {
  /** Datos completos de la tarea (null si no existe) */
  data: TaskDetailData | null;
  /** Error si la tarea no existe o falta alguna relación */
  error: string | null;
  /** Actualiza la tarea */
  updateTask: (updates: Partial<Task>) => void;
  /** Elimina la tarea y sus sesiones */
  deleteTask: () => void;
  /** Alterna el estado de completado */
  toggleComplete: () => void;
}

/**
 * Hook para obtener todos los datos de una tarea con sus relaciones
 * 
 * @param taskId - ID de la tarea
 * @returns Datos de la tarea, proyecto, cliente, sesiones, estadísticas y acciones
 * 
 */
export function useTaskDetail(taskId: string): UseTaskDetailResult {
  // Obtener funciones de acción
  const updateTaskStore = useTaskStore((state) => state.updateTask);
  const deleteTaskStore = useTaskStore((state) => state.deleteTask);

  // Obtener datos de las stores directamente con selectores
  const task = useTaskStore((state) => state.getTaskById(taskId));
  const project = useProjectStore((state) => 
    task ? state.getProjectById(task.projectId) : undefined
  );
  const client = useClientStore((state) => 
    project ? state.getClientById(project.clientId) : undefined
  );
  const sessions = useSessionStore((state) => state.getSessionsByTask(taskId));

  // Calcular datos y estadísticas
  const result = useMemo<{
    data: TaskDetailData | null;
    error: string | null;
  }>(() => {
    // Validaciones
    if (!task) {
      return {
        data: null,
        error: `Tarea con ID "${taskId}" no encontrada`,
      };
    }

    if (!project) {
      return {
        data: null,
        error: `Proyecto con ID "${task.projectId}" no encontrado`,
      };
    }

    if (!client) {
      return {
        data: null,
        error: `Cliente con ID "${project.clientId}" no encontrado`,
      };
    }

    // Calcular estadísticas
    const stats = getTaskDetailStats(taskId, sessions);

    // Retornar datos completos
    return {
      data: {
        task,
        project,
        client,
        sessions,
        stats,
      },
      error: null,
    };
  }, [task, project, client, sessions, taskId]);

  // Funciones de acción
  const updateTask = (updates: Partial<Task>) => {
    updateTaskStore(taskId, updates);
  };

  const deleteTask = () => {
    deleteTaskStore(taskId);
  };

  const toggleComplete = () => {
    if (task) {
      updateTaskStore(taskId, { isCompleted: !task.isCompleted });
    }
  };

  return {
    data: result.data,
    error: result.error,
    updateTask,
    deleteTask,
    toggleComplete,
  };
}
