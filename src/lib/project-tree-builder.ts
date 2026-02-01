/**
 * Función pura para construir árbol jerárquico de proyectos
 */

import { Client, Project, Task, Session, TreeNode } from '@/types';
import { getTaskStats, getProjectStats, getClientStats } from './project-stats';

export interface BuildTreeOptions {
  includeArchived?: boolean;
  includeFullStats?: boolean;
}

/**
 * Construye árbol jerárquico de proyectos desde arrays planos
 * 
 * @param clients - Array de clientes
 * @param projects - Array de proyectos
 * @param tasks - Array de tareas
 * @param sessions - Array de sesiones
 * @param options - Opciones de construcción
 * @returns Array de TreeNodes con estructura jerárquica
 */
export function buildProjectTree(
  clients: Client[],
  projects: Project[],
  tasks: Task[],
  sessions: Session[],
  options: BuildTreeOptions = {}
): TreeNode[] {
  const { includeArchived = false, includeFullStats = false } = options;

  const filteredClients = includeArchived 
    ? clients 
    : clients.filter((client) => !client.isArchived);

  return filteredClients.map((client) => 
    buildClientNode(client, projects, tasks, sessions, includeArchived, includeFullStats)
  );
}

/**
 * Construye un nodo de tarea con estadísticas
 */
function buildTaskNode(
  task: Task,
  sessions: Session[],
  projectId: string,
  includeFullStats: boolean
): TreeNode {
  if (includeFullStats) {
    const stats = getTaskStats(task.id, sessions);
    
    return {
      id: task.id,
      name: task.name,
      type: 'task',
      parentId: projectId,
      isCompleted: task.isCompleted,
      isArchived: task.isArchived,
      totalTime: stats.totalHours,
      sessionCount: stats.sessionCount,
      lastActivity: stats.lastActivityFormatted,
    };
  } else {
    const taskSessions = sessions.filter(s => s.taskId === task.id);
    const totalTime = taskSessions.reduce((sum, s) => sum + s.duration, 0);
    
    return {
      id: task.id,
      name: task.name,
      type: 'task',
      parentId: projectId,
      isCompleted: task.isCompleted,
      isArchived: task.isArchived,
      totalTime,
      sessionCount: taskSessions.length,
    };
  }
}

/**
 * Construye un nodo de proyecto con sus tareas
 */
function buildProjectNode(
  project: Project,
  tasks: Task[],
  sessions: Session[],
  clientId: string,
  includeArchived: boolean,
  includeFullStats: boolean
): TreeNode {
  const projectTasks = includeArchived
    ? tasks.filter((task) => task.projectId === project.id)
    : tasks.filter((task) => task.projectId === project.id && !task.isArchived);

  const taskNodes: TreeNode[] = projectTasks.map((task) => 
    buildTaskNode(task, sessions, project.id, includeFullStats)
  );

  if (includeFullStats) {
    const stats = getProjectStats(project.id, sessions, tasks);
    
    return {
      id: project.id,
      name: project.name,
      type: 'project',
      parentId: clientId,
      color: project.color,
      isArchived: project.isArchived,
      children: taskNodes,
      totalTime: stats.totalHours,
      sessionCount: stats.sessionCount,
      tasksCompleted: stats.tasksCompleted,
      totalTasks: stats.totalTasks,
      lastActivity: stats.lastActivityFormatted,
    };
  } else {
    const projectTotalTime = taskNodes.reduce((sum, task) => sum + (task.totalTime || 0), 0);
    const projectSessionCount = taskNodes.reduce((sum, task) => sum + (task.sessionCount || 0), 0);

    return {
      id: project.id,
      name: project.name,
      type: 'project',
      parentId: clientId,
      color: project.color,
      isArchived: project.isArchived,
      children: taskNodes,
      totalTime: projectTotalTime,
      sessionCount: projectSessionCount,
    };
  }
}

/**
 * Construye un nodo de cliente con sus proyectos
 */
function buildClientNode(
  client: Client,
  projects: Project[],
  tasks: Task[],
  sessions: Session[],
  includeArchived: boolean,
  includeFullStats: boolean
): TreeNode {
  const clientProjects = includeArchived
    ? projects.filter((project) => project.clientId === client.id)
    : projects.filter((project) => project.clientId === client.id && !project.isArchived);

  const projectNodes: TreeNode[] = clientProjects.map((project) => 
    buildProjectNode(project, tasks, sessions, client.id, includeArchived, includeFullStats)
  );

  if (includeFullStats) {
    const stats = getClientStats(client.id, sessions, projects, tasks);
    
    return {
      id: client.id,
      name: client.name,
      type: 'client',
      color: client.color,
      isArchived: client.isArchived,
      children: projectNodes,
      totalTime: stats.totalHours,
      sessionCount: stats.sessionCount,
      projectCount: stats.projectCount,
      taskCount: stats.taskCount,
      lastActivity: stats.lastActivityFormatted,
    };
  } else {
    const clientTotalTime = projectNodes.reduce((sum, project) => sum + (project.totalTime || 0), 0);
    const clientSessionCount = projectNodes.reduce((sum, project) => sum + (project.sessionCount || 0), 0);

    return {
      id: client.id,
      name: client.name,
      type: 'client',
      color: client.color,
      isArchived: client.isArchived,
      children: projectNodes,
      totalTime: clientTotalTime,
      sessionCount: clientSessionCount,
    };
  }
}


