/**
 * Funciones de cálculo de estadísticas para clientes, proyectos y tareas
 * Calcula horas totales, horas esta semana, última actividad, etc.
 */

import { Session, Task, Project } from '@/types';
import { formatDuration } from './time-utils';

/**
 * Estadísticas de una tarea
 */
export interface TaskStats {
  totalHours: number; // en segundos
  totalHoursFormatted: string; // ej: "2h 30m"
  sessionCount: number;
  lastActivity: Date | null;
  lastActivityFormatted: string; // ej: "hace 2 horas" o "15/01/2026"
}

/**
 * Estadísticas de un proyecto
 */
export interface ProjectStats {
  totalHours: number; // en segundos
  totalHoursFormatted: string;
  tasksCompleted: number;
  totalTasks: number;
  sessionCount: number;
  lastActivity: Date | null;
  lastActivityFormatted: string;
}

/**
 * Estadísticas de un cliente
 */
export interface ClientStats {
  totalHours: number; // en segundos
  totalHoursFormatted: string;
  projectCount: number;
  taskCount: number;
  sessionCount: number;
  lastActivity: Date | null;
  lastActivityFormatted: string;
}

function getWeekStart(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = domingo, 1 = lunes, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Ajustar para que lunes sea el inicio
  
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  
  return weekStart;
}

/**
 * Filtra sesiones de esta semana
 */
export function getWeekSessions(sessions: Session[]): Session[] {
  const weekStart = getWeekStart();
  
  return sessions.filter(session => {
    const sessionDate = new Date(session.startTime);
    return sessionDate >= weekStart;
  });
}

/**
 * Formatea la última actividad de forma relativa
 */
export function getLastActivity(sessions: Session[]): string {
  if (sessions.length === 0) {
    return 'Sin actividad';
  }

  const lastSession = sessions.reduce((latest, current) => {
    const latestDate = new Date(latest.startTime);
    const currentDate = new Date(current.startTime);
    return currentDate > latestDate ? current : latest;
  });

  const lastDate = new Date(lastSession.startTime);
  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  // Formato relativo
  if (diffMinutes < 1) {
    return 'Hace un momento';
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'Ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  } else {

    const day = String(lastDate.getDate()).padStart(2, '0');
    const month = String(lastDate.getMonth() + 1).padStart(2, '0');
    const year = lastDate.getFullYear();
    return `${day}/${month}/${year}`;
  }
}


export function getTaskStats(taskId: string, sessions: Session[]): TaskStats {

  const taskSessions = sessions.filter(s => s.taskId === taskId);
  
  const totalHours = taskSessions.reduce((sum, session) => sum + session.duration, 0);
  
  const lastActivity = taskSessions.length > 0
    ? new Date(Math.max(...taskSessions.map(s => new Date(s.startTime).getTime())))
    : null;

  return {
    totalHours,
    totalHoursFormatted: formatDuration(totalHours),
    sessionCount: taskSessions.length,
    lastActivity,
    lastActivityFormatted: getLastActivity(taskSessions),
  };
}


export function getProjectStats(
  projectId: string,
  sessions: Session[],
  tasks: Task[]
): ProjectStats {

  const projectTasks = tasks.filter(t => t.projectId === projectId);
  
  const taskStatsArray = projectTasks.map(task => getTaskStats(task.id, sessions));
  
  const totalHours = taskStatsArray.reduce((sum, stats) => sum + stats.totalHours, 0);
  const sessionCount = taskStatsArray.reduce((sum, stats) => sum + stats.sessionCount, 0);
  
  const tasksCompleted = projectTasks.filter(t => t.isCompleted).length;
  
  const lastActivities = taskStatsArray
    .map(stats => stats.lastActivity)
    .filter((date): date is Date => date !== null);
  
  const lastActivity = lastActivities.length > 0
    ? new Date(Math.max(...lastActivities.map(d => d.getTime())))
    : null;
  
  const projectTaskIds = projectTasks.map(t => t.id);
  const projectSessions = sessions.filter(s => projectTaskIds.includes(s.taskId));

  return {
    totalHours,
    totalHoursFormatted: formatDuration(totalHours),
    tasksCompleted,
    totalTasks: projectTasks.length,
    sessionCount,
    lastActivity,
    lastActivityFormatted: getLastActivity(projectSessions),
  };
}


export function getClientStats(
  clientId: string,
  sessions: Session[],
  projects: Project[],
  tasks: Task[]
): ClientStats {
  
  const clientProjects = projects.filter(p => p.clientId === clientId);
  
  
  const projectStatsArray = clientProjects.map(project => 
    getProjectStats(project.id, sessions, tasks)
  );
  
  
  const totalHours = projectStatsArray.reduce((sum, stats) => sum + stats.totalHours, 0);
  const sessionCount = projectStatsArray.reduce((sum, stats) => sum + stats.sessionCount, 0);
  const taskCount = projectStatsArray.reduce((sum, stats) => sum + stats.totalTasks, 0);
  
  
  const lastActivities = projectStatsArray
    .map(stats => stats.lastActivity)
    .filter((date): date is Date => date !== null);
  
  const lastActivity = lastActivities.length > 0
    ? new Date(Math.max(...lastActivities.map(d => d.getTime())))
    : null;
  
  
  const clientProjectIds = clientProjects.map(p => p.id);
  const clientTasks = tasks.filter(t => clientProjectIds.includes(t.projectId));
  const clientTaskIds = clientTasks.map(t => t.id);
  const clientSessions = sessions.filter(s => clientTaskIds.includes(s.taskId));

  return {
    totalHours,
    totalHoursFormatted: formatDuration(totalHours),
    projectCount: clientProjects.length,
    taskCount,
    sessionCount,
    lastActivity,
    lastActivityFormatted: getLastActivity(clientSessions),
  };
}
