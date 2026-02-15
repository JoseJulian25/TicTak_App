import React, { useState } from "react";
import { ArrowRightLeft, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTaskActions } from "@/hooks/useTaskActions";

interface TaskActionsProps {
  taskId: string;
  taskName: string;
  sessionCount: number;
  onMoveClick?: () => void;
}

/**
 * 
 * Muestra los botones de acción principales para una tarea: Mover a Proyecto y Eliminar Tarea.
 * 
 */
export default function TaskActions({ 
  taskId, 
  taskName, 
  sessionCount,
  onMoveClick 
}: TaskActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { isDeleting, handleDelete } = useTaskActions(taskId);

  /**
   * Confirma y ejecuta la eliminación de la tarea
   */
  const handleConfirmDelete = async () => {
    await handleDelete();
    setShowDeleteDialog(false);
  };

  return (
    <>
      {/* Botones de acción */}
      <div className="flex flex-col md:flex-row gap-3">
        <Button 
          variant="outline" 
          className="gap-2" 
          onClick={onMoveClick}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Mover a Proyecto
        </Button>
        <Button
          variant="outline"
          className="gap-2 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
          Eliminar Tarea
        </Button>
      </div>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              ¿Eliminar tarea?
            </DialogTitle>
            <DialogDescription className="pt-2">
              Se eliminará "{taskName}". 
              {sessionCount > 0 ? (
                <> Las {sessionCount} sesiones asociadas se mantendrán en el historial general pero ya no estarán vinculadas a esta tarea.</>
              ) : (
                <> Esta acción no se puede deshacer.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
