"use client";

import { TaskDetailView } from "@/components/views/TaskDetailView";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    taskId: string;
  };
}

export default function TaskDetailPage({ params }: PageProps) {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/projects");
  };

  const handleStartTimer = () => {
    // TODO: Implementar lógica de iniciar timer con esta tarea
    router.push("/dashboard/timer");
  };

  // Por ahora solo renderizamos el template con datos mock
  // La lógica real se implementará después
  return (
    <TaskDetailView
      taskId={params.taskId}
      onBack={handleBack}
      onStartTimer={handleStartTimer}
    />
  );
}
