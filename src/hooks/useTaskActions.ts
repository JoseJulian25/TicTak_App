import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTaskStore } from "@/stores/useTaskStore";

/**
 * Resultado del hook useTaskActions
 */
export interface UseTaskActionsResult {
  isDeleting: boolean;
  isMoving: boolean;
  handleDelete: () => Promise<void>;
  handleMove: (newProjectId: string) => Promise<void>;
  handleToggleComplete: () => void;
}

/**
 * Hook para manejar todas las acciones sobre una tarea
 * 
 * Encapsula la lógica de eliminación, movimiento, y toggle de completado
 * con estados de loading, confirmaciones y feedback mediante toasts.
 */
export function useTaskActions(taskId: string): UseTaskActionsResult {
  const router = useRouter();
  
  // Estados de loading
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Funciones del store (estables)
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const moveTaskToProject = useTaskStore((state) => state.moveTaskToProject);
  const updateTask = useTaskStore((state) => state.updateTask);
  
  // Array de tasks para buscar por ID (referencia estable)
  const tasks = useTaskStore((state) => state.tasks);

  /**
   * Elimina la tarea y sus sesiones
   * Navega a /dashboard/projects después de eliminar
   */
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      // Obtener nombre de la tarea para el toast
      const task = tasks.find((t) => t.id === taskId);
      const taskName = task?.name || "Tarea";

      // Eliminar tarea (también elimina sus sesiones en el store)
      deleteTask(taskId);

      toast.success(`"${taskName}" eliminada correctamente`, {
        description: "Las sesiones asociadas también fueron eliminadas",
      });

      // Navegar a proyectos después de eliminar
      router.push("/dashboard/projects");
    } catch (error) {
      console.error("Error al eliminar tarea:", error);
      toast.error("Error al eliminar la tarea", {
        description: "Por favor intenta de nuevo",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Mueve la tarea a otro proyecto
   */
  const handleMove = async (newProjectId: string) => {
    try {
      setIsMoving(true);

      const task = tasks.find((t) => t.id === taskId);
      const taskName = task?.name || "Tarea";

      await moveTaskToProject(taskId, newProjectId);

      toast.success(`"${taskName}" movida correctamente`, {
        description: "La tarea fue asignada al nuevo proyecto",
      });
    } catch (error) {
      console.error("Error al mover tarea:", error);
      toast.error("Error al mover la tarea", {
        description: error instanceof Error ? error.message : "Por favor intenta de nuevo",
      });
      throw error; 
    } finally {
      setIsMoving(false);
    }
  };


  /**
   * Alterna el estado de completado de la tarea
   */
  const handleToggleComplete = () => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      
      if (!task) {
        toast.error("Tarea no encontrada");
        return;
      }

      const newCompletedState = !task.isCompleted;
      updateTask(taskId, { isCompleted: newCompletedState });

      toast.success(
        newCompletedState 
          ? `"${task.name}" marcada como completada` 
          : `"${task.name}" marcada como pendiente`
      );
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
      toast.error("Error al actualizar la tarea");
    }
  };

  return {
    isDeleting,
    isMoving,
    handleDelete,
    handleMove,
    handleToggleComplete,
  };
}
