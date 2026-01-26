import { useMemo } from 'react';
import { Session, SessionWithDetails } from '@/types';
import { useClientStore } from '@/stores/useClientStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTaskStore } from '@/stores/useTaskStore';

/**
 * Hook para enriquecer sesiones con información completa
 * 
 * Toma un array de sesiones (que solo tienen taskId) y agrega:
 * - taskName
 * - projectName  
 * - clientName
 * - projectPath ("Cliente > Proyecto > Tarea")
 * - projectColor
 * 
 * Útil para mostrar contexto completo en historial y reportes
 */
export const useEnrichedSessions = (sessions: Session[]): SessionWithDetails[] => {
  const getClientById = useClientStore((state) => state.getClientById);
  const getProjectById = useProjectStore((state) => state.getProjectById);
  const getTaskById = useTaskStore((state) => state.getTaskById);

  const enrichedSessions = useMemo(() => {
    return sessions.map((session): SessionWithDetails => {
      // Buscar la tarea
      const task = getTaskById(session.taskId);
      
      if (!task) {
        // Si no existe la tarea, retornar con valores por defecto
        return {
          ...session,
          taskName: 'Tarea eliminada',
          projectName: 'Proyecto eliminado',
          clientName: 'Cliente eliminado',
          projectPath: 'Desconocido',
          projectColor: '#gray',
        };
      }

      // Buscar el proyecto
      const project = getProjectById(task.projectId);
      
      if (!project) {
        return {
          ...session,
          taskName: task.name,
          projectName: 'Proyecto eliminado',
          clientName: 'Cliente eliminado',
          projectPath: `Desconocido > ${task.name}`,
          projectColor: '#gray',
        };
      }

      // Buscar el cliente
      const client = getClientById(project.clientId);
      
      if (!client) {
        return {
          ...session,
          taskName: task.name,
          projectName: project.name,
          clientName: 'Cliente eliminado',
          projectPath: `Desconocido > ${project.name} > ${task.name}`,
          projectColor: project.color,
        };
      }

      // Todo encontrado correctamente
      return {
        ...session,
        taskName: task.name,
        projectName: project.name,
        clientName: client.name,
        projectPath: `${client.name} > ${project.name} > ${task.name}`,
        projectColor: project.color,
      };
    });
  }, [sessions, getClientById, getProjectById, getTaskById]);

  return enrichedSessions;
};
