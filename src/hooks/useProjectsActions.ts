import { useState } from "react";
import { useClientStore } from "@/stores/useClientStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { toast } from "sonner";

export function useProjectsActions() {
  const addClient = useClientStore((state) => state.addClient);
  const updateClient = useClientStore((state) => state.updateClient);
  const clients = useClientStore((state) => state.clients);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const projects = useProjectStore((state) => state.projects);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const tasks = useTaskStore((state) => state.tasks);

  const [newItemName, setNewItemName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setNewItemName("");
    setErrorMessage("");
  };

  // Funciones de validación reutilizables
  const validateEmptyName = (name: string): string | null => {
    if (!name.trim()) {
      return "El nombre no puede estar vacío";
    }
    return null;
  };

  const validateClientName = (name: string, excludeId?: string): string | null => {
    const existingClient = clients.find(
      (c) =>
        c.id !== excludeId &&
        c.name.toLowerCase() === name.toLowerCase() &&
        !c.isArchived
    );
    return existingClient ? "Ya existe un cliente con ese nombre" : null;
  };

  const validateProjectName = (name: string, clientId: string, excludeId?: string): string | null => {
    const existingProject = projects.find(
      (p) =>
        p.id !== excludeId &&
        p.clientId === clientId &&
        p.name.toLowerCase() === name.toLowerCase() &&
        !p.isArchived
    );
    return existingProject ? "Ya existe un proyecto con ese nombre en este cliente" : null;
  };

  const validateTaskName = (name: string, projectId: string, excludeId?: string): string | null => {
    const existingTask = tasks.find(
      (t) =>
        t.id !== excludeId &&
        t.projectId === projectId &&
        t.name.toLowerCase() === name.toLowerCase() &&
        !t.isArchived
    );
    return existingTask ? "Ya existe una tarea con ese nombre en este proyecto" : null;
  };

  const handleCreateClient = async (
    onSuccess: (newElementId: string, parentIds: string[]) => void
  ) => {
    const trimmedName = newItemName.trim();

    const emptyError = validateEmptyName(trimmedName);
    if (emptyError) {
      setErrorMessage(emptyError);
      return;
    }

    const duplicateError = validateClientName(trimmedName);
    if (duplicateError) {
      setErrorMessage(duplicateError);
      return;
    }

    try {

      const newClient = addClient({ name: trimmedName });

      toast.success("Cliente creado", {
        description: `"${newClient.name}" fue creado exitosamente`,
      });

      onSuccess(newClient.id, []);
      resetForm();
    } catch (error) {
      console.error("Error al crear cliente:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const handleCreateProject = async (
    clientId: string,
    onSuccess: (newElementId: string, parentIds: string[]) => void
  ) => {
    const trimmedName = newItemName.trim();

    const emptyError = validateEmptyName(trimmedName);
    if (emptyError) {
      setErrorMessage(emptyError);
      return;
    }

    const duplicateError = validateProjectName(trimmedName, clientId);
    if (duplicateError) {
      setErrorMessage(duplicateError);
      return;
    }

    try {

      const newProject = await addProject({
        name: trimmedName,
        clientId: clientId,
      });


      const parentClient = clients.find((c) => c.id === clientId);

      toast.success("Proyecto creado", {
        description: `"${newProject.name}" fue creado${parentClient ? ` en ${parentClient.name}` : ''}`,
      });

      onSuccess(newProject.id, [clientId]);
      resetForm();
    } catch (error) {
      console.error("Error al crear proyecto:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const handleCreateTask = async (
    projectId: string,
    onSuccess: (newElementId: string, parentIds: string[]) => void
  ) => {
    const trimmedName = newItemName.trim();

    const emptyError = validateEmptyName(trimmedName);
    if (emptyError) {
      setErrorMessage(emptyError);
      return;
    }

    const duplicateError = validateTaskName(trimmedName, projectId);
    if (duplicateError) {
      setErrorMessage(duplicateError);
      return;
    }

    try {

      const newTask = await addTask({
        name: trimmedName,
        projectId: projectId,
      });

      // Obtener el proyecto y cliente para el toast y expansión
      const parentProject = projects.find((p) => p.id === projectId);
      const parentClient = parentProject ? clients.find((c) => c.id === parentProject.clientId) : null;
      const parentIds = parentClient ? [parentClient.id, projectId] : [projectId];

      toast.success("Tarea creada", {
        description: `"${newTask.name}" fue creada${parentProject ? ` en ${parentProject.name}` : ''}`,
      });

      onSuccess(newTask.id, parentIds);
      resetForm();
    } catch (error) {
      console.error("Error al crear tarea:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const handleEditClient = async (
    clientId: string,
    onSuccess: () => void
  ) => {
    const trimmedName = newItemName.trim();

    const emptyError = validateEmptyName(trimmedName);
    if (emptyError) {
      setErrorMessage(emptyError);
      return;
    }

    const duplicateError = validateClientName(trimmedName, clientId);
    if (duplicateError) {
      setErrorMessage(duplicateError);
      return;
    }

    try {

      updateClient(clientId, { name: trimmedName });

      toast.success("Cliente actualizado", {
        description: `"${trimmedName}" fue actualizado exitosamente`,
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const handleEditProject = async (
    projectId: string,
    clientId: string,
    onSuccess: () => void
  ) => {
    const trimmedName = newItemName.trim();

    const emptyError = validateEmptyName(trimmedName);
    if (emptyError) {
      setErrorMessage(emptyError);
      return;
    }

    const duplicateError = validateProjectName(trimmedName, clientId, projectId);
    if (duplicateError) {
      setErrorMessage(duplicateError);
      return;
    }

    try {

      updateProject(projectId, { name: trimmedName });

      const parentClient = clients.find((c) => c.id === clientId);

      toast.success("Proyecto actualizado", {
        description: `"${trimmedName}" fue actualizado${parentClient ? ` en ${parentClient.name}` : ''}`,
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const handleEditTask = async (
    taskId: string,
    projectId: string,
    onSuccess: () => void
  ) => {
    const trimmedName = newItemName.trim();

    const emptyError = validateEmptyName(trimmedName);
    if (emptyError) {
      setErrorMessage(emptyError);
      return;
    }

    const duplicateError = validateTaskName(trimmedName, projectId, taskId);
    if (duplicateError) {
      setErrorMessage(duplicateError);
      return;
    }

    try {

      updateTask(taskId, { name: trimmedName });

      const parentProject = projects.find((p) => p.id === projectId);

      toast.success("Tarea actualizada", {
        description: `"${trimmedName}" fue actualizada${parentProject ? ` en ${parentProject.name}` : ''}`,
      });

      onSuccess();
      resetForm();
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  return {
    newItemName,
    setNewItemName,
    errorMessage,
    setErrorMessage,
    resetForm,
    handleCreateClient,
    handleCreateProject,
    handleCreateTask,
    handleEditClient,
    handleEditProject,
    handleEditTask,
  };
}
