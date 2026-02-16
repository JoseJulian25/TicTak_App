"use client";

import { use } from "react";
import { TaskDetailView } from "@/components/views/TaskDetailView";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useTaskStore } from "@/stores/useTaskStore";

interface PageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default function TaskDetailPage({ params }: PageProps) {
  const router = useRouter();
  
  const { taskId } = use(params);
  
  const tasks = useTaskStore((state) => state.tasks);
  const task = tasks.find((t) => t.id === taskId);

  if (!task) {
    notFound();
  }

  const handleBack = () => {
    router.push("/dashboard/projects");
  };

  return (
    <TaskDetailView
      taskId={taskId}
      onBack={handleBack}
    />
  );
}
