import { useState } from "react";
import { useClientStore } from "@/stores/useClientStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { toast } from "sonner";

export function useProjectsActions() {
  const addClient = useClientStore((state) => state.addClient);
  const clients = useClientStore((state) => state.clients);
  const addProject = useProjectStore((state) => state.addProject);
  const projects = useProjectStore((state) => state.projects);
  const addTask = useTaskStore((state) => state.addTask);
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

    if (!trimmedName) {
      setErrorMessage("El nombre no puede estar vacío");
      return;
    }

    try {

      const existingClient = clients.find(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && !c.isArchived
      );

      if (existingClient) {
        setErrorMessage("Ya existe un cliente con ese nombre");
        return;
      }

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

    if (!trimmedName) {
      setErrorMessage("El nombre no puede estar vacío");
      return;
    }

    try {

      const existingProject = projects.find(
        (p) =>
          p.clientId === clientId &&
          p.name.toLowerCase() === trimmedName.toLowerCase() &&
          !p.isArchived
      );

      if (existingProject) {
        setErrorMessage("Ya existe un proyecto con ese nombre en este cliente");
        return;
      }

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

    if (!trimmedName) {
      setErrorMessage("El nombre no puede estar vacío");
      return;
    }

    try {

      const existingTask = tasks.find(
        (t) =>
          t.projectId === projectId &&
          t.name.toLowerCase() === trimmedName.toLowerCase() &&
          !t.isArchived
      );

      if (existingTask) {
        setErrorMessage("Ya existe una tarea con ese nombre en este proyecto");
        return;
      }

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

  return {
    newItemName,
    setNewItemName,
    errorMessage,
    setErrorMessage,
    resetForm,
    handleCreateClient,
    handleCreateProject,
    handleCreateTask,
  };
}
