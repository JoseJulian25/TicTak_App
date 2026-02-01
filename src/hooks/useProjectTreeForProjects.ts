import { useMemo } from 'react';
import { TreeNode } from '@/types';
import { useClientStore } from '@/stores/useClientStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { buildProjectTree } from '@/lib/project-tree-builder';

/**
 * Hook para construir árbol jerárquico de proyectos (ProjectsView)
 * 
 * @param showArchived - Mostrar elementos archivados
 */
export const useProjectTreeForProjects = (showArchived: boolean = false) => {
  const clients = useClientStore((state) => state.clients);
  const projects = useProjectStore((state) => state.projects);
  const tasks = useTaskStore((state) => state.tasks);
  const sessions = useSessionStore((state) => state.sessions);

  // Construir árbol 
  const tree = useMemo(() => {
    return buildProjectTree(clients, projects, tasks, sessions, {
      includeArchived: showArchived,
      includeFullStats: true,
    });
  }, [clients, projects, tasks, sessions, showArchived]);

  // Estado de carga (si todos los stores están listos)
  const isLoading = useClientStore((state) => state.isLoading) ||
                    useProjectStore((state) => state.isLoading) ||
                    useTaskStore((state) => state.isLoading);

  return {
    tree,
    isLoading,
  };
};
