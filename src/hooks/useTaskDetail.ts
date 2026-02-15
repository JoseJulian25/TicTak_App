import { useMemo } from "react";
import { useTaskStore } from "@/stores/useTaskStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useClientStore } from "@/stores/useClientStore";
import { useSessionStore } from "@/stores/useSessionStore";
import { getTaskDetailStats, type TaskDetailStats } from "@/lib/task-stats";
import type { Task, Project, Client, Session } from "@/types/entities";


export interface TaskDetailData {
  task: Task;
  project: Project;
  client: Client;
  sessions: Session[];
  stats: TaskDetailStats;
}


export interface UseTaskDetailResult {
  data: TaskDetailData | null;
  error: string | null;
  updateTask: (updates: Partial<Task>) => void;
  deleteTask: () => void;
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

  const updateTaskStore = useTaskStore((state) => state.updateTask);
  const deleteTaskStore = useTaskStore((state) => state.deleteTask);

  // Obtener arrays completos
  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const clients = useClientStore((state) => state.clients);
  const sessions = useSessionStore((state) => state.sessions);

  // Calcular datos y estadísticas
  const result = useMemo<{
    data: TaskDetailData | null;
    error: string | null;
  }>(() => {
    const task = tasks.find((t) => t.id === taskId);
    
    if (!task) {
      return {
        data: null,
        error: `Tarea con ID "${taskId}" no encontrada`,
      };
    }

    const project = projects.find((p) => p.id === task.projectId);
    if (!project) {
      return {
        data: null,
        error: `Proyecto con ID "${task.projectId}" no encontrado`,
      };
    }

    const client = clients.find((c) => c.id === project.clientId);
    if (!client) {
      return {
        data: null,
        error: `Cliente con ID "${project.clientId}" no encontrado`,
      };
    }

    const taskSessions = sessions.filter((s) => s.taskId === taskId);
    const stats = getTaskDetailStats(taskId, taskSessions);

    return {
      data: {
        task,
        project,
        client,
        sessions: taskSessions,
        stats,
      },
      error: null,
    };
  }, [tasks, projects, clients, sessions, taskId]);

  // Funciones de acción
  const updateTask = (updates: Partial<Task>) => {
    updateTaskStore(taskId, updates);
  };

  const deleteTask = () => {
    deleteTaskStore(taskId);
  };

  const toggleComplete = () => {
    if (result.data?.task) {
      updateTaskStore(taskId, { isCompleted: !result.data.task.isCompleted });
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
