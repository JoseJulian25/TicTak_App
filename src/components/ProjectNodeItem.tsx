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
} from "lucide-react";
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
}: ProjectNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const counts = countChildren(node);

  // Padding progresivo según nivel
  const paddingLeft = level === 0 ? 12 : level === 1 ? 32 : 52;

  return (
    <div key={node.id}>
      {/* Node Item */}
      <div
        className={`
          group flex items-center gap-2 py-2.5 px-3 
          hover:bg-gray-100 dark:hover:bg-gray-800 
          border-b border-gray-100 dark:border-gray-800
          transition-colors cursor-pointer
          ${level === 0 ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''}
        `}
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={() => onToggle(node.id)}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded shrink-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Icon */}
        <span className={`shrink-0 ${getIconColor(node.type)}`}>
          {getIcon(node.type)}
        </span>

        {/* Name & Info */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className={`
            truncate
            ${level === 0 ? 'font-semibold text-gray-900 dark:text-gray-100' : ''}
            ${level === 1 ? 'font-medium text-gray-800 dark:text-gray-200' : ''}
            ${level === 2 ? 'text-gray-700 dark:text-gray-300' : ''}
          `}>
            {node.name}
          </span>

          {/* Metadata inline */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500 shrink-0">
            {/* Child counts for clients and projects */}
            {node.type === "client" && counts.projects > 0 && (
              <span className="flex items-center gap-1">
                <FolderKanban className="h-3 w-3" />
                {counts.projects}
              </span>
            )}
            
            {(node.type === "client" || node.type === "project") && counts.tasks > 0 && (
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {counts.tasks}
              </span>
            )}

            {/* Progress for projects */}
            {node.type === "project" && node.totalTasks && (
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${((node.tasksCompleted || 0) / node.totalTasks) * 100}%` }}
                  />
                </div>
                <span>{node.tasksCompleted}/{node.totalTasks}</span>
              </div>
            )}
          </div>
        </div>

        {/* Time tracked */}
        <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
          <Clock className="h-3 w-3" />
          <span className="font-medium">{node.totalTime || 0}h</span>
        </div>

        {/* Last activity */}
        <span className="hidden lg:block text-xs text-gray-400 shrink-0 w-20 text-right">
          {node.lastActivity}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {node.type !== "task" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
