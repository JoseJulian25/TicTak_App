import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import TaskBreadcrumb from "@/components/TaskBreadcrumb";
import TaskHeader from "@/components/TaskHeader";
import TaskMetrics from "@/components/TaskMetrics";
import TaskStatsSummary from "@/components/TaskStatsSummary";
import TaskSessionHistory from "@/components/TaskSessionHistory";
import TaskActions from "@/components/TaskActions";
import { MoveItemDialog } from "@/components/MoveItemDialog";
import { useTaskDetail } from "@/hooks/useTaskDetail";
import { useTaskActions } from "@/hooks/useTaskActions";
import { useClientStore } from "@/stores/useClientStore";
import { useProjectStore } from "@/stores/useProjectStore";

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
  onStartTimer?: () => void;
}

export function TaskDetailView({ taskId, onBack, onStartTimer }: TaskDetailViewProps) {
  const router = useRouter();
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  // Obtener datos de la tarea con el hook
  const { data, error, updateTask } = useTaskDetail(taskId);
  
  // Hook para acciones (mover tarea)
  const { handleMove } = useTaskActions(taskId);

  // Obtener clientes y proyectos para el diálogo de mover
  const clients = useClientStore((state) => state.getActiveClients());
  const getProjectsByClient = useProjectStore((state) => state.getProjectsByClient);

  // Preparar destinos para MoveItemDialog
  const moveDestinations: MoveDestination[] = useMemo(() => {
    const destinations: MoveDestination[] = [];
    
    clients.forEach((client) => {
      const projects = getProjectsByClient(client.id, false);
      projects.forEach((project) => {
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
  }, [clients, getProjectsByClient]);

  // Manejar el movimiento de la tarea
  const handleMoveTask = async (destinationProjectId: string) => {
    await handleMove(destinationProjectId);
    setShowMoveDialog(false);
  };

  // Manejar inicio de timer
  const handleStartTimer = () => {
    if (onStartTimer) {
      onStartTimer();
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-8">
        {/* Breadcrumb */}
        <TaskBreadcrumb client={client} project={project} task={task} />

        {/* Task Header */}
        <TaskHeader
          task={task}
          onUpdate={updateTask}
          onToggleComplete={updateTask}
          onStartTimer={handleStartTimer}
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
      </div>
    </div>
  );
}
