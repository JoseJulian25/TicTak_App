import { useMemo } from 'react';
import { TreeNode } from '@/types';
import { useClientStore } from '@/stores/useClientStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSessionStore } from '@/stores/useSessionStore';

/**
 * Hook para construir árbol jerárquico de proyectos
 * 
 * Transforma arrays planos de clientes, proyectos y tareas
 * en una estructura tipo árbol navegable con metadata de estadísticas
 * 
 */
export const useProjectTree = () => {
  const clients = useClientStore((state) => state.clients);
  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const sessions = useSessionStore((state) => state.sessions);

  // Construir árbol y memoizarlo para evitar recalcular en cada render
  const tree = useMemo(() => {
    // Calcular estadísticas por tarea
    const taskStats = new Map<string, { totalTime: number; sessionCount: number }>();
    
    sessions.forEach((session) => {
      const current = taskStats.get(session.taskId) || { totalTime: 0, sessionCount: 0 };
      taskStats.set(session.taskId, {
        totalTime: current.totalTime + session.duration,
        sessionCount: current.sessionCount + 1,
      });
    });

    // Filtrar solo clientes activos (no archivados)
    const activeClients = clients.filter((client) => !client.isArchived);

    // Construir árbol
    const treeNodes: TreeNode[] = activeClients.map((client) => {
      // Obtener proyectos de este cliente (no archivados)
      const clientProjects = projects.filter(
        (project) => project.clientId === client.id && !project.isArchived
      );

      // Para cada proyecto, obtener sus tareas
      const projectNodes: TreeNode[] = clientProjects.map((project) => {
        // Obtener tareas de este proyecto (no archivadas)
        const projectTasks = tasks.filter(
          (task) => task.projectId === project.id && !task.isArchived
        );

        // Construir nodos de tareas con estadísticas
        const taskNodes: TreeNode[] = projectTasks.map((task) => {
          const stats = taskStats.get(task.id) || { totalTime: 0, sessionCount: 0 };
          
          return {
            id: task.id,
            name: task.name,
            type: 'task' as const,
            parentId: project.id,
            isCompleted: task.isCompleted,
            isArchived: task.isArchived,
            totalTime: stats.totalTime,
            sessionCount: stats.sessionCount,
          };
        });

        // Calcular estadísticas del proyecto (suma de todas sus tareas)
        const projectTotalTime = taskNodes.reduce((sum, task) => sum + (task.totalTime || 0), 0);
        const projectSessionCount = taskNodes.reduce((sum, task) => sum + (task.sessionCount || 0), 0);

        return {
          id: project.id,
          name: project.name,
          type: 'project' as const,
          parentId: client.id,
          color: project.color,
          isArchived: project.isArchived,
          children: taskNodes,
          totalTime: projectTotalTime,
          sessionCount: projectSessionCount,
        };
      });

      // Calcular estadísticas del cliente (suma de todos sus proyectos)
      const clientTotalTime = projectNodes.reduce((sum, project) => sum + (project.totalTime || 0), 0);
      const clientSessionCount = projectNodes.reduce((sum, project) => sum + (project.sessionCount || 0), 0);

      return {
        id: client.id,
        name: client.name,
        type: 'client' as const,
        color: client.color,
        isArchived: client.isArchived,
        children: projectNodes,
        totalTime: clientTotalTime,
        sessionCount: clientSessionCount,
      };
    });

    return treeNodes;
  }, [clients, projects, tasks, sessions]);

  // Estado de carga (si todos los stores están listos)
  const isLoading = useClientStore((state) => state.isLoading) ||
                    useProjectStore((state) => state.isLoading) ||
                    useTaskStore((state) => state.isLoading);

  return {
    tree,
    isLoading,
  };
};
