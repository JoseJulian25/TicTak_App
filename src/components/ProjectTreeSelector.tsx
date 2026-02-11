import { useState, memo } from "react";
import { ChevronDown, ChevronRight, Building2, FolderKanban, CheckSquare, Search, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TreeNode } from "@/types";
import { useProjectTreeState } from "@/hooks/useProjectTreeState";

interface ProjectTreeSelectorProps {
  selectedTaskId: string | null;
  onSelectTask: (taskId: string) => void;
}

/**
 * Selector de proyectos en forma de árbol jerárquico
 */
export const ProjectTreeSelector = memo(function ProjectTreeSelector({
  selectedTaskId,
  onSelectTask,
}: ProjectTreeSelectorProps) {
  const [open, setOpen] = useState(false);
  
  // Hook personalizado con toda la lógica del árbol
  const {
    isLoading,
    expandedNodes,
    searchTerm,
    selectedNode,
    filteredProjects,
    setSearchTerm,
    toggleNode,
    getNodePath,
  } = useProjectTreeState(selectedTaskId);

  const getIcon = (node: TreeNode, isExpanded: boolean, hasChildren: boolean) => {
    const iconClasses = "h-5 w-5";
    
    if (node.type === "client") {
      return <Building2 className={`${iconClasses} text-blue-600 dark:text-blue-400`} />;
    }
    if (node.type === "project") {
      return <FolderKanban className={`${iconClasses} text-purple-600 dark:text-purple-400`} />;
    }
    return <CheckSquare className={`${iconClasses} text-green-600 dark:text-green-400`} />;
  };

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = !!(node.children && node.children.length > 0);
    const isSelected = selectedNode?.id === node.id;
    const canSelect = node.type === "task";

    const getBgColor = () => {
      if (isSelected) return "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-l-4 border-blue-500";
      return "hover:bg-gray-50 dark:hover:bg-gray-800";
    };

    const getTextColor = () => {
      if (node.type === "client") return "font-semibold text-gray-900 dark:text-gray-100";
      if (node.type === "project") return "font-medium text-gray-800 dark:text-gray-200";
      return "text-gray-700 dark:text-gray-300";
    };

    return (
      <div key={node.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${getBgColor()}`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
            if (canSelect) {
              onSelectTask(node.id);
              setOpen(false);
            }
          }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {/* Icon with background */}
          <div className={`p-1.5 rounded-lg ${
            node.type === "client" 
              ? "bg-blue-100 dark:bg-blue-950" 
              : node.type === "project"
              ? "bg-purple-100 dark:bg-purple-950"
              : "bg-green-100 dark:bg-green-950"
          }`}>
            {getIcon(node, isExpanded, hasChildren)}
          </div>

          {/* Node name */}
          <div className="flex-1 flex items-center gap-2">
            <span className={`text-sm ${getTextColor()} ${isSelected ? "text-blue-700 dark:text-blue-400" : ""}`}>
              {node.name}
            </span>
            
          </div>

          {/* Checkmark for selected */}
          {isSelected && (
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div
          className="w-full flex items-center justify-between bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-300 hover:bg-gray-50 dark:hover:bg-gray-700 min-h-[70px] py-4 px-6 rounded-md transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {selectedNode ? (
              <div className={`p-2 rounded-lg ${
                selectedNode.type === "task"
                  ? "bg-green-100 dark:bg-green-950"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}>
                {selectedNode.type === "task" ? (
                  <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <FolderKanban className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <FolderKanban className="h-6 w-6 text-gray-400" />
              </div>
            )}
            
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Proyecto / Tarea
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">
                {getNodePath(selectedNode)}
              </span>
            </div>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        align="start" 
        sideOffset={8}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-1">
            Selecciona una tarea
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Navega por la jerarquía: Cliente → Proyecto → Tarea
          </p>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar tareas, proyectos o clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tree */}
        <ScrollArea className="h-[320px]">
          <div className="p-3 space-y-1">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Cargando proyectos...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              filteredProjects.map((node) => renderNode(node, 0))
            ) : searchTerm ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No se encontraron resultados</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FolderKanban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay proyectos disponibles</p>
                <p className="text-xs mt-2">Crea tu primer proyecto en Ajustes</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Create Task Button */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Link href="/dashboard/projects">
            <button className="w-full flex items-center justify-center gap-2 py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-colors">
              <Plus className="h-4 w-4" />
              <span>Crear nueva tarea</span>
            </button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
});
