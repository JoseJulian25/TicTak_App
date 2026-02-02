import { Client, Project, Task } from "@/types";

/**
 * Funciones de validación para clientes, proyectos y tareas
 * Retornan null si la validación pasa, o un mensaje de error si falla
 */

export function validateEmptyName(name: string): string | null {
  if (!name.trim()) {
    return "El nombre no puede estar vacío";
  }
  return null;
}

export function validateClientName(
  name: string,
  clients: Client[],
  excludeId?: string
): string | null {
  const existingClient = clients.find(
    (c) =>
      c.id !== excludeId &&
      c.name.toLowerCase() === name.toLowerCase() &&
      !c.isArchived
  );
  return existingClient ? "Ya existe un cliente con ese nombre" : null;
}

export function validateProjectName(
  name: string,
  clientId: string,
  projects: Project[],
  excludeId?: string
): string | null {
  const existingProject = projects.find(
    (p) =>
      p.id !== excludeId &&
      p.clientId === clientId &&
      p.name.toLowerCase() === name.toLowerCase() &&
      !p.isArchived
  );
  return existingProject ? "Ya existe un proyecto con ese nombre en este cliente" : null;
}

export function validateTaskName(
  name: string,
  projectId: string,
  tasks: Task[],
  excludeId?: string
): string | null {
  const existingTask = tasks.find(
    (t) =>
      t.id !== excludeId &&
      t.projectId === projectId &&
      t.name.toLowerCase() === name.toLowerCase() &&
      !t.isArchived
  );
  return existingTask ? "Ya existe una tarea con ese nombre en este proyecto" : null;
}
