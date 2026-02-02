"use client";

import { useState } from "react";
import { 
  Plus, 
  MoreHorizontal, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Building2, 
  FolderKanban, 
  CheckSquare, 
  Search, 
  X,
  Pencil,
  Trash2,
  Archive
} from "lucide-react";
import { TreeNode } from "@/types";
import { useProjectTreeForProjects } from "@/hooks/useProjectTreeForProjects";
import { useProjectsActions } from "@/hooks/useProjectsActions";
import { SkeletonProjects } from "@/components/skeletons/SkeletonProjects";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ProjectsView() {
  const [showArchived, setShowArchived] = useState(false);
  const { tree, isLoading } = useProjectTreeForProjects(showArchived);
  const {
    newItemName,
    setNewItemName,
    errorMessage,
    setErrorMessage,
    resetForm,
    handleCreateClient,
    handleCreateProject,
    handleCreateTask,
  } = useProjectsActions();
  
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<"client" | "project" | "task">("client");
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const openAddDialog = (type: "client" | "project" | "task", parentId?: string) => {
    setDialogType(type);
    setSelectedParentId(parentId || "");
    resetForm();
    setShowDialog(true);
  };

  const handleCreate = async () => {
    const onSuccess = (newElementId: string, parentIds: string[]) => {
      // Auto-expandir elementos
      setExpandedNodes((prev) => {
        const newSet = new Set(prev);
        parentIds.forEach((id) => newSet.add(id));
        newSet.add(newElementId);
        return newSet;
      });
      
      // Cerrar diálogo
      setShowDialog(false);
    };

    if (dialogType === "client") {
      await handleCreateClient(onSuccess);
    } else if (dialogType === "project") {
      await handleCreateProject(selectedParentId, onSuccess);
    } else if (dialogType === "task") {
      await handleCreateTask(selectedParentId, onSuccess);
    }
  };

  const filterProjects = (nodes: TreeNode[], query: string): TreeNode[] => {
    if (!query.trim()) return nodes;
    
    return nodes.reduce((acc: TreeNode[], node: TreeNode) => {
      const matchesDirectly = node.name.toLowerCase().includes(query.toLowerCase());
      const filteredChildren = node.children 
        ? filterProjects(node.children, query)
        : [];
      
      if (matchesDirectly || filteredChildren.length > 0) {
        acc.push({
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : node.children
        });
      }
      
      return acc;
    }, [] as TreeNode[]);
  };

  const filteredProjects = filterProjects(tree, searchQuery);

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

  const renderNode = (node: TreeNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
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
              onClick={() => toggleNode(node.id)}
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
                  openAddDialog(node.type === "client" ? "project" : "task", node.id);
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
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {node.type !== "task" && (
                  <DropdownMenuItem>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar {node.type === "client" ? "proyecto" : "tarea"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archivar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
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
            {node.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Calculate totals for header stats
  const totalHours = tree.reduce((sum, p) => sum + (p.totalTime || 0), 0);
  const totalClients = tree.length;
  const totalProjects = tree.reduce((sum, p) => sum + (p.children?.length || 0), 0);

  // Show loading skeleton
  if (isLoading) {
    return <SkeletonProjects />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Proyectos
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{totalClients} clientes</span>
            <span>•</span>
            <span>{totalProjects} proyectos</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {totalHours}h total
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={setShowArchived}
            />
            <Label htmlFor="show-archived" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
              Mostrar archivados
            </Label>
          </div>
          <Button
            onClick={() => openAddDialog("client")}
            size="sm"
            className="gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar cliente, proyecto o tarea..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-9 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Projects Accordion List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Column Headers */}
        <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="w-5" /> {/* Spacer for chevron */}
          <div className="w-4" /> {/* Spacer for icon */}
          <div className="flex-1">Nombre</div>
          <div className="w-12 text-right">Total</div>
          <div className="hidden lg:block w-20 text-right">Actividad</div>
          <div className="w-16" /> {/* Spacer for actions */}
        </div>

        {/* Projects Tree */}
        {filteredProjects.length > 0 ? (
          filteredProjects.map((node) => renderNode(node, 0))
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              No se encontraron resultados para &quot;{searchQuery}&quot;
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-1">No hay clientes creados</p>
            <p className="text-sm text-gray-400">Crea tu primer cliente para empezar</p>
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Agregar {dialogType === "client" ? "Cliente" : dialogType === "project" ? "Proyecto" : "Tarea"}
            </DialogTitle>
            <DialogDescription>
              {dialogType === "client" 
                ? "Crea un nuevo cliente para organizar tus proyectos"
                : dialogType === "project"
                ? "Agrega un proyecto al cliente seleccionado"
                : "Crea una tarea específica dentro del proyecto"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={newItemName}
                onChange={(e) => {
                  setNewItemName(e.target.value);
                  setErrorMessage(""); // Limpiar error al escribir
                }}
                placeholder={
                  dialogType === "client"
                    ? "Ej: BanReservas"
                    : dialogType === "project"
                    ? "Ej: Sistema de Pagos"
                    : "Ej: Implementar API de transacciones"
                }
              />
              {errorMessage && (
                <p className="text-sm text-red-500">{errorMessage}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
