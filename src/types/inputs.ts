/**
 * Inputs para crear y actualizar entidades
 * Usados en formularios y acciones de store
 */

// ----------------------------------------
// Inputs para Crear Entidades
// ----------------------------------------

export interface CreateClientInput {
  name: string;
  color?: string;
  description?: string;
}

export interface CreateProjectInput {
  name: string;
  clientId: string;
  description?: string;
  color?: string;
}

export interface CreateTaskInput {
  name: string;
  projectId: string;
  description?: string;
}

// ----------------------------------------
// Inputs para Actualizar Entidades
// ----------------------------------------

export interface UpdateClientInput {
  name?: string;
  color?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  isCompleted?: boolean;
}
