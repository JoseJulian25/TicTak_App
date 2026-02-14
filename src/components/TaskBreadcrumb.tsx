import Link from "next/link";
import { Building2, FolderKanban, CheckSquare, ChevronRight } from "lucide-react";
import type { Client, Project, Task } from "@/types/entities";

interface TaskBreadcrumbProps {
  client: Client;
  project: Project;
  task: Task;
}

/**
 * Breadcrumb navegable para mostrar la jerarquía Cliente > Proyecto > Tarea
 */
export function TaskBreadcrumb({ client, project, task }: TaskBreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 mb-8 flex-wrap">
      {/* Cliente */}
      <Link
        href="/dashboard/projects"
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors"
      >
        <Building2 className="h-4 w-4 text-blue-500" />
        <span className="truncate max-w-[120px] md:max-w-none">{client.name}</span>
      </Link>
      
      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      
      {/* Proyecto */}
      <Link
        href="/dashboard/projects"
        className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline transition-colors"
      >
        <FolderKanban className="h-4 w-4 text-purple-500" />
        <span className="truncate max-w-[120px] md:max-w-none">{project.name}</span>
      </Link>
      
      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
      
      {/* Tarea (no clickeable) */}
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        <CheckSquare className="h-4 w-4 text-green-500" />
        <span className="truncate max-w-[120px] md:max-w-none">{task.name}</span>
      </div>
    </nav>
  );
}
