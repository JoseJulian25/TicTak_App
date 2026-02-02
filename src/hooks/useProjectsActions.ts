import { useState } from "react";
import { useClientStore } from "@/stores/useClientStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { toast } from "sonner";
import {
  validateEmptyName,
  validateClientName,
  validateProjectName,
  validateTaskName,
} from "@/lib/project-validations";

export function useProjectsActions() {
  const addClient = useClientStore((state) => state.addClient);
  const updateClient = useClientStore((state) => state.updateClient);
  const hardDeleteClient = useClientStore((state) => state.hardDeleteClient);
  const clients = useClientStore((state) => state.clients);
  const addProject = useProjectStore((state) => state.addProject);
  const updateProject = useProjectStore((state) => state.updateProject);
  const hardDeleteProject = useProjectStore((state) => state.hardDeleteProject);
  const projects = useProjectStore((state) => state.projects);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const tasks = useTaskStore((state) => state.tasks);

  const [newItemName, setNewItemName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setNewItemName("");
    setErrorMessage("");
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

    const duplicateError = validateClientName(trimmedName, clients);
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

    const duplicateError = validateProjectName(trimmedName, clientId, projects);
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

    const duplicateError = validateTaskName(trimmedName, projectId, tasks);
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

    const duplicateError = validateClientName(trimmedName, clients, clientId);
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

    const duplicateError = validateProjectName(trimmedName, clientId, projects, projectId);
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

    const duplicateError = validateTaskName(trimmedName, projectId, tasks, taskId);
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

  const handleDeleteClient = (clientId: string, clientName: string) => {
    try {
      hardDeleteClient(clientId);

      toast.success("Cliente eliminado", {
        description: `"${clientName}" y todos sus proyectos y tareas fueron eliminados`,
      });
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error("Error al eliminar", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    try {
      hardDeleteProject(projectId);

      toast.success("Proyecto eliminado", {
        description: `"${projectName}" y todas sus tareas fueron eliminadas`,
      });
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      toast.error("Error al eliminar", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  };

  const handleDeleteTask = (taskId: string, taskName: string) => {
    try {
      deleteTask(taskId);

      toast.success("Tarea eliminada", {
        description: `"${taskName}" fue eliminada exitosamente`,
      });
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      toast.error("Error al eliminar", {
        description: error instanceof Error ? error.message : "Error desconocido",
      });
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
    handleDeleteClient,
    handleDeleteProject,
    handleDeleteTask,
  };
}
