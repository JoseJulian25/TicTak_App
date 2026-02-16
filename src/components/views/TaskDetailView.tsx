import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { TaskBreadcrumb } from "@/components/TaskBreadcrumb";
import { TaskHeader } from "@/components/TaskHeader";
import { TaskMetrics } from "@/components/TaskMetrics";
import TaskStatsSummary from "@/components/TaskStatsSummary";
import TaskSessionHistory from "@/components/TaskSessionHistory";
import TaskActions from "@/components/TaskActions";
import { MoveItemDialog } from "@/components/MoveItemDialog";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import { useTaskActions } from "@/hooks/useTaskActions";
import { useClientStore } from "@/stores/useClientStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useTimerStore } from "@/stores/useTimerStore";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Client } from "@/types/entities";

interface MoveDestination {
  id: string;
  name: string;
  type: "client" | "project";
  clientId?: string;
  clientName?: string;
}


interface TaskDetailViewProps {
  taskId: string;
  onBack: () => void;
}

export function TaskDetailView({ taskId, onBack }: TaskDetailViewProps) {
  const router = useRouter();
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showTimerDialog, setShowTimerDialog] = useState(false);

  const { data, error, updateTask } = useTaskDetail(taskId);
  
  const { handleMove } = useTaskActions(taskId);
  
  const isRunning = useTimerStore((state) => state.isRunning);
  const activeSession = useTimerStore((state) => state.activeSession);
  const startTimer = useTimerStore((state) => state.startTimer);
  const resetTimer = useTimerStore((state) => state.resetTimer);

  const allClients = useClientStore((state) => state.clients);
  const allProjects = useProjectStore((state) => state.projects);

  // Preparar destinos para MoveItemDialog
  const moveDestinations: MoveDestination[] = useMemo(() => {
    const destinations: MoveDestination[] = [];
    const activeClients = allClients.filter((c: Client) => !c.isArchived);
    
    activeClients.forEach((client) => {
      const clientProjects = allProjects.filter(
        (p) => p.clientId === client.id && !p.isArchived
      );
      clientProjects.forEach((project) => {
        destinations.push({
          id: project.id,
          name: project.name,
          type: "project",
          clientId: client.id,
          clientName: client.name,
        });
      });
    });

    return destinations;
  }, [allClients, allProjects]);

  // Manejar el movimiento de la tarea
  const handleMoveTask = async (destinationProjectId: string) => {
    await handleMove(destinationProjectId);
    setShowMoveDialog(false);
  };

  // Manejar inicio de timer
  const handleStartTimer = () => {
    if (!data?.task) return;

    if (data.task.isCompleted) {
      toast.error("No se puede iniciar timer en una tarea completada");
      return;
    }

    if (isRunning && activeSession?.taskId === taskId) {
      toast.info("El timer ya está corriendo con esta tarea");
      router.push("/dashboard/timer");
      return;
    }

    if (isRunning && activeSession?.taskId !== taskId) {
      setShowTimerDialog(true);
      return;
    }

    startTimer(taskId);
    toast.success("Timer iniciado");
    router.push("/dashboard/timer");
  };

  const handleConfirmChangeTimer = () => {
    resetTimer();
    startTimer(taskId);
    setShowTimerDialog(false);
    toast.success("Timer cambiado a esta tarea");
    router.push("/dashboard/timer");
  };

  // Estado de carga o error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 dark:text-red-400">{error}</p>
          <button
            onClick={onBack}
            className="mt-4 text-blue-500 hover:underline"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  const { task, project, client, sessions, stats } = data;

  // Verificar si esta tarea está siendo temporizada actualmente
  const isTimerActive = isRunning && activeSession?.taskId === taskId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* Breadcrumb */}
        <TaskBreadcrumb client={client} project={project} task={task} />

        {/* Task Header */}
        <TaskHeader
          task={task}
          onUpdate={updateTask}
          onStartTimer={handleStartTimer}
          isTimerActive={isTimerActive}
        />

        {/* Metrics Grid */}
        <TaskMetrics stats={stats} />

        {/* Performance Stats */}
        <TaskStatsSummary stats={stats} />

        {/* Session History */}
        <TaskSessionHistory sessions={sessions} />

        {/* Action Buttons */}
        <TaskActions
          taskId={taskId}
          taskName={task.name}
          sessionCount={sessions.length}
          onMoveClick={() => setShowMoveDialog(true)}
        />

        {/* Move Task Dialog */}
        <MoveItemDialog
          open={showMoveDialog}
          onOpenChange={setShowMoveDialog}
          destinations={moveDestinations}
          currentParentId={project.id}
          itemName={task.name}
          itemType="task"
          onMove={handleMoveTask}
        />

        {/* Timer Change Confirmation Dialog */}
        <AlertDialog open={showTimerDialog} onOpenChange={setShowTimerDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Cambiar tarea del timer?</AlertDialogTitle>
              <AlertDialogDescription>
                Ya hay un timer activo con otra tarea. ¿Deseas detenerlo y comenzar con esta tarea?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmChangeTimer}>
                Cambiar tarea
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
