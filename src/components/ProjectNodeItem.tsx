import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  FolderKanban, 
  CheckSquare,
  Pencil,
  Trash2,
  Move,
} from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/time-utils";
import { TreeNode } from "@/types";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ProjectNodeItemProps {
  node: TreeNode;
  level: number;
  parentId: string;
  expandedNodes: Set<string>;
  onToggle: (nodeId: string) => void;
  onAddChild: (type: "project" | "task", parentId: string) => void;
  onEdit: (node: TreeNode, type: "client" | "project" | "task", parentId: string) => void;
  onDelete: (node: TreeNode, type: "client" | "project" | "task") => void;
  onMove?: (node: TreeNode, type: "project" | "task", currentParentId: string) => void;
  onToggleComplete?: (taskId: string) => void;
}


const getIcon = (type: "client" | "project" | "task") => {
  switch (type) {
    case "client":
      return <Building2 className="h-4 w-4" />;
    case "project":
      return <FolderKanban className="h-4 w-4" />;
    case "task":
      return <CheckSquare className="h-4 w-4" />;
  }
};

const getIconColor = (type: "client" | "project" | "task") => {
  switch (type) {
    case "client":
      return "text-blue-500";
    case "project":
      return "text-purple-500";
    case "task":
      return "text-green-500";
  }
};

const countChildren = (node: TreeNode): { projects: number; tasks: number } => {
  let projects = 0;
  let tasks = 0;
  
  if (node.children) {
    node.children.forEach(child => {
      if (child.type === "project") {
        projects++;
        const subCounts = countChildren(child);
        tasks += subCounts.tasks;
      } else if (child.type === "task") {
        tasks++;
      }
    });
  }
  
  return { projects, tasks };
};

export function ProjectNodeItem({
  node,
  level,
  parentId,
  expandedNodes,
  onToggle,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
  onToggleComplete,
}: ProjectNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const counts = countChildren(node);

  const paddingLeft = level === 0 ? 12 : level === 1 ? 28 : 48;

  const progressPercent =
    node.type === "project" && node.totalTasks && node.totalTasks > 0
      ? Math.round(((node.tasksCompleted || 0) / node.totalTasks) * 100)
      : null;

  return (
    <div>
      {/* Node Item */}
      <div
        className={`
          group relative
          hover:bg-gray-50 dark:hover:bg-gray-800/60
          border-b border-gray-100 dark:border-gray-800
          transition-colors
          ${level === 0 ? 'bg-gray-50/70 dark:bg-gray-900/60' : 'bg-white dark:bg-gray-900'}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <div className="flex items-center gap-2 pr-2 py-2.5">

          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => onToggle(node.id)}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Icon — tarea: clickeable para toggle completado */}
          {node.type === "task" && onToggleComplete ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(node.id);
              }}
              className="shrink-0 hover:scale-110 transition-transform"
              title={node.isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
            >
              <CheckSquare
                className={`h-4 w-4 transition-colors ${
                  node.isCompleted
                    ? "text-green-500"
                    : "text-gray-300 dark:text-gray-600 hover:text-green-400"
                }`}
              />
            </button>
          ) : (
            <span className={`shrink-0 ${getIconColor(node.type)}`}>
              {getIcon(node.type)}
            </span>
          )}

          {/* Contenido principal: dos líneas */}
          <div className="flex-1 min-w-0">
            {/* Línea 1: nombre + acciones */}
            <div className="flex items-center gap-2">
              {/* Nombre */}
              <div className="flex-1 min-w-0">
                {node.type === "task" ? (
                  <Link
                    href={`/dashboard/tasks/${node.id}`}
                    className={`
                      block truncate text-sm transition-colors
                      hover:text-green-600 dark:hover:text-green-400 hover:underline
                      ${node.isCompleted
                        ? "line-through text-gray-400 dark:text-gray-500"
                        : "text-gray-700 dark:text-gray-300"
                      }
                    `}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {node.name}
                  </Link>
                ) : (
                  <span
                    className={`
                      block truncate
                      ${level === 0 ? "font-semibold text-sm text-gray-900 dark:text-gray-100" : ""}
                      ${level === 1 ? "font-medium text-sm text-gray-800 dark:text-gray-200" : ""}
                    `}
                  >
                    {node.name}
                  </span>
                )}
              </div>

              {/* Acciones — siempre visibles en móvil, hover en desktop */}
              <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                {node.type !== "task" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title={`Agregar ${node.type === "client" ? "proyecto" : "tarea"}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddChild(node.type === "client" ? "project" : "task", node.id);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5 text-gray-500" />
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(node, node.type, parentId);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {node.type !== "client" && onMove && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onMove(node, node.type as "project" | "task", parentId);
                        }}
                      >
                        <Move className="h-4 w-4 mr-2" />
                        Mover
                      </DropdownMenuItem>
                    )}
                    {node.type === "task" && onToggleComplete && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(node.id);
                        }}
                      >
                        <CheckSquare className={`h-4 w-4 mr-2 ${node.isCompleted ? "text-green-500" : ""}`} />
                        {node.isCompleted ? "Marcar como pendiente" : "Marcar como completada"}
                      </DropdownMenuItem>
                    )}
                    {node.type !== "task" && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddChild(node.type === "client" ? "project" : "task", node.id);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar {node.type === "client" ? "proyecto" : "tarea"}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(node, node.type);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Línea 2: metadata secundaria */}
            <div className="flex items-center gap-3 mt-0.5">
              {/* Tiempo total */}
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDuration(node.totalTime || 0)}
              </span>

              {/* Conteo de hijos para clientes */}
              {node.type === "client" && counts.projects > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <FolderKanban className="h-3 w-3" />
                  {counts.projects} {counts.projects === 1 ? "proyecto" : "proyectos"}
                </span>
              )}

              {/* Conteo de tareas */}
              {(node.type === "client" || node.type === "project") && counts.tasks > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <CheckSquare className="h-3 w-3" />
                  {counts.tasks} {counts.tasks === 1 ? "tarea" : "tareas"}
                </span>
              )}

              {/* Porcentaje de progreso — solo en hover, proyectos */}
              {progressPercent !== null && (
                <span className="text-xs text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {progressPercent}%
                </span>
              )}
            </div>

            {/* Barra de progreso — solo proyectos, debajo de todo el contenido */}
            {progressPercent !== null && (
              <div className="mt-1.5 h-[2px] w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <ProjectNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              parentId={node.id}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
              onToggleComplete={onToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
