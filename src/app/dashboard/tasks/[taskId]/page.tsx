"use client";

import { TaskDetailView } from "@/components/views/TaskDetailView";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useTaskStore } from "@/stores/useTaskStore";

interface PageProps {
  params: {
    taskId: string;
  };
}

export default function TaskDetailPage({ params }: PageProps) {
  const router = useRouter();
  
  // Obtener función para verificar existencia de tarea
  const getTaskById = useTaskStore((state) => state.getTaskById);
  
  // Verificar si la tarea existe
  const task = getTaskById(params.taskId);

  // Si la tarea no existe, mostrar página not-found
  if (!task) {
    notFound();
  }

  const handleBack = () => {
    router.push("/dashboard/projects");
  };

  const handleStartTimer = () => {
    // TODO: Implementar lógica de iniciar timer con esta tarea
    router.push("/dashboard/timer");
  };

  return (
    <TaskDetailView
      taskId={params.taskId}
      onBack={handleBack}
      onStartTimer={handleStartTimer}
    />
  );
}
